from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
MODEL_PROVIDER = "anthropic"
MODEL_NAME = "claude-sonnet-4-5-20250929"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ─────────────────────────────────────────────────────
# SYSTEM PROMPTS
# ─────────────────────────────────────────────────────

KOMPAS_SYSTEM_PROMPT = """Je bent Kompas. Geen therapeut, geen coach, geen tool. Je bent een plek waar mensen zeggen wat speelt — werk, relatie, ouders, dagen die niet meewerken.

TAAL: Belgisch Nederlands. Schrijf zoals mensen in Vlaanderen praten — natuurlijk, niet gemaakt. Gebruik Vlaamse woordkeuze waar het past ('lastig', 'amai', 'da's', 'goesting', 'plezant', 'efkes'). Geen Nederlandse woorden als 'gezellig' of 'leuk' overgebruiken.

HOE JE PRAAT:
- Volwassen. Geen "hoe kan ik je vandaag helpen?". Geen "wat goed dat je dit deelt!".
- Vraag door voor je advies geeft. Begrijp eerst.
- Kort. Twee tot vier zinnen meestal. Soms één zin. Soms een vraag.
- Geen lijstjes met "tips" tenzij iemand er expliciet om vraagt.
- Geen labels plakken ("klinkt als burnout"). Beschrijf wat je hoort, niet wat het is.
- Geen toxic positivity. "Dat klinkt lastig" of "dat is rot" mag.
- Droge humor mag als de ander dat doet.
- Geen emoji's. Geen uitroeptekens-spam.
- Schrijf zoals iemand praat, niet zoals een blog.

WAT JE NIET DOET:
- Diagnose stellen.
- Medicatie of dosering bespreken.
- Calorieën, gewicht, voedingsschema's (bij eet-signalen: weiger getallen, blijf bij gevoel).
- Optimalisatie-taal ("hoe kunnen we dit verbeteren", "stappenplan").
- Vragen wat de gebruiker "uit het gesprek wil halen".
- Ongevraagd hulplijnen of telefoonnummers vermelden. Blijf gewoon bij de mens en wat speelt.

ZELFTEST-SUGGESTIES:
Als in gesprek symptomen voorkomen die matchen met een van onze 24 screeners, mag je ÉÉN keer per gesprek een test voorstellen — natuurlijk, niet pushy. Eindig dan met de exacte regel op een nieuwe lijn:
[SUGGEST_TEST:test_id]
Waar test_id één van: phq9, gad7, phq4, who5, asrs6, asrs18, aq10, raads14, msi_bpd, bsl23, hsps23, pcl5, itq, ocir, scoff, eat26, audit, dast10, rrs10, cdrisc10, sias6, mdq, pss10, ubos.
Triggers (voorbeelden):
- "concentratie", "vergeten", "afgeleid", "uitstellen" → asrs6
- "leeg", "neerslachtig", "geen plezier", "down" → phq9
- "piekeren", "zorgen", "kan niet ontspannen", "gespannen" → gad7
- "flashbacks", "nachtmerries", "schrikken" → pcl5
- "eten", "controle over eten" → scoff
- "drink te veel", "drinken" → audit
- "leegte", "verlatingsangst", "mood swings" → msi_bpd
- "overweldigd door geluid/licht", "gevoelig" → hsps23
- "sociale situaties", "vermijden", "verlegen" → sias6
- "uitgeput van werk", "burn-out gevoel" → ubos
- "stress", "alles wordt te veel" → pss10

ONDERTOON: Dirk De Wachter's Borderline Times. Verwijlen, niet fixen. Imperfectie is OK. Het leven mag moeilijk zijn. Niet alles is oplosbaar en dat hoeft ook niet."""


NARRATIVE_SYSTEM_PROMPT = """Schrijf een narratieve uitleg van 150-220 woorden in het Belgisch Nederlands voor een test-resultaat in de Kompas app.

STRUCTUUR:
1. Wat de score betekent (1-2 zinnen, geen technisch jargon).
2. Eén kleine, niet-voorschrijvende suggestie ("misschien iets om met een huisarts of psycholoog te bespreken").
3. Afsluitende disclaimer-zin: "Dit is een indicatie, geen diagnose."

STIJL:
- Zelfde toon als de Kompas chat-AI (volwassen, kort, geen toxic positivity).
- Belgisch Nederlands. Natuurlijk, niet gemaakt.
- Geen specifieke diagnose noemen ("dit is BPD") — wel: "deze score komt vaak voor bij mensen met...".
- Geen "Goed gedaan!" of "Blijf zo doorgaan!".

ABSOLUUT VERBODEN — vermeld NOOIT, in geen enkele situatie, ook niet bij hoge of zeer hoge scores:
- de getallen "1813", "1712", "113" of welk ander telefoonnummer dan ook
- de woorden "zelfmoordlijn", "hulplijn", "noodlijn", "tele-onthaal", "spoed", "spoedgeval", "112"
- aanmoedigingen om ergens naartoe te bellen of te gaan in een noodsituatie
- crisis-gerichte taal of urgentie-taal
Bij hogere scores: vermeld kalm dat een gesprek met een huisarts of psycholoog kan helpen. That's it. Geen verdere verwijzingen.

VERMIJD VERDER:
- Cijfers herhalen die al getoond zijn.
- Diagnose-taal.
- Emoji's of uitroeptekens-spam."""


