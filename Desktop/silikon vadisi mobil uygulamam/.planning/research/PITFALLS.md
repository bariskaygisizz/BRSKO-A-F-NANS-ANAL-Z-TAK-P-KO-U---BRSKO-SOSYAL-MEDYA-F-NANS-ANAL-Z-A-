# Pitfalls Research — Silicon Valley Kültür & Eşleşme Uygulaması

**Domain:** Mobile app combining content discovery, social matching, UGC, multi-language, freemium
**Researched:** 2026-05-01
**Confidence:** HIGH (established engineering patterns from matching app, i18n, and App Store domains)

---

## Critical Pitfalls

### 1. Cold Start Problem (CRITICAL)

**What goes wrong:**
A matching app with no users produces zero matches. A content catalogue with no reviews is a ghost town. Both layers suffer cold start simultaneously — doubly dangerous. Users open the app once, see empty state, and never return. First-session churn is permanent: the user forms a negative brand impression before the product can deliver value.

**Warning signs:**
- Day-1 retention below 20%
- Match screen shows fewer than 3 cards
- Catalogue pages have zero reviews for the first 2 weeks
- Users complete onboarding but do not return on Day 2

**Prevention:**
- Seed the content catalogue (50-100 SV companies, venues, culture profiles) BEFORE any user can sign up
- Lead with place matching first — immune to cold start because places are pre-seeded
- Launch into a tight niche (Turkish tech community, SV-bound university cohort) for Day-1 density
- Use a waitlist with referral incentive to build density before public registration

**Phase to address:** Phase 1 — seed data is a launch prerequisite, not a post-launch task.

---

### 2. i18n Retrofitted Late (CRITICAL)

**What goes wrong:**
Team builds the entire app in English, hardcoding strings. When TR/ES support is added, every string in every component must be extracted, translation keys invented, plural forms handled, date/number formats corrected. Teams consistently underestimate this by 3-5x. It requires a partial rewrite — not just string replacement.

**Turkish-specific traps:**
- Dotless i: `"ISTANBUL".toLocaleLowerCase('tr')` returns `"ıstanbul"` (with dotless ı). Using `toLowerCase()` instead of `toLocaleLowerCase('tr')` breaks Turkish text silently
- Plural forms: Turkish has different plural logic — `i18next` handles this only if the system is built to use it from the beginning

**Warning signs:**
- Any `<Text>Welcome back</Text>` hardcoded string after Week 1
- No `i18n.t()` wrapper in the codebase
- Content database has no `locale` column on text fields

**Prevention:**
- Set up `react-i18next` + `expo-localization` in the first component written
- Establish `en.json`, `tr.json`, `es.json` translation files before writing any user-facing string
- Content catalogue: use `jsonb` locale-aware text columns from the start: `{ "en": "...", "tr": "...", "es": "..." }`

**Phase to address:** Phase 1, Week 1, before any UI component is written. Non-negotiable.

---

### 3. Privacy & Safety Gaps (CRITICAL)

**What goes wrong:**
Location data leaks through imprecise API design. Matching surfaces expose identity before mutual consent. Photos contain GPS EXIF metadata. A single safety incident generates press coverage disproportionate to app size and permanently damages trust.

**Warning signs:**
- API returning raw `{lat: 37.4219, lng: -122.0840}` instead of `{neighborhood: "Palo Alto"}`
- User full profile visible before a mutual match
- No EXIF stripping on photo upload
- No block/report flow in the UI
- No rate limiting on matching API (allows profile scraping)

