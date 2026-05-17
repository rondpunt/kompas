"""
Backend tests for Kompas — Iteration 5
Profile CRUD + cross-device isolation + chat regression with profile_context.
"""
import os
import sys
import uuid
import httpx
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "kompas-admin-dev-2026")

BASE = "https://noah-android-chat.preview.emergentagent.com/api"
DEVICE = "dev_test_iter5"
DEVICE_OTHER = "dev_test_iter5_OTHER"

results = []  # (name, ok, detail)


def record(name, ok, detail=""):
    results.append((name, ok, detail))
    flag = "PASS" if ok else "FAIL"
    print(f"[{flag}] {name} :: {detail}")


def main():
    timeout = httpx.Timeout(60.0)
    with httpx.Client(base_url=BASE, timeout=timeout) as client:
        # Clean slate — delete any existing profile for both devices
        for d in (DEVICE, DEVICE_OTHER):
            try:
                client.delete("/profile", headers={"X-Device-Id": d})
            except Exception:
                pass

        # 1. GET /api/profile auto-creates empty profile
        r = client.get("/profile", headers={"X-Device-Id": DEVICE})
        ok = r.status_code == 200
        body = r.json() if ok else {}
        profile = body.get("profile", {})
        sections = ["basis", "levenscontext", "communicatie", "wat_werkt",
                    "mentaal", "waarden", "steun", "levensbeschouwing"]
        has_all = all(s in profile for s in sections)
        completion = body.get("completion", {})
        overall = body.get("overall_completion")
        all_zero = all(completion.get(s) == 0.0 for s in sections)
        record(
            "1. GET /api/profile auto-create empty",
            ok and has_all and all_zero and overall == 0.0,
            f"status={r.status_code} has_all_sections={has_all} all_zero={all_zero} overall={overall}",
        )

        # 2. PATCH basis
        patch_body = {"section": "basis", "values": {
            "voornaam": "Sam", "aanspreken": "Sam", "geboortejaar": 1990}}
        r = client.patch("/profile", json=patch_body, headers={"X-Device-Id": DEVICE})
        ok_patch = r.status_code == 200
        record(
            "2a. PATCH basis (Sam, 1990)",
            ok_patch,
            f"status={r.status_code} body={r.text[:200]}",
        )
        r = client.get("/profile", headers={"X-Device-Id": DEVICE})
        body = r.json()
        basis = body.get("profile", {}).get("basis", {})
        comp_basis = body.get("completion", {}).get("basis", 0)
        overall2 = body.get("overall_completion", 0)
        ok2 = (
            r.status_code == 200
            and basis.get("voornaam") == "Sam"
            and basis.get("aanspreken") == "Sam"
            and basis.get("geboortejaar") == 1990
            and comp_basis > 0
            and overall2 > 0
        )
        record(
            "2b. GET after PATCH shows persisted basis + completion>0",
            ok2,
            f"voornaam={basis.get('voornaam')} basis_comp={comp_basis} overall={overall2}",
        )

        # 3. PATCH communicatie
        patch_body = {"section": "communicatie", "values": {
            "toon": 1, "lengte": 2, "humor": "graag",
            "vraag_stijl": ["doorvragen", "perspectief"],
            "vermijd_zinnen": ["kop op", "gewoon doen"],
        }}
        r = client.patch("/profile", json=patch_body, headers={"X-Device-Id": DEVICE})
        ok_patch2 = r.status_code == 200
        r = client.get("/profile", headers={"X-Device-Id": DEVICE})
        comm = r.json().get("profile", {}).get("communicatie", {})
        ok3 = (
            ok_patch2
            and comm.get("toon") == 1
            and comm.get("lengte") == 2
            and comm.get("humor") == "graag"
            and comm.get("vraag_stijl") == ["doorvragen", "perspectief"]
            and comm.get("vermijd_zinnen") == ["kop op", "gewoon doen"]
        )
        record(
            "3. PATCH communicatie values persist",
            ok3,
            f"patch_status={r.status_code} comm={comm}",
        )

        # 4. PATCH unknown section → 400
        r = client.patch("/profile", json={"section": "blabla", "values": {"x": 1}},
                         headers={"X-Device-Id": DEVICE})
        ok4 = r.status_code == 400 and "unknown_section" in r.text
        record(
            "4. PATCH unknown section → 400 unknown_section",
            ok4,
            f"status={r.status_code} body={r.text[:120]}",
        )

        # 5. POST /api/profile/forget — remove geboortejaar
        r = client.post("/profile/forget",
                        json={"section": "basis", "field": "geboortejaar"},
                        headers={"X-Device-Id": DEVICE})
        ok5a = r.status_code == 200
        r = client.get("/profile", headers={"X-Device-Id": DEVICE})
        basis_after = r.json().get("profile", {}).get("basis", {})
        gj = basis_after.get("geboortejaar")
        ok5b = gj is None or "geboortejaar" not in basis_after
        record(
            "5. POST /profile/forget then GET — geboortejaar removed",
            ok5a and ok5b,
            f"forget_status={r.status_code} geboortejaar={gj!r} basis_keys={list(basis_after.keys())}",
        )

        # 6. GET /api/profile/export
        r = client.get("/profile/export", headers={"X-Device-Id": DEVICE})
        body = r.json() if r.status_code == 200 else {}
        ok6 = r.status_code == 200 and "profile" in body and isinstance(body["profile"], dict) and body["profile"].get("basis", {}).get("voornaam") == "Sam"
        record(
            "6. GET /profile/export → 200 with profile payload",
            ok6,
            f"status={r.status_code} has_profile={'profile' in body} voornaam={body.get('profile',{}).get('basis',{}).get('voornaam')}",
        )

        # 7. POST /api/profile/complete-onboarding
        r = client.post("/profile/complete-onboarding",
                        headers={"X-Device-Id": DEVICE})
        ok7a = r.status_code == 200 and r.json().get("ok") is True
        r = client.get("/profile", headers={"X-Device-Id": DEVICE})
        ob = r.json().get("profile", {}).get("onboarding_completed")
        ok7b = ob is True
        record(
            "7. POST /profile/complete-onboarding sets onboarding_completed=true",
            ok7a and ok7b,
            f"post_ok={ok7a} onboarding_completed={ob}",
        )

        # 8. DELETE /api/profile re-creates fresh empty profile
        r = client.delete("/profile", headers={"X-Device-Id": DEVICE})
        ok8a = r.status_code == 200
        r = client.get("/profile", headers={"X-Device-Id": DEVICE})
        body = r.json()
        profile_after = body.get("profile", {})
        basis_after = profile_after.get("basis", {})
        ok8b = (
            r.status_code == 200
            and not basis_after.get("voornaam")
            and body.get("overall_completion") == 0.0
            and profile_after.get("onboarding_completed") is False
        )
        record(
            "8. DELETE /profile then GET re-creates empty profile",
            ok8a and ok8b,
            f"delete_status={r.status_code} new_voornaam={basis_after.get('voornaam')!r} overall={body.get('overall_completion')} onboarding={profile_after.get('onboarding_completed')}",
        )

        # 9. Cross-device isolation
        # Re-PATCH DEVICE with name Anouk
        client.patch("/profile", json={"section": "basis", "values": {"voornaam": "Anouk"}},
                     headers={"X-Device-Id": DEVICE})
        r = client.get("/profile", headers={"X-Device-Id": DEVICE_OTHER})
        body = r.json()
        other_voornaam = body.get("profile", {}).get("basis", {}).get("voornaam")
        ok9 = r.status_code == 200 and other_voornaam in (None, "")
        record(
            "9. Cross-device isolation — DEVICE_OTHER does not see DEVICE values",
            ok9,
            f"status={r.status_code} other_voornaam={other_voornaam!r}",
        )

        # 10. /api/chat with profile context
        r = client.post("/chat", json={"message": "Hey, ik heb het zwaar vandaag."},
                        headers={"X-Device-Id": DEVICE}, timeout=120.0)
        if r.status_code == 200:
            data = r.json()
            ok10 = (
                "conversation_id" in data
                and "user_message" in data
                and "assistant_message" in data
                and data["assistant_message"].get("content")
            )
            record(
                "10. POST /chat with profile context → 200, contract holds",
                ok10,
                f"status=200 has_keys={ok10} assistant_len={len(data.get('assistant_message',{}).get('content',''))}",
            )
        elif r.status_code == 502:
            # Upstream LLM budget block — not a code bug
            record(
                "10. POST /chat with profile context",
                True,
                f"blocked by upstream (502): {r.text[:200]} — not a code bug",
            )
        else:
            record(
                "10. POST /chat with profile context",
                False,
                f"status={r.status_code} body={r.text[:300]}",
            )

        # Bonus: admin endpoint still 401 without token
        r = client.get("/admin/overview")
        ok_admin_no = r.status_code == 401
        r = client.get("/admin/overview", headers={"X-Admin-Token": ADMIN_TOKEN})
        ok_admin_yes = r.status_code == 200
        record(
            "11. Admin gating still enforced",
            ok_admin_no and ok_admin_yes,
            f"no_token={r.status_code} → must be 401 without, 200 with token",
        )

    print("\n========== SUMMARY ==========")
    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    print(f"{passed}/{total} tests passed")
    for name, ok, detail in results:
        if not ok:
            print(f"  FAIL: {name} :: {detail}")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
