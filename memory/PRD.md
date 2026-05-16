# Kompas — Product Requirements Document

## Overview
**Kompas** is a private chat-companion app for Belgian Dutch speakers (België, audience 25-50) — a place to talk about what's playing in your life (work, relationships, parents, days that don't cooperate). It pairs a Claude Sonnet 4.5 conversational AI (tone informed by Dirk De Wachter's *Borderline Times*: anti-self-optimization, anti-toxic-positivity, "verwijlen") with 24 clinically validated screeners and a clean, ChatGPT-strak UI.

- **Tagline**: "Voor wat speelt."
- **Wordmark**: `•Kompas`
- **Platform**: Expo React Native (Android-first, also iOS)
- **Chat model**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) via Emergent Universal Key
- **Language**: Belgian Dutch only
- **Auth**: Anonymous (no login) for v1 MVP

## What's new in iteration 2
- **Onboarding flow** (3 slides, first-launch only): Welkom ("Wat speelt er?"), Hoe werkt het ("Verwijlen, niet fixen"), Privé ("Wat je deelt blijft van jou").
- **SecureHandshake animation** plays on cold launch + when starting a new conversation. Hex stream + lock icon + status progression ("Beveiligd kanaal opzetten" → "Sleutels uitwisselen" → "Sessie versleutelen" → "Klaar.").
- **Crisis UI fully removed** per user request. No `Bel 1813` buttons, no `CrisisSheet`, no hotline disclaimers anywhere in onboarding/settings/test-result/chat.
- **Privacy bullets refined** (research-backed, discreet, factually true): Anoniem · Versleuteld kanaal · Geen reclame/tracking/derden · Jij beheert je geschiedenis.
- **Beheerconsole (admin) backend endpoints** provisioned, token-gated via `X-Admin-Token` header (`ADMIN_TOKEN` env). Frontend `/admin` stub route — login form + overview of totals + recent activity.

## Themes
- **Night** (default): Off-black #0a0a0a, surface #161616, text #fafafa, accent amber #f59e0b
- **Klaar** (light): White #ffffff, surface #f4f4f4, text #0d0d0d, accent amber #d97706
- **Systeem**: Follows OS color scheme
- Theme persists via local storage

## Features shipped
### Onboarding
- 3 slides with progress dots, "Verder" / "Overslaan" / "Open Kompas" CTAs
- Stores `kompas.onboarded` flag in storage. Skipped on subsequent launches.

### SecureHandshake
- 2-second overlay: hex-stream + lock icon (shield → lock + amber check) + Belgian Dutch status text
- Plays once per app launch + once per new conversation
- Sub-status: "End-to-end · AES-256 · privé"

### Chat
- Empty state "Wat speelt er?" centered in Georgia italic, "Voor wat speelt." tagline
- Active conversation: user bubbles right-aligned, AI text left-aligned (no bubble), 15px body
- Input pill bottom-fixed: attachment icon, textarea, microphone, amber send-button
- Typewriter cursor (4×16px, 1Hz blink) during AI response
- AI replies in Belgian Dutch tone (no toxic positivity, no diagnoses, no optimization-speak, no hotlines)
- AI may suggest one self-test per conversation via `[SUGGEST_TEST:test_id]` marker

### Sidebar (slide-in from left)
- "Nieuw gesprek" button, search, conversation list grouped by date
- Long-press to delete
- Links to `/zelftesten` and `/instellingen`

### Zelftesten (24 validated screeners)
| Free tier | Plus tier (UI ready, gating later) |
|-----------|-----------------------------------|
| PHQ-9, GAD-7, PHQ-4, WHO-5, PSS-10, CD-RISC-10, SIAS-6, SCOFF, AUDIT | ASRS-6, ASRS-18, AQ-10, RAADS-14, MSI-BPD, BSL-23, HSPS, PCL-5, ITQ, OCI-R, EAT-26, DAST-10, RRS-10, MDQ, UBOS |

Each test has: intro → step-by-step question screen (progress bar, auto-advance 200ms) → result with category pill, big score 42px, AI narrative 150-220 words.

### Settings (`/instellingen`)
- Account (Anoniem), Abonnement (Free tier badge + Plus placeholder), Uiterlijk (Night/Klaar/Systeem radio), Taal, Over (version 1.0.0). Footer: "Kompas is geen vervanging voor professionele zorg."