**Prevention:**
- Location precision by design: store exact coordinates server-side, expose only neighborhood/city strings to clients
- Show only first name + photo + quiz persona before match; full profile visible only after mutual match
- Strip EXIF metadata from all uploaded photos on server ingest (sharp library for Node.js — one-line operation)
- Block/report UI must be built in Phase 1 — App Store reviewers check for this in matching apps
- Rate-limit swipe API: max 100 swipe actions per hour per user
- KVKK (Turkey's GDPR equivalent): "Delete my account" must permanently remove all PII within 30 days

**Phase to address:** Phase 1 for data model and API design; Phase 1 for block/report UI.

---

### 4. App Store Compliance Failures (CRITICAL)

**What goes wrong:**
Matching apps that allow messaging between strangers are classified as "dating-adjacent" by Apple regardless of stated purpose. Without proactive compliance work, the app is rejected on first submission or after a subsequent update.

**Specific policies that apply:**
- Guideline 1.3: apps with social networking or matching features must include mechanisms to filter objectionable content and report offensive content
- Privacy Manifest (`PrivacyInfo.xcprivacy`) is required for all apps since iOS 17 — omitting causes automatic rejection
- Age gating: if UGC photos are possible, age verification must be implemented
- Apps with user reviews must have a mechanism to delete inappropriate reviews

**Prevention:**
- Complete the Privacy Manifest before first submission
- Set age rating to 17+ if uncertain
- Write explicit App Review Notes on first submission explaining the professional networking nature
- For Google Play: comply with User Generated Content policy (report + block mandatory)
- Always test on a real device before submission — simulator does not reproduce permission dialogs accurately

**Phase to address:** Phase 1 for compliance architecture; pre-launch phase for submission prep.

---

### 5. Matching Quality Decay (HIGH)

**What goes wrong:**
Early matches are good because the algorithm uses quiz answers (high-signal structured data). As the user base grows and behavioral data is incorporated, quality degrades because swipe data is sparse and noisy. "It used to feel personal, now it's just random" is a churn trigger.

**Warning signs:**
- Right-swipe rate drops from >40% to <15% after a few weeks
- Users frequently reach the end of their swipe deck ("no more profiles")
- Match-to-conversation conversion drops (matched but never messaged)

**Prevention:**
- Phase 1: deterministic rule-based matching only. Quiz dimensions map directly to compatibility scores. No ML.
- Phase 2: add implicit signal weighting (profile view time, revisit, saved profiles) as soft boosts
- Phase 3+: introduce collaborative filtering only after 500+ active users with consistent daily signals
- Always implement "match explanation" UI text: "You both value remote-first culture and AI"
- Never show the same user twice within a 48-hour window

**Phase to address:** Phase 1 for rule-based foundation; Phase 3 for ML with data-gate requirement.

---

### 6. Content Quality Collapse (HIGH)

**What goes wrong:**
The catalogue starts with good hand-curated content. UGC takes over: duplicate reviews, off-topic photos, fake listings, outdated info. Without moderation, credibility collapses within 3 months of launch.

**Prevention:**
- Schema constraints at DB level: minimum review length (100 chars), required fields for company/venue profiles
- Build simple admin moderation queue before launch — even a basic approve/reject page is sufficient
- Soft-delete + review queue for all UGC. New content visible after 24h if not flagged
- B2B "claim your page" flow shifts moderation burden to motivated parties
- Visually separate editorial content (team-created) from UGC

**Phase to address:** Phase 1 for schema and moderation queue; Phase 2 for contributor trust system.

---

### 7. Performance on Real Devices (HIGH)

**What goes wrong:**
The swipe interface feels fast with 3 cards and localhost. In production with 50 personalized profiles each with 5 photos, the deck takes 4+ seconds. The app is sluggish on mid-range Android — the actual device profile of TR and ES markets.

**React Native / Expo specific traps:**
- Using standard `Animated` API for swipe gestures — runs on JS thread, blocks during heavy operations
- No spatial index on geo-query (full table scan on every "show me nearby venues")
- Loading all 50 swipe cards at once rather than prefetching 3-5 ahead
- Uploading original camera resolution photos without on-device compression

**Warning signs:**
- Swipe deck takes >1.5 seconds to appear after launch
- Photo upload takes >10 seconds on 4G
- Swipe animation stutters (visible in Flipper performance monitor)
- Backend match query response time >500ms

**Prevention:**
- Compress photos on-device before upload using `expo-image-manipulator`. Target 800x1000px, <300KB. Never upload original resolution.
- Use `react-native-reanimated` v3 for all swipe gestures — Worklets run on UI thread, immune to JS blocking
- Prefetch cards: when user views card N, preload N+2 and N+3
- Add spatial index from Day 1: `CREATE INDEX ON venues USING gist(location);`
- Profile on real Samsung Galaxy A-series device (common in TR/ES markets) before every release

**Phase to address:** Phase 1 for architectural decisions; Phase 2 for profiling and tuning.

---

### 8. Premature Monetization (MEDIUM)

**What goes wrong:**
The team paywalls engaging features before the app has delivered value. Users who haven't experienced a meaningful match hit a paywall and leave. In matching apps, the product must deliver a "wow moment" BEFORE asking for payment.

**Prevention:**
- Define the wow moment: first mutual human match that leads to a message, OR a place recommendation that feels uncannily accurate
- Free tier floor: unlimited place matches, minimum 20 human swipes/day, full messaging with matches
- B2B revenue (venue/company placement, sponsored profiles) should be the FIRST revenue stream — requires no user conversion, only sales. Target 3-5 founding B2B partners before launch (also partially solves cold start)
- Do not introduce in-app purchases until 500+ MAU have each had at least one completed matching session

**Phase to address:** Phase 1 to define wow moment and free-tier floor; Phase 2 for B2B; Phase 3 for premium paywall.

---

## Moderate Pitfalls

### 9. Onboarding Quiz Drop-off

A quiz that is too long (>7 questions), too abstract, or has no progress indicator loses 40-60% of users before completion.

**Prevention:** Hard cap at 5-7 questions. One per screen. Concrete and visual questions. Show progress indicator. Make skippable with default persona.

### 10. Dual-Entity Matching UX Confusion

Users may not intuit they can match with both people AND places, making the app feel like two products stitched together.

**Prevention:** Lead with place matching in onboarding. Use identical interaction patterns for both modes. Tab switcher must be prominent: "Find Places" / "Find People".

### 11. Push Notification Overuse

Too many notifications cause users to disable them within 3 days. Once disabled on iOS, re-enabling requires device Settings — almost no user does this.

**Prevention:** Maximum 1 push per user per day. Always contextualize the permission request. Send in user's local timezone, not UTC.

---

## Quick Reference

| Pitfall | Severity | Phase to Address | Consequence if Deferred |
|---------|----------|-----------------|------------------------|
| Cold Start — Content Seeding | CRITICAL | Phase 1 (pre-launch) | Ghost town UX, permanent churn |
| i18n Architecture | CRITICAL | Phase 1, Week 1 | 3-5x rewrite cost per language |
| Privacy & Safety Data Design | CRITICAL | Phase 1 (data model) | Regulatory liability, rejection |
| App Store Compliance | CRITICAL | Phase 1 + pre-launch | Rejection blocks all distribution |
| Matching Quality Foundation | HIGH | Phase 1 | Churn before algo can learn |
| Content Moderation Queue | HIGH | Phase 1 (pre-launch) | Spam destroys catalogue credibility |
| Spatial Index / Geo Query | HIGH | Phase 1 (DB schema) | Full-table scan, unusable at scale |
| Photo Compression Pipeline | HIGH | Phase 1 (upload flow) | Slow uploads, storage costs explode |
| Onboarding Quiz Design | HIGH | Phase 1 | 40-60% drop-off, no algo signal |
| Dual-Entity UX Architecture | HIGH | Phase 1 (design) | Cognitive confusion, mode abandonment |
| B2B Revenue Before Paywall | MEDIUM | Phase 2 | Revenue zero before user base exists |
| Premature Paywall | MEDIUM | Phase 3 | Kills conversion before wow moment |
| Analytics Instrumentation | MEDIUM | Phase 1 | Blind product decisions post-launch |
| Push Notification Strategy | MEDIUM | Phase 2 | Re-engagement channel lost forever |
| KVKK Compliance | MEDIUM | Phase 1 | Turkish market legal liability |
