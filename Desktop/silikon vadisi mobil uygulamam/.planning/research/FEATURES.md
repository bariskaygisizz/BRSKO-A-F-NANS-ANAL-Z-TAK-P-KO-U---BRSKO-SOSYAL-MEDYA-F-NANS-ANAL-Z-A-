# Features Research — Silicon Valley Kültür & Eşleşme Uygulaması

**Domain:** Culture discovery + dual-axis matching (person↔person, person↔place/company)
**Comparable apps:** Bumble BFF, Meetup, Glassdoor, TripAdvisor, LinkedIn, Blind
**Researched:** 2026-05-01

---

## Table Stakes

### Auth & Onboarding

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Social auth (Apple, Google) | Every modern app has this | Low | Apple Sign In MANDATORY on iOS if any social login exists (App Store rule) |
| Email + password fallback | Users who refuse social login | Low | Required for privacy-conscious users |
| Multi-step personality quiz | Core differentiator setup | Medium | 5-8 questions max. Cover: archetype, work style, intent, interests |
| Language selection at launch | TR/EN/ES from first screen | Low | Detect device locale as default |
| Progress indicator in onboarding | Users abandon without knowing steps remaining | Low | "Step X of Y" |
| Skip-to-later for optional fields | Photo upload, bio — defer pressure | Low | Reduces onboarding drop-off |
| Profile photo upload | Required by any social/matching app | Low | Single photo acceptable in v1 |

### Discovery

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Curated catalog: companies & venues | Core content; without it nothing else works | High | 50-100 SV entries at launch; quality > quantity |
| Culture profile page per entity | TripAdvisor/Glassdoor expectation | Medium | Fields: vibe tags, work tempo, size, notable alumni, map link |
| Search & filter | Every discovery app has this | Medium | Filter by: category, vibe tag, area, industry |
| Category browsing | For users who don't know what to search | Low | Big Tech, Startup, Coworking, Cafe, Event Space, Accelerator |
| Personalized recommendation feed | Algo-driven, based on onboarding quiz | High | Rule-based scoring acceptable in v1 |
| Trending / popular section | Social proof | Low | Simple SQL query; no special infra |
| Deep link to entity pages | Shareable links for organic growth | Low | Required for referrals |

### Matching

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Swipe card deck — person↔person | Tinder pattern; users arrive with muscle memory | Medium | Card: photo, name, archetype badge, shared interests count |
| Swipe card deck — person↔place | Novel but same UX; users grasp it immediately | Medium | Card: place photo, vibe tags, compatibility score |
| Match notification | Omitting breaks the engagement loop | Low | "You matched with [name]!" / "You're a fit for [company]!" |
| Match list / inbox | Users need to see match history | Low | Separate tabs: People / Places |
| 1:1 in-app text messaging | Users expect to message matches | High | HIGHEST single-feature complexity in v1. Text only. |
| Compatibility score with reason | Builds trust in algorithm | Medium | Simple weighted overlap acceptable in v1 |
| Unmatch / block / report | Safety; mandatory for App Store approval | Low | Must exist before launch |
| Daily swipe limit (freemium gate) | Standard freemium mechanic | Low | Free: 20 swipes/day. Premium: unlimited |

### Social / Community

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| User reviews on company/venue pages | Core product promise | Medium | Text + star rating + optional photo. Min 100 chars |
| Photo upload on reviews | TripAdvisor makes photos primary trust signal | Medium | Compress client-side |
| Upvote / helpful voting on reviews | Surfaces quality content | Low | One vote per user per review |
| Rating aggregation display | Users expect average score | Low | 5-star breakdown |
| Public user profile page | LinkedIn-lite | Medium | Show: archetype badge, industry tags, goal, review count |
| Follow / save entity | Bookmark a company to revisit | Low | Starred list in user profile |
| Push notifications — social triggers | Review upvoted, new match, message received | Low | |
| Content reporting / flagging | Mandatory for App Store / Play Store | Low | Flag button + reason selection |

### Multi-Language

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| UI fully translated TR/EN/ES | Core product promise | Medium | All static UI strings at launch; UGC shown as-written |
| Language switcher in settings | Users need to change after install | Low | Persist in user prefs |
| Locale-aware date/number formatting | Dates look wrong for TR/ES users otherwise | Low | Use device locale for formatting |

