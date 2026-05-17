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
