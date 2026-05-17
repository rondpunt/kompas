"""Regression tests for Stripe checkout + profile memory/suggestions integration."""
import os
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "EXPO_PUBLIC_BACKEND_URL missing"
API = f"{BASE_URL}/api"
TIMEOUT = 120
MONGO_URL = os.environ.get("MONGO_URL", "")
DB_NAME = os.environ.get("DB_NAME", "")


def _client(device_id: str) -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "X-Device-Id": device_id,
    })
    return s


def _post_chat(client: requests.Session, message: str, conversation_id: str | None = None) -> dict:
    payload = {"message": message}
    if conversation_id:
        payload["conversation_id"] = conversation_id
    r = client.post(f"{API}/chat", json=payload, timeout=TIMEOUT)
    assert r.status_code == 200, r.text
    return r.json()


def _generate_suggestion(client: requests.Session) -> dict:
    """Drive 10th/20th turn extraction; retry once for LLM flakiness."""
    r_mem = client.post(f"{API}/profile/memory", json={"enabled": True}, timeout=20)
    assert r_mem.status_code == 200, r_mem.text

    convo_id = None
    prompts = [
        "Noem me TEST_Pieter.",
        "Spreek me aan met je/jij, dat voelt natuurlijker.",
        "Ik heb twee kinderen en een drukke job.",
        "Humor mag, maar geen flauwe clichés alsjeblieft.",
        "Ik pieker vooral 's avonds.",
        "Korte antwoorden helpen mij beter.",
        "Ik wil minder zinnen als 'neem je tijd'.",
        "Mijn energie komt van wandelen in het park.",
        "Ik wil dat je direct en helder bent.",
        "Onthoud dit soort voorkeuren voor later.",
    ]

    last = None
    for _attempt in range(2):
        for prompt in prompts:
            last = _post_chat(client, prompt, convo_id)
            convo_id = last["conversation_id"]
        suggestion = (last or {}).get("profile_suggestion")
        if suggestion:
            return suggestion

    listed = client.get(f"{API}/profile/suggestions", timeout=20)
    assert listed.status_code == 200, listed.text
    arr = listed.json()
    if arr:
        return arr[0]

    pytest.fail("Expected profile_suggestion around 10th user turn with memory enabled, but none was produced")


def _read_profile_value(profile: dict, field_path: str):
    cur = profile
    for part in field_path.split("."):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(part)
    return cur


def _seed_pending_suggestion(device_id: str, field_path: str, value):
    from pymongo import MongoClient

    assert MONGO_URL and DB_NAME, "MONGO_URL/DB_NAME missing for seeded confirm tests"
    sug_id = str(uuid.uuid4())
    mongo = MongoClient(MONGO_URL)
    coll = mongo[DB_NAME]["profile_suggestions"]
    coll.insert_one({
        "id": sug_id,
        "owner_user_id": None,
        "owner_device_id": device_id,
        "conversation_id": f"seed-{uuid.uuid4().hex[:8]}",
        "field_path": field_path,
        "value": value,
        "rationale": "seeded by test",
        "status": "pending",
        "created_at": "2026-01-01T00:00:00+00:00",
    })
    mongo.close()
    return sug_id


# Stripe checkout behavior coverage
class TestStripeCheckoutSession:
    def test_checkout_monthly_and_annual_response_shape(self):
        c = _client(f"TEST_stripe_{uuid.uuid4().hex[:8]}")
        for plan in ("monthly", "annual"):
            r = c.post(
                f"{API}/stripe/checkout-session",
                json={"plan": plan, "user_id": "anonymous"},
                timeout=30,
            )
            assert r.status_code == 200, r.text
            data = r.json()
            assert "checkoutUrl" in data
            assert "mock" in data
            assert isinstance(data.get("mock"), bool)
            if data["mock"]:
                assert data["checkoutUrl"] is None
                assert isinstance(data.get("message"), str) and len(data["message"]) > 0
            else:
                assert isinstance(data["checkoutUrl"], str) and data["checkoutUrl"].startswith("http")

    def test_checkout_invalid_plan_400(self):
        c = _client(f"TEST_stripe_{uuid.uuid4().hex[:8]}")
        r = c.post(
            f"{API}/stripe/checkout-session",
            json={"plan": "weekly", "user_id": "anonymous"},
            timeout=20,
        )
        assert r.status_code == 400


