# Technology Stack

**Project:** Silicon Valley Kültür & Eşleşme Uygulaması
**Researched:** 2026-05-01
**Overall confidence:** HIGH (core stack), MEDIUM (matching/recommendation layer)

---

## Recommended Stack

### Mobile Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Native (Expo) | SDK 52+ | Cross-platform mobile app (iOS + Android) | React Native docs now officially recommend Expo. Managed workflow eliminates native config overhead. EAS Build handles App Store / Play Store deploys. Expo Router provides file-based navigation matching modern web conventions. |
| TypeScript | 5.x | Type safety across entire codebase | Mandatory for a codebase with complex matching logic, multilingual strings, and user profile shapes. |
| Expo Router | 4.x | File-based navigation | Replaces React Navigation with zero-boilerplate routing. Deep links, typed routes, and tab/stack layouts out of the box. |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| NativeWind | 4.x | Tailwind utility classes in React Native | Eliminates ad-hoc StyleSheet objects. Consistent design tokens. v4 ships stable dark mode and responsive support. |

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | 5.x | Client / UI state (user session, onboarding progress, swipe queue, filter preferences) | Minimal boilerplate, no providers, TypeScript-first. |
| TanStack Query | 5.x | Server state (profiles, venues, matches, reviews) | Caching, background refetch, pagination, optimistic updates — all handled declaratively. |

### Animation & Gesture

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Native Reanimated | 3.x | All animations including swipe card motion | Runs on the native UI thread. Zero jank on mid-range Android devices. |
| React Native Gesture Handler | 2.x | Gesture detection (swipe, pan, tap) | Pairs with Reanimated. Offloads gesture processing to native layer. |
| rn-swiper-list | latest | Pre-built Tinder-style swipe card deck | Actively maintained, Reanimated 3 + Gesture Handler under the hood. Saves significant MVP build time. |

### Backend

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase | latest | Postgres database, Auth, Storage, Realtime, Edge Functions | Single platform covers auth, relational data, file storage, real-time subscriptions, and serverless functions. pgvector extension enables vector-similarity matching without a separate ML service. Open-source with low vendor lock-in. |
| Supabase Auth | — | User authentication (email/password, social OAuth) | Deep Row Level Security integration. Handles JWT refresh automatically. |
| Supabase Storage | — | User photos, venue images | CDN-backed, integrates with RLS. |
| Supabase Realtime | — | Live match notifications, chat messages | WebSocket-based, built on PostgreSQL logical replication. |
| Supabase Edge Functions | Deno | Embedding generation, matching score computation | React Native cannot call OpenAI APIs directly (exposes API keys). Edge Functions act as secure server-side layer. |

### Matching & Recommendation Engine

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| pgvector (Postgres extension) | 0.7+ | Vector similarity search for user-to-user and user-to-venue matching | Lives inside Supabase Postgres. HNSW index makes nearest-neighbor search fast at scale. No separate vector database to operate. |
| OpenAI Embeddings API (text-embedding-3-small) | — | Generate embedding vectors from user profiles, venue culture profiles | Called from Edge Functions only. LOW COST model, adequate quality for profile similarity. |

### Internationalization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-i18next | 14.x | Translation hook (t()), plural rules, interpolation | Industry standard, works in Expo Go without ejecting, TypeScript-friendly. |
| expo-localization | — | Read device locale for auto-detection | Official Expo package. Required companion to react-i18next in Expo projects. |
| i18next | 23.x | Core i18n engine behind react-i18next | Peer dependency, configure once. |

### Push Notifications

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Expo Notifications | SDK 52 | Push notification delivery | Free, zero native config in managed workflow, sufficient for match alerts and messages at MVP scale. |

### Development Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| EAS Build | — | Cloud builds for iOS & Android | No local Xcode/Android Studio setup required. |
| EAS Update | — | Over-the-air JS updates | Ship JS bug fixes without going through App Store review. |
| ESLint + Prettier | latest | Code quality | Standard. Use expo/eslint-config as base. |
| Bun | 1.x | Package manager & runtime | Faster than npm/yarn for installs and script execution. |

---

## Alternatives Considered & Rejected

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Expo (managed) | Bare React Native | Bare requires native configuration expertise. No benefit at this stage. |
| Backend | Supabase | Firebase | Firebase uses NoSQL (Firestore) — relational queries (user + venue + match + review joins) are awkward. |
| Backend | Supabase | PlanetScale | Removed free tier in 2024. No auth, storage, or realtime built-in. |
| Navigation | Expo Router | React Navigation | React Navigation lacks file-based conventions. |
| Styling | NativeWind | StyleSheet API | Raw StyleSheets produce verbose, inconsistent code and no design token system. |
| State | Zustand + TanStack Query | Redux Toolkit | Redux is overengineered. Far less boilerplate with this combo. |
| i18n | react-i18next | Lingui | Lingui requires compile-time extraction step that complicates Expo managed workflow. |
| Swipe | rn-swiper-list | Custom Reanimated build | 2-4 weeks of effort for equivalent quality. Use library for MVP. |
| Vector DB | pgvector (Supabase) | Pinecone / Weaviate | External vector databases add cost, ops complexity, and a network hop. pgvector is sufficient to 1M vectors. |
| Push | Expo Notifications | OneSignal | OneSignal adds cost and complexity unnecessarily for MVP. |

---

## Installation

```bash
# Bootstrap Expo project
npx create-expo-app@latest sv-app --template blank-typescript

# Navigation
npx expo install expo-router

# Styling
npm install nativewind
npm install -D tailwindcss

# State management
npm install zustand @tanstack/react-query

# Animation & gesture
npx expo install react-native-reanimated react-native-gesture-handler

# Swipe deck
npm install rn-swiper-list

# Backend SDK
npm install @supabase/supabase-js

# i18n
npm install react-i18next i18next
npx expo install expo-localization

# Push notifications
npx expo install expo-notifications
```

---

## Key Architecture Constraints

- **Edge Functions are mandatory** for anything touching API keys (OpenAI embeddings). React Native clients must never hold secret keys.
- **RLS (Row Level Security)** in Supabase must be configured before shipping. A misconfigured RLS policy can expose all user profiles publicly.
- **Embedding generation is async** — profiles will not be immediately searchable by vector similarity after creation. Design the matching flow to handle "no matches yet" gracefully.
- **Expo managed workflow** constrains which native modules can be used. Verify every new native library against Expo compatibility before adding it.
