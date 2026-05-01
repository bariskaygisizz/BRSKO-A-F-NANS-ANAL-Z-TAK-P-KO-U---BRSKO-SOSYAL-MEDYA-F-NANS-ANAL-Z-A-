# Requirements — Silicon Valley Kültür & Eşleşme Uygulaması

**Version:** v1.0
**Date:** 2026-05-01
**Status:** Draft

---

## v1 Requirements

### AUTH — Authentication & Onboarding

- [ ] **AUTH-01**: User can create account with email/password or social login (Apple, Google)
- [ ] **AUTH-02**: User can log in and stay logged in across sessions (JWT refresh)
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User completes personality/style onboarding quiz (archetype, work style, interests, goals) — max 7 questions
- [ ] **AUTH-05**: User can select app language (TR/EN/ES) at onboarding; preference persists
- [ ] **AUTH-06**: User can upload a profile photo
- [ ] **AUTH-07**: User can delete their account and all associated data (GDPR/KVKK)

### CATALOG — Company & Venue Catalogue

- [ ] **CAT-01**: Admin can create and manage SV company and venue profiles with culture data (pre-launch: 50-100 seed entries)
- [ ] **CAT-02**: User can browse company/venue profiles filtered by category, vibe tag, neighborhood, and industry
- [ ] **CAT-03**: User can search companies and venues by keyword
- [ ] **CAT-04**: Each company/venue profile displays: name, culture description (localized TR/EN/ES), vibe tags, culture tempo, ideal archetypes, rating, and review count
- [ ] **CAT-05**: User can save/bookmark companies and venues to a personal list
- [ ] **CAT-06**: User can view their saved list

### MATCH — Dual-Axis Matching

- [ ] **MATCH-01**: User can swipe right/left on person cards (person↔person matching)
- [ ] **MATCH-02**: User can swipe right/left on place/company cards (person↔place matching)
- [ ] **MATCH-03**: When two users both swipe right on each other, a mutual match is created
- [ ] **MATCH-04**: When a user swipes right on a place/company, a place match is saved
- [ ] **MATCH-05**: User receives a push notification when a mutual match is made
- [ ] **MATCH-06**: User can view their match list with separate tabs (People / Places)
- [ ] **MATCH-07**: User can unmatch or block another user
- [ ] **MATCH-08**: Free users are limited to 20 swipes per day across both person and place decks
- [ ] **MATCH-09**: Each match card displays a compatibility score and a brief "fit reason" explanation

### SOCIAL — Reviews & Community

- [ ] **SOC-01**: User can write a review for a company or venue (min 100 chars, max 5-star rating)
- [ ] **SOC-02**: User can attach a photo to a review
- [ ] **SOC-03**: User can upvote reviews as helpful
- [ ] **SOC-04**: Company/venue profile displays aggregated rating and review count
- [ ] **SOC-05**: User can report a review or profile as inappropriate
- [ ] **SOC-06**: All flagged content enters a moderation queue (admin review)

### CHAT — Messaging

- [ ] **CHAT-01**: Matched users (person↔person) can exchange text messages
- [ ] **CHAT-02**: User receives a push notification when a new message arrives
- [ ] **CHAT-03**: User can view all their active conversations in an inbox

### FEED — Personalized Discovery

- [ ] **FEED-01**: User sees a personalized recommendation feed of places and companies based on their quiz profile
- [ ] **FEED-02**: User sees a "trending" section showing the most popular places/companies this week
- [ ] **FEED-03**: Feed updates as user behavior evolves (implicit signal weighting)

### I18N — Multi-Language

- [ ] **I18N-01**: All UI text is available in Turkish, English, and Spanish
- [ ] **I18N-02**: App detects device locale automatically and sets default language
- [ ] **I18N-03**: User can change language in Settings
- [ ] **I18N-04**: All catalog culture descriptions are stored and displayed in the user's selected language (where available; fallback to EN)
- [ ] **I18N-05**: Date and number formats adapt to the user's locale

### PRIVACY — Safety & Compliance

- [ ] **PRIV-01**: User's exact location is never exposed to other users — only neighborhood/city level
- [ ] **PRIV-02**: User can set profile visibility (everyone / matches only / nobody)
- [ ] **PRIV-03**: User can manage notification preferences per category (matches, messages, social)
- [ ] **PRIV-04**: App complies with GDPR/KVKK: data deletion, data export, privacy policy in-app

### MONETIZE — Freemium & B2B

- [ ] **MON-01**: Premium subscription unlocks unlimited swipes (RevenueCat IAP)
- [ ] **MON-02**: Premium users can see who liked them
- [ ] **MON-03**: Companies/venues can request featured placement (B2B — manual process in v1)

---

## v2 Requirements (Deferred)

- Advanced personality filters for premium users
- B2B self-serve company page claiming portal
- Goal-based matching modes (networking / job / travel / co-founder queues)
- Offline-readable culture cards (cached for travel)
- Native map view with venue pins
- Cities outside Silicon Valley (geographic expansion)
- ML-based collaborative filtering (after 500+ MAU)
- SV Pulse: anonymized cultural insights dashboard
- Video messaging
- Group chats

---

## Out of Scope (Explicit Exclusions)

| Exclusion | Reason |
|-----------|--------|
| Web application | Mobile-first; validate PMF before doubling front-end effort |
| In-app voice/video calling | Enormous scope + regulatory complexity; users can exchange contact info via chat |
| Events / event creation | Meetup's entire product surface; out of scope for v1 |
| Cities outside Silicon Valley | Depth > breadth; SV only until content quality validated |
| AI-generated review summaries | Users distrust AI content on social platforms |
| Real-time typing indicators | Cost >> benefit; negligible user value |
| Gamification leaderboards | Incentivizes fake reviews; distracts from cultural discovery |

---

## Traceability

*To be filled by roadmapper — maps each REQ-ID to a phase.*

| REQ-ID | Phase | Notes |
|--------|-------|-------|
| AUTH-01 to AUTH-07 | Phase 1 | |
| CAT-01 to CAT-06 | Phase 2 | CAT-01 seed data is pre-launch prerequisite |
| MATCH-01 to MATCH-09 | Phase 3-4 | |
| SOC-01 to SOC-06 | Phase 5 | |
| CHAT-01 to CHAT-03 | Phase 6 | |
| FEED-01 to FEED-03 | Phase 3 | |
| I18N-01 to I18N-05 | Phase 1 (infra), all phases (content) | |
| PRIV-01 to PRIV-04 | Phase 1 (design), Phase 7 (audit) | |
| MON-01 to MON-03 | Phase 7 | |
