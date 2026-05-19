/**
 * ============================================================
 * CreatorPage.jsx — BRSKO Creator Pazarlama & Demo Sayfası
 * ============================================================
 *
 * Bu sayfa iki farklı amaca hizmet eder:
 *
 *   1. PAZARLAMA: BRSKO Creator ürününü (finans içerik üreticileri için
 *      SaaS platform) tanıtır. Özellik kartları, rakip karşılaştırma
 *      tablosu, fiyatlandırma ve bekleme listesi formu içerir.
 *
 *   2. DEMO: Kullanıcıların ürünü satın almadan önce 3 temel aracı
 *      deneyimlemesini sağlar:
 *        a) Rakip Analizi — URL/kullanıcı adı bazlı içerik stratejisi
 *        b) İçerik Üretici — Platform + konu + ton => hazır içerik
 *        c) Reklam Bütçesi — Bütçe + hedef + platform => AI önerisi
 *
 * Deneme Sistemi:
 *   10 ücretsiz kullanım hakkı vardır (localStorage'da saklanır).
 *   Her AI çağrısı 1 hak tüketir. Haklar bitince CreatorPaywall
 *   modal bileşeni gösterilir ve kullanıcı ödeme sayfasına yönlendirilir.
 *
 * AI Entegrasyonu:
 *   chatWithHistory() (geminiService.js) fonksiyonu kullanılır.
 *   Her araç kendi prompt şablonunu oluşturup bu fonksiyona gönderir.
 *
 * Props (App.jsx'ten gelir):
 *   onBack        — Ana sayfaya dönme callback'i
 *   T             — Aktif tema token nesnesi (THEMES[theme])
 *   theme         — 'light' | 'dark' string'i
 *   onToggleTheme — Tema değiştirme callback'i
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, X, Sun, Moon, Sparkles, BarChart2,
  Newspaper, Palette, Calendar, TrendingUp, Users, Zap, Globe,
  Copy, Lock, Send
} from 'lucide-react';
import BrskoLogo from '../components/BrskoLogo';
import { supabase } from '../lib/supabase';
import { chatWithHistory } from '../services/geminiService';

// ─── SABITLER ────────────────────────────────────────────────────────────────

const FONT = '-apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif';

/**
 * Creator deneme sistemi sabitleri.
 * Versiyon eki: CREATOR_TRIAL_VER değişince localStorage'daki eski sayaç sıfırlanır.
 */
const CREATOR_TRIAL_KEY     = 'brsko_creator_trials';
const CREATOR_TRIAL_VER_KEY = 'brsko_creator_trial_ver';
const CREATOR_TRIAL_VER     = 'v1';
const MAX_CREATOR_TRIALS    = 10;

// ─── VERİ SABİTLERİ ──────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: 'Instagram',   bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', letter: 'IG' },
  { name: 'Twitter / X', bg: '#000000',  letter: 'X'  },
  { name: 'Facebook',    bg: '#1877F2',  letter: 'f'  },
  { name: 'LinkedIn',    bg: '#0A66C2',  letter: 'in' },
  { name: 'YouTube',     bg: '#FF0000',  letter: 'YT' },
  { name: 'TikTok',      bg: '#010101',  letter: 'TT' },
  { name: 'Google',      bg: '#4285F4',  letter: 'G'  },
  { name: 'Blog / Web',  bg: '#FF6B35',  letter: 'W'  },
];

const FEATURES = [
  { icon: <Sparkles size={26}/>,   color: '#0071E3', title: 'AI İçerik Üretici',       desc: 'Instagram gönderisi, Twitter thread, YouTube scripti — tek tıkla platform odaklı içerik üretin. Ton, uzunluk, hashtag ve emoji dahil.' },
  { icon: <BarChart2 size={26}/>,  color: '#30D158', title: 'Rakip Analizi',            desc: 'Rakip hesapların paylaşım sıklığını, en iyi içeriklerini ve etkileşim oranlarını takip edin. Strateji boşluklarını anında görün.' },
  { icon: <Newspaper  size={26}/>, color: '#FF9F0A', title: 'Piyasa Olayı Otomasyonu', desc: 'FED, TCMB, kripto haberleri — önemli piyasa olaylarını saniyeler içinde içeriğe dönüştürün. Haber çıkar, gönderi hazır.' },
  { icon: <Palette    size={26}/>, color: '#FF453A', title: 'Görsel & Video Şablonlar', desc: 'Grafik üstü yorum kartları, istatistik infografikleri, kısa video scriptleri. Canva entegrasyonu ile doğrudan dışa aktarım.' },
  { icon: <Calendar   size={26}/>, color: '#5856D6', title: 'İçerik Takvimi',           desc: 'Haftalık içerik planı oluşturun. Piyasa açılış/kapanış saatlerine göre otomatik zamanlama önerileri alın.' },
  { icon: <TrendingUp size={26}/>, color: '#FF6B35', title: 'Performans & Büyüme',      desc: 'İçerik performansını takip edin, A/B testleri yapın. Hangi formatın daha fazla takipçi getirdiğini görün.' },
];

