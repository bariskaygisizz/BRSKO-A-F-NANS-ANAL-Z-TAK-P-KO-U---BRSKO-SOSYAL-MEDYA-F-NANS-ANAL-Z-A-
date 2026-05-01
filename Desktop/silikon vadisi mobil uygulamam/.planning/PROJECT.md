# Project: Silicon Valley Kültür & Eşleşme Uygulaması

## What This Is

Silicon Valley'in şirket kültürünü, mekanlarını ve ruhunu dünyaya taşıyan çok dilli bir mobil uygulama. Kullanıcılar kendi kişilik, tarz ve hedeflerine göre SV kültürünü keşfeder; hem insanlarla hem de mekanlarla Tinder benzeri bir eşleşme sistemiyle bağlanır. Platform kullanıldıkça SV hakkında zengin kültürel veri birikir.

## Core Value

**Kullanıcı kendi ruhuna uygun Silicon Valley deneyimini bulur ve benzer insanlarla bağlantı kurar.**

## Who It's For

- SV'ye gidecek ya da gitmek isteyen herkes (stajyer, girişimci, meraklı turist)
- Dünyadan SV kültürünü uzaktan keşfetmek isteyen tech meraklıları
- SV'deki şirketler ve mekanlar (içerik ortakları olarak)

## What It Does

### Keşif Katmanı
- Silicon Valley şirketleri, ofisleri, coworking alanları, mekanlar, restoranlar, etkinlikler
- Her yer ve şirket için kültür profili (tempo, vibe, çalışma tarzı, ruh)
- Kullanıcı yorum, fotoğraf ve deneyim paylaşımı (TripAdvisor + Glassdoor karışımı)
- Oylama ve öneri sistemi

### Eşleşme Katmanı (Tinder benzeri)
- **İnsan ↔ İnsan**: Benzer SV ruhu, çalışma tarzı, ilgi alanı ve hedeflere sahip kişilerle eşleşme (networking, ortak proje, seyahat arkadaşı)
- **İnsan ↔ Mekan/Şirket**: Kullanıcının profiline en uygun şirket veya mekan eşleşmesi

### Kişiselleştirme
- Onboarding: kişilik/ruh testi (girişimci, mühendis, tasarımcı, vizyoner, sanatçı vb.)
- Çalışma tarzı tercihleri (remote/ofis, hızlı/yavaş tempo, kurumsal/startup)
- İlgi alanı seçimi (YZ, biyotek, kripto, SaaS, tasarım, fintech vb.)
- Amaç seçimi (networking, iş arama, merak, seyahat, ortak proje)
- Algoritma davranışa göre öğrenir ve öneriler gelişir

### Çok Dilli Destek
- Türkçe, İngilizce, İspanyolca (ve genişletilebilir dil altyapısı)
- SV daha geniş kitlelere tanıtılır, kültürel veri zenginleşir

### İçerik Modeli
- Temel katalog ekip tarafından kurulur (şirketler, mekanlar, kültür profilleri)
- Kullanıcılar yorum, fotoğraf, deneyim ekleyerek zenginleştirir
- Şirketler/mekanlar kendi sayfalarını yönetebilir (B2B katmanı)

### Gelir Modeli
- Freemium: ücretsiz temel, ücretli gelişmiş eşleşme ve özellikler
- Şirket/mekan öne çıkarma ve sponsorluk
- Veri ve içgörü (kültürel analitik)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobil önce (React Native) | Eşleşme deneyimi mobilde daha doğal | — Pending |
| Çok dilli altyapı baştan | Sonradan eklemek çok maliyetli | — Pending |
| İkili eşleşme (insan + mekan) | Tinder mekaniğini kültür keşfiyle birleştiriyor | — Pending |
| İçerik: hibrit (ekip + kullanıcı) | Hızlı başlangıç + organik büyüme | — Pending |

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Kullanıcı kaydı ve kişilik/ruh onboardingi
- [ ] Silicon Valley şirket ve mekan kataloğu
- [ ] Tinder benzeri eşleşme (insan ↔ insan, insan ↔ mekan)
- [ ] Yorum, fotoğraf, oylama sistemi
- [ ] Çok dilli destek (TR/EN/ES)
- [ ] Algoritma tabanlı kişiselleştirilmiş öneri akışı
- [ ] Kullanıcı profili ve ilgi alanı yönetimi
- [ ] Şirket/mekan kültür profili sayfaları
- [ ] Freemium ve monetizasyon katmanı

### Out of Scope (v1)

- Web uygulaması — mobil önce, web sonraki milestone
- Gerçek zamanlı video görüşme — v2
- SV dışı şehirler — v2 genişlemesi

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-01 after initialization*
