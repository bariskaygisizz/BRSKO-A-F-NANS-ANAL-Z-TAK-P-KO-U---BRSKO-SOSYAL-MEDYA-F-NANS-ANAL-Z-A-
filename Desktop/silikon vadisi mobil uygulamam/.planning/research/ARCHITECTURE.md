# Architecture Research — Silicon Valley Kültür & Eşleşme Uygulaması

**Researched:** 2026-05-01
**Confidence:** HIGH (patterns from Tinder, Hinge, Yelp, LinkedIn engineering)

---

## System Components

### Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT                            │
│                   React Native / Expo                           │
│   Discovery Feed │ Swipe Deck │ Profile │ Social │ Chat        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / WebSocket
┌──────────────────────────▼──────────────────────────────────────┐
│                        SUPABASE                                 │
│      Auth │ REST API │ Realtime WebSocket │ Edge Functions      │
└──────┬───────┬──────────┬────────────┬──────────┬──────────────┘
       │       │          │            │          │
   ┌───▼──┐ ┌──▼───┐ ┌───▼────┐ ┌────▼───┐ ┌────▼────┐
   │ Auth │ │Catal │ │ Match  │ │ Social │ │ Notif.  │
   │ Svc  │ │ og   │ │ Engine │ │  Svc   │ │  Svc    │
   └──┬───┘ └──┬───┘ └───┬────┘ └────┬───┘ └────┬────┘
      │        │         │           │           │
┌─────▼────────▼─────────▼───────────▼───────────▼──────────────┐
│                      DATA LAYER                                 │
│  PostgreSQL (users, profiles, catalog)                          │
│  pgvector (embedding vectors for recommendations)               │
│  Cloudflare R2 (photos, media)                                 │
└────────────────────────────────────────────────────────────────┘
```

### Service Boundaries

| Service | Responsibility | Owns |
|---------|---------------|------|
| Auth Service | Registration, login, JWT, social OAuth | `users`, `sessions` |
| Catalog Service | Companies, venues, culture profiles, search | `places`, `companies`, `tags` |
| Match Engine | Swipe recording, match detection, candidate queue | `swipes`, `matches` |
| Social Service | Reviews, photos, votes, comments, follow graph | `reviews`, `photos`, `votes` |
| Recommendation Service | Personalized feed computation, vector similarity | `feed_cache`, `vectors` |
| Notification Service | Push (Expo Push), in-app | `notifications` |
| Chat Service | Real-time messaging between matched users | `messages` |

**Deployment unit (MVP):** All services as modules within Supabase (PostgreSQL + Edge Functions). Extract to dedicated microservices only when a service becomes a scaling bottleneck — Match Engine and Recommendation Service are most likely candidates by ~50K MAU.

---

## Data Models

### User

```typescript
User {
  id: uuid
  email: string (unique)
  display_name: string
  avatar_url?: string
  locale: 'tr' | 'en' | 'es'
  created_at: timestamp
  is_premium: boolean

  // Personality / onboarding dimensions
  archetype: 'founder' | 'engineer' | 'designer' | 'investor' |
             'artist' | 'visionary' | 'researcher' | 'operator'
  work_style: {
    pace: 'fast' | 'moderate' | 'slow'
    mode: 'remote' | 'hybrid' | 'office'
    environment: 'startup' | 'scaleup' | 'corporate'
  }
  interests: string[]        // ['ai', 'biotech', 'saas', 'design']
  goals: ('networking' | 'job' | 'curiosity' | 'travel' | 'co-founder')[]
  sv_connection: 'going_soon' | 'been_there' | 'want_to_go' | 'remote_explorer'

  // Computed
  profile_completeness: int   // 0-100
}
```

### Place (Venue / Coworking / Restaurant / Event Space)

```typescript
Place {
  id: uuid
  slug: string
  name: string
  category: 'coworking' | 'office' | 'restaurant' | 'cafe' | 'event_space' | 'other'
  address: string
  lat: float
  lng: float
  neighborhood: string     // 'Palo Alto' | 'Menlo Park' | 'SF SOMA' etc.

  // Culture profile
  vibe_tags: string[]      // ['hustle', 'zen', 'creative', 'nerdy']
  culture_tempo: 'intense' | 'balanced' | 'relaxed'
  ideal_archetypes: archetype[]
  culture_description: jsonb   // { "en": "...", "tr": "...", "es": "..." }

  // Stats (denormalized)
  avg_rating: float
  review_count: int
  popularity_score: float

  // B2B
  is_claimed: boolean
  is_featured: boolean
}
```

### Company

```typescript
Company {
  id: uuid
  slug: string
  name: string
  logo_url?: string
  founded_year?: int
  size_range: 'seed' | 'series_a_b' | 'growth' | 'public' | 'acquired'
  sector: string[]
  hq_place_id?: uuid

  // Culture profile
  culture_description: jsonb   // { "en": "...", "tr": "...", "es": "..." }
  culture_tempo: 'intense' | 'balanced' | 'relaxed'
  work_style_fit: work_style
  ideal_archetypes: archetype[]
  vibe_tags: string[]

  avg_rating: float
  review_count: int
  popularity_score: float
  is_claimed: boolean
  is_featured: boolean
}
```

### Swipe

```typescript
Swipe {
  id: uuid
  actor_user_id: uuid
  target_type: 'user' | 'place' | 'company'
  target_id: uuid
  action: 'like' | 'pass' | 'super_like'
  created_at: timestamp

  // Composite unique index: (actor_user_id, target_type, target_id)
}
```

### Match

```typescript
Match {
  id: uuid
  type: 'user_user' | 'user_place' | 'user_company'
  user_id: uuid
  matched_id: uuid
  created_at: timestamp
  is_active: boolean

  // For user_user only
  conversation_id?: uuid
  last_message_at?: timestamp
}
```

### Review

```typescript
Review {
  id: uuid
  author_user_id: uuid
  target_type: 'place' | 'company'
  target_id: uuid
  rating: int   // 1-5
  body: jsonb   // { "en": "...", "tr": "...", "es": "..." }
  visit_date?: date
  photo_ids: uuid[]
  upvote_count: int
  created_at: timestamp
}
```

### Conversation / Message

```typescript
Conversation {
  id: uuid
  match_id: uuid
  created_at: timestamp
  last_message_at: timestamp
}