const PACKAGES = [
  {
    name: 'Başlangıç', price: '₺199', period: '/ay',
    desc: 'Yeni başlayan içerik üreticiler için',
    color: '#0071E3', highlight: false, variantId: 'CREATOR_STARTER_ID',
    features: ['50 AI içerik/ay', 'Instagram + Twitter', '10 hazır şablon', 'Rakip takibi (3 hesap)', 'E-posta desteği'],
  },
  {
    name: 'Creator', price: '₺449', period: '/ay',
    desc: 'Büyümek isteyen profesyoneller için',
    color: '#5856D6', highlight: true, variantId: 'CREATOR_PRO_ID',
    features: ['Sınırsız AI içerik', 'Tüm platformlar (8+)', '100+ premium şablon', 'Rakip takibi (20 hesap)', 'Piyasa olayı otomasyonu', 'İçerik takvimi & zamanlama', 'Öncelikli destek'],
  },
  {
    name: 'Ajans', price: '₺999', period: '/ay',
    desc: 'Ajans ve kurumsal kullanım için',
    color: '#FF9F0A', highlight: false, variantId: 'CREATOR_AGENCY_ID',
    features: ["Her şey Creator'da var", '5 hesap yönetimi', 'White-label çözüm', 'API erişimi', 'Özel şablon tasarımı', '7/24 öncelikli destek', 'Aylık strateji görüşmesi'],
  },
];

const COMPETITORS = [
  { name: 'Hootsuite',     price: '$99/ay',  tr: '~₺3.200', note: 'Finansa özel değil, genel sosyal medya' },
  { name: 'Buffer',        price: '$18/ay',  tr: '~₺580',   note: 'İçerik üretimi yok, sadece zamanlama' },
  { name: 'Jasper AI',     price: '$49/ay',  tr: '~₺1.580', note: 'Finans odaklı değil, genel metin AI' },
  { name: 'BRSKO Creator', price: '₺449/ay', tr: '~$14',    note: 'Finansa özel AI + rakip analizi + şablonlar', highlight: true },
];

// ─── YARDIMCI FONKSİYONLAR ───────────────────────────────────────────────────

/**
 * localStorage'dan Creator deneme sayacını okur.
 * Versiyon uyuşmazlığında sayacı sıfırlar — eski değerleri geçersiz kılar.
 * @returns {number} Kullanılan deneme sayısı (0 ile MAX_CREATOR_TRIALS arası)
 */
