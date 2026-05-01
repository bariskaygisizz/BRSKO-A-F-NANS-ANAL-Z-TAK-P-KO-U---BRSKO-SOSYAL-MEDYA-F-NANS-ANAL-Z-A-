# Roadmap — Silicon Valley Kültür & Eşleşme Uygulaması

**8 phases** | **46 requirements** | Milestone 1: MVP

---

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation | Auth, onboarding, i18n, privacy altyapısı | AUTH-01–07, I18N-01–05, PRIV-01–04 | 5 |
| 2 | Catalogue | SV şirket/mekan kataloğu ve kültür profilleri | CAT-01–06 | 4 |
| 3 | Discovery Feed | Kişiselleştirilmiş öneri akışı | FEED-01–03 | 3 |
| 4 | Matching Core | Çift eksenli eşleşme (insan + mekan) | MATCH-01–09 | 5 |
| 5 | Social Layer | Yorumlar, puanlama, fotoğraf, moderasyon | SOC-01–06 | 4 |
| 6 | Real-Time & Chat | WebSocket, 1:1 mesajlaşma, Expo Push | CHAT-01–03 | 3 |
| 7 | Monetization | Freemium kapı, premium IAP, B2B | MON-01–03 | 3 |
| 8 | Polish & Launch | i18n doğrulama, analitik, App Store hazırlık | — (quality gate) | 4 |

**Coverage:** 46/46 gereksinim eşleştirildi. Orphan yok.

---

## Phase Details

### Phase 1: Foundation
**Goal:** Kullanıcı kaydı, kişilik testi, çok dilli altyapı, gizlilik ve güvenlik temellerini inşa et — her şey buna bağlı.
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, PRIV-01, PRIV-02, PRIV-03, PRIV-04
**UI hint:** yes
**Success criteria:**
1. Kullanıcı email/şifre, Apple veya Google ile kayıt olabilir ve uygulama yeniden açıldığında oturumu devam eder.
2. Kullanıcı maksimum 7 soruluk kişilik/arketip testini tamamlar ve profilinde arketip rozeti görür.
3. Kullanıcı onboardingde TR/EN/ES seçer; tüm UI anında o dilde görüntülenir; cihaz locale'i otomatik algılanır.
4. Kullanıcı profil görünürlüğünü ve kategori bazında bildirim tercihlerini yönetebilir.
5. Kullanıcı hesabını siler ve tüm verisinin kaldırıldığına dair onay alır (GDPR/KVKK).

---

### Phase 2: Catalogue
**Goal:** Silicon Valley şirket ve mekan kataloğunu inşa et — eşleşme ve feed için önkoşul; soğuk başlangıcı önler.
**Requirements:** CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06
**UI hint:** yes
**Success criteria:**
1. En az 50 SV şirket/mekan profili kullanıcının seçtiği dilde tam kültür verisiyle erişilebilir.
2. Kullanıcı kategori, vibe etiketi, semt ve sektöre göre filtreler; sonuçlar anında gelir.
3. Kullanıcı anahtar kelimeyle arama yapar ve 2 saniye içinde sonuç bulur.
4. Kullanıcı girişleri favorilere ekler ve "Kaydettiklerim" listesinde görür.

---

### Phase 3: Discovery Feed
**Goal:** Kullanıcının arketip ve ilgi alanlarına göre kişiselleştirilmiş şirket/mekan önerisi sun.
**Requirements:** FEED-01, FEED-02, FEED-03
**UI hint:** no
**Success criteria:**
1. Feed, kullanıcının testten gelen arketipi ve ilgi alanlarını yansıtır — genel bir liste değildir.
2. Kullanıcı "Bu hafta trend" bölümünü görür.
3. Swiping ve kaydetme sonrası feed sonraki oturumlarda evrilir.

---

