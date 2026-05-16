"""Consistency check for the assessment-narrative scrub fix (iteration 3).

Spec:
- PHQ-9 score=27/27 'Ernstig' with crisis_flag=true → narrative must NEVER contain
  any of: 1813, 1712, 113, 112, zelfmoordlijn, hulplijn, noodlijn, tele-onthaal, spoed,
  tele onthaal — across 3 consecutive calls.
- PHQ-9 score=3/27 'Mild' with crisis_flag=false → must still return a sensible
  narrative of >= 100 words.
"""
import os
import re
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
API = f"{BASE_URL}/api"
TIMEOUT = 90

FORBIDDEN = re.compile(
    r"(1813|1712|\b113\b|\b112\b|zelfmoordlijn\w*|hulplijn\w*|noodlijn\w*|tele[- ]?onthaal|spoedgeval|\bspoed\b)",
    re.IGNORECASE,
)


@pytest.mark.parametrize("attempt", [1, 2, 3])
def test_narrative_crisis_no_forbidden_words(attempt):
    payload = {
        "assessment_id": "phq9",
        "assessment_title": "PHQ-9 — Depressie",
        "score": 27,
        "max_score": 27,
        "interpretation_label": "Ernstig",
        "crisis_flag": True,
    }
    r = requests.post(f"{API}/assessment-narrative", json=payload, timeout=TIMEOUT)
    assert r.status_code == 200, r.text
    text = r.json()["narrative"]
    m = FORBIDDEN.search(text)
    assert m is None, (
        f"[attempt {attempt}] forbidden token '{m.group(0) if m else ''}' "
        f"leaked in narrative:\n{text}"
    )
    # Sanity: still substantial enough
    assert len(text.split()) >= 80, f"narrative too short on attempt {attempt}: {text}"


def test_narrative_low_score_normal_case_still_works():
    payload = {
        "assessment_id": "phq9",
        "assessment_title": "PHQ-9 — Depressie",
        "score": 3,
        "max_score": 27,
        "interpretation_label": "Mild",
        "crisis_flag": False,
    }
    r = requests.post(f"{API}/assessment-narrative", json=payload, timeout=TIMEOUT)
    assert r.status_code == 200, r.text
    text = r.json()["narrative"]
    wc = len(text.split())
    assert wc >= 100, f"low-score narrative should still be >=100 words, got {wc}: {text}"
    # Even on a low score, there must be no hotline references
    m = FORBIDDEN.search(text)
    assert m is None, f"unexpected forbidden token '{m.group(0) if m else ''}' in low-score narrative:\n{text}"
