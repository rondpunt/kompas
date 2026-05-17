# Kompas — PRD (Product Requirements Document)

## Oorspronkelijk Probleemstatement
Bouw een health chat app genaamd "Kompas" (genre Noah AI) in Belgisch Nederlands met een premium feel.
De app gebruikt Claude Sonnet via Emergent Universal Key.

## Product Requirements
- Full-stack architectuur (Expo frontend, FastAPI backend, MongoDB)
- Geen "crisis" (1813) interventies of lokale opslag van chat details (strikte privacy)
- 24 zelftesten met AI-narratief
- Emergent-managed Google Auth login om anonieme gesprekken te synchroniseren/claimen
- "SecureHandshake" animatie bij opstarten (inclusief cold-start en first-install variant)
- Profiel-systeem (8 secties) dat context voedt aan de AI
- Uitgebreide PostHog analytics en een Stripe paywall (Plus-tier)
- RAG memory across sessions en anonieme Community functionaliteit (in aanbouw)

## Gebruikerspersona
- Primair: Vlaamse/Belgische volwassenen die mentaal welzijn ondersteuning zoeken
- Tussenin therapie-sessies of als alternatief voor professionele hulp
- Privacy-first gebruikers die anoniem willen starten

## Architectuur
- **Frontend**: Expo Router (file-based), React Native, Zustand v5, PostHog React Native
- **Backend**: FastAPI, Motor (async MongoDB), Claude Sonnet 4.5 via Emergent LLM Key
- **Auth**: Emergent-managed Google OAuth (replaces Magic Link)
- **Payments**: Stripe (sk_test_emergent, graceful fallback)
- **Analytics**: PostHog EU (phc_zX9...)
- **Storage**: MongoDB Atlas via MONGO_URL

## Database Schema
- `users`: {user_id, google_id, email, name, plan, created_at, last_login}
- `user_sessions`: {session_token, user_id, expires_at}
- `conversations`: {conversation_id, session_id, messages[], device_id, user_id}
- `profiles`: {schema_version, owner_device_id, owner_user_id, basis, levenscontext, communicatie, triggers, mentale_gezondheid, waarden, steun, levensbeschouwelijk, onboarding_quiz}
- `subscriptions`: {stripe_subscription_id, stripe_customer_id, status, trial_end, user_id}

## Key API Endpoints
- `POST /api/chat` (injecteert profiel context in system prompt)
- `GET/PATCH/DELETE /api/profile` (8-delige profielstructuur)
- `POST /api/auth/session`, `GET /api/auth/me`, `POST /api/auth/claim`
- `POST /api/stripe/checkout-session` (Stripe Checkout met 14-dag trial)
- `POST /api/stripe/webhook` (subscription sync)
- `GET /api/subscription` (status per user/device)
- `POST /api/onboarding/quiz` (quiz-data opgeslagen bij afronden onboarding)