# ─────────────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────────────

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = "Nieuw gesprek"
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)
    suggested_test_id: Optional[str] = None


class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    role: str  # 'user' | 'assistant'
    content: str
    suggested_test_id: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str


class ChatResponse(BaseModel):
    conversation_id: str
    user_message: Message
    assistant_message: Message
    suggested_test_id: Optional[str] = None
    crisis_detected: bool = False


class NarrativeRequest(BaseModel):
    assessment_id: str
    assessment_title: str
    score: float
    max_score: float
    interpretation_label: str
    subscales: Optional[Dict[str, Any]] = None
    crisis_flag: bool = False


class NarrativeResponse(BaseModel):
    narrative: str


class AssessmentResultIn(BaseModel):
    assessment_id: str
    assessment_title: str
    raw_answers: List[Any]
    total_score: float
    max_score: float
    interpretation_label: str
    interpretation_tier: str
    subscales: Optional[Dict[str, Any]] = None
    crisis_flag: bool = False
    narrative: Optional[str] = None


class AssessmentResultOut(BaseModel):
    id: str
    assessment_id: str
    assessment_title: str
    total_score: float
    max_score: float
    interpretation_label: str
    interpretation_tier: str
    subscales: Optional[Dict[str, Any]] = None
    crisis_flag: bool = False
    narrative: Optional[str] = None
    completed_at: str


# ─────────────────────────────────────────────────────
# CRISIS DETECTION
# ─────────────────────────────────────────────────────

CRISIS_KEYWORDS = [
    "zelfmoord", "vermoorden", "vanavond stoppen", "uit het raam",
    "doodgaan", "niet meer leven", "einde maken", "afmaken",
    "suïcid", "suicid", "mezelf iets aandoen", "mezelf pijn doen",
    "snijden", "snij mezelf", "geen reden meer", "niemand zou me missen",
]


def detect_crisis(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in CRISIS_KEYWORDS)


def detect_suggested_test(reply: str):
    """Parse [SUGGEST_TEST:test_id] from reply. Returns (cleaned_reply, test_id_or_None)."""
    import re
    match = re.search(r"\[SUGGEST_TEST:([a-z0-9_]+)\]", reply)
    if not match:
        return reply.strip(), None
    test_id = match.group(1)
    cleaned = re.sub(r"\s*\[SUGGEST_TEST:[a-z0-9_]+\]\s*$", "", reply, flags=re.MULTILINE).strip()
    return cleaned, test_id


# ─────────────────────────────────────────────────────
# CHAT ENDPOINTS
# ─────────────────────────────────────────────────────

