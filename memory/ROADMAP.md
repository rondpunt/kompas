# Roadmap — Kompas App

## P0 — Kritisch voor lancering
- [ ] Stripe live keys configureren (sk_live_..., pk_live_...) voor echte betalingen
- [ ] Stripe Price IDs aanmaken in Dashboard (maandelijks + jaarlijks)
- [ ] `STRIPE_PRICE_MONTHLY` en `STRIPE_PRICE_ANNUAL` env vars instellen

## P1 — Hoge prioriteit
- [ ] RAG memory across sessions (vector embeddings in backend, memory UI toggle op frontend)
- [ ] Post-onboarding profielvulling: automatisch quiz-data naar profielsecties mappen
- [ ] AI Background Extraction: "Zal ik dit aan je profiel toevoegen?" tijdens gesprek
- [ ] Slimme openings-prompts op homescherm op basis van profiel
- [ ] Notificatie-toestemming scherm (contextueel, na 3de dag actief gebruik)

## P2 — Gemiddelde prioriteit
- [ ] Insights-tab met wekelijkse synthese van gesprekken
- [ ] Patroon-detectie engine in backend
- [ ] Community tab (anonieme profielen per aandoening: ADHD, autisme, angst, ...)
- [ ] Voice mode (OpenAI TTS/STT via Emergent Key)
- [ ] PDF-export voor testresultaten (naar therapeut)

## P3 — Lage prioriteit / Nice-to-have
- [ ] Figma design opwaardering (wacht op PNGs + tokens van gebruiker)
- [ ] "Nora" → "Kompas" branding op Google OAuth consent screen (gebruiker moet dit zelf doen in Emergent Dashboard)
- [ ] Verzonken knoppen dual-light/dark border design (wacht op Figma assets)
- [ ] A/B test voor paywall pricing
- [ ] Jaarlijkse prijskorting-badge animatie

## Technische Schuld
- [ ] server.py splitsing: routes/chat.py, routes/auth.py, routes/stripe.py
- [ ] shadow* deprecation warnings oplossen voor Expo web (gebruik boxShadow)
- [ ] TypeScript strict mode inschakelen voor frontend
- [ ] End-to-end test suite opzetten (Detox of Maestro)
