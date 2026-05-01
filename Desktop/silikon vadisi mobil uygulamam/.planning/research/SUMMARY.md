# Research Summary — Silicon Valley Kültür & Eşleşme Uygulaması

**Synthesized:** 2026-05-01
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## Executive Summary

This is a dual-axis culture discovery and matching mobile app — users swipe on people AND on companies/venues using identical UX patterns. The core novelty is combining Tinder-style social matching with Yelp-style venue discovery, unified by a Silicon Valley culture lens and an archetype personality system. No competitor combines both axes in a single product. The recommended approach is React Native (Expo managed) on mobile backed by a Supabase modular monolith, with pgvector handling recommendation similarity inside the same Postgres instance — avoiding separate ML infrastructure at MVP.

The biggest risk is not technical: it is double cold start. The app needs seeded catalogue content (50-100 SV companies and venues) before a single user signs up, because both the place-matching feed and the social-proof layer (reviews, ratings) fail visibly on Day 1 without it. The second risk is i18n: TR/EN/ES support is a core product promise and must be wired into the project from the first file written — retrofitting costs 3-5x. Privacy, App Store compliance, and onboarding quiz design must be treated as Phase 1 concerns, not pre-launch polish.

---

## Recommended Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo SDK 52, TypeScript, Expo Router 4 |
| Styling | NativeWind 4 |
| State | Zustand 5 (client) + TanStack Query 5 (server) |
| Swipe / Animation | Reanimated 3 + Gesture Handler 2 + rn-swiper-list |
| Backend | Supabase (Postgres, Auth, Realtime, Edge Functions, Storage) |
| Matching | pgvector inside Supabase Postgres |
| Embeddings | OpenAI text-embedding-3-small via Edge Functions only |
| i18n | react-i18next 14 + expo-localization |
| Push | Expo Push API |
| Media | Cloudflare R2 (zero egress, CDN, presigned upload) |

---

## Table Stakes for v1

1. Apple Sign In + Google OAuth + email/password (Apple mandatory on iOS when any social login exists)
2. 5-7 question personality quiz — archetype, work style, goals, interests
3. Seeded catalogue — 50-100 SV companies and venues before launch
4. Culture profile pages per entity (vibe tags, tempo, archetype fit, 3-language descriptions)
5. Person-to-person swipe deck + mutual match detection + notification
6. Person-to-place swipe deck + match saved notification
7. Match inbox with People tab and Places tab
8. 1:1 text-only messaging for matched users (highest single-feature complexity in v1)
9. Reviews with star ratings + photo upload on company/venue pages
10. Search + category filter on catalogue
11. Personalized recommendation feed (rule-based, not ML)
12. Full TR / EN / ES UI translation from day one
13. Freemium gate: 20 free swipes/day
14. Block / unmatch / report + moderation queue
15. Delete account with full PII removal (GDPR / KVKK)

---

## Core Differentiators

- **Archetype system** — "Girişimci, Mühendis, Vizyoner, Sanatçı" visual identity badges. No competitor has this for SV context. Ship at launch (P0).
- **Dual-axis matching** — identical swipe UX for people AND places/companies. Strategically unique. (P0)
- **SV Culture Score** — proprietary innovation/remote/startup energy index per entity. (P1)
- **Fit Reason explanation** — "You match because: Remote-first, AI-focused, Fast tempo." Transparent algorithm builds trust. (P1)
- **Goal-based modes** — Networking / Job hunting / Co-founder / Travel buddy. Ships v1.1. (P1)

---

## Architecture Pattern

- **Shape:** Modular monolith inside Supabase. Services (Auth, Catalog, Match Engine, Social, Chat, Notifications) are Postgres schemas + Edge Functions.
- **Real-time:** Supabase Realtime WebSocket for match events and chat (<1-2s latency). Expo Push for background delivery.
- **Recommendations:** Rule-based 64-128 float profile vectors in pgvector at MVP. Scoring: 50% vector similarity + 25% popularity + 15% freshness + 10% behavioral boost. No ML until 500+ daily-active users.
- **i18n storage:** All catalogue text as `jsonb` columns `{ "en": "...", "tr": "...", "es": "..." }`. API resolves from `Accept-Language` with `en` fallback.
- **Media:** Client compresses photos to <300KB before upload. Presigned R2 URL — uploads go directly to CDN, never through Supabase.
- **Location privacy:** Exact coordinates stored server-side only; neighborhood strings returned to clients.

---

## Critical Pitfalls — Top 5

| # | Pitfall | Prevention |
|---|---------|-----------|
| 1 | **Double cold start** | Seed 50-100 SV entities before any user can register. Lead with place matching first in onboarding. |
| 2 | **i18n retrofitted late** — costs 3-5x | Wire react-i18next + `en/tr/es.json` into the first component. Never hardcode user-facing strings. |
| 3 | **Privacy gaps** — raw GPS, EXIF in photos, pre-match profile exposure | Expose neighborhood only. Strip EXIF on ingest. Show first name + archetype badge only before mutual match. |
| 4 | **App Store rejection** | Block/report UI in Phase 1. Privacy Manifest before first submission. App Review Notes explaining professional networking purpose. |
| 5 | **Premature paywall** | Free tier: unlimited place matches + 20 human swipes/day + full messaging. B2B sponsorships as first revenue stream. |

---

## Build Order

| Phase | Delivers |
|-------|----------|
| **1 — Foundation** | Auth, user model, onboarding quiz, DB schema, i18n wiring, RLS, block/report |
| **2 — Catalogue** | 50-100 seeded SV companies + venues, culture profiles, search, category filter |
| **3 — Discovery Feed** | Personalized recommendation feed, pgvector ANN, feed cache, trending section |
| **4 — Matching Core** | Swipe decks (people + places), mutual match detection, match inbox, push notifications |
| **5 — Social Layer** | Reviews, star ratings, photo upload, upvote, moderation queue |
| **6 — Real-Time + Chat** | Supabase Realtime WebSocket, 1:1 messaging, Expo Push integration |
| **7 — Monetization** | Freemium gate, premium flag, RevenueCat IAP, B2B claim flow |
| **8 — Polish** | i18n validation pass, analytics (PostHog), admin panel, App Store submission prep |

---

## Open Questions

1. **Content seeding** — Who writes the 50-100 SV culture profiles? Internal team, contractors, or B2B partners?
2. **B2B pricing model** — Featured listings, claimed pages, sponsored cards — price points and sales process?
3. **Premium tier definition** — What does premium include beyond unlimited swipes?
4. **Launch market** — Turkish tech community, US-based Turkish diaspora, or general SV visitors?
5. **Review translation policy** — UGC reviews shown as-written or machine-translated?
6. **Moderation staffing** — Who reviews flagged content post-launch?

---

## Confidence Assessment

| Area | Confidence |
|------|------------|
| Stack | HIGH |
| Features | HIGH |
| Architecture | HIGH |
| Pitfalls | HIGH |
| Recommendation engine | MEDIUM |
| B2B revenue model | LOW — needs market validation |