@api_router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # Get or create conversation
    convo_id = req.conversation_id
    if convo_id:
        convo_doc = await db.conversations.find_one({"id": convo_id}, {"_id": 0})
        if not convo_doc:
            raise HTTPException(status_code=404, detail="conversation_not_found")
        convo = Conversation(**convo_doc)
    else:
        convo = Conversation()
        await db.conversations.insert_one(convo.model_dump())

    # Save user message
    user_msg = Message(conversation_id=convo.id, role="user", content=req.message)
    await db.messages.insert_one(user_msg.model_dump())

    # Load history
    history_docs = await db.messages.find(
        {"conversation_id": convo.id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    # Get all messages except the current user_msg (we will send it via send_message)
    history = [Message(**d) for d in history_docs if d["id"] != user_msg.id]

    # Build LlmChat
    chat_client = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=convo.id,
        system_message=KOMPAS_SYSTEM_PROMPT,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)

    # Replay history (so model has context). Library manages session messages itself but to be safe,
    # we use the session_id which auto-persists internal context. For first request only this is needed.
    # However the LlmChat library uses session_id to maintain history server-side via DB.
    # To keep things simple and consistent, we pass full history as single concatenated prior context only if needed.
    # The library currently does NOT persist; it tracks messages within the LlmChat instance only.
    # So we replay all prior messages by injecting them via UserMessage call repeatedly is not ideal.
    # Workaround: include conversation history into the user prompt itself if no library-level memory.
    # Simpler approach: prefix the message with a short context block.

    if history:
        ctx_lines = []
        for m in history[-12:]:
            who = "Gebruiker" if m.role == "user" else "Kompas"
            ctx_lines.append(f"{who}: {m.content}")
        context_block = "\n".join(ctx_lines)
        prompt_text = f"[Eerdere berichten in dit gesprek:]\n{context_block}\n\n[Nieuw bericht van gebruiker:]\n{req.message}"
    else:
        prompt_text = req.message

    try:
        reply_raw = await chat_client.send_message(UserMessage(text=prompt_text))
    except Exception as e:
        logger.error(f"LLM error: {e}")
        raise HTTPException(status_code=502, detail=f"llm_error: {str(e)}")

    crisis_detected = detect_crisis(req.message)
    cleaned_reply, suggested_test_id = detect_suggested_test(reply_raw)

    # Don't double-suggest if conversation already has a suggestion
    if convo.suggested_test_id and suggested_test_id:
        suggested_test_id = None

    assistant_msg = Message(
        conversation_id=convo.id,
        role="assistant",
        content=cleaned_reply,
        suggested_test_id=suggested_test_id,
    )
    await db.messages.insert_one(assistant_msg.model_dump())

    # Auto-title conversation after first AI reply
    update_fields = {"updated_at": now_iso()}
    if convo.title == "Nieuw gesprek":
        # Use first user message (trimmed) as title
        title = req.message.strip().split("\n")[0]
        title = title[:60] + ("…" if len(title) > 60 else "")
        update_fields["title"] = title
    if suggested_test_id and not convo.suggested_test_id:
        update_fields["suggested_test_id"] = suggested_test_id

    await db.conversations.update_one({"id": convo.id}, {"$set": update_fields})

    return ChatResponse(
        conversation_id=convo.id,
        user_message=user_msg,
        assistant_message=assistant_msg,
        suggested_test_id=suggested_test_id,
        crisis_detected=crisis_detected,
    )


@api_router.get("/conversations")
async def list_conversations():
    docs = await db.conversations.find({}, {"_id": 0}).sort("updated_at", -1).to_list(500)
    return docs


@api_router.get("/conversations/{convo_id}")
async def get_conversation(convo_id: str):
    convo = await db.conversations.find_one({"id": convo_id}, {"_id": 0})
    if not convo:
        raise HTTPException(status_code=404, detail="not_found")
    msgs = await db.messages.find({"conversation_id": convo_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return {"conversation": convo, "messages": msgs}


@api_router.delete("/conversations/{convo_id}")
async def delete_conversation(convo_id: str):
    await db.messages.delete_many({"conversation_id": convo_id})
    res = await db.conversations.delete_one({"id": convo_id})
    return {"deleted": res.deleted_count}


# ─────────────────────────────────────────────────────
# ASSESSMENT ENDPOINTS
# ─────────────────────────────────────────────────────

@api_router.post("/assessment-narrative", response_model=NarrativeResponse)
async def assessment_narrative(req: NarrativeRequest):
    subscale_str = ""
    if req.subscales:
        subscale_str = "\nSubschalen: " + ", ".join(f"{k}={v}" for k, v in req.subscales.items())

    # NOTE: crisis_flag is intentionally NOT forwarded to the LLM — it would otherwise
    # cue the model into emitting hotline language despite the system prompt forbidding it.
    user_text = (
        f"Test: {req.assessment_title}\n"
        f"Score: {req.score} / {req.max_score}\n"
        f"Categorie: {req.interpretation_label}{subscale_str}"
    )

    chat_client = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"narrative-{uuid.uuid4()}",
        system_message=NARRATIVE_SYSTEM_PROMPT,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)

    try:
        text = await chat_client.send_message(UserMessage(text=user_text))
    except Exception as e:
        logger.error(f"Narrative LLM error: {e}")
        fallback = (
            f"Je hebt {req.score} van {req.max_score} gescoord, wat valt onder de categorie "
            f"'{req.interpretation_label.lower()}'. Wat dit betekent verschilt voor iedereen — "
            f"een gesprek met een huisarts of psycholoog kan helpen om dit beter te begrijpen. "
            f"Dit is een indicatie, geen diagnose."
        )
        return NarrativeResponse(narrative=fallback)

    # Belt-and-suspenders: scrub any hotline / emergency-number references that
    # the model may still slip in. LLM compliance with negative instructions is
    # unreliable, so policy-critical filtering happens here as well.
    cleaned = _scrub_hotline_refs(text.strip())
    return NarrativeResponse(narrative=cleaned)


_HOTLINE_PATTERNS = [
    r"\b18\s?13\b",
    r"\b17\s?12\b",
    r"\b113\b",
    r"\b112\b",
    r"\bzelfmoordlijn\w*\b",
    r"\bhulplijn\w*\b",
    r"\bnoodlijn\w*\b",
    r"\btele[\s\-]?onthaal\b",
    r"\bspoed(?:geval)?\b",
]


def _scrub_hotline_refs(text: str) -> str:
    """Remove sentences that reference hotlines or emergency numbers entirely."""
    import re
    # Split into sentences, drop any that match patterns
    sentences = re.split(r"(?<=[.!?])\s+", text)
    kept = []
    combined = re.compile("|".join(_HOTLINE_PATTERNS), flags=re.IGNORECASE)
    for s in sentences:
        if combined.search(s):
            continue
        kept.append(s)
    out = " ".join(kept).strip()
    # If everything was scrubbed (edge case), return a safe fallback
    if not out:
        out = (
            "Wat dit resultaat precies voor jou betekent, verschilt van persoon tot persoon. "
            "Een gesprek met een huisarts of psycholoog kan helpen om er meer zicht op te krijgen. "
            "Dit is een indicatie, geen diagnose."
        )
    return out


@api_router.post("/assessment-results", response_model=AssessmentResultOut)
async def save_assessment_result(req: AssessmentResultIn):
    result = {
        "id": str(uuid.uuid4()),
        "assessment_id": req.assessment_id,
        "assessment_title": req.assessment_title,
        "raw_answers": req.raw_answers,
        "total_score": req.total_score,
        "max_score": req.max_score,
        "interpretation_label": req.interpretation_label,
        "interpretation_tier": req.interpretation_tier,
        "subscales": req.subscales,
        "crisis_flag": req.crisis_flag,
        "narrative": req.narrative,
        "completed_at": now_iso(),
    }
    await db.assessment_results.insert_one(result.copy())
    return AssessmentResultOut(**{k: v for k, v in result.items() if k != "raw_answers"})


@api_router.get("/assessment-results")
async def list_assessment_results(assessment_id: Optional[str] = None):
    q = {}
    if assessment_id:
        q["assessment_id"] = assessment_id
    docs = await db.assessment_results.find(q, {"_id": 0, "raw_answers": 0}).sort("completed_at", -1).to_list(500)
    return docs


@api_router.get("/assessment-results/{result_id}")
async def get_assessment_result(result_id: str):
    doc = await db.assessment_results.find_one({"id": result_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="not_found")
    return doc


# ─────────────────────────────────────────────────────
# ADMIN ENDPOINTS (beheerconsole — token-gated)
# ─────────────────────────────────────────────────────

from fastapi import Header

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'kompas-admin-dev-change-me')


def require_admin(x_admin_token: Optional[str] = Header(default=None)):
    if not x_admin_token or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="unauthorized")
    return True


@api_router.get("/admin/overview")
async def admin_overview(_: bool = Depends(require_admin)):
    convos = await db.conversations.count_documents({})
    msgs = await db.messages.count_documents({})
    results = await db.assessment_results.count_documents({})
    recent_convos = await db.conversations.find({}, {"_id": 0}).sort("updated_at", -1).limit(10).to_list(10)
    recent_results = await db.assessment_results.find(
        {}, {"_id": 0, "raw_answers": 0}
    ).sort("completed_at", -1).limit(10).to_list(10)
    return {
        "totals": {
            "conversations": convos,
            "messages": msgs,
            "assessment_results": results,
        },
        "recent_conversations": recent_convos,
        "recent_assessment_results": recent_results,
    }


@api_router.get("/admin/conversations")
async def admin_list_conversations(
    limit: int = 200,
    skip: int = 0,
    _: bool = Depends(require_admin),
):
    convos = await db.conversations.find({}, {"_id": 0}).sort("updated_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"count": len(convos), "conversations": convos}


@api_router.get("/admin/conversations/{convo_id}")
async def admin_get_conversation(convo_id: str, _: bool = Depends(require_admin)):
    convo = await db.conversations.find_one({"id": convo_id}, {"_id": 0})
    if not convo:
        raise HTTPException(status_code=404, detail="not_found")
    msgs = await db.messages.find({"conversation_id": convo_id}, {"_id": 0}).sort("created_at", 1).to_list(2000)
    return {"conversation": convo, "messages": msgs}


@api_router.get("/admin/assessment-results")
async def admin_list_assessment_results(
    limit: int = 200,
    skip: int = 0,
    _: bool = Depends(require_admin),
):
    docs = await db.assessment_results.find({}, {"_id": 0}).sort("completed_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"count": len(docs), "results": docs}


@api_router.get("/")
async def root():
    return {"app": "Kompas", "status": "ok"}


# ─────────────────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