### Beheerconsole (`/admin`) — stub for later build-out
- Token-gated (`X-Admin-Token` header, `ADMIN_TOKEN` env)
- Stub UI: token-entry form → overview (totals + recent conversations + recent results)
- Backend endpoints ready:
  - `GET /api/admin/overview`
  - `GET /api/admin/conversations` (paginated)
  - `GET /api/admin/conversations/{id}` (full incl. messages)
  - `GET /api/admin/assessment-results` (full incl. raw_answers)

## Backend API
All endpoints under `/api/*` (FastAPI on port 8001).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/chat` | Belgian Dutch chat with Claude Sonnet 4.5 |
| GET/DEL | `/api/conversations[/{id}]` | CRUD conversations |
| POST | `/api/assessment-narrative` | Generate AI narrative for a test result |
| GET/POST | `/api/assessment-results[/{id}]` | CRUD test results |
| GET | `/api/admin/*` | Beheerconsole endpoints (token-gated) |

## Privacy guarantees (factual, true)
- Anonymous use — no email, no phone
- HTTPS channel for every chat (TLS in transit)
- No analytics, no advertising, no third-party SDK tracking
- Not sold or shared with third parties
- User controls history — can wipe via sidebar long-press or settings

## Out of scope for v1
- Memory across sessions (Plus tier)
- Voice mode (Whisper + ElevenLabs)
- PDF export for therapist
- Stripe billing / Plus paywall
- Trend charts per test
- Magic-link / OAuth login
- Full admin UI (backend ready, frontend stub only)

## Verified at iteration 2 completion
- ✅ 25/25 backend pytest tests pass (chat, conversations CRUD, narrative scrub, admin auth)
- ✅ 4/4 narrative-scrub consistency tests pass (3× crisis-flag forced + 1 low-score control)
- ✅ No '1813' / hotline references anywhere in UI or AI output
- ✅ Admin endpoints return 401 without token, 200 with `kompas-admin-dev-2026`
- ✅ SecureHandshake animates on cold launch + new conversation
- ✅ Onboarding 3 slides, privacy bullets pass research-backed criteria (no third-party sharing, encryption, minimal data, user control)


- **Tagline**: "Voor wat speelt."
- **Wordmark**: `•Kompas`
- **Platform**: Expo React Native (Android-first, also iOS)
- **Chat model**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) via Emergent Universal Key
- **Language**: Belgian Dutch only
- **Auth**: Anonymous (no login) for v1 MVP — local + cloud storage tied to anonymous conversation IDs

## Themes
- **Night** (default): Off-black #0a0a0a, surface #161616, text #fafafa, accent amber #f59e0b
- **Klaar** (light): White #ffffff, surface #f4f4f4, text #0d0d0d, accent amber #d97706
- **Systeem**: Follows OS color scheme
- Theme persists via local storage

## Features shipped in MVP v1
### Chat
- Empty state: "Wat speelt er?" centered (Georgia italic), "Voor wat speelt." tagline
- Active conversation: user bubbles right-aligned (surface-elevated pill), AI text left-aligned (no bubble), 15px body, 18px gap
- Input pill: bottom-fixed, attachment + textarea + microphone/send button (amber when text present)
- Streaming-feel: typewriter cursor (4×16px, 1Hz blink) during AI response
- Non-streaming for v1 (full reply on completion)
- AI replies in Belgian Dutch tone (no toxic positivity, no diagnoses, no optimization-speak)
- AI may suggest one self-test per conversation when symptoms match (via `[SUGGEST_TEST:test_id]` marker, parsed server-side)
- Crisis keyword detection on user input (`zelfmoord`, etc.) → triggers Crisis Sheet

### Sidebar (slide-in from left)
- Hamburger in top bar opens it
- "Nieuw gesprek" button, search, conversation list grouped by date (Vandaag / Gisteren / Afgelopen 7 dagen / 30 dagen / Ouder)
- Long-press a conversation to delete
- Links to `/zelftesten` and `/instellingen`

### Zelftesten (24 clinically validated screeners)
| Free tier | Plus tier (UI ready, gating later) |
|-----------|-----------------------------------|
| PHQ-9, GAD-7, PHQ-4, WHO-5, PSS-10, CD-RISC-10, SIAS-6, SCOFF, AUDIT | ASRS-6, ASRS-18, AQ-10, RAADS-14, MSI-BPD, BSL-23, HSPS, PCL-5, ITQ, OCI-R, EAT-26, DAST-10, RRS-10, MDQ, UBOS |

Each test has: 
- Intro screen (category icon, description, source, "Begin test" CTA)
- Step-by-step question screen (eyebrow "VRAAG x VAN y", progress bar 2px, 4-5 answer cards, auto-advance 200ms)
- Result screen (category pill, big score 42px font-weight 300, Georgia italic context, AI narrative 150-220 words via Claude Sonnet 4.5, optional subscale breakdown)
- Crisis flag handling (PHQ-9 #9, MSI-BPD #2, BSL-23 #8/#10, PCL-5 #16) → red "Bel 1813" CTA + auto-open Crisis Sheet
- All scoring/interpretation logic in `src/data/assessments.ts`

### Crisis Sheet
- Bottom-sheet slides up when crisis detected
- Red banner "Hulp nu"
- Buttons: "Bel 1813" (Zelfmoordlijn België), "Bel 1712" (Geweld/misbruik), "Chat met Tele-Onthaal", "Stuur bericht naar vertrouwde persoon", "Sluiten"

### Settings (`/instellingen`)
- Account (Anoniem)
- Abonnement (Free tier badge, "Probeer Kompas Plus — binnenkort" placeholder)
- Uiterlijk (Night / Klaar / Systeem radio with persistence)
- Taal (Belgisch Nederlands)
- Over (version 1.0.0, bron-inspiratie Borderline Times)
- Fixed bottom disclaimer

## Backend API
All endpoints under `/api/*` (FastAPI on port 8001, exposed via Kubernetes ingress).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/chat` | Send a message; returns user_message + assistant_message + crisis_detected + suggested_test_id |
| GET | `/api/conversations` | List all conversations sorted by updated_at desc |
| GET | `/api/conversations/{id}` | Get conversation + messages |
| DELETE | `/api/conversations/{id}` | Delete conversation + cascade messages |
| POST | `/api/assessment-narrative` | Generate Belgian Dutch AI narrative for a test result |
| POST | `/api/assessment-results` | Save a test result |
| GET | `/api/assessment-results` | List saved results (optional `?assessment_id=`) |
| GET | `/api/assessment-results/{id}` | Get single saved result |

## Data Model (MongoDB collections in `kompas_db`)
- `conversations` — id, title, created_at, updated_at, suggested_test_id
- `messages` — id, conversation_id, role, content, suggested_test_id, created_at
- `assessment_results` — id, assessment_id, assessment_title, raw_answers, total_score, max_score, interpretation_label, interpretation_tier, subscales, crisis_flag, narrative, completed_at

## Out of scope for v1 (planned for later iterations)
- Memory across sessions (Plus tier)
- Voice mode (Whisper + ElevenLabs)
- PDF export for therapist
- Stripe billing / Plus paywall
- Trend charts per test
- Daily check-in push notifications
- Magic-link / OAuth login

## Tech stack
- **Frontend**: Expo SDK 54, React Native 0.81, React 19, expo-router, react-native-reanimated, @expo/vector-icons (Feather + MaterialCommunityIcons for category icons)
- **Backend**: FastAPI 0.110, motor 3.3.1 (MongoDB), emergentintegrations LlmChat (Claude Sonnet 4.5 via Emergent Universal Key)
- **Storage**: MongoDB (`kompas_db`) for chat history + test results; AsyncStorage (frontend) for theme preference
- **Crisis support**: 1813 (Zelfmoordlijn België), 1712 (Vlaanderen — geweld), Tele-Onthaal (tele-onthaal.be)

## Verified at MVP completion
- ✅ 15/15 backend pytest tests pass
- ✅ Chat with Claude Sonnet 4.5 produces fluent Belgian Dutch replies
- ✅ Crisis detection (`zelfmoord` keyword) triggers crisis_detected=true
- ✅ Test execution end-to-end: intro → questions → save → result with AI narrative
- ✅ Crisis flag on PHQ-9 #9 (suicidal ideation) triggers Crisis Sheet with "Bel 1813"
- ✅ Theme switching (Night ↔ Klaar ↔ Systeem) persists via storage
- ✅ All 24 test cards render on Zelftesten index; category filter works