Message {
  id: uuid
  conversation_id: uuid
  sender_user_id: uuid
  body: string
  type: 'text' | 'image' | 'reaction'
  created_at: timestamp
  read_at?: timestamp
}
```

---

## API Design

### REST Endpoint Sketch

```
POST   /auth/register
POST   /auth/login
GET    /auth/me
PATCH  /auth/me

POST   /onboarding/personality
GET    /onboarding/status

GET    /places                        // paginated, filter by category/neighborhood/vibe
GET    /places/:id
GET    /places/search?q=&lat=&lng=
GET    /places/:id/reviews
POST   /places/:id/reviews

GET    /companies
GET    /companies/:id
GET    /companies/search?q=
GET    /companies/:id/reviews
POST   /companies/:id/reviews

GET    /feed/places                   // personalized place cards for swipe deck
GET    /feed/companies
GET    /feed/users

POST   /swipes                        // { target_type, target_id, action }
GET    /matches
GET    /matches/:id
DELETE /matches/:id

GET    /conversations
GET    /conversations/:id/messages
POST   /conversations/:id/messages

GET    /notifications
POST   /notifications/push-token
```

**REST vs GraphQL:** REST is correct for v1 — simpler caching, no resolver complexity, Expo integration is zero-friction. Switch to GraphQL at v2 if feed query fan-out becomes painful.

---

## Real-Time Layer

### Event Classification

| Event | Latency Need | Mechanism |
|-------|-------------|-----------|
| Match notification (mutual like) | < 2s | Supabase Realtime WebSocket |
| Chat message delivery | < 1s | Supabase Realtime WebSocket |
| In-app like notification | < 5s | Supabase Realtime |
| Feed refresh | best-effort | polling (30s interval) |
| Background push | best-effort | Expo Push API |

### Expo Push (Background)

When user has no active WebSocket connection:
1. Notification Service catches the trigger event
2. Looks up user's `expo_push_token`
3. Sends via `POST https://exp.host/--/api/v2/push/send`
4. No Firebase/APNs certificate management required

---

## Recommendation Engine

### Scoring Formula

```
final_score = α * vector_similarity(user, candidate)
            + β * popularity_score(candidate)
            + γ * freshness_decay(candidate)
            + δ * behavioral_boost(candidate, user_history)
```

Default weights: α=0.5, β=0.25, γ=0.15, δ=0.10

### Profile Vector

Built from onboarding dimensions + implicit behavioral feedback:

```
profile_vector = encode([
  archetype,               // one-hot (8 dimensions)
  work_style.pace,         // one-hot (3)
  work_style.mode,         // one-hot (3)
  work_style.environment,  // one-hot (3)
  interests[],             // multi-hot (N interest tags)
  goals[],                 // multi-hot (5)
  like_rate_by_category,   // implicit signal
])
```

**MVP:** 64-128 float vector, computed server-side with weighted rules. No ML training data needed initially — rule-based embedding is interpretable and correct.
**v2:** Collaborative filtering on accumulated swipe data.

### Data Flow

