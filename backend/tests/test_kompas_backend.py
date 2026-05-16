"""Kompas backend integration tests against public preview URL."""
import os
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "EXPO_PUBLIC_BACKEND_URL missing"
API = f"{BASE_URL}/api"

session = requests.Session()
session.headers.update({"Content-Type": "application/json"})
TIMEOUT = 90  # LLM calls can be slow


# ---------- Health ----------
def test_root_ok():
    r = session.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j.get("app") == "Kompas"


# ---------- Chat: Belgian Dutch + context + suggest test ----------
class TestChat:
    convo_id = None

    def test_01_chat_initial_belgian_dutch(self):
        r = session.post(f"{API}/chat", json={"message": "Hey, ik voel me al een paar dagen wat plat. Wat moet ik daarmee?"}, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "conversation_id" in j
        assert j["user_message"]["role"] == "user"
        assert j["assistant_message"]["role"] == "assistant"
        assert "crisis_detected" in j
        assert j["crisis_detected"] is False
        content = j["assistant_message"]["content"]
        assert content and len(content) > 5
        TestChat.convo_id = j["conversation_id"]

    def test_02_chat_followup_context(self):
        assert TestChat.convo_id, "no conversation yet"
        r = session.post(f"{API}/chat", json={"conversation_id": TestChat.convo_id, "message": "Vooral 's avonds is het zwaar."}, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["conversation_id"] == TestChat.convo_id

    def test_03_chat_suggest_test_or_followup(self):
        # AI may suggest asrs6 or ask follow-up — either is valid per spec.
        r = session.post(
            f"{API}/chat",
            json={"message": "Ik kan me al weken niet concentreren, ik vergeet constant alles, ik stel alles uit. Wat is dit?"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        j = r.json()
        # The reply must not include the SUGGEST_TEST tag literal
        assert "[SUGGEST_TEST" not in j["assistant_message"]["content"]

    def test_04_chat_crisis_detection(self):
        r = session.post(
            f"{API}/chat",
            json={"message": "Ik denk soms aan zelfmoord, ik weet niet meer wat te doen."},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["crisis_detected"] is True


# ---------- Conversations CRUD ----------
class TestConversations:
    def test_list_conversations_sorted(self):
        r = session.get(f"{API}/conversations", timeout=20)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        if len(arr) >= 2:
            assert arr[0]["updated_at"] >= arr[1]["updated_at"]

    def test_get_conversation_with_messages(self):
        if not TestChat.convo_id:
            pytest.skip("no conversation")
        r = session.get(f"{API}/conversations/{TestChat.convo_id}", timeout=20)
        assert r.status_code == 200
        j = r.json()
        assert j["conversation"]["id"] == TestChat.convo_id
        assert isinstance(j["messages"], list)
        assert len(j["messages"]) >= 2

    def test_get_conversation_404(self):
        r = session.get(f"{API}/conversations/nope-no-such-id", timeout=15)
        assert r.status_code == 404

    def test_delete_conversation(self):
        # create a throwaway convo via chat
        r = session.post(f"{API}/chat", json={"message": "TEST_throwaway_conversation_voor_delete"}, timeout=TIMEOUT)
        assert r.status_code == 200
        cid = r.json()["conversation_id"]
        d = session.delete(f"{API}/conversations/{cid}", timeout=20)
        assert d.status_code == 200
        assert d.json().get("deleted") == 1
        # verify gone
        g = session.get(f"{API}/conversations/{cid}", timeout=15)
        assert g.status_code == 404


# ---------- Narrative ----------
class TestNarrative:
    def test_narrative_phq9_minimal(self):
        r = session.post(f"{API}/assessment-narrative", json={
            "assessment_id": "phq9",
            "assessment_title": "PHQ-9 — Depressie",
            "score": 0,
            "max_score": 27,
            "interpretation_label": "Minimaal",
            "crisis_flag": False,
        }, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        text = r.json()["narrative"]
        assert "indicatie" in text.lower() or "geen diagnose" in text.lower()
        # 150-220 words approx
        wc = len(text.split())
        assert 80 <= wc <= 320, f"unexpected word count {wc}"

    def test_narrative_crisis_does_not_mention_1813(self):
        # Per iteration-2 spec: narrative must NOT include phone numbers/hulplijnen even at crisis_flag=true
        r = session.post(f"{API}/assessment-narrative", json={
            "assessment_id": "phq9",
            "assessment_title": "PHQ-9 — Depressie",
            "score": 24,
            "max_score": 27,
            "interpretation_label": "Ernstig",
            "crisis_flag": True,
        }, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        text = r.json()["narrative"]
        assert "1813" not in text, f"narrative should NOT mention 1813: {text}"
        assert "zelfmoordlijn" not in text.lower(), f"narrative should NOT mention zelfmoordlijn: {text}"


# ---------- Chat must NOT proactively mention 1813 ----------
class TestChatNoCrisisCTA:
    def test_chat_everyday_problem_no_1813(self):
        r = session.post(f"{API}/chat", json={"message": "ik voel me al een paar dagen plat"}, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        content = r.json()["assistant_message"]["content"]
        assert "1813" not in content, f"chat should NOT proactively mention 1813: {content}"
        assert "zelfmoordlijn" not in content.lower()


# ---------- Admin endpoints (token-gated) ----------
ADMIN_TOKEN = "kompas-admin-dev-2026"


class TestAdminAuth:
    def test_overview_no_token_401(self):
        r = requests.get(f"{API}/admin/overview", timeout=15)
        assert r.status_code == 401

    def test_overview_wrong_token_401(self):
        r = requests.get(f"{API}/admin/overview", headers={"X-Admin-Token": "wrong-token"}, timeout=15)
        assert r.status_code == 401

    def test_conversations_no_token_401(self):
        r = requests.get(f"{API}/admin/conversations", timeout=15)
        assert r.status_code == 401

    def test_assessment_results_no_token_401(self):
        r = requests.get(f"{API}/admin/assessment-results", timeout=15)
        assert r.status_code == 401


class TestAdminEndpoints:
    headers = {"X-Admin-Token": ADMIN_TOKEN}

    def test_overview_ok(self):
        r = requests.get(f"{API}/admin/overview", headers=self.headers, timeout=20)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "totals" in j
        assert "conversations" in j["totals"]
        assert "messages" in j["totals"]
        assert "assessment_results" in j["totals"]
        assert isinstance(j["totals"]["conversations"], int)
        assert isinstance(j["recent_conversations"], list)
        assert isinstance(j["recent_assessment_results"], list)

    def test_admin_list_conversations(self):
        r = requests.get(f"{API}/admin/conversations", headers=self.headers, timeout=20)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "count" in j and "conversations" in j
        assert isinstance(j["conversations"], list)

    def test_admin_get_conversation(self):
        if not TestChat.convo_id:
            pytest.skip("no conversation seeded")
        r = requests.get(f"{API}/admin/conversations/{TestChat.convo_id}", headers=self.headers, timeout=20)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["conversation"]["id"] == TestChat.convo_id
        assert isinstance(j["messages"], list)

    def test_admin_get_conversation_404(self):
        r = requests.get(f"{API}/admin/conversations/no-such-id", headers=self.headers, timeout=15)
        assert r.status_code == 404

    def test_admin_assessment_results_includes_raw_answers(self):
        r = requests.get(f"{API}/admin/assessment-results", headers=self.headers, timeout=20)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "count" in j and "results" in j
        assert isinstance(j["results"], list)
        # At least one result should have raw_answers (we seeded one in TestAssessmentResults)
        if j["results"]:
            # find one where raw_answers is present
            with_raw = [d for d in j["results"] if "raw_answers" in d and d["raw_answers"] is not None]
            assert with_raw, "expected at least one result with raw_answers in admin endpoint"


# ---------- Assessment results CRUD ----------
# Iteration 3: device_id scoping is now enforced — save+list need same X-Device-Id.
class TestAssessmentResults:
    rid = None
    DEVICE_ID = "TEST_legacy_assessment_device"

    def test_save_result(self):
        payload = {
            "assessment_id": "phq9",
            "assessment_title": "PHQ-9 — Depressie",
            "raw_answers": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            "total_score": 0,
            "max_score": 27,
            "interpretation_label": "Minimaal",
            "interpretation_tier": "minimal",
            "crisis_flag": False,
            "narrative": "TEST_narrative",
        }
        r = session.post(
            f"{API}/assessment-results",
            json=payload,
            headers={"X-Device-Id": self.DEVICE_ID},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        j = r.json()
        assert "id" in j and "completed_at" in j
        assert j["total_score"] == 0
        assert j["interpretation_label"] == "Minimaal"
        TestAssessmentResults.rid = j["id"]

    def test_list_results_with_filter(self):
        r = session.get(
            f"{API}/assessment-results",
            params={"assessment_id": "phq9"},
            headers={"X-Device-Id": self.DEVICE_ID},
            timeout=20,
        )
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        assert any(d["id"] == TestAssessmentResults.rid for d in arr)
        # raw_answers excluded
        for d in arr:
            assert "raw_answers" not in d

    def test_get_single_result(self):
        assert TestAssessmentResults.rid
        r = session.get(f"{API}/assessment-results/{TestAssessmentResults.rid}", timeout=20)
        assert r.status_code == 200
        j = r.json()
        assert j["id"] == TestAssessmentResults.rid
        assert j["assessment_id"] == "phq9"

    def test_get_result_404(self):
        r = session.get(f"{API}/assessment-results/no-such-id", timeout=15)
        assert r.status_code == 404
