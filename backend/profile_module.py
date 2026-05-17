"""Kompas — Profile schema + system-prompt builder.

The user profile is a versioned JSON document that stays mostly stable over
time. It is the "duurzame context-laag" that the AI uses to personalize tone
and questions. Storage is in MongoDB collection ``profiles`` keyed by owner
(user_id for authenticated users, device_id for anonymous).

Schema version: profile_v1
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from pydantic import BaseModel, Field

PROFILE_SCHEMA_VERSION = "profile_v1"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ───── Section A: Basis ─────
class ProfileBasis(BaseModel):
    voornaam: Optional[str] = None
    geboortejaar: Optional[int] = None
    voornaamwoorden: Optional[str] = None  # "hij/hem" | "zij/haar" | "die/diens" | "anders"
    aanspreken: Optional[str] = None
    taal: Optional[str] = "nl"


# ───── Section B: Levenscontext ─────
class ProfileLevenscontext(BaseModel):
    levenssituatie: Optional[str] = None
    kinderen: Optional[str] = None  # "geen" | "1" | "2" | "3+"
    kinderen_leeftijden: Optional[str] = None
    werksituatie: Optional[str] = None
    rollen: List[str] = Field(default_factory=list)
    recente_transitie: List[str] = Field(default_factory=list)


# ───── Section C: Communicatievoorkeur ─────
class ProfileCommunicatie(BaseModel):
    toon: Optional[int] = None  # 1=direct, 5=zacht
    lengte: Optional[int] = None  # 1=kort, 5=uitgebreid
    humor: Optional[str] = None  # "graag" | "neutraal" | "liever_niet"
    vraag_stijl: List[str] = Field(default_factory=list)  # ["luisteren","doorvragen","perspectief","praktisch"]
    wat_helpt: List[str] = Field(default_factory=list)  # ["gehoord","valideren","doorvragen","herkaderen","plan","gewoon_praten"]
    vermijd_zinnen: List[str] = Field(default_factory=list)
    pet_peeves: Optional[str] = None


# ───── Section D: Wat werkt voor jou ─────
class ProfileWatWerkt(BaseModel):
    energie_bronnen: List[str] = Field(default_factory=list)
    coping: List[str] = Field(default_factory=list)
    herstel_na_overprikkeling: Optional[str] = None
    beste_tijd_dag: Optional[str] = None  # "ochtend"|"midden"|"avond"|"nacht"|"wisselend"


# ───── Section E: Mentale gezondheid (optioneel) ─────
class ProfileMentaal(BaseModel):
    hulpverlening: Optional[str] = None  # "nooit" | "verleden" | "loopt_nu"
    hulpverlener_type: List[str] = Field(default_factory=list)
    diagnoses: List[str] = Field(default_factory=list)
    medicatie: Optional[str] = None  # "ja"|"nee"|"liever_niet"
    patronen: Optional[str] = None


# ───── Section F: Waarden & richting ─────
class ProfileWaarden(BaseModel):
    top_waarden: List[str] = Field(default_factory=list, max_length=3)
    richting: Optional[str] = None  # 1 zin: "over een jaar zou ik…"
    trots: Optional[str] = None


# ───── Section G: Steun & relaties ─────
class ProfileSteun(BaseModel):
    vertrouwens_rollen: List[str] = Field(default_factory=list)
    hulp_vragen_gemak: Optional[int] = None  # 1-5
    eenzaamheid: Optional[int] = None  # 1-5
    crisis_contact: Optional[str] = None


# ───── Section H: Levensbeschouwelijk (optioneel) ─────
class ProfileLevensbeschouwing(BaseModel):
    speelt_rol: Optional[str] = None  # "ja"|"nee"|"soms"
    toelichting: Optional[str] = None
    cultureel_kader: Optional[str] = None


# ───── AI-derived layer (system-built, user-readable) ─────
class ProfileAIDerived(BaseModel):
    """Built passively by background extraction. User can read & correct."""

    terugkerende_themas: List[Dict[str, Any]] = Field(default_factory=list)  # [{tag, count, last_seen}]
    triggers: List[str] = Field(default_factory=list)
    zware_tijden: List[str] = Field(default_factory=list)
    wat_werkt: List[str] = Field(default_factory=list)
    assessment_trend: Dict[str, Any] = Field(default_factory=dict)


# ───── Full profile ─────
class Profile(BaseModel):
    schema_version: str = PROFILE_SCHEMA_VERSION
    owner_user_id: Optional[str] = None
    owner_device_id: Optional[str] = None
    basis: ProfileBasis = Field(default_factory=ProfileBasis)
    levenscontext: ProfileLevenscontext = Field(default_factory=ProfileLevenscontext)
    communicatie: ProfileCommunicatie = Field(default_factory=ProfileCommunicatie)
    wat_werkt: ProfileWatWerkt = Field(default_factory=ProfileWatWerkt)
    mentaal: ProfileMentaal = Field(default_factory=ProfileMentaal)
    waarden: ProfileWaarden = Field(default_factory=ProfileWaarden)
    steun: ProfileSteun = Field(default_factory=ProfileSteun)
    levensbeschouwing: ProfileLevensbeschouwing = Field(default_factory=ProfileLevensbeschouwing)
    ai_derived: ProfileAIDerived = Field(default_factory=ProfileAIDerived)
    onboarding_completed: bool = False
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


# ────────────────────────────────────────────────────────────────
# Profile completion %  — per section, used by UI progress rings
# ────────────────────────────────────────────────────────────────

SECTION_FIELDS = {
    "basis": ["voornaam", "geboortejaar", "voornaamwoorden", "aanspreken"],
    "levenscontext": ["levenssituatie", "werksituatie", "rollen", "recente_transitie"],
    "communicatie": ["toon", "lengte", "humor", "vraag_stijl", "wat_helpt", "vermijd_zinnen"],
    "wat_werkt": ["energie_bronnen", "coping", "beste_tijd_dag"],
    "mentaal": ["hulpverlening", "diagnoses", "patronen"],
    "waarden": ["top_waarden", "richting", "trots"],
    "steun": ["vertrouwens_rollen", "hulp_vragen_gemak", "crisis_contact"],
    "levensbeschouwing": ["speelt_rol", "toelichting"],
}


def section_completion(profile: Dict[str, Any], section: str) -> float:
    fields = SECTION_FIELDS.get(section, [])
    if not fields:
        return 0.0
    sect = profile.get(section, {}) or {}
    filled = 0
    for f in fields:
        v = sect.get(f)
        if v is None:
            continue
        if isinstance(v, str) and v.strip() == "":
            continue
        if isinstance(v, list) and len(v) == 0:
            continue
        filled += 1
    return round(filled / len(fields), 2)


def overall_completion(profile: Dict[str, Any]) -> float:
    sects = list(SECTION_FIELDS.keys())
    if not sects:
        return 0.0
    total = sum(section_completion(profile, s) for s in sects)
    return round(total / len(sects), 2)


# ────────────────────────────────────────────────────────────────
# System-prompt context builder
# ────────────────────────────────────────────────────────────────

# Human-friendly labels per code
_TOON_LABELS = {1: "direct", 2: "iets directer", 3: "neutraal", 4: "iets zachter", 5: "zacht"}
_LENGTE_LABELS = {
    1: "kort en to-the-point",
    2: "vrij beknopt",
    3: "neutraal",
    4: "iets uitgebreider",
    5: "uitgebreid en reflectief",
}


def _label(value: Optional[int], mapping: Dict[int, str]) -> Optional[str]:
    if value is None:
        return None
    return mapping.get(int(value))


def _truthy(v) -> bool:
    if v is None:
        return False
    if isinstance(v, (list, dict)):
        return len(v) > 0
    if isinstance(v, str):
        return len(v.strip()) > 0
    return True


def build_profile_context(
    profile: Optional[Dict[str, Any]],
    recent_themes: Optional[List[str]] = None,
    recent_assessment_summary: Optional[str] = None,
) -> str:
    """Return a compact context block for the system prompt, or empty string."""
    if not profile:
        return ""

    lines: List[str] = []

    basis = profile.get("basis", {}) or {}
    naam = basis.get("aanspreken") or basis.get("voornaam")
    if naam:
        lines.append(f"- Aanspreken als: {naam}")
    vw = basis.get("voornaamwoorden")
    if vw:
        lines.append(f"- Voornaamwoorden: {vw}")
    by = basis.get("geboortejaar")
    if by:
        try:
            age = datetime.now().year - int(by)
            lines.append(f"- Leeftijd: ongeveer {age}")
        except Exception:
            pass

    lv = profile.get("levenscontext", {}) or {}
    bits: List[str] = []
    if lv.get("levenssituatie"):
        bits.append(lv["levenssituatie"])
    if lv.get("werksituatie"):
        bits.append(lv["werksituatie"])
    if lv.get("rollen"):
        bits.append("rollen: " + ", ".join(lv["rollen"]))
    if bits:
        lines.append("- Levensfase: " + " · ".join(bits))
    if lv.get("recente_transitie"):
        lines.append("- Recente transitie: " + ", ".join(lv["recente_transitie"]))

    comm = profile.get("communicatie", {}) or {}
    pref_bits: List[str] = []
    t = _label(comm.get("toon"), _TOON_LABELS)
    if t:
        pref_bits.append(f"toon: {t}")
    L = _label(comm.get("lengte"), _LENGTE_LABELS)
    if L:
        pref_bits.append(f"lengte: {L}")
    if comm.get("humor") == "graag":
        pref_bits.append("droge humor welkom")
    elif comm.get("humor") == "liever_niet":
        pref_bits.append("liever serieus, geen humor")
    if comm.get("vraag_stijl"):
        pref_bits.append("voorkeur: " + ", ".join(comm["vraag_stijl"]))
    if pref_bits:
        lines.append("- Toon-voorkeur: " + " · ".join(pref_bits))
    if comm.get("wat_helpt"):
        lines.append("- Wil meestal: " + ", ".join(comm["wat_helpt"]))
    if comm.get("vermijd_zinnen"):
        lines.append("- VERMIJD: " + ", ".join(comm["vermijd_zinnen"]))

    ww = profile.get("wat_werkt", {}) or {}
    if ww.get("energie_bronnen"):
        lines.append("- Geeft energie: " + ", ".join(ww["energie_bronnen"]))
    if ww.get("coping"):
        lines.append("- Werkende coping: " + ", ".join(ww["coping"]))
    if ww.get("beste_tijd_dag"):
        lines.append(f"- Functioneert best in de {ww['beste_tijd_dag']}")

    mh = profile.get("mentaal", {}) or {}
    if mh.get("diagnoses"):
        lines.append("- Bekend (door user benoemd): " + ", ".join(mh["diagnoses"]))
    if mh.get("patronen"):
        lines.append(f"- Eigen patroon: \"{mh['patronen']}\"")

    wa = profile.get("waarden", {}) or {}
    if wa.get("top_waarden"):
        lines.append("- Belangrijkste waarden nu: " + ", ".join(wa["top_waarden"]))
    if wa.get("richting"):
        lines.append(f"- Richting: {wa['richting']}")

    st = profile.get("steun", {}) or {}
    if st.get("crisis_contact"):
        lines.append(f"- Vertrouwd in crisis: {st['crisis_contact']}")

    # AI-derived
    ai = profile.get("ai_derived", {}) or {}
    if recent_themes:
        lines.append("- Recent terugkerende thema's: " + ", ".join(recent_themes[:5]))
    elif ai.get("terugkerende_themas"):
        tt = [t.get("tag") for t in ai["terugkerende_themas"][:5] if t.get("tag")]
        if tt:
            lines.append("- Recent terugkerende thema's: " + ", ".join(tt))

    if recent_assessment_summary:
        lines.append(f"- Assessment-trend: {recent_assessment_summary}")
    elif ai.get("assessment_trend"):
        trend = ai["assessment_trend"]
        if isinstance(trend, dict) and trend:
            pieces = [f"{k}: {v}" for k, v in list(trend.items())[:3]]
            lines.append("- Assessment-trend: " + " · ".join(pieces))

    if not lines:
        return ""

    return (
        "\n\nGEBRUIKERSCONTEXT (vertrouwelijk, gebruik om gesprek af te stemmen,\n"
        "vermeld NOOIT letterlijk dat je dit ziet):\n"
        + "\n".join(lines)
    )


# ────────────────────────────────────────────────────────────────
# Background extraction — light AI-call after a chat turn
# ────────────────────────────────────────────────────────────────

PROFILE_EXTRACT_PROMPT = """Je analyseert ÉÉN bericht van een gebruiker in een chat met
Kompas. Doel: nieuwe, stabiele profiel-feiten herkennen die nuttig zijn
voor toekomstige gesprekken.