# Profile memory toggle + suggestion pipeline coverage
class TestProfileMemoryAndSuggestions:
    def test_profile_memory_get_post_roundtrip(self):
        c = _client(f"TEST_mem_{uuid.uuid4().hex[:8]}")

        r0 = c.get(f"{API}/profile/memory", timeout=20)
        assert r0.status_code == 200, r0.text
        assert isinstance(r0.json().get("enabled"), bool)

        r1 = c.post(f"{API}/profile/memory", json={"enabled": False}, timeout=20)
        assert r1.status_code == 200, r1.text
        assert r1.json().get("enabled") is False

        r2 = c.get(f"{API}/profile/memory", timeout=20)
        assert r2.status_code == 200
        assert r2.json().get("enabled") is False

        r3 = c.post(f"{API}/profile/memory", json={"enabled": True}, timeout=20)
        assert r3.status_code == 200
        assert r3.json().get("enabled") is True

    def test_chat_no_profile_suggestion_when_memory_disabled(self):
        c = _client(f"TEST_memoff_{uuid.uuid4().hex[:8]}")
        rm = c.post(f"{API}/profile/memory", json={"enabled": False}, timeout=20)
        assert rm.status_code == 200, rm.text

        convo_id = None
        last = None
        for i in range(10):
            last = _post_chat(c, f"TEST mem-off bericht {i+1}: noem me Kaat en ik heb twee kinderen.", convo_id)
            convo_id = last["conversation_id"]

        assert last is not None
        assert last.get("profile_suggestion") is None

        rs = c.get(f"{API}/profile/suggestions", timeout=20)
        assert rs.status_code == 200
        assert rs.json() == []

    def test_chat_profile_suggestion_appears_on_10th_turn_with_memory_enabled(self):
        c = _client(f"TEST_sugrej_{uuid.uuid4().hex[:8]}")
        sug = _generate_suggestion(c)
        sug_id = sug["id"]

        rs = c.get(f"{API}/profile/suggestions", timeout=20)
        assert rs.status_code == 200, rs.text
        pending_ids = {d["id"] for d in rs.json()}
        assert sug_id in pending_ids

        rc = c.post(
            f"{API}/profile/suggestions/confirm",
            json={"suggestion_id": sug_id, "accept": False},
            timeout=20,
        )
        assert rc.status_code == 200, rc.text
        assert rc.json().get("accepted") is False

        rs2 = c.get(f"{API}/profile/suggestions", timeout=20)
        assert rs2.status_code == 200
        pending_ids_after = {d["id"] for d in rs2.json()}
        assert sug_id not in pending_ids_after

    def test_confirm_reject_with_seeded_pending_suggestion(self):
        device_id = f"TEST_seed_reject_{uuid.uuid4().hex[:8]}"
        c = _client(device_id)
        sug_id = _seed_pending_suggestion(device_id, "basis.voornaam", "TEST_Jan")

        rc = c.post(
            f"{API}/profile/suggestions/confirm",
            json={"suggestion_id": sug_id, "accept": False},
            timeout=20,
        )
        assert rc.status_code == 200, rc.text
        assert rc.json().get("accepted") is False

        rs = c.get(f"{API}/profile/suggestions", timeout=20)
        assert rs.status_code == 200
        ids = {d["id"] for d in rs.json()}
        assert sug_id not in ids

    def test_confirm_accept_with_seeded_pending_suggestion_updates_profile(self):
        device_id = f"TEST_seed_accept_{uuid.uuid4().hex[:8]}"
        c = _client(device_id)
        field_path = "communicatie.vermijd_zinnen"
        value = "TEST_zeg_niet_neem_je_tijd"
        sug_id = _seed_pending_suggestion(device_id, field_path, value)

        rc = c.post(
            f"{API}/profile/suggestions/confirm",
            json={"suggestion_id": sug_id, "accept": True},
            timeout=20,
        )
        assert rc.status_code == 200, rc.text
        data = rc.json()
        assert data.get("accepted") is True

        rp = c.get(f"{API}/profile/export", timeout=20)
        assert rp.status_code == 200, rp.text
        profile = rp.json().get("profile", {})
        saved = _read_profile_value(profile, field_path)
        if isinstance(saved, list):
            assert value in saved
        else:
            assert saved == value
