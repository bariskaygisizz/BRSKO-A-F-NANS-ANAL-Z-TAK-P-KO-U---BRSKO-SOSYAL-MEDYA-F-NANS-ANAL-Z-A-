/**
 * ============================================================
 * profileService.js — Kullanıcı Profil & Abonelik Servisi
 * ============================================================
 *
 * Bu servis, Supabase'deki `profiles` tablosuyla ilgili tüm
 * okuma/yazma işlemlerini kapsüller (encapsulation). Bileşenler
 * Supabase sorgularını doğrudan yazmak yerine bu servis fonksiyonlarını
 * çağırır. Bu sayede:
 *   - Tablo adı veya şema değişirse yalnızca bu dosya güncellenir.
 *   - Bileşenler veri katmanından bağımsız kalır (separation of concerns).
 *   - Unit test yazmak kolaylaşır (servis mock'lanabilir).
 *
 * profiles tablosu şeması (beklenen):
 *   id               uuid (auth.users.id ile ilişkili)
 *   trial_count      int  (kalan deneme hakkı sayısı)
 *   subscription_plan text ('free' | 'starter' | 'creator' | 'agency')
 *
 * Bağımlılık: ../lib/supabase (singleton Supabase istemcisi)
 */

import { supabase } from '../lib/supabase';

// ─── OKUMA ────────────────────────────────────────────────────

/**
 * getProfile — Kullanıcının profil satırını getirir.
 *
 * .single() kullanılmasının nedeni: id primary key olduğundan
 * her zaman en fazla 1 satır döner. Dizi yerine nesne döndürmek
 * çağıran kodu temizler (data[0] yazmak gerekmez).
 *
 * Kullanım yerleri:
 *   - isPro() içinde abonelik planını kontrol etmek
 *   - Dashboard bileşenlerinde kullanıcı adı ve planı göstermek
 *
 * @param {string} userId auth.users.id (UUID formatında)
 * @returns {Promise<object|null>} Profil nesnesi veya bulunamazsa null
 */
export async function getProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

// ─── YAZMA ────────────────────────────────────────────────────

/**
 * syncTrialCount — Kullanıcının deneme sayısını veritabanıyla senkronize eder.
 *
 * Neden gerekli?
 *   Deneme sayısı önce LocalStorage'da (hız için) sonra burada (kalıcılık için)
 *   güncellenir. Bu fonksiyon "arka plan senkronizasyonu" görevi görür:
 *   kullanıcı farklı bir cihazdan giriş yaparsa LocalStorage yoktur, ama
 *   veritabanı kayıtlı kalan sayıyı saklar.
 *
 * ⚠️  Hata yönetimi kasıtlı olarak yok — deneme sayısı senkronizasyonu
 *     kritik bir işlem değildir; başarısız olsa bile kullanıcı deneyimi
 *     bozulmaz (LocalStorage fallback çalışır).
 *
 * @param {string} userId auth.users.id
 * @param {number} count  Yeni deneme sayısı (0 ile MAX_CREATOR_TRIALS arası)
 * @returns {Promise<void>}
 */
export async function syncTrialCount(userId, count) {
  await supabase
    .from('profiles')
    .update({ trial_count: count })
    .eq('id', userId);
}

// ─── ABONELİK KONTROLÜ ────────────────────────────────────────

/**
 * isPro — Kullanıcının ücretli aboneli olup olmadığını kontrol eder.
 *
 * Karar mantığı:
 *   - subscription_plan yoksa veya 'free' ise → false (ücretsiz kullanıcı)
 *   - Herhangi başka bir değer ('starter', 'creator', 'agency') → true
 *
 * Bu fonksiyon "paywall kararı" için kullanılır. Pro ise araçlar
 * deneme sınırı olmadan çalışır; değilse trial sistemi devreye girer.
 *
 * Örnek kullanım:
 *   const userIsPro = await isPro(session.user.id);
 *   if (!userIsPro) { // deneme sistemi devreye girer }
 *
 * @param {string} userId auth.users.id
 * @returns {Promise<boolean>} true = ücretli abone, false = ücretsiz kullanıcı
 */
export async function isPro(userId) {
  const profile = await getProfile(userId);
  // Null güvenliği: profil bulunamazsa veya plan tanımsızsa free kabul et
  return profile?.subscription_plan != null && profile.subscription_plan !== 'free';
}