function readTrialCount() {
  if (localStorage.getItem(CREATOR_TRIAL_VER_KEY) !== CREATOR_TRIAL_VER) {
    localStorage.setItem(CREATOR_TRIAL_VER_KEY, CREATOR_TRIAL_VER);
    localStorage.setItem(CREATOR_TRIAL_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(CREATOR_TRIAL_KEY) || '0', 10);
}

/**
 * Lemon Squeezy ödeme URL'i oluşturur.
 * Production'da variantId'ler .env dosyasından yüklenmelidir:
 *   VITE_CREATOR_STARTER_ID, VITE_CREATOR_PRO_ID, VITE_CREATOR_AGENCY_ID
 * @param {string} variantId Lemon Squeezy varyant ID'si
 * @returns {string} Ödeme sayfası URL'i
 */
function checkoutUrl(variantId) {
  return `https://brsko.lemonsqueezy.com/buy/${variantId}`;
}

// ─── ÖDEME MODAL BİLEŞENİ ────────────────────────────────────────────────────

/**
 * CreatorPaywall — Deneme hakkı bitince gösterilen abonelik modal'ı.
 *
 * 3 paket seçeneği sunar (Başlangıç, Creator, Ajans).
 * Seçili paketin Lemon Squeezy ödeme sayfasını yeni sekmede açar.
 *
 * @param {function} onClose Modal kapatma callback'i
 */
function CreatorPaywall({ onClose, tl }) {
  const [selected, setSelected] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#FFFFFF', borderRadius: 24, padding: '40px 36px', maxWidth: 860, width: '100%', position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', color: '#1D1D1F' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: '50%', background: '#F2F2F7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#86868B' }}>
          <X size={13} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <BrskoLogo size={40} showText textColor="#1D1D1F" textSize={18} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 100, background: 'rgba(88,86,214,0.08)', fontSize: 12, fontWeight: 600, color: '#5856D6', marginBottom: 16 }}>
            <Lock size={11} /> {tl ? tl('cr_pw_badge') : '10 ücretsiz deneme hakkınız doldu'}
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 10 }}>
            <span style={{ background: 'linear-gradient(135deg,#5856D6,#0071E3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Creator</span>{' '}
            {tl ? tl('cr_pw_title') : 'aboneliğine geç'}
          </h2>
          <p style={{ fontSize: 15, color: '#6E6E73', lineHeight: 1.55 }}>
            {tl ? tl('cr_pw_sub') : 'Sınırsız rakip analizi, içerik üretimi ve reklam bütçesi hesaplama.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {PACKAGES.map((pkg, i) => (
            <div key={pkg.name} onClick={() => setSelected(i)}
              style={{ borderRadius: 16, padding: '20px 16px', cursor: 'pointer', position: 'relative', border: selected === i ? `2px solid ${pkg.color}` : '1.5px solid #E5E5EA', background: selected === i ? `${pkg.color}08` : '#FAFAFA', transition: 'all 0.15s' }}
            >
              {pkg.highlight && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: pkg.color, borderRadius: 100, padding: '2px 12px', fontSize: 10, fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>{tl ? tl('most_popular') : 'EN POPÜLER'}</div>
              )}
              <div style={{ fontSize: 13, fontWeight: 700, color: pkg.color, marginBottom: 2 }}>{pkg.name}</div>
              <div style={{ fontSize: 11, color: '#86868B', marginBottom: 12 }}>{pkg.desc}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 14 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em' }}>{pkg.price}</span>
                <span style={{ fontSize: 12, color: '#86868B' }}>{pkg.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pkg.features.slice(0, 4).map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#3A3A3C' }}>
                    <CheckCircle size={11} color="#30D158" style={{ flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <a
          href={checkoutUrl(PACKAGES[selected].variantId)}
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px', borderRadius: 12, background: PACKAGES[selected].color, color: 'white', fontSize: 16, fontWeight: 500, textDecoration: 'none', fontFamily: FONT, transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {tl ? tl('cr_pw_btn', { name: PACKAGES[selected].name, price: PACKAGES[selected].price }) : `${PACKAGES[selected].name} Paketi Satın Al — ${PACKAGES[selected].price}/ay`}
        </a>
        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#86868B', marginTop: 12 }}>
          {tl ? tl('cr_pw_cancel') : 'İstediğiniz zaman iptal edebilirsiniz. KDV dahil.'}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── ORTAK BUTON BİLEŞENİ ────────────────────────────────────────────────────

/**
 * ActionButton — Demo araçların AI gönder butonu.
 * Yükleme sırasında animasyonlu dots gösterir.
 */
function ActionButton({ onClick, loading, disabled, label }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      style={{ width: '100%', padding: '13px', borderRadius: 12, background: loading || disabled ? 'rgba(88,86,214,0.4)' : '#5856D6', border: 'none', color: 'white', fontSize: 15, fontWeight: 600, cursor: loading || disabled ? 'default' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}>
      {loading ? (
        [0, 1, 2].map(n => (
          <span key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', display: 'inline-block', animation: 'typingBounce 1.4s infinite', animationDelay: `${n * 0.2}s` }} />
        ))
      ) : (
        <><Send size={14} /> {label}</>
      )}
    </button>
  );
}

// ─── DEMO ARAÇLAR PANELİ ─────────────────────────────────────────────────────

/**
 * DemoTools — 3 sekmeli interaktif araç paneli.
 *
 * Her araç, chatWithHistory() ile Gemini AI çağrısı yapar.
 * Çağrı öncesi kalan hak kontrolü yapılır; hak bittiyse paywall açılır.
 *
 * @param {number}   trialCount  Şimdiye kadar kullanılan hak sayısı
 * @param {function} onUse       Her AI çağrısında tetiklenir (count+1 için)
 * @param {function} onPaywall   Hak bitti olayında paywall modalı açar
 * @param {object}   T           Tema token nesnesi
 * @param {string}   theme       'light' | 'dark'
 */
function DemoTools({ trialCount, onUse, onPaywall, T, theme, tl }) {
  const isDark   = theme === 'dark';
  const panelBg  = isDark ? '#111111' : '#F5F5F7';
  const tabBg    = isDark ? '#1C1C1E' : '#FFFFFF';
  const inputBg  = isDark ? '#2C2C2E' : '#FFFFFF';
  const inputBdr = isDark ? '#3A3A3C' : '#D2D2D7';
  const chipBdr  = isDark ? 'rgba(255,255,255,0.12)' : '#E5E5EA';
  const chipClr  = isDark ? 'rgba(255,255,255,0.65)' : '#3A3A3C';

  const [tab,     setTab]     = useState('rakip');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState('');
  const [copied,  setCopied]  = useState(false);

  // Rakip Analizi state
  const [compUrl,      setCompUrl]      = useState('');
  const [compPlatform, setCompPlatform] = useState('Instagram');

  // İçerik Üretici state
  const [contPlatform, setContPlatform] = useState('Instagram');
  const [contTopic,    setContTopic]    = useState('');
  const [contTone,     setContTone]     = useState('Bilgilendirici');
  const [contType,     setContType]     = useState('Gönderi');

  // Reklam Bütçesi state
  const [adPlatform, setAdPlatform] = useState('Instagram');
  const [adBudget,   setAdBudget]   = useState('');
  const [adGoal,     setAdGoal]     = useState('Farkındalık');
  const [adDuration, setAdDuration] = useState('1 Ay');
  const [adAudience, setAdAudience] = useState('Orta (10K-100K)');

  const remaining = MAX_CREATOR_TRIALS - trialCount;

  /**
   * AI çağrısı yapan merkezi fonksiyon.
   * Hak kontrolü, trial decrement, AI isteği ve sonuç gösterimi burada.
   * @param {string} prompt Platforma özel hazırlanan prompt metni
   */
  const callAI = async (prompt) => {
    if (remaining <= 0) { onPaywall(); return; }
    setLoading(true);
    setResult('');
    onUse();
    try {
      const res = await chatWithHistory([{ role: 'user', content: prompt }]);
      setResult(res);
    } catch {
      setResult(tl ? tl('cr_ai_error') : 'AI bağlantısı şu an yoğun. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  const analyzeCompetitor = () => {
    if (!compUrl.trim()) return;
    callAI(`Sen BRSKO Creator, finans içerik üreticileri için rakip analizi yapıyorsun.

Rakip hesap: "${compUrl.trim()}"
Platform: ${compPlatform}

Şu başlıklar altında Türkçe detaylı analiz yap:

1. **Tahmini İçerik Stratejisi**
Bu hesabın muhtemelen kullandığı strateji ve niş.

2. **En Çok Etkileşim Alan İçerik Türleri**
Bu platform ve niş için hangi formatlar (reels, carousel, thread vb.) en iyi performans gösterir?

3. **5 Rekabetçi İçerik Fikri**
Bu rakiple rekabet edebilecek, öne çıkabilecek 5 özgün içerik fikri. Her biri için başlık + kısa açıklama.

4. **Hashtag Stratejisi**
Bu niş için 15-20 hashtag (büyük, orta ve küçük hacimli karışık).

5. **Optimal Paylaşım Zamanlaması**
${compPlatform} için en iyi gün ve saat önerileri.

NOT: Bu analiz AI tarafından tahminsel üretilmiştir. Gerçek hesap istatistiklerine erişilmemektedir.`);
  };

  const generateContent = () => {
    if (!contTopic.trim()) return;
    callAI(`Sen BRSKO Creator, finans içerik üreticileri için ${contPlatform} içeriği üretiyorsun.

Platform: ${contPlatform}
Konu: ${contTopic}
Ton: ${contTone}
İçerik Türü: ${contType}

${contPlatform} için yayına hazır, Türkçe bir ${contType} üret.

Kurallar:
- ${contPlatform}'a özel format ve uzunluk kullan
- Tonu "${contTone}" olarak koru
- Finansal içerik için net, değer katan bilgi sun
- Gerekli hashtag'leri ekle
- Call-to-action (CTA) ile bitir
- Emoji'leri platforma uygun kullan

Direkt kopyalanıp yayına alınabilecek şekilde yaz. Sadece içeriği yaz, açıklama ekleme.`);
  };

  const calculateBudget = () => {
    if (!adBudget.trim() || isNaN(Number(adBudget))) return;
    callAI(`Sen BRSKO Creator, finans içerik üreticilerine dijital reklam bütçesi danışmanlığı yapıyorsun.

Platform: ${adPlatform}
Aylık Bütçe: ₺${adBudget}
Kampanya Hedefi: ${adGoal}
Süre: ${adDuration}
Hedef Kitle Büyüklüğü: ${adAudience}

Türkçe detaylı reklam bütçesi planı hazırla:

1. **Bütçe Dağılımı**
${adDuration} için günlük/haftalık bütçe önerisi ve taktik dağılımı.

2. **Tahmini Erişim & Etkileşim**
Bu bütçeyle ${adPlatform}'da ulaşılabilecek tahmini erişim, tıklama ve etkileşim (Türkiye pazarı).

3. **CPM & CPC Tahminleri**
${adPlatform} Türkiye ortalaması CPM (₺) ve CPC (₺) tahminleri.

4. **Hedefleme Önerileri**
${adGoal} hedefi için ${adPlatform}'da en etkili hedefleme parametreleri (yaş, ilgi alanı, davranış).

5. **Reklam Formatı Önerisi**
Bu bütçe ve hedef için en iyi performans gösteren reklam formatı.

6. **5 Optimizasyon İpucu**
Bütçeyi maksimize etmek için pratik öneriler.

NOT: Rakamlar sektör ortalamalarına dayalı tahminlerdir. Gerçek sonuçlar değişebilir.`);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Chip — tekrar eden seçim butonu
  const Chip = ({ val, cur, set }) => (
    <button onClick={() => set(val)}
      style={{ padding: '5px 12px', borderRadius: 100, border: `1px solid ${cur === val ? '#5856D6' : chipBdr}`, background: cur === val ? 'rgba(88,86,214,0.12)' : 'transparent', color: cur === val ? '#5856D6' : chipClr, fontSize: 12, fontWeight: cur === val ? 600 : 400, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.12s', whiteSpace: 'nowrap' }}>
      {val}
    </button>
  );

  const TABS = [
    { key: 'rakip',  label: tl ? tl('cr_tab_competitor') : 'Rakip Analizi' },
    { key: 'icerik', label: tl ? tl('cr_tab_content') : 'İçerik Üretici' },
    { key: 'butce',  label: tl ? tl('cr_tab_budget') : 'Reklam Bütçesi' },
  ];

  const trialColor = remaining > 5 ? '#30D158' : remaining > 1 ? '#FF9F0A' : '#FF453A';
  const LBL = (txt) => (
    <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{txt}</div>
  );

  return (
    <div style={{ background: panelBg, borderRadius: 24, padding: 28, transition: 'background 0.3s' }}>

      {/* Başlık + hak sayacı */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', margin: 0 }}>{tl ? tl('cr_demo_title') : 'Hemen Deneyin'}</h3>
          <p style={{ fontSize: 13, color: T.text2, margin: '3px 0 0' }}>{tl ? tl('cr_demo_sub') : 'Kayıt olmadan — 10 ücretsiz kullanım'}</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: `${trialColor}18`, border: `1px solid ${trialColor}40` }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: trialColor }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: trialColor }}>{tl ? tl('cr_trials_badge', { n: remaining, max: MAX_CREATOR_TRIALS }) : `${remaining} / ${MAX_CREATOR_TRIALS} hak kaldı`}</span>
        </div>
      </div>

      {/* Tab seçici */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: isDark ? '#1C1C1E' : '#EBEBED', borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setResult(''); }}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 9, border: 'none', background: tab === t.key ? tabBg : 'transparent', color: tab === t.key ? T.text : T.text2, fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s', boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.12)' : 'none', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: RAKİP ANALİZİ ── */}
      {tab === 'rakip' && (
        <div>
          <div style={{ marginBottom: 14 }}>
            {LBL(tl ? tl('cr_platform_lbl') : 'Platform')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Instagram', 'Twitter / X', 'YouTube', 'TikTok', 'LinkedIn'].map(p => (
                <Chip key={p} val={p} cur={compPlatform} set={setCompPlatform} />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            {LBL(tl ? tl('cr_url_label') : 'Rakip Hesap URL veya Kullanıcı Adı')}
            <input value={compUrl} onChange={e => setCompUrl(e.target.value)}
              placeholder={tl ? tl('cr_url_ph') : 'Örn: instagram.com/finanskocu veya @finanskocu'}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${inputBdr}`, background: inputBg, color: T.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>{tl ? tl('cr_url_note') : "AI, URL'e dayanarak strateji tahmini yapar. Gerçek hesap verilerine erişim yapılmaz."}</p>
          </div>
          <ActionButton onClick={analyzeCompetitor} loading={loading} disabled={!compUrl.trim()} label={tl ? tl('cr_analyze_btn') : 'Rakip Analiz Et'} />
        </div>
      )}

      {/* ── TAB: İÇERİK ÜRETİCİ ── */}
      {tab === 'icerik' && (
        <div>
          <div style={{ marginBottom: 14 }}>
            {LBL(tl ? tl('cr_platform_lbl') : 'Platform')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Instagram', 'Twitter / X', 'YouTube', 'TikTok', 'LinkedIn', 'Blog'].map(p => (
                <Chip key={p} val={p} cur={contPlatform} set={setContPlatform} />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            {LBL(tl ? tl('cr_topic_lbl') : 'Konu')}
            <input value={contTopic} onChange={e => setContTopic(e.target.value)}
              placeholder={tl ? tl('cr_topic_ph') : 'Örn: Dolar/TL analizi, Bitcoin 2025 tahmini, Enflasyon etkileri'}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${inputBdr}`, background: inputBg, color: T.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              {LBL(tl ? tl('cr_tone_lbl') : 'Ton')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {['Bilgilendirici', 'Eglenceli', 'Uzman', 'Provoke Edici'].map(t => (
                  <Chip key={t} val={t} cur={contTone} set={setContTone} />
                ))}
              </div>
            </div>
            <div>
              {LBL(tl ? tl('cr_type_lbl') : 'İçerik Türü')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {['Gonderi', 'Thread', 'Video Script', 'Hikaye', 'Reel Script'].map(t => (
                  <Chip key={t} val={t} cur={contType} set={setContType} />
                ))}
              </div>
            </div>
          </div>
          <ActionButton onClick={generateContent} loading={loading} disabled={!contTopic.trim()} label={tl ? tl('cr_content_btn') : 'İçerik Üret'} />
        </div>
      )}

      {/* ── TAB: REKLAM BÜTÇESİ ── */}
      {tab === 'butce' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              {LBL(tl ? tl('cr_platform_lbl') : 'Platform')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {['Instagram', 'Facebook', 'YouTube', 'TikTok', 'LinkedIn', 'Google'].map(p => (
                  <Chip key={p} val={p} cur={adPlatform} set={setAdPlatform} />
                ))}
              </div>
            </div>
            <div>
              {LBL(tl ? tl('cr_budget_lbl') : 'Aylık Bütçe (TL)')}
              <input type="number" value={adBudget} onChange={e => setAdBudget(e.target.value)}
                placeholder={tl ? tl('cr_budget_ph') : 'Örn: 5000'}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${inputBdr}`, background: inputBg, color: T.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div>
              {LBL(tl ? tl('cr_goal_lbl') : 'Hedef')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['Farkindalik', 'Etkilesim', 'Takipci', 'Web Trafigi'].map(g => (
                  <Chip key={g} val={g} cur={adGoal} set={setAdGoal} />
                ))}
              </div>
            </div>
            <div>
              {LBL(tl ? tl('cr_dur_lbl') : 'Süre')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['1 Hafta', '2 Hafta', '1 Ay', '3 Ay'].map(d => (
                  <Chip key={d} val={d} cur={adDuration} set={setAdDuration} />
                ))}
              </div>
            </div>
            <div>
              {LBL(tl ? tl('cr_aud_lbl') : 'Hedef Kitle')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['Kucuk (1K-10K)', 'Orta (10K-100K)', 'Buyuk (100K+)'].map(a => (
                  <Chip key={a} val={a} cur={adAudience} set={setAdAudience} />
                ))}
              </div>
            </div>
          </div>
          <ActionButton onClick={calculateBudget} loading={loading} disabled={!adBudget.trim()} label={tl ? tl('cr_budget_btn') : 'Bütçeyi Hesapla'} />
        </div>
      )}

      {/* ── SONUÇ ALANI ── */}
      <AnimatePresence>
        {(loading || result) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginTop: 20, overflow: 'hidden' }}
          >
            <div style={{ background: isDark ? '#000000' : '#FFFFFF', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E5EA'}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F2F2F7'}` }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text3 }}>{tl ? tl('cr_result_hdr') : 'AI Yanıtı'}</span>
                {result && (
                  <button onClick={copyResult}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E5E5EA'}`, background: 'transparent', color: copied ? '#30D158' : T.text2, fontSize: 11, cursor: 'pointer', fontFamily: FONT, transition: 'color 0.15s' }}>
                    <Copy size={11} /> {copied ? (tl ? tl('cr_copied_btn') : 'Kopyalandı!') : (tl ? tl('cr_copy_btn') : 'Kopyala')}
                  </button>
                )}
              </div>
              <div style={{ padding: 16, maxHeight: 420, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.text3, fontSize: 14 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0,1,2].map(n => (
                        <span key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: '#5856D6', display: 'inline-block', animation: 'typingBounce 1.4s infinite', animationDelay: `${n * 0.2}s` }} />
                      ))}
                    </div>
                    {tl ? tl('cr_ai_loading') : 'AI analiz yapıyor...'}
                  </div>
                ) : (
                  <pre style={{ fontFamily: FONT, fontSize: 14, color: T.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
                    {result}
                  </pre>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ANA SAYFA BİLEŞENİ ──────────────────────────────────────────────────────

export default function CreatorPage({ onBack, T, theme, onToggleTheme, tl }) {

  // Bekleme listesi
  const [waitEmail, setWaitEmail] = useState('');
  const [waitDone,  setWaitDone]  = useState(false);
  const [waitErr,   setWaitErr]   = useState('');
  const [sending,   setSending]   = useState(false);

  // Deneme sistemi
  const [trialCount,  setTrialCount]  = useState(readTrialCount);
  const [showPaywall, setShowPaywall] = useState(false);

  const joinWaitlist = async () => {
    if (!waitEmail.trim() || !/\S+@\S+\.\S+/.test(waitEmail)) {
      setWaitErr(tl ? tl('cr_err_email') : 'Geçerli bir e-posta adresi girin.');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('creator_waitlist').insert({ email: waitEmail });
      if (error) throw error;
      setWaitDone(true);
    } catch {
      setWaitErr(tl ? tl('cr_err_generic') : 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
    setSending(false);
  };

  /**
   * Bir deneme hakkı kullanıldığında hem state'i hem localStorage'ı günceller.
   * İki kaynağı senkron tutmak önemlidir: biri anlık UI, diğeri kalıcı depolama.
   */
  const handleTrialUse = () => {
    const next = trialCount + 1;
    setTrialCount(next);
    localStorage.setItem(CREATOR_TRIAL_KEY, String(next));
  };

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: FONT, minHeight: '100vh', transition: 'background 0.3s' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: T.nav, backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: `1px solid ${T.navBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.text2, cursor: 'pointer', fontSize: 13, fontFamily: FONT }}>
            <ArrowLeft size={15} /> {tl ? tl('cr_back') : 'Ana Sayfa'}
          </button>
          <div style={{ width: 1, height: 16, background: T.border }} />
          <BrskoLogo size={22} showText textColor={T.text} textSize={13} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#5856D6', background: 'rgba(88,86,214,0.1)', padding: '2px 8px', borderRadius: 100 }}>Creator</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onToggleTheme} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text2 }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <a href="#fiyatlar" onClick={e => { e.preventDefault(); document.getElementById('fiyatlar')?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{ padding: '7px 16px', borderRadius: 980, background: '#5856D6', color: 'white', fontSize: 13, fontWeight: 500, textDecoration: 'none', cursor: 'pointer' }}>
            {tl ? tl('cr_early_nav') : 'Erken Erişim'}
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '140px 24px 80px', textAlign: 'center', background: theme === 'dark' ? 'linear-gradient(180deg,#000 50%,#0d0d1a)' : 'linear-gradient(180deg,#fff 50%,#f0f0ff)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 100, background: 'rgba(88,86,214,0.1)', fontSize: 12, fontWeight: 600, color: '#5856D6', marginBottom: 24 }}>
            <Zap size={11} fill="#5856D6" /> {tl ? tl('cr_badge') : 'Erken Erişim — İlk 3 Ay %40 İndirimli'}
          </div>
          <h1 style={{ fontSize: 'clamp(36px,7vw,80px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 22, color: T.text }}>
            {tl ? tl('cr_hero_prefix') : 'Finans içerik üreticileri için'}{' '}
            <span style={{ background: 'linear-gradient(135deg,#5856D6,#0071E3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {tl ? tl('cr_hero_hl') : 'AI platform.'}
            </span>
          </h1>
          <p style={{ fontSize: 19, color: T.text2, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.6 }}>
            {tl ? tl('cr_hero_sub') : 'Instagram, Twitter, YouTube, LinkedIn — tüm platformlarda finans içeriği üretin, rakipleri analiz edin, reklam bütçenizi optimize edin.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 52 }}>
            {PLATFORMS.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 100, background: T.card, border: `1px solid ${T.border}`, fontSize: 13, color: T.text2, boxShadow: T.cardShadow }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>{p.letter}</div>
                {p.name}
              </div>
            ))}
          </div>
          {waitDone ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.25)', color: '#30D158', fontSize: 15, fontWeight: 500 }}>
              <CheckCircle size={18} /> {tl ? tl('cr_joined') : 'Listeye eklendiniz! Yakında haber vereceğiz.'}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 480, margin: '0 auto' }}>
              <input value={waitEmail} onChange={e => { setWaitEmail(e.target.value); setWaitErr(''); }}
                placeholder={tl ? tl('cr_email_ph') : 'E-posta adresiniz'}
                onKeyDown={e => e.key === 'Enter' && joinWaitlist()}
                style={{ flex: 1, minWidth: 220, padding: '12px 16px', borderRadius: 12, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.text, fontSize: 15, fontFamily: FONT, outline: 'none' }} />
              <button onClick={joinWaitlist} disabled={sending}
                style={{ padding: '12px 24px', borderRadius: 12, background: '#5856D6', border: 'none', color: 'white', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: FONT, opacity: sending ? 0.75 : 1 }}>
                {sending ? (tl ? tl('cr_joining') : 'Ekleniyor...') : (tl ? tl('cr_join_btn') : 'Erken Erişim')}
              </button>
            </div>
          )}
          {waitErr && <p style={{ fontSize: 13, color: '#FF3B30', marginTop: 8 }}>{waitErr}</p>}
          <p style={{ fontSize: 12, color: T.text3, marginTop: 10 }}>{tl ? tl('cr_free_note') : 'Ücretsiz erken erişim · Kredi kartı gerekmez'}</p>
        </motion.div>
      </section>

      {/* DEMO ARAÇLAR */}
      <section style={{ background: T.bg2, padding: '80px 48px', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, letterSpacing: '-0.03em', color: T.text, marginBottom: 10 }}>
              {tl ? tl('cr_try_title') : 'Araçları şimdi deneyin.'}
            </h2>
            <p style={{ fontSize: 17, color: T.text2, maxWidth: 460, margin: '0 auto' }}>
              {tl ? tl('cr_try_sub') : 'Kayıt olmadan, ücretsiz 10 kullanım hakkı ile rakip analizi, içerik üretimi ve reklam bütçesi hesaplama araçlarını test edin.'}
            </p>
          </div>
          <DemoTools trialCount={trialCount} onUse={handleTrialUse} onPaywall={() => setShowPaywall(true)} T={T} theme={theme} tl={tl} />
        </div>
      </section>

      {/* OZELLIKLER */}
      <section style={{ background: T.bg, padding: '80px 48px', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 12, color: T.text }}>{tl ? tl('cr_feat_title') : 'Her şey tek platformda.'}</h2>
          <p style={{ fontSize: 17, color: T.text2, textAlign: 'center', marginBottom: 52, maxWidth: 480, margin: '0 auto 52px' }}>{tl ? tl('cr_feat_sub') : 'Araç aramayı bırak. İçerik üretmeye odaklan.'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{ background: T.card, borderRadius: 18, padding: '32px 26px', boxShadow: T.cardShadow, transition: 'background 0.3s' }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: f.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: f.color }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8, color: T.text }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RAKIP TABLOSU */}
      <section style={{ background: T.bg2, padding: '80px 48px', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 12, color: T.text }}>{tl ? tl('cr_vs_title') : 'Rakiplerle kıyasla.'}</h2>
          <p style={{ fontSize: 17, color: T.text2, textAlign: 'center', marginBottom: 44 }}>{tl ? tl('cr_vs_sub') : 'Finansa özel araç, dolar kurundan bağımsız TRY fiyatı.'}</p>
          <div style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${T.border}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 2fr', padding: '12px 20px', background: T.bg, fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <span>{tl ? tl('cr_vs_tool') : 'Araç'}</span><span>{tl ? tl('cr_vs_price') : 'Fiyat/ay'}</span><span>{tl ? tl('cr_vs_try') : 'TRY karşılığı'}</span><span>{tl ? tl('cr_vs_diff') : 'Fark'}</span>
            </div>
            {COMPETITORS.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 2fr', padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: c.highlight ? 'rgba(88,86,214,0.07)' : 'transparent', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: c.highlight ? 700 : 500, color: c.highlight ? '#5856D6' : T.text }}>
                  {c.name}
                  {c.highlight && <span style={{ marginLeft: 6, fontSize: 10, background: '#5856D6', color: 'white', padding: '2px 7px', borderRadius: 100 }}>{tl ? tl('cr_you') : 'SİZ'}</span>}
                </span>
                <span style={{ fontSize: 14, color: T.text }}>{c.price}</span>
                <span style={{ fontSize: 14, color: T.text2 }}>{c.tr}</span>
                <span style={{ fontSize: 13, color: c.highlight ? '#30D158' : T.text2 }}>{c.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIYATLANDIRMA */}
      <section id="fiyatlar" style={{ background: T.bg, padding: '80px 48px', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 12, color: T.text }}>{tl ? tl('cr_price_title') : 'Şeffaf fiyatlandırma.'}</h2>
          <p style={{ fontSize: 17, color: T.text2, textAlign: 'center', marginBottom: 48 }}>{tl ? tl('cr_price_sub') : 'Kur riskine karşı TRY ile fiyatlandırma. İstediğiniz zaman iptal.'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {PACKAGES.map((pkg, i) => (
              <div key={i} style={{ background: T.card, borderRadius: 20, padding: '28px 24px', border: pkg.highlight ? `2px solid ${pkg.color}` : `1.5px solid ${T.border}`, position: 'relative', transition: 'background 0.3s' }}>
                {pkg.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: pkg.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>{tl ? tl('most_popular') : 'EN POPÜLER'}</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: pkg.color, marginBottom: 4 }}>{pkg.name}</div>
                <div style={{ fontSize: 11, color: T.text3, marginBottom: 16 }}>{pkg.desc}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 20 }}>
                  <span style={{ fontSize: 34, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>{pkg.price}</span>
                  <span style={{ fontSize: 13, color: T.text3 }}>{pkg.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
                  {pkg.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text2 }}>
                      <CheckCircle size={13} color="#30D158" style={{ flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>
                <a href={checkoutUrl(pkg.variantId)} target="_blank" rel="noopener noreferrer"
                  style={{ width: '100%', padding: '12px', borderRadius: 11, background: pkg.highlight ? pkg.color : 'transparent', border: `1.5px solid ${pkg.highlight ? pkg.color : T.border}`, color: pkg.highlight ? 'white' : T.text, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.15s' }}>
                  {tl ? tl('cr_buy_btn', { price: pkg.price }) : `Satın Al — ${pkg.price}/ay`}
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: T.text3, marginTop: 24 }}>
            {tl ? tl('cr_price_note') : 'Lansman öncesi erken erişim listesine kaydolanlar ilk 3 ay %40 indirimli başlar.'}
          </p>
        </div>
      </section>

      {/* KIM ICIN */}
      <section style={{ background: T.bg2, padding: '80px 48px 100px', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12, color: T.text }}>{tl ? tl('cr_who_title') : 'Kim için?'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginTop: 36 }}>
            {[
              { icon: <Users size={22}/>,      title: "Finans YouTuber'lari",  desc: 'Script, thumbnail metni, SEO basliklar' },
              { icon: <Globe size={22}/>,      title: 'Kripto Analistler',     desc: 'Thread, teknik analiz yazisi, haber yorumu' },
              { icon: <TrendingUp size={22}/>, title: 'Borsa Egitimcileri',    desc: 'Egitim icerigi, soru-cevap, aciklama' },
              { icon: <Newspaper size={22}/>,  title: 'Finans Blogculari',     desc: 'Makale, SEO icerik, bulten' },
            ].map((uc, i) => (
              <div key={i} style={{ background: T.card, borderRadius: 16, padding: '22px 18px', boxShadow: T.cardShadow, transition: 'background 0.3s' }}>
                <div style={{ color: '#5856D6', marginBottom: 10 }}>{uc.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>{uc.title}</div>
                <div style={{ fontSize: 13, color: T.text2 }}>{uc.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#1D1D1F', padding: '32px 48px', textAlign: 'center' }}>
        <BrskoLogo size={24} showText textColor="white" textSize={13} />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>
          2025 BRSKO AI - BRSKO Creator - destek@brsko.ai
        </p>
      </footer>

      {/* ODEME MODALI */}
      <AnimatePresence>
        {showPaywall && <CreatorPaywall onClose={() => setShowPaywall(false)} tl={tl} />}
      </AnimatePresence>

    </div>
  );
}
