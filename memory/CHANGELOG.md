# Changelog — Kompas App

## 2026-01-xx — Fork van vorige sessie (Baseline)
- Werkende full-stack app met chat interface (Claude Sonnet 4.5)
- Google Auth via Emergent (Emergent-managed OAuth)
- 8-delig profielsysteem gekoppeld aan AI chat context
- SecureHandshake animatie (3-stap groen, cold-start & first-install varianten)
- Soft-paywall logica na 20 berichten / 3 dagen
- Chat behavior via kompas-chat-behavior.md (korte antwoorden, anti-opener regex)
- PostHog key aanwezig in backend .env maar niet actief op frontend
- Stripe key sk_test_emergent aanwezig in omgeving

## 2026-05-17 — Volledige Onboarding Flow (Spec Deel B)

### Gebouwd
- **8-scherm onboarding flow** per spec (Deel B):
  - Scherm 1: Welcome (compass icon, serif headline, feature bullets, blauwe CTA)
  - Scherm 2: Quiz Intent (multi-select checkboxes, skip mogelijk)
  - Scherm 3: Quiz Mood (single-select auto-advance)
  - Scherm 4: Quiz Therapie-ervaring (single-select met subtext)
  - Scherm 5: Eerste Gesprek (gepersonaliseerde AI-opener op basis van quiz, suggestion chips, live chat met Claude)
  - Scherm 6: Privacy Keuze (anoniem vs Google Account kaarten)
  - Scherm 7: Paywall (features, timeline, maandelijks/jaarlijks toggle, social proof, 14-dag trial)
  - Scherm 8: Bevestiging (groene check animatie, 3 next-step kaarten, "Begin met Kompas")

### Design System
- Nieuwe OB (Onboarding) kleuren: bg=#0A0F1E, accent=#5B7FFF, surface=#141B2E
- Serif (Georgia) voor koppen, system sans voor bodytekst
- Gedeeld ob-theme.ts module voor consistentie

### Nieuwe Backend Endpoints
- `POST /api/stripe/checkout-session` (graceful fallback als Stripe niet geconfigureerd)
- `POST /api/stripe/webhook` (subscription sync naar MongoDB)
- `GET /api/subscription` (status per user/device)
- `POST /api/onboarding/quiz` (quiz-data bij afronden)

### State Management
- Zustand v5 store (`src/stores/onboardingStore.ts`) voor onboarding state
- PostHog singleton (`src/utils/posthog.ts`) met EU-hosting
- PostHog key toegevoegd aan frontend .env

### Emergent Systemen Gebruikt
- Google Auth vervangt Magic Link uit spec
- PostHog key phc_zX9... al beschikbaar (nu ook op frontend)
- Stripe key sk_test_emergent al in omgeving (graceful fallback)
- Emergent LLM Key voor Claude in het eerste gesprek

### Testing
- Alle 8 schermen visueel getest via screenshot-tool
- Backend: 13/13 tests geslaagd (Stripe mock, quiz opslag)
- Frontend: 9/9 items geslaagd na 1 bugfix (skip link ging naar main chat i.p.v. bevestigingsscherm)

## 2026-05-17 — Versnelde P0/P1 upgrade (Stripe + Memory + Extractie)

### Gebouwd
- **Stripe checkout-flow verbeterd**:
  - Geen hardcoded success/cancel URL meer (nu request/env-gedreven)
  - Ondersteuning voor env price IDs (`STRIPE_PRICE_MONTHLY/ANNUAL`)
  - Fallback naar dynamische recurring `price_data` als price IDs ontbreken
  - Webhook slaat owner velden op (`owner_user_id`/`owner_device_id`) en plan metadata
- **AI Background Extraction actief**:
  - Na elke 10 user-berichten wordt 1 achtergrond-analyse uitgevoerd
  - Nieuwe profielsuggesties worden als `pending` opgeslagen in `profile_suggestions`
  - Suggestie verschijnt in chat met expliciete vraag: "Zal ik dit toevoegen aan je profiel?"
- **RAG geheugen-toggle live**:
  - Nieuwe API: `GET/POST /api/profile/memory`
  - UI toggle in `Instellingen > Profiel > Privacy`
  - Bij `memory_enabled=false` wordt profielcontext niet meer geïnjecteerd in `/api/chat`

### Fixes
- Profiel-owner helpers werken nu ook correct met dict-based user objecten
- Onboarding quiz save gebruikt nu API-client met auth/device headers (geen anonieme owner-mismatch)

### Bekende beperking
- Huidige Stripe sleutel in omgeving (`sk_test_emergent`) wordt door Stripe als ongeldig afgewezen.
  Daarom blijft checkout momenteel in **fallback/mock** tot een geldige key beschikbaar is.

## 2026-05-17 — Community Launch Scope (anonieme mini-twitter)

### Gebouwd
- Nieuwe community backend in `server.py`:
  - `GET /api/community/me` (auto-anoniem profiel + premium flags)
  - `POST /api/community/nickname` (custom nickname)
  - `GET /api/community/feed` + `POST /api/community/posts`
  - `GET /api/community/dm/inbox` + `GET/POST /api/community/dm/thread/{peer_nickname}`
- Premium gating actief:
  - **Free** = read-only
  - **Premium/trialing** = posten + DM
- Nieuwe frontend routes:
  - `/community` (feed + nickname beheer + composer/paywall)
  - `/community/inbox` (DM inbox)
  - `/community/[peer]` (DM thread)

### Teststatus
- Testing agent: backend + frontend community scope geslaagd (8/8 backend tests + UI routes renderen correct)

### Bekende beperking
- Kanaal-leden/activiteit labels in community UI zijn momenteel **MOCKED** designdata (statisch), geen live aggregatie.
