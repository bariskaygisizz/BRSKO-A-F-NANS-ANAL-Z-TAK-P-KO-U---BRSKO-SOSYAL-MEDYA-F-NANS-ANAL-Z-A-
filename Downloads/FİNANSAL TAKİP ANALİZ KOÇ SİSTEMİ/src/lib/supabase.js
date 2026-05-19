/**
 * ============================================================
 * supabase.js — Supabase İstemci Başlatma Modülü
 * ============================================================
 *
 * Bu dosya tek bir iş yapar: Supabase istemcisini oluşturur ve
 * tüm uygulama boyunca aynı instance'ı paylaşır (singleton pattern).
 *
 * Neden singleton?
 *   Supabase istemcisi WebSocket bağlantısı ve oturum (session) durumu
 *   tutar. Her dosyada yeniden createClient() çağrılsaydı:
 *     - Gereksiz ağ bağlantıları açılırdı.
 *     - Realtime abonelikleri çakışırdı.
 *     - Auth state tutarsız kalırdı.
 *   Bu yüzden istemci burada bir kez oluşturulur ve import ile paylaşılır.
 *
 * Kullanım:
 *   import { supabase } from '../lib/supabase';
 *   const { data } = await supabase.from('profiles').select('*');
 *
 * Ortam değişkenleri (.env dosyasından yüklenir, Vite build'e gömülür):
 *   VITE_SUPABASE_URL      — Supabase proje URL'i (ör. https://xyz.supabase.co)
 *   VITE_SUPABASE_ANON_KEY — Supabase anonim (public) API anahtarı
 *
 * ⚠️  VITE_ öneki zorunludur — Vite yalnızca bu önekle başlayan değişkenleri
 *     istemci tarafı bundle'a dahil eder. Öneksiz değişkenler undefined olur.
 *
 * ⚠️  Anon key, Row Level Security (RLS) politikalarına tabidir.
 *     Hassas işlemler (admin, servis rolü) için service_role key kullanılır
 *     ve asla istemci tarafına gönderilmez.
 *
 * Bağımlılık: @supabase/supabase-js
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase proje URL'i.
 * Yükleniyor: import.meta.env.VITE_SUPABASE_URL
 * @type {string}
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Supabase anonim (public) API anahtarı.
 * Yükleniyor: import.meta.env.VITE_SUPABASE_ANON_KEY
 * Bu anahtar RLS politikaları tarafından korunur; public bundle'a girmesi güvenlidir.
 * @type {string}
 */
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Paylaşılan Supabase istemci instance'ı.
 * Uygulamanın tamamında bu tek nesne kullanılır.
 * Auth oturumu, realtime abonelikleri ve fetch interceptor'ları burada yaşar.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