```
1. User completes onboarding
   → Profile vector computed and stored in pgvector

2. Background job (runs every ~1 hour):
   a. Fetch top-K candidates via pgvector ANN query
   b. Apply hard filters: already swiped, blocked, geographic bounds
   c. Apply soft scoring: popularity, freshness, behavioral boost
   d. Write ranked list to cache (TTL = 2h)

3. GET /feed/places → read from cache
   → cache miss → trigger sync rebuild → return partial results

4. When user swipes:
   a. Write Swipe to Postgres (async-safe)
   b. Check mutual like: SELECT from swipes WHERE actor=$target AND target=$actor
   c. If mutual like → INSERT Match → emit match event → push notification
```

---

## Build Order (Dependencies)

```
Phase 1: Foundation (root dependency of everything)
  ├─ PostgreSQL schema + pgvector extension
  ├─ Auth: register, login, JWT, refresh
  ├─ User model + onboarding endpoints
  └─ Profile vector computation (rule-based)

Phase 2: Catalog (feed and matching depend on entities existing)
  ├─ Place model + CRUD + culture profile fields
  ├─ Company model + CRUD + culture profile fields
  ├─ Seed data (50-100 companies + places, fully i18n'd)
  ├─ Entity vector computation
  └─ Basic search (PostgreSQL tsvector)

Phase 3: Discovery Feed (requires Phase 1 + 2)
  ├─ Feed cache + background job queue
  ├─ pgvector ANN candidate fetching
  ├─ Scoring + feed cache population
  └─ GET /feed endpoints (places, companies, users)

Phase 4: Matching (requires Phase 3)
  ├─ POST /swipes
  ├─ Mutual like detection → Match creation
  ├─ GET /matches endpoints
  └─ Match persistence lifecycle

Phase 5: Social Layer
  ├─ Reviews: create, read, upvote
  ├─ Photo upload: presigned URL flow → Cloudflare R2
  ├─ Vote system
  └─ Popularity score refresh

Phase 6: Real-Time
  ├─ Supabase Realtime WebSocket
  ├─ match:new event emission
  ├─ Chat: Conversation + Message models + endpoints
  └─ Expo Push Notification integration

Phase 7: Monetization & B2B
  ├─ is_premium flag + feature-gating middleware
  ├─ Place/Company claim flow
  ├─ Featured listings
  └─ RevenueCat (mobile IAP)

Phase 8: Polish & Optimization
  ├─ i18n validation pass (all content in TR/EN/ES)
  ├─ Recommendation weight tuning
  ├─ Analytics instrumentation (PostHog)
  └─ Admin panel (CRUD + moderation)
```

---

## Scalability Notes

### Geo-Based Queries

Use PostgreSQL's `earthdistance` + `cube` extensions (no PostGIS needed at MVP):

```sql
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

SELECT *, earth_distance(ll_to_earth(lat, lng), ll_to_earth($1, $2)) AS dist_m
FROM places
WHERE earth_box(ll_to_earth($1, $2), 5000) @> ll_to_earth(lat, lng)
ORDER BY dist_m LIMIT 20;
```

### Swipe Volume by Scale

| MAU | Strategy |
|-----|----------|
| 0-10K | Direct Postgres writes |
| 10K-100K | Buffer in cache, flush to Postgres in batches |
| 100K+ | Dedicated write service |

### Mutual Like Check Performance

```sql
CREATE INDEX swipes_mutual_check ON swipes (actor_user_id, target_id, target_type, action);
```

Fast to 50M swipe rows.

### i18n Storage Pattern

All catalog text stored as `jsonb`:

```json
{ "en": "Fast-paced coworking hub...", "tr": "Hızlı tempolu ortak çalışma...", "es": "Centro de coworking..." }
```

API reads from `Accept-Language` header, falls back to `en`.

### Media / CDN

- Photos stored in Cloudflare R2 (S3-compatible, zero egress fees, built-in CDN)
- Pattern: client requests presigned upload URL → uploads directly to R2 → API records the URL

---

## Key Architecture Decisions

| Decision | Recommendation | Confidence | Rationale |
|----------|---------------|------------|-----------|
| Backend | Supabase (PostgreSQL + Edge Functions) | HIGH | Single platform, pgvector built-in |
| ORM | Drizzle ORM | HIGH | Type-safe, lightweight, first-class PostgreSQL |
| Vector store | pgvector (within Postgres) | HIGH | No separate service at MVP |
| Real-time | Supabase Realtime | HIGH | WebSocket built-in, PostgreSQL-based |
| Push | Expo Push API | HIGH | Handles APNs + FCM without certificates |
| Media | Cloudflare R2 | HIGH | Zero egress fees, CDN included |
| Deployment shape | Modular monolith | HIGH | Ship faster; extract as needed |