Geef terug als geldige JSON met maximum 2 voorstellen. Format:
{
  "suggestions": [
    {
      "field_path": "communicatie.vermijd_zinnen",
      "value": "kop op",
      "rationale": "User schreef letterlijk: 'als ik nog 1x kop op hoor...'"
    }
  ]
}

Beperkingen:
- ALLEEN duurzame feiten of voorkeuren (geen tijdelijke gevoelens als "ik ben moe").
- field_path moet bestaan in dit schema:
  basis.{voornaam,aanspreken,voornaamwoorden,geboortejaar}
  levenscontext.{levenssituatie,kinderen,werksituatie,rollen,recente_transitie}
  communicatie.{toon,lengte,humor,vraag_stijl,wat_helpt,vermijd_zinnen,pet_peeves}
  wat_werkt.{energie_bronnen,coping,herstel_na_overprikkeling,beste_tijd_dag}
  mentaal.{hulpverlening,diagnoses,patronen}
  waarden.{top_waarden,richting,trots}
  steun.{vertrouwens_rollen,crisis_contact}
- Geen voorstel als er niets stabiels in het bericht zit. Lege "suggestions" lijst is OK.
- Niets verzinnen. Geen aannames.
- value moet exact citeerbaar zijn voor de user (kort en correct).
- Geen Nederlands buiten JSON; geen toelichting buiten JSON.
"""