### Settings & Account Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Edit profile (photo, bio, tags) | Any social app | Low | |
| Notification preferences | Granular control prevents full disable | Low | Matches / Messages / Social — each toggleable |
| Privacy settings (profile visibility) | GDPR / KVKK; App Store requirement | Low | everyone / matches only / nobody |
| Delete account | GDPR / App Store mandatory | Low | Must actually delete data, not just deactivate |

---

## Differentiators

| Feature | Value Proposition | Complexity | Priority |
|---------|-------------------|------------|----------|
| **Archetype system** (Girişimci, Mühendis, Tasarımcı, Vizyoner, Sanatçı…) | Visual identity no competitor has for SV context; creates shareable "I'm a Visionary" moments | Medium | P0 — ship at launch |
| **Dual-axis matching** (person↔person AND person↔place in same UX) | No competitor combines social matching with venue/company matching | High | P0 — core differentiator |
| **SV Culture Score per entity** | Proprietary score (innovation index, remote-friendliness, startup energy) | Medium | P1 |
| **"Fit Reason" explanation** | "You fit because: Remote-first, YZ odaklı, Hızlı tempo" — transparent algorithm | Low-Med | P1 — builds user trust |
| **Goal-based matching modes** | Networking / Job hunting / Travel buddy / Co-founder — separate intent queues | Medium | P1 |
| **Offline-readable culture cards** | Cache company profiles for travelers without connectivity | Low | P1 — high value for international users |
| **B2B company page claiming** | Companies can claim and edit their culture profile | High | P2 — v1.1 |
| **Cultural data layer / SV Pulse reports** | Aggregate anonymized data into public cultural insights | High | P3 — v2 revenue stream |

---

## Anti-Features (v1)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Video profiles / video messages | Encoding, storage, CDN — massive scope | Text messages only |
| Events / event creation | Meetup's entire product surface | Link to external SV events |
| Web app | Already Out of Scope | Mobile first, validate PMF |
| Real-time typing indicators | Negligible user value vs engineering cost | Send/receive text only |
| In-app voice/video calling | Enormous scope + legal complexity | Users exchange contacts via chat |
| Group chats / group matching | Complex moderation; years of safety work needed | 1:1 matching only |
| Native map with custom pins | Can ship without it | Deep link to Google Maps |
| Cities outside Silicon Valley | Depth > breadth | SV only until content quality validated |
| AI-generated review summaries | Users distrust AI content on social platforms | Real user reviews only |

---

## Feature Dependencies

```
Apple Sign In / Google Auth
  └─→ Profile creation
        └─→ Onboarding quiz (archetype + work style + goal + interests)
              └─→ User profile record complete
                    ├─→ Person↔Person swipe feed
                    │     └─→ Swipe → Mutual match
                    │           └─→ In-app 1:1 messaging  ← HIGHEST COMPLEXITY
                    │                 └─→ Push notification on message
                    └─→ Person↔Place swipe feed
                          └─→ Swipe → Place match saved

Company/Venue Catalog (seed data, admin-loaded)
  └─→ Culture profile pages
        ├─→ Reviews & ratings → Upvote → Rating aggregation
        ├─→ SV Culture Score display
        ├─→ Search & filter index
        └─→ Personalized recommendation feed → Trending section

i18n setup (TR/EN/ES)  ← must be present from day 1, not retrofitted
  └─→ ALL UI screens

Push notification service
  └─→ Match / Message / Social trigger notifications

Auth
  └─→ Block / unmatch / report / delete account (GDPR/KVKK)

Freemium entitlement check
  └─→ Daily swipe limit (free: 20/day)
  └─→ Premium: unlimited swipes
```

---

## MVP Launch Checklist (v1.0)

1. Auth (Apple + Google + email) + personality quiz onboarding
2. Company/venue catalog — 50-100 SV entries, seed data
3. Culture profile pages with archetype system and vibe tags
4. Person↔person swipe deck + match notification
5. Person↔place swipe deck + match notification
6. Match inbox (People tab + Places tab)
7. 1:1 text-only messaging
8. Reviews + star ratings + photo upload
9. Upvote / helpful flag on reviews
10. Search + category filter on catalog
11. Personalized recommendation feed (rule-based, not ML)
12. Multi-language: TR / EN / ES across all UI
13. Freemium gate: 20 free swipes/day
14. Block / report / unmatch + content moderation queue
15. Delete account (GDPR/KVKK)

**Defer to v1.1:** Native map, goal-based match modes, offline culture card cache, B2B claiming flow
**Defer to v2:** Events, groups, video messaging, additional cities, ML recommendations