### Phase 4: Matching Core
**Goal:** Çift eksenli Tinder benzeri eşleşme — insanlarla VE mekanlarla, aynı UX ile.
**Requirements:** MATCH-01, MATCH-02, MATCH-03, MATCH-04, MATCH-05, MATCH-06, MATCH-07, MATCH-08, MATCH-09
**UI hint:** yes
**Success criteria:**
1. Kullanıcı hem kişi hem mekan/şirket kartlarını aynı UX ile (swipe) değerlendirebilir.
2. Karşılıklı sağa kaydırma, saniyeler içinde her iki kullanıcıya da push bildirimi gönderir.
3. Eşleşme gelen kutusu, Kişiler ve Mekanlar sekmeleriyle tüm aktif eşleşmeleri gösterir.
4. Her eşleşme kartı uyumluluk skoru ve sade dilde "uyum nedeni" açıklaması içerir.
5. Ücretsiz kullanıcılar 20 swipe sonrası günlük limit ekranı görür; engelleme/eşleşmeyi kaldırma eşleşme detayından yapılabilir.

---

### Phase 5: Social Layer
**Goal:** Şirket/mekan sayfalarına kullanıcı yorumu, puanlama, fotoğraf ve içerik moderasyonu ekle.
**Requirements:** SOC-01, SOC-02, SOC-03, SOC-04, SOC-05, SOC-06
**UI hint:** yes
**Success criteria:**
1. Kullanıcı min 100 karakterlik metin yorumu ve 1–5 yıldız puanı yazar; yorum hemen görünür.
2. Kullanıcı yoruma fotoğraf ekleyebilir.
3. Kullanıcı bir yorumu "Faydalı" olarak oylar.
4. Kullanıcı içerik şikayet eder; işaretlenen içerik admin moderasyon kuyruğuna girer.

---

### Phase 6: Real-Time & Chat
**Goal:** Eşleşen kullanıcılar arasında gerçek zamanlı mesajlaşmayı etkinleştir.
**Requirements:** CHAT-01, CHAT-02, CHAT-03
**UI hint:** yes
**Success criteria:**
1. Eşleşen kullanıcılar, yanıtlar 2 saniye içinde görünen metin mesajları gönderebilir.
2. Yeni mesaj push bildirimi tıklandığında doğru sohbeti açar.
3. Tüm aktif sohbetler son mesaj sırasıyla tek bir gelen kutusunda görünür.

---

### Phase 7: Monetization
**Goal:** Freemium kapısını, premium IAP'i ve B2B öne çıkarma taleplerini hayata geçir.
**Requirements:** MON-01, MON-02, MON-03
**UI hint:** no
**Success criteria:**
1. Premium Apple/Google IAP aracılığıyla satın alınabilir (RevenueCat); sınırsız swipe anında aktif olur.
2. Premium kullanıcılar eşleşme gelen kutusunda "Seni beğenenler" listesini görür.
3. Şirket sahipleri uygulama içi form aracılığıyla öne çıkarma talebi gönderebilir.

---

### Phase 8: Polish & Launch
**Goal:** i18n doğrulama, analitik, admin paneli ve App Store başvurusu.
**Requirements:** — (quality gate, tüm önceki gereksinimler doğrulanır)
**UI hint:** yes
**Success criteria:**
1. Tüm TR/EN/ES stringleri doğrulandı — kullanıcılara görünür eksik anahtar veya ham fallback yok.
2. Temel funnel (kayıt → test → göz at → swipe → eşleşme → sohbet) PostHog'da uçtan uca izleniyor.
3. Admin, moderasyon kuyruğunu görüntüler, içerik onaylar/reddeder ve öne çıkarma taleplerini yönetir.
4. Uygulama App Store incelemesinden ilk başvuruda geçer (Privacy Manifest, blok/şikayet UI, Apple Sign In, App Review Notes).

---

## Requirement Coverage

| Phase | REQ-IDs |
|-------|---------|
| Phase 1 | AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, PRIV-01, PRIV-02, PRIV-03, PRIV-04 |
| Phase 2 | CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06 |
| Phase 3 | FEED-01, FEED-02, FEED-03 |
| Phase 4 | MATCH-01, MATCH-02, MATCH-03, MATCH-04, MATCH-05, MATCH-06, MATCH-07, MATCH-08, MATCH-09 |
| Phase 5 | SOC-01, SOC-02, SOC-03, SOC-04, SOC-05, SOC-06 |
| Phase 6 | CHAT-01, CHAT-02, CHAT-03 |
| Phase 7 | MON-01, MON-02, MON-03 |
| Phase 8 | Quality gate (tüm önceki gereksinimler) |

**Total: 46/46 ✓**

---

*Created: 2026-05-01*
