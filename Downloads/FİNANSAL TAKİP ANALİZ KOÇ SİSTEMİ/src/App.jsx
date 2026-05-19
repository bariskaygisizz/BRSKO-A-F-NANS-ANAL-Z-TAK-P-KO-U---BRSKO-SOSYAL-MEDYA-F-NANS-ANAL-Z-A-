import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LineChart, Settings, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, TrendingUp, Shield, Crown, Lock, CheckCircle, X, LogOut, User, BrainCircuit, Mail, Clock, ChevronDown, Sun, Moon, Globe } from 'lucide-react';
import { chatWithHistory } from './services/geminiService';
import { supabase } from './lib/supabase';
import { getProfile, syncTrialCount } from './services/profileService';
import AuthModal from './components/AuthModal';
import BrskoLogo from './components/BrskoLogo';
import IntroScreen from './components/IntroScreen';
import FloatingBanknotes from './components/FloatingBanknotes';
import LanguageSelector from './components/LanguageSelector';
import CreatorPage from './pages/CreatorPage';
import { translate } from './i18n/translations';
import { LANGUAGES } from './i18n/languages';
import './App.css';

const TRIAL_KEY = 'brsko_trial_count';
const TRIAL_VERSION_KEY = 'brsko_trial_version';
const TRIAL_VERSION = 'v3';
const MAX_TRIALS = 5;
const FONT = '-apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif';

const THEMES = {
  light: {
    bg: '#FFFFFF', bg2: '#F5F5F7',
    text: '#1D1D1F', text2: '#6E6E73', text3: '#86868B',
    card: '#FFFFFF', cardShadow: '0 2px 16px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.04)',
    border: 'rgba(0,0,0,0.06)',
    nav: 'rgba(255,255,255,0.85)', navBorder: 'rgba(0,0,0,0.1)',
    inputBg: '#F9F9F9', inputBorder: '#E5E5EA',
    heroGrad: 'linear-gradient(180deg, #FFFFFF 55%, #F5F5F7 100%)',
  },
  dark: {
    bg: '#000000', bg2: '#0d0d0d',
    text: '#F5F5F7', text2: 'rgba(255,255,255,0.55)', text3: 'rgba(255,255,255,0.35)',
    card: '#1C1C1E', cardShadow: '0 2px 16px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.07)',
    nav: 'rgba(0,0,0,0.88)', navBorder: 'rgba(255,255,255,0.08)',
    inputBg: '#1C1C1E', inputBorder: '#3A3A3C',
    heroGrad: 'linear-gradient(180deg, #000000 55%, #0d0d0d 100%)',
  },
};

export default function App() {
  const [page, setPage] = useState('landing');
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('brsko_theme') || 'light');
  const [cookieDone, setCookieDone] = useState(() => !!localStorage.getItem('brsko_cookie'));
  const [showCookie, setShowCookie] = useState(false);
  const [policyModal, setPolicyModal] = useState(null);
  const [language, setLanguage] = useState(() => localStorage.getItem('brsko_lang') || 'tr');
  const [showLangModal, setShowLangModal] = useState(false);

  const T = THEMES[theme];

  const tl = (key, vars) => translate(language, key, vars);

  const selectLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem('brsko_lang', code);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('brsko_theme', next);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!cookieDone) {
      const t = setTimeout(() => setShowCookie(true), 1800);
      return () => clearTimeout(t);
    }
  }, [cookieDone]);

  const acceptCookies = (all) => {
    localStorage.setItem('brsko_cookie', all ? 'all' : 'minimal');
    setCookieDone(true);
    setShowCookie(false);
  };

  const handleEnter = () => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      synth.cancel();
      const say = () => {
        const u = new SpeechSynthesisUtterance('BRSKO AI');
        u.lang = 'en-US';
        u.rate = 0.72;
        u.pitch = 0.85;
        u.volume = 1;
        const voices = synth.getVoices();
        const v = voices.find(v => v.lang === 'en-US' && v.localService)
               || voices.find(v => v.lang.startsWith('en'))
               || voices[0];
        if (v) u.voice = v;
        synth.speak(u);
      };
      if (synth.getVoices().length > 0) {
        say();
      } else {
        synth.addEventListener('voiceschanged', say, { once: true });
        setTimeout(say, 150);
      }
    }
    setPage('intro');
  };

  const currentLangFlag = LANGUAGES.find(l => l.code === language)?.flag || '🌐';

  if (page === 'intro') return <IntroScreen onComplete={() => setPage('app')} />;

  if (page === 'creator') return <CreatorPage onBack={() => setPage('landing')} T={T} theme={theme} onToggleTheme={toggleTheme} tl={tl} />;

  if (page === 'app') return (
    <>
      <ChatApp onExit={() => setPage('landing')} user={user} onOpenAuth={() => setShowAuth(true)} tl={tl} language={language} langFlag={currentLangFlag} onOpenLang={() => setShowLangModal(true)} />
      <AnimatePresence>
        {showLangModal && (
          <LanguageSelector
            current={language}
            onSelect={selectLanguage}
            onClose={() => setShowLangModal(false)}
            T={{ bg: '#000000' }}
          />
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <Landing
        onEnter={handleEnter}
        scrolled={scrolled}
        user={user}
        onOpenAuth={() => setShowAuth(true)}
        onLogout={() => supabase.auth.signOut()}
        onOpenPolicy={setPolicyModal}
        T={T}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCreator={() => setPage('creator')}
        tl={tl}
        language={language}
        langFlag={currentLangFlag}
        onOpenLang={() => setShowLangModal(true)}
      />
      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showCookie && <CookieBanner onAccept={() => acceptCookies(true)} onMinimal={() => acceptCookies(false)} tl={tl} />}
      </AnimatePresence>
      <AnimatePresence>
        {policyModal && <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showLangModal && (
          <LanguageSelector
            current={language}
            onSelect={selectLanguage}
            onClose={() => setShowLangModal(false)}
            T={T}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────── LANDING ────────────────────────────────────
function Landing({ onEnter, scrolled, user, onOpenAuth, onLogout, onOpenPolicy, T, theme, onToggleTheme, onOpenCreator, tl, language, langFlag, onOpenLang }) {
  const FEATURES = [
    { title: 'AI Danışman', sub: 'Portföyünüz hakkında her şeyi doğal dilde sorun. Bir uzmanla konuşur gibi.', icon: <BrainCircuit size={30} />, color: '#0071E3' },
    { title: 'Piyasa Zekası', sub: 'BTC, hisse senetleri, döviz ve altın. Gerçek zamanlı analiz tek yerde.', icon: <LineChart size={30} />, color: '#30D158' },
    { title: 'Öngörüler', sub: 'Portföy yörüngesi tahminleri. Geleceği şimdiden görün.', icon: <TrendingUp size={30} />, color: '#FF9F0A' },
    { title: 'Güvenlik', sub: 'Banka düzeyinde şifreleme. Verileriniz asla üçüncü taraflarla paylaşılmaz.', icon: <Shield size={30} />, color: '#FF453A' },
  ];

  const MARKETS = [
    { t: 'BTC/USD', v: '$64,230', c: '+2.4%', up: true },
    { t: 'NASDAQ', v: '18,123', c: '+1.1%', up: true },
    { t: 'USD/TRY', v: '32.45', c: '-0.2%', up: false },
    { t: 'ALTIN', v: '$2,340', c: '+0.5%', up: true },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: FONT, transition: 'background 0.3s, color 0.3s' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 48,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: T.nav,
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: `1px solid ${scrolled ? T.navBorder : 'transparent'}`,
        transition: 'border-color 0.3s, background 0.3s',
      }}>
        <BrskoLogo size={26} showText textColor={T.text} textSize={15} />

        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="hide-mobile">
          {[
            { label: tl('nav_features'), id: 'ozellikler' },
            { label: tl('nav_pricing'), id: 'fiyatlandirma' },
            { label: tl('nav_contact'), id: 'iletisim' },
          ].map(l => (
            <a key={l.label} href={`#${l.id}`}
              onClick={e => { e.preventDefault(); document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{ fontSize: 12, color: T.text, opacity: 0.7, textDecoration: 'none', transition: 'opacity 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.opacity = '1'}
              onMouseLeave={e => e.target.style.opacity = '0.7'}
            >{l.label}</a>
          ))}
          <button onClick={onOpenCreator}
            style={{ fontSize: 11, fontWeight: 600, color: '#5856D6', background: 'rgba(88,86,214,0.1)', border: 'none', padding: '4px 10px', borderRadius: 100, cursor: 'pointer', fontFamily: FONT, letterSpacing: '0.01em' }}>
            ✦ Creator
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: 12, color: T.text2 }} className="hide-mobile">{user.email?.split('@')[0]}</span>
              <button onClick={onLogout} style={{ fontSize: 12, color: '#0071E3', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT }}>{tl('nav_logout')}</button>
            </>
          ) : (
            <button onClick={onOpenAuth} style={{ fontSize: 12, color: '#0071E3', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT }}>{tl('nav_login')}</button>
          )}
          {/* Tema toggle */}
          <button onClick={onToggleTheme} style={{
            width: 32, height: 32, borderRadius: '50%', border: `1px solid ${T.border}`,
            background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: T.text2, transition: 'all 0.2s',
          }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {/* Dil seçici */}
          <button onClick={onOpenLang} title={tl('lang_select')} style={{
            height: 32, padding: '0 10px', borderRadius: 100, border: `1px solid ${T.border}`,
            background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            cursor: 'pointer', color: T.text2, transition: 'all 0.2s',
          }}>
            <Globe size={13} color="#0071E3" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: T.text, lineHeight: 1 }}>
              {language.toUpperCase().slice(0, 2)}
            </span>
          </button>
          <button onClick={onEnter} className="apple-btn" style={{ padding: '8px 18px', fontSize: 13 }}>{tl('nav_start')}</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
        background: T.heroGrad,
        position: 'relative', overflow: 'hidden',
        transition: 'background 0.3s',
      }}>
        <FloatingBanknotes />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px',
            borderRadius: 100, background: 'rgba(0,113,227,0.07)',
            fontSize: 12, fontWeight: 500, color: '#0071E3', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30D158', animation: 'pulse 2s infinite' }} />
            {tl('hero_badge')}
          </div>

          <h1 className="hero-title" style={{ marginBottom: 22, maxWidth: 820, whiteSpace: 'pre-line' }}>
            {tl('hero_title')}
          </h1>

          <p style={{ fontSize: 21, color: T.text2, maxWidth: 520, margin: '0 auto 44px', lineHeight: 1.55, fontWeight: 400 }}>
            {tl('hero_sub')}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEnter} className="apple-btn" style={{ padding: '14px 28px', fontSize: 17 }}>
              {tl('hero_cta')}
            </button>
            <button onClick={() => document.getElementById('ozellikler')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'transparent', color: '#0071E3', border: 'none', padding: '14px 24px', borderRadius: 980, fontSize: 17, cursor: 'pointer', fontFamily: FONT }}>
              {tl('hero_learn')}
            </button>
          </div>
        </motion.div>

        {/* Market Cards */}
        <div style={{ display: 'flex', gap: 14, marginTop: 72, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {MARKETS.map((w, i) => (
            <motion.div key={w.t}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              style={{
                padding: '18px 22px', borderRadius: 16, minWidth: 144, textAlign: 'left',
                background: T.card,
                boxShadow: T.cardShadow,
                transition: 'background 0.3s',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 500, color: T.text3, letterSpacing: '0.05em', marginBottom: 6 }}>{w.t}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: T.text, marginBottom: 3 }}>{w.v}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: w.up ? '#30D158' : '#FF453A' }}>{w.c}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="ozellikler" style={{ background: T.bg2, padding: '96px 48px', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="section-title" style={{ marginBottom: 14, color: T.text }}>{tl('feat_title')}</h2>
            <p style={{ fontSize: 19, color: T.text2, maxWidth: 460, margin: '0 auto', lineHeight: 1.5 }}>
              {tl('feat_sub')}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: T.card, borderRadius: 18, padding: '36px 28px',
                boxShadow: T.cardShadow, transition: 'background 0.3s',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8, color: T.text }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.55 }}>{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="fiyatlandirma" style={{ background: T.bg, padding: '96px 48px', textAlign: 'center', transition: 'background 0.3s' }}>
        <h2 className="section-title" style={{ marginBottom: 18, color: T.text }}>{tl('cta_title')}</h2>
        <p style={{ fontSize: 19, color: T.text2, marginBottom: 40, lineHeight: 1.5 }}>
          {tl('cta_sub')}
        </p>
        <button onClick={onEnter} className="apple-btn" style={{ padding: '15px 32px', fontSize: 17 }}>
          {tl('cta_btn')}
        </button>
      </section>

      {/* ── İLETİŞİM ── */}
      <ContactSection T={T} tl={tl} />

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1D1D1F', padding: '48px 48px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, marginBottom: 40 }}>
            <div style={{ maxWidth: 280 }}>
              <BrskoLogo size={28} showText textColor="white" textSize={15} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 14, lineHeight: 1.6 }}>
                {tl ? tl('footer_desc') : 'Yapay zeka destekli finansal analiz ve danışmanlık platformu. 5 ücretsiz mesajla başlayın.'}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>
                📧 destek@brsko.ai
              </p>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 14, textTransform: 'uppercase' }}>{tl ? tl('footer_product') : 'Ürün'}</div>
                {[
                  { label: tl ? tl('footer_features') : 'Özellikler', id: 'ozellikler' },
                  { label: tl ? tl('footer_pricing') : 'Fiyatlandırma', id: 'fiyatlandirma' },
                  { label: tl ? tl('footer_contact') : 'İletişim', id: 'iletisim' },
                ].map(l => (
                  <div key={l.label} style={{ marginBottom: 10 }}>
                    <button onClick={() => document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' })}
                      style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT, textAlign: 'left' }}
                      onMouseEnter={e => e.target.style.color = 'white'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                    >{l.label}</button>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 14, textTransform: 'uppercase' }}>{tl ? tl('footer_legal') : 'Yasal'}</div>
                {[
                  { label: tl ? tl('footer_privacy') : 'Gizlilik Politikası', key: 'privacy' },
                  { label: tl ? tl('footer_terms') : 'Kullanım Koşulları', key: 'terms' },
                  { label: tl ? tl('footer_cookies') : 'Çerez Politikası', key: 'cookies' },
                  { label: tl ? tl('footer_kvkk') : 'KVKK Aydınlatma', key: 'privacy' },
                ].map(l => (
                  <div key={l.label} style={{ marginBottom: 10 }}>
                    <button onClick={() => onOpenPolicy(l.key)}
                      style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT, textAlign: 'left' }}
                      onMouseEnter={e => e.target.style.color = 'white'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                    >{l.label}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
            {/* Financial disclaimer */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{tl ? tl('footer_warn_title') : 'Yasal Uyarı:'}</strong> {tl ? tl('footer_warn') : 'BRSKO AI, yalnızca bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz. Sunulan analizler, finansal tavsiye, yatırım önerisi veya alım-satım sinyali değildir. Geçmiş performans, gelecekteki sonuçların garantisi değildir. Yatırım kararlarınızı vermeden önce lisanslı bir finansal danışmana başvurunuz. Sermaye kaybı riski her zaman mevcuttur.'}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{tl ? tl('footer_copy') : '© 2025 BRSKO AI. Tüm hakları saklıdır.'}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{tl ? tl('footer_prot') : 'KVKK Kapsamında Korunmaktadır'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────── CHAT APP ───────────────────────────────────
function ChatApp({ onExit, user, onOpenAuth, tl, language, langFlag, onOpenLang }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeItem, setActiveItem] = useState('ai');
  const [showAuth, setShowAuth] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [trialCount, setTrialCount] = useState(() => {
    if (localStorage.getItem(TRIAL_VERSION_KEY) !== TRIAL_VERSION) {
      localStorage.setItem(TRIAL_VERSION_KEY, TRIAL_VERSION);
      localStorage.setItem(TRIAL_KEY, '0');
      return 0;
    }
    return parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!user) { setIsPro(false); return; }
    getProfile(user.id).then(profile => {
      setIsPro(profile?.subscription_plan && profile.subscription_plan !== 'free');
      if (profile?.trial_count != null) {
        const serverCount = profile.trial_count;
        const localCount = parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
        const maxCount = Math.max(serverCount, localCount);
        setTrialCount(maxCount);
        localStorage.setItem(TRIAL_KEY, maxCount);
      }
    });
  }, [user]);

  const remainingTrials = isPro ? Infinity : Math.max(0, MAX_TRIALS - trialCount);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!isPro && trialCount >= MAX_TRIALS) { setShowPaywall(true); return; }

    const newCount = trialCount + 1;
    localStorage.setItem(TRIAL_KEY, newCount);
    setTrialCount(newCount);
    if (user) syncTrialCount(user.id, newCount);

    const txt = input;
    setInput('');
    const updatedMessages = [...messages, { role: 'user', text: txt }];
    setMessages(updatedMessages);
    setLoading(true);
    try {
      const reply = await chatWithHistory(
        updatedMessages.map(m => ({ role: m.role, content: m.text }))
      );
      setMessages(p => [...p, { role: 'assistant', text: reply }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', text: `Bağlantı hatası: ${e.message}` }]);
    }
    setLoading(false);
  };

  const sidebarItems = [
    { icon: <BrainCircuit size={16} />, key: 'ai', label: tl ? tl('sidebar_ai') : 'AI Danışman' },
    { icon: <LineChart size={16} />, key: 'markets', label: tl ? tl('sidebar_markets') : 'Para Analizi' },
    { icon: <Settings size={16} />, key: 'settings', label: tl ? tl('settings') : 'Ayarlar' },
  ];

  const quickPrompts = tl
    ? [tl('qp_1'), tl('qp_2'), tl('qp_3'), tl('qp_4')]
    : ['Portföyümü analiz et', 'Tasarruf planı yap', 'Borç azaltma öner', 'Piyasa yorumu yap'];

  const sendPrompt = async (txt) => {
    if (loading) return;
    if (!isPro && trialCount >= MAX_TRIALS) { setShowPaywall(true); return; }
    const newCount = trialCount + 1;
    localStorage.setItem(TRIAL_KEY, newCount);
    setTrialCount(newCount);
    if (user) syncTrialCount(user.id, newCount);
    const updatedMessages = [...messages, { role: 'user', text: txt }];
    setMessages(updatedMessages);
    setActiveItem('ai');
    setLoading(true);
    try {
      const reply = await chatWithHistory(updatedMessages.map(m => ({ role: m.role, content: m.text })));
      setMessages(p => [...p, { role: 'assistant', text: reply }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', text: `Bağlantı hatası: ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#000000', color: 'white', fontFamily: FONT, overflow: 'hidden' }}>

      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ height: '100%', background: '#111111', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}
          >
            <div style={{ padding: '18px 14px 10px' }}>
              <BrskoLogo size={26} showText textColor="white" textSize={14} />
            </div>

            <div style={{ padding: '6px 10px 10px' }}>
              <button className="sidebar-item"
                onClick={() => { setMessages([]); setInput(''); setActiveItem('ai'); }}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.8)' }}>
                <MessageSquarePlus size={15} /> {tl ? tl('new_chat') : 'Yeni Sohbet'}
              </button>
            </div>

            <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
              {sidebarItems.map(item => (
                <button key={item.key} onClick={() => setActiveItem(item.key)} className="sidebar-item"
                  style={{ background: activeItem === item.key ? 'rgba(255,255,255,0.08)' : 'transparent', color: activeItem === item.key ? 'white' : 'rgba(255,255,255,0.45)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>

            <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={onExit} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT }}>
                <Settings size={14} /> {tl ? tl('home') : 'Ana Sayfa'}
              </button>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 2px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email?.split('@')[0]}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    </div>
                  </div>
                  <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} style={{ width: '100%', marginTop: 8, padding: '9px 10px', borderRadius: 8, background: '#0071E3', border: 'none', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FONT }}>
                  <User size={13} /> {tl ? tl('login_btn') : 'Giriş Yap'}
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* HEADER */}
        <header style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}>
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
              {sidebarItems.find(i => i.key === activeItem)?.label || activeItem}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30D158', display: 'inline-block' }} />
              {tl ? tl('live_data') : 'Canlı Veri'}
            </div>
            {onOpenLang && (
              <button onClick={onOpenLang} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, height: 28, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                <Globe size={12} color="#0A84FF" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.04em' }}>
                  {language ? language.toUpperCase().slice(0, 2) : 'TR'}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* PARA ANALİZİ VIEW */}
        {activeItem === 'markets' ? (
          <ParaAnaliziView onAnalyze={sendPrompt} loading={loading} tl={tl} />
        ) : activeItem === 'settings' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 24px' }}>
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 28 }}>{tl ? tl('settings') : 'Ayarlar'}</h2>

                {/* Hesap */}
                <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, marginBottom: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>{tl ? tl('account') : 'Hesap'}</div>
                    {user ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                            {user.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{user.email?.split('@')[0]}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user.email}</div>
                          </div>
                        </div>
                        <button onClick={() => supabase.auth.signOut()}
                          style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', color: '#FF453A', fontSize: 12, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' }}>
                          {tl ? tl('logout_btn') : 'Çıkış Yap'}
                        </button>
                      </div>
                    ) : (
                      <button onClick={onOpenAuth}
                        style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#0071E3', border: 'none', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: FONT }}>
                        {tl ? tl('login_reg') : 'Giriş Yap / Kayıt Ol'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Abonelik */}
                <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, marginBottom: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>{tl ? tl('subscription') : 'Abonelik'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{isPro ? (tl ? tl('pro_plan') : '✦ Pro Plan') : (tl ? tl('free_plan') : 'Ücretsiz Plan')}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                          {isPro ? (tl ? tl('unlimited_msg') : 'Sınırsız mesaj hakkınız aktif') : (tl ? tl('trials_left', { n: remainingTrials }) : `${remainingTrials} ücretsiz mesaj hakkınız kaldı`)}
                        </div>
                      </div>
                      {isPro ? (
                        <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)', color: '#30D158', fontSize: 12, fontWeight: 600 }}>{tl ? tl('active') : 'Aktif'}</div>
                      ) : (
                        <button onClick={() => setShowPaywall(true)}
                          style={{ padding: '8px 16px', borderRadius: 8, background: '#0071E3', border: 'none', color: 'white', fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
                          {tl ? tl('upgrade') : 'Yükselt'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hakkında */}
                <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>{tl ? tl('about') : 'Hakkında'}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                      <div>{tl ? tl('settings_v') : 'BRSKO AI — Sürüm 1.0'}</div>
                      <div>{tl ? tl('settings_coach') : 'Yapay zeka destekli finansal koç'}</div>
                      <div style={{ marginTop: 8 }}>
                        <a href="mailto:destek@brsko.ai" style={{ color: '#0A84FF', textDecoration: 'none' }}>destek@brsko.ai</a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* MESSAGES / CHAT VIEW */
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 180px' }}>
            <div style={{ width: '100%', maxWidth: 720 }}>

              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', paddingTop: 80 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <BrskoLogo size={72} />
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.02em' }}>
                    {tl ? tl('chat_welcome') : 'Nasıl yardımcı olabilirim?'}
                  </h2>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
                    {tl ? tl('chat_welcome_sub') : 'Piyasaları analiz edin veya finansal tavsiye isteyin.'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {quickPrompts.map(q => (
                      <button key={q} onClick={() => setInput(q)}
                        style={{ padding: '8px 16px', borderRadius: 100, background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#2C2C2E'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#1C1C1E'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                      >{q}</button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', padding: '2px 0' }}
                  >
                    <div style={{
                      maxWidth: '75%', padding: '10px 15px',
                      borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: m.role === 'user' ? '#0A84FF' : '#1C1C1E',
                      fontSize: 15, lineHeight: 1.65, color: 'white', whiteSpace: 'pre-wrap',
                    }}>
                      {m.text}
                    </div>
                    {m.role === 'assistant' && i === messages.length - 1 && !loading && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, maxWidth: '75%' }}>
                        {(tl ? [tl('act_1'), tl('act_2'), tl('act_3'), tl('act_4'), tl('act_5')] : ['Daha kısa yaz', 'Daha detaylı anlat', 'Sosyal medya formatında', 'Daha teknik yap', 'Başka bir versiyon']).map(action => (
                          <button key={action} onClick={() => sendPrompt(action)}
                            style={{ padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontSize: 12, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                          >{action}</button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', padding: '2px 0' }}>
                    <div style={{ padding: '12px 18px', borderRadius: '18px 18px 18px 4px', background: '#1C1C1E', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {[0, 1, 2].map(n => <span key={n} className="typing-dot" style={{ animationDelay: `${n * 0.2}s` }} />)}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>
          </div>
        )}

        {/* INPUT — sadece chat görünümünde */}
        {activeItem !== 'settings' && activeItem !== 'markets' && (
          <div style={{ position: 'absolute', bottom: 0, left: sidebarOpen ? 240 : 0, right: 0, padding: '12px 20px 24px', background: 'linear-gradient(to top, #000000 65%, transparent)', transition: 'left 0.2s ease' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              {!isPro && remainingTrials > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 100,
                    background: remainingTrials === 1 ? 'rgba(255,69,58,0.1)' : 'rgba(10,132,255,0.08)',
                    border: `1px solid ${remainingTrials === 1 ? 'rgba(255,69,58,0.25)' : 'rgba(10,132,255,0.2)'}`,
                    fontSize: 11.5, fontWeight: 500,
                    color: remainingTrials === 1 ? '#FF453A' : '#0A84FF',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: remainingTrials === 1 ? '#FF453A' : '#0A84FF' }} />
                    {tl ? tl('trials_left', { n: remainingTrials }) : `${remainingTrials} ücretsiz mesaj hakkınız kaldı`}
                  </div>
                </div>
              )}
              <div style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, display: 'flex', alignItems: 'flex-end', gap: 10, padding: '12px 14px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
                <textarea
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  placeholder={remainingTrials === 0 ? (tl ? tl('chat_placeholder_lock') : 'Devam etmek için paket satın alın...') : (tl ? tl('chat_placeholder') : 'BRSKO AI ile sohbet edin...')}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 15, color: 'white', fontFamily: FONT, lineHeight: 1.6, maxHeight: 140, overflowY: 'auto', caretColor: '#0A84FF' }}
                />
                <button onClick={send} disabled={!input.trim() || loading}
                  style={{ background: input.trim() ? '#0A84FF' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '7px 9px', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
                  {remainingTrials === 0
                    ? <Crown size={15} color="rgba(255,255,255,0.5)" />
                    : <Send size={15} color={input.trim() ? 'white' : 'rgba(255,255,255,0.25)'} />
                  }
                </button>
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
                {tl ? tl('disclaimer') : 'BRSKO AI hata yapabilir. Kritik finansal kararlarınızı doğrulayın.'}
              </p>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onOpenAuth={() => { setShowPaywall(false); setShowAuth(true); }} user={user} tl={tl} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────── PAYMENT CONFIG ────────────────────────────────
const LS_STORE = 'SENIN_STORE_ADINIZ';
const LS_VARIANTS = { starter: 'VARIANT_ID_1', pro: 'VARIANT_ID_2', premium: 'VARIANT_ID_3' };

function lsCheckoutUrl(plan, userEmail, userId) {
  const base = `https://${LS_STORE}.lemonsqueezy.com/buy/${LS_VARIANTS[plan]}`;
  const params = new URLSearchParams({
    'checkout[email]': userEmail || '',
    'checkout[custom][user_id]': userId || '',
    'checkout[custom][plan]': plan,
  });
  return `${base}?${params}`;
}

const PACKAGES = [
  {
    name: 'Başlangıç', price: '₺99', period: '/ay', desc: 'Bireysel yatırımcılar için',
    features: ['50 AI mesajı/ay', 'Temel piyasa analizi', 'Portföy takibi', 'E-posta desteği'],
    highlight: false, plan: 'starter',
  },
  {
    name: 'Pro', price: '₺199', period: '/ay', desc: 'En çok tercih edilen',
    features: ['Sınırsız AI mesajı', 'Gelişmiş piyasa analizi', 'Portföy optimizasyonu', 'Öncelikli destek', 'Özelleştirilmiş raporlar'],
    highlight: true, plan: 'pro',
  },
  {
    name: 'Premium', price: '₺399', period: '/ay', desc: 'Profesyonel yatırımcılar',
    features: ["Her şey Pro'da var", 'API erişimi', 'Özel finans koçu', '7/24 canlı destek', 'Kurumsal raporlama'],
    highlight: false, plan: 'premium',
  },
];

// ─────────────────────────── PAYWALL MODAL ──────────────────────────────────
function PaywallModal({ onClose, onOpenAuth, user, tl }) {
  const [selected, setSelected] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#FFFFFF', borderRadius: 24, padding: '40px 36px', maxWidth: 860, width: '100%', position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', fontFamily: FONT, color: '#1D1D1F' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: '50%', background: '#F2F2F7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#86868B' }}>
          <X size={13} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <BrskoLogo size={44} showText textColor="#1D1D1F" textSize={20} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 100, background: 'rgba(255,69,58,0.07)', fontSize: 12, fontWeight: 500, color: '#FF453A', marginBottom: 18 }}>
            <Lock size={11} /> {tl ? tl('paywall_locked') : 'Ücretsiz deneme hakkınız doldu'}
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 10, color: '#1D1D1F' }}>
            {tl ? tl('paywall_title') : <><span style={{ background: 'linear-gradient(135deg,#0071E3,#5856D6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sınırsız</span>{' '}Analiz için Devam Et</>}
          </h2>
          <p style={{ fontSize: 15, color: '#6E6E73', lineHeight: 1.55 }}>
            {tl ? tl('paywall_sub') : 'Finansal koçunuza erişmeye devam edin.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
          {PACKAGES.map((pkg, i) => (
            <div key={pkg.name} onClick={() => setSelected(i)}
              style={{
                borderRadius: 16, padding: '22px 18px', cursor: 'pointer', position: 'relative',
                border: selected === i ? '2px solid #0071E3' : '1.5px solid #E5E5EA',
                background: selected === i ? 'rgba(0,113,227,0.04)' : '#FAFAFA',
                transition: 'all 0.15s',
              }}
            >
              {pkg.highlight && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#0071E3', borderRadius: 100, padding: '2px 12px', fontSize: 10, fontWeight: 600, color: 'white', whiteSpace: 'nowrap' }}>
                  {tl ? tl('most_popular') : 'EN POPÜLER'}
                </div>
              )}
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 2 }}>{pkg.name}</div>
              <div style={{ fontSize: 11, color: '#86868B', marginBottom: 14 }}>{pkg.desc}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 16 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.03em' }}>{pkg.price}</span>
                <span style={{ fontSize: 12, color: '#86868B' }}>{pkg.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {pkg.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#3A3A3C' }}>
                    <CheckCircle size={12} color="#30D158" style={{ flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <a
          href={lsCheckoutUrl(PACKAGES[selected].plan, user?.email, user?.id)}
          target="_blank" rel="noopener noreferrer"
          style={{ width: '100%', padding: '15px', borderRadius: 12, background: '#0071E3', border: 'none', color: 'white', fontSize: 16, fontWeight: 400, cursor: 'pointer', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', transition: 'background 0.15s', fontFamily: FONT }}
          onMouseEnter={e => e.currentTarget.style.background = '#0077ED'}
          onMouseLeave={e => e.currentTarget.style.background = '#0071E3'}
        >
          {tl ? tl('paywall_btn', { name: PACKAGES[selected].name, price: PACKAGES[selected].price }) : `${PACKAGES[selected].name} Paketi Satın Al — ${PACKAGES[selected].price}/ay`}
        </a>

        {!user && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 13, color: '#86868B' }}>{tl ? tl('paywall_have_acc') : 'Hesabınız var mı?'} </span>
            <button onClick={onOpenAuth} style={{ background: 'none', border: 'none', color: '#0071E3', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: FONT }}>
              {tl ? tl('paywall_login_link') : 'Giriş yapın'}
            </button>
          </div>
        )}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#86868B', marginTop: 12 }}>
          {tl ? tl('paywall_cancel') : 'İstediğiniz zaman iptal edebilirsiniz. KDV dahil fiyatlar.'}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────── İLETİŞİM BÖLÜMÜ ────────────────────────────────
const SUBJECTS = ['Genel Bilgi', 'Teknik Destek', 'Abonelik & Ödeme', 'İş Birliği', 'KVKK Talebi', 'Diğer'];

function ContactSection({ T, tl }) {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Genel Bilgi', message: '', kvkk: false });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const iStyle = {
    ...inputStyle,
    background: T.inputBg,
    border: `1px solid ${T.inputBorder}`,
    color: T.text,
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = tl ? tl('err_name') : 'Ad soyad zorunludur.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = tl ? tl('err_email') : 'Geçerli bir e-posta adresi giriniz.';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = tl ? tl('err_msg') : 'Mesaj en az 10 karakter olmalıdır.';
    if (!form.kvkk) e.kvkk = tl ? tl('err_kvkk') : 'Devam etmek için aydınlatma metnini onaylamanız gerekmektedir.';
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      setErrors({ submit: tl ? tl('form_err') : 'Mesaj gönderilemedi. Lütfen destek@brsko.ai adresine doğrudan yazın.' });
    }
    setSending(false);
  };

  return (
    <section id="iletisim" style={{ background: T.bg2, padding: '96px 48px', transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 className="section-title" style={{ marginBottom: 14, color: T.text }}>{tl ? tl('contact_title') : 'İletişime geçin.'}</h2>
          <p style={{ fontSize: 19, color: T.text2, maxWidth: 440, margin: '0 auto', lineHeight: 1.5 }}>
            {tl ? tl('contact_sub') : 'Sorularınız, önerileriniz veya destek talepleriniz için buradayız.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'start' }}>
          {/* Sol — iletişim bilgileri */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: <Mail size={18} color="#0071E3" />, label: tl ? tl('contact_info_email') : 'E-posta', val: 'destek@brsko.ai' },
              { icon: <Clock size={18} color="#0071E3" />, label: tl ? tl('contact_info_resp') : 'Yanıt Süresi', val: tl ? tl('contact_info_resp_val') : '24 – 48 saat' },
              { icon: <Shield size={18} color="#0071E3" />, label: tl ? tl('contact_info_kvkk') : 'KVKK', val: tl ? tl('contact_info_kvkk_val') : 'Kişisel verileriniz güvende' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: T.card, borderRadius: 14, padding: '18px 20px', boxShadow: T.cardShadow, transition: 'background 0.3s' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,113,227,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {row.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: '0.04em', marginBottom: 3 }}>{row.label}</div>
                  <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{row.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sağ — form */}
          <div style={{ background: T.card, borderRadius: 20, padding: '36px 32px', boxShadow: T.cardShadow, transition: 'background 0.3s' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(48,209,88,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={28} color="#30D158" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8 }}>{tl ? tl('form_ok_title') : 'Mesajınız alındı!'}</h3>
                <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
                  {tl ? tl('form_ok_sub') : 'Teşekkür ederiz. 24–48 saat içinde e-posta ile yanıt vereceğiz.'}
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: 'Genel Bilgi', message: '', kvkk: false }); }}
                  style={{ marginTop: 24, padding: '10px 22px', borderRadius: 980, background: '#0071E3', border: 'none', color: 'white', fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>
                  {tl ? tl('form_new_msg') : 'Yeni Mesaj'}
                </button>
              </div>
            ) : (
              <>
                {/* Ad + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <CField label={tl ? tl('form_name_lbl') : 'Ad Soyad *'} error={errors.name} T={T}>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder={tl ? tl('form_name_ph') : 'Adınız Soyadınız'}
                      style={iStyle} />
                  </CField>
                  <CField label={tl ? tl('form_email_lbl') : 'E-posta *'} error={errors.email} T={T}>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder={tl ? tl('form_email_ph') : 'ornek@mail.com'}
                      style={iStyle} />
                  </CField>
                </div>

                {/* Konu */}
                <CField label={tl ? tl('form_subject_lbl') : 'Konu'} error={errors.subject} style={{ marginBottom: 12 }} T={T}>
                  <div style={{ position: 'relative' }}>
                    <select value={form.subject} onChange={e => set('subject', e.target.value)}
                      style={{ ...iStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 36, cursor: 'pointer', width: '100%' }}>
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} color={T.text3} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </CField>

                {/* Mesaj */}
                <CField label={tl ? tl('form_msg_lbl') : 'Mesaj *'} error={errors.message} style={{ marginBottom: 16 }} T={T}>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={5}
                    placeholder={tl ? tl('form_msg_ph') : 'Mesajınızı buraya yazın... (en az 10 karakter)'}
                    style={{ ...iStyle, resize: 'vertical', minHeight: 110 }} />
                </CField>

                {/* KVKK */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.kvkk} onChange={e => set('kvkk', e.target.checked)}
                      style={{ marginTop: 2, accentColor: '#0071E3', width: 15, height: 15, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                      {tl ? tl('form_kvkk') : "Kişisel verilerimin işlenmesine ilişkin Aydınlatma Metni'ni okudum ve kabul ediyorum. *"}
                    </span>
                  </label>
                  {errors.kvkk && <p style={{ fontSize: 12, color: '#FF3B30', marginTop: 6 }}>{errors.kvkk}</p>}
                </div>

                <button onClick={submit} disabled={sending}
                  style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#0071E3', border: 'none', color: 'white', fontSize: 15, fontWeight: 500, cursor: sending ? 'default' : 'pointer', fontFamily: FONT, opacity: sending ? 0.75 : 1, transition: 'opacity 0.15s, background 0.15s' }}
                  onMouseEnter={e => { if (!sending) e.currentTarget.style.background = '#0077ED'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#0071E3'; }}
                >
                  {sending ? (tl ? tl('form_sending') : 'Gönderiliyor...') : (tl ? tl('form_submit') : 'Mesaj Gönder')}
                </button>

                {errors.submit && (
                  <p style={{ fontSize: 13, color: '#FF3B30', marginTop: 10, textAlign: 'center' }}>{errors.submit}</p>
                )}

                <p style={{ fontSize: 11.5, color: T.text3, marginTop: 12, textAlign: 'center' }}>
                  {tl ? tl('form_required') : '* ile işaretli alanlar zorunludur.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 9,
  border: '1px solid #E5E5EA', background: '#F9F9F9',
  fontSize: 14, color: '#1D1D1F',
  fontFamily: FONT, outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

function CField({ label, error, children, style, T }) {
  return (
    <div style={{ marginBottom: 12, ...style }}
      onFocusCapture={e => { const inp = e.currentTarget.querySelector('input,textarea,select'); if (inp) { inp.style.borderColor = '#0071E3'; inp.style.background = T?.bg || '#FFFFFF'; } }}
      onBlurCapture={e => { const inp = e.currentTarget.querySelector('input,textarea,select'); if (inp) { inp.style.borderColor = T?.inputBorder || '#E5E5EA'; inp.style.background = T?.inputBg || '#F9F9F9'; } }}
    >
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T?.text || '#1D1D1F', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#FF3B30', marginTop: 5 }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────── PARA ANALİZİ PANELİ ────────────────────────────
const PARA_ASSETS = [
  'USD/TRY','EUR/TRY','GBP/TRY','JPY/TRY',
  'BTC/USD','ETH/USD','ALTIN','GÜMÜŞ',
  'BIST100','NASDAQ','S&P500','PETROL',
];
const PARA_TONES = [
  { key:'teknik',   label:'📊 Teknik',   desc:'Grafik, indikatör, destek/direnç' },
  { key:'temel',    label:'📰 Temel',    desc:'Ekonomik veri, haber, merkez bankası' },
  { key:'sosyal',   label:'📱 Sosyal',   desc:'Sosyal medya için sade dil' },
  { key:'ogretici', label:'📚 Öğretici', desc:'Yeni başlayanlar için açıklayıcı' },
];
const PARA_LENGTHS = [
  { key:'kisa',    label:'Kısa',    desc:'2-3 paragraf' },
  { key:'orta',    label:'Orta',    desc:'4-5 paragraf' },
  { key:'detayli', label:'Detaylı', desc:'Kapsamlı rapor' },
];
const PARA_SCENARIOS = [
  { key:'tarafsiz',  label:'⚖️ Tarafsız' },
  { key:'yükseliş',  label:'📈 Yükseliş Senaryosu' },
  { key:'düşüş',     label:'📉 Düşüş Senaryosu' },
];

function ParaAnaliziView({ onAnalyze, loading, tl }) {
  const [asset, setAsset] = useState('USD/TRY');
  const [tone, setTone] = useState('teknik');
  const [len, setLen] = useState('orta');
  const [scenario, setScenario] = useState('tarafsiz');

  const analyze = () => {
    const t = PARA_TONES.find(x => x.key === tone);
    const l = PARA_LENGTHS.find(x => x.key === len);
    const s = PARA_SCENARIOS.find(x => x.key === scenario);
    const prompt = `${asset} için ${t.label.split(' ')[1]} analiz yap. Uzunluk: ${l.label}. Senaryo: ${s.label.split(' ').slice(1).join(' ')}. ${
      tone === 'teknik' ? 'Teknik göstergeler (RSI, MACD, Bollinger), destek/direnç seviyeleri ve trend yönünü dahil et.' :
      tone === 'temel'  ? 'Ekonomik veriler, merkez bankası politikaları, jeopolitik faktörler ve piyasa beklentilerini ele al.' :
      tone === 'sosyal' ? 'Sosyal medyada paylaşılabilecek sade ve etkileyici bir dille yaz. Hashtag ve emoji öner.' :
                          'Kavramları açıklayarak anlat. Yeni yatırımcıların anlayabileceği sade bir dil kullan.'
    }`;
    onAnalyze(prompt);
  };

  const chip = (val, cur, set, items, renderLabel) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map(item => {
        const v = item.key || item;
        const active = v === cur;
        return (
          <button key={v} onClick={() => set(v)}
            style={{ padding: '6px 13px', borderRadius: 100, border: `1px solid ${active ? '#0A84FF' : 'rgba(255,255,255,0.1)'}`, background: active ? 'rgba(10,132,255,0.18)' : 'transparent', color: active ? '#0A84FF' : 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s', fontWeight: active ? 600 : 400 }}>
            {renderLabel ? renderLabel(item) : item}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 24px 40px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>{tl ? tl('para_title') : 'Para Analizi'}</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>{tl ? tl('para_sub') : 'Varlık ve analiz stilini seçin, AI sizin için rapor üretsin.'}</p>

          {/* Varlık seçimi */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{tl ? tl('para_asset') : 'Varlık / Parite'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PARA_ASSETS.map(a => (
                <button key={a} onClick={() => setAsset(a)}
                  style={{ padding: '6px 13px', borderRadius: 100, border: `1px solid ${a === asset ? '#0A84FF' : 'rgba(255,255,255,0.1)'}`, background: a === asset ? 'rgba(10,132,255,0.18)' : 'transparent', color: a === asset ? '#0A84FF' : 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: FONT, fontWeight: a === asset ? 600 : 400, transition: 'all 0.15s' }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Analiz tonu */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{tl ? tl('para_tone') : 'Analiz Tonu'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PARA_TONES.map(t => (
                <button key={t.key} onClick={() => setTone(t.key)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 11, border: `1px solid ${t.key === tone ? '#0A84FF' : 'rgba(255,255,255,0.08)'}`, background: t.key === tone ? 'rgba(10,132,255,0.12)' : '#111111', cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s', textAlign: 'left' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: t.key === tone ? '#0A84FF' : 'rgba(255,255,255,0.8)' }}>{t.label}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Uzunluk */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{tl ? tl('para_len') : 'Uzunluk'}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {PARA_LENGTHS.map(l => (
                <button key={l.key} onClick={() => setLen(l.key)}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1px solid ${l.key === len ? '#0A84FF' : 'rgba(255,255,255,0.08)'}`, background: l.key === len ? 'rgba(10,132,255,0.12)' : '#111111', cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: l.key === len ? '#0A84FF' : 'rgba(255,255,255,0.8)', marginBottom: 2 }}>{l.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{l.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Senaryo */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{tl ? tl('para_scene') : 'Senaryo'}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {PARA_SCENARIOS.map(s => (
                <button key={s.key} onClick={() => setScenario(s.key)}
                  style={{ flex: 1, padding: '9px 8px', borderRadius: 10, border: `1px solid ${s.key === scenario ? '#0A84FF' : 'rgba(255,255,255,0.08)'}`, background: s.key === scenario ? 'rgba(10,132,255,0.12)' : '#111111', cursor: 'pointer', fontFamily: FONT, fontSize: 12, color: s.key === scenario ? '#0A84FF' : 'rgba(255,255,255,0.6)', transition: 'all 0.15s', fontWeight: s.key === scenario ? 600 : 400 }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={analyze} disabled={loading}
            style={{ width: '100%', padding: '15px', borderRadius: 13, background: loading ? 'rgba(10,132,255,0.4)' : '#0A84FF', border: 'none', color: 'white', fontSize: 16, fontWeight: 600, cursor: loading ? 'default' : 'pointer', fontFamily: FONT, letterSpacing: '-0.01em', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><span className="typing-dot" /><span className="typing-dot" style={{ animationDelay: '0.2s' }} /><span className="typing-dot" style={{ animationDelay: '0.4s' }} /></> : (tl ? tl('para_analyze', { asset }) : `${asset} Analiz Et →`)}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 10 }}>
            {tl ? tl('para_note') : 'Analiz tamamlandığında AI Danışman sekmesine geçeceksiniz.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────── COOKIE BANNER ──────────────────────────────────
function CookieBanner({ onAccept, onMinimal, tl }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 8000, width: '92%', maxWidth: 560,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 18, padding: '20px 22px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
        fontFamily: FONT,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>🍪</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', marginBottom: 5 }}>
            {tl ? tl('cookie_title') : 'Bu site çerezler kullanmaktadır.'}
          </div>
          <p style={{ fontSize: 12.5, color: '#6E6E73', lineHeight: 1.55, margin: '0 0 14px' }}>
            {tl ? tl('cookie_desc') : 'Deneyiminizi iyileştirmek, trafiği analiz etmek ve hizmetlerimizi geliştirmek için çerezler kullanıyoruz. KVKK kapsamında kişisel verilerinizi korumaktayız.'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={onAccept}
              style={{ padding: '9px 18px', borderRadius: 980, background: '#0071E3', border: 'none', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: FONT }}>
              {tl ? tl('cookie_accept') : 'Tümünü Kabul Et'}
            </button>
            <button onClick={onMinimal}
              style={{ padding: '9px 18px', borderRadius: 980, background: 'transparent', border: '1px solid #D2D2D7', color: '#1D1D1F', fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
              {tl ? tl('cookie_minimal') : 'Yalnızca Zorunlu'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────── POLICY MODAL ───────────────────────────────────
const POLICY_CONTENT = {
  privacy: {
    title: 'Gizlilik Politikası & KVKK Aydınlatma Metni',
    sections: [
      { h: 'Veri Sorumlusu', t: 'BRSKO AI ("Şirket"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket etmektedir.' },
      { h: 'İşlenen Kişisel Veriler', t: 'Adınız, soyadınız, e-posta adresiniz, kullanım verileriniz (oturum bilgileri, sohbet geçmişi) ve teknik veriler (IP adresi, tarayıcı bilgisi) işlenmektedir.' },
      { h: 'İşleme Amaçları', t: 'Kişisel verileriniz; hizmetlerin sunulması, üyelik yönetimi, teknik destek, iletişim, yasal yükümlülüklerin yerine getirilmesi ve hizmet kalitesinin iyileştirilmesi amaçlarıyla işlenmektedir.' },
      { h: 'Hukuki Dayanak', t: 'Verileriniz; sözleşmenin ifası, meşru menfaat ve açık rıza hukuki sebeplerine dayalı olarak işlenmektedir.' },
      { h: 'Veri Güvenliği', t: 'Kişisel verileriniz, SSL/TLS şifrelemesi ve endüstri standardı güvenlik önlemleriyle korunmaktadır. Supabase altyapısı üzerinde güvenli şekilde saklanmaktadır.' },
      { h: 'Üçüncü Taraflarla Paylaşım', t: 'Kişisel verileriniz; yasal zorunluluk bulunmadıkça üçüncü taraflarla paylaşılmamaktadır. Hizmet alınan altyapı sağlayıcıları (Supabase) gizlilik sözleşmesiyle bağlıdır.' },
      { h: 'Saklama Süresi', t: 'Kişisel verileriniz, hizmet ilişkisinin sona ermesinden itibaren yasal saklama süreleri (genellikle 10 yıl) boyunca saklanmaktadır.' },
      { h: 'KVKK Kapsamındaki Haklarınız', t: 'Kişisel verilerinize erişim, düzeltme, silme, işlemenin kısıtlanması, itiraz ve taşınabilirlik haklarına sahipsiniz. Talepleriniz için: destek@brsko.ai' },
    ],
  },
  terms: {
    title: 'Kullanım Koşulları',
    sections: [
      { h: '1. Hizmet Tanımı', t: 'BRSKO AI, yapay zeka destekli finansal bilgi ve analiz hizmeti sunan bir platformdur. Hizmetlerimiz bilgilendirme amaçlıdır; yatırım tavsiyesi niteliği taşımaz.' },
      { h: '2. Kullanıcı Yükümlülükleri', t: 'Platformu yalnızca yasal amaçlarla kullanmayı, başkalarının haklarına zarar vermemeyi ve platformun güvenliğini tehlikeye atmamayı kabul edersiniz.' },
      { h: '3. Finansal Sorumluluk Reddi', t: 'BRSKO AI tarafından sunulan hiçbir içerik yatırım tavsiyesi, finansal öneri veya alım-satım sinyali değildir. Geçmiş performans geleceğin göstergesi değildir. Yatırım kararlarından kaynaklanan zararlardan BRSKO AI sorumlu tutulamaz.' },
      { h: '4. Fikri Mülkiyet', t: 'Platform üzerindeki tüm içerik, tasarım ve yazılım BRSKO AI\'ye aittir. İzinsiz kopyalanması, dağıtılması veya ticari amaçla kullanılması yasaktır.' },
      { h: '5. Abonelik & Ödeme', t: 'Ücretli planlar aylık faturalandırılır. İptal talebi bir sonraki faturalandırma döneminden önce yapılmalıdır. İade politikamız için destek@brsko.ai ile iletişime geçiniz.' },
      { h: '6. Hesap Güvenliği', t: 'Hesabınızın güvenliğinden siz sorumlusunuz. Şüpheli aktivite tespit etmeniz halinde derhal destek@brsko.ai ile iletişime geçiniz.' },
      { h: '7. Değişiklik Hakkı', t: 'BRSKO AI, bu koşulları önceden bildirmeksizin değiştirme hakkını saklı tutar. Değişiklikler platformda yayımlanmasıyla yürürlüğe girer.' },
      { h: '8. Uygulanacak Hukuk', t: 'Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Anlaşmazlıklarda İstanbul Mahkemeleri yetkilidir.' },
    ],
  },
  cookies: {
    title: 'Çerez Politikası',
    sections: [
      { h: 'Çerez Nedir?', t: 'Çerezler, web sitelerinin tarayıcınıza yerleştirdiği küçük metin dosyalarıdır. Oturumunuzu, tercihlerinizi ve kullanım verilerinizi hatırlamak için kullanılır.' },
      { h: 'Zorunlu Çerezler', t: 'Oturum yönetimi ve kimlik doğrulama için gereklidir. Bu çerezler olmadan hizmet düzgün çalışmaz. Reddedilemez.' },
      { h: 'Analitik Çerezler', t: 'Platformun nasıl kullanıldığını anlamak için anonim kullanım verileri toplar. Hizmet kalitesini iyileştirmek amacıyla kullanılır.' },
      { h: 'Tercih Çerezleri', t: 'Dil, tema ve görüntüleme tercihlerinizi hatırlar. Bu çerezler opsiyoneldir.' },
      { h: 'Çerezleri Nasıl Kontrol Ederim?', t: 'Tarayıcı ayarlarınızdan çerezleri yönetebilir veya engelleyebilirsiniz. Ancak bazı işlevler çerez olmadan çalışmayabilir. Ayrıca platformdaki çerez tercih panelini kullanabilirsiniz.' },
      { h: 'Üçüncü Taraf Çerezleri', t: 'BRSKO AI, üçüncü taraf reklam çerezi kullanmamaktadır. Yalnızca Supabase altyapısına ait oturum çerezleri kullanılmaktadır.' },
      { h: 'İletişim', t: 'Çerez politikamız hakkında sorularınız için: destek@brsko.ai' },
    ],
  },
};

function PolicyModal({ type, onClose }) {
  const content = POLICY_CONTENT[type];
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 660, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', fontFamily: FONT }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', borderBottom: '1px solid #F2F2F7' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.02em' }}>{content.title}</h2>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: '#F2F2F7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#86868B' }}>
            <X size={13} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '24px 28px', flex: 1 }}>
          <p style={{ fontSize: 12, color: '#86868B', marginBottom: 20 }}>Son güncelleme: Mayıs 2025</p>
          {content.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', marginBottom: 7 }}>{s.h}</h3>
              <p style={{ fontSize: 13.5, color: '#6E6E73', lineHeight: 1.65 }}>{s.t}</p>
            </div>
          ))}
          <div style={{ marginTop: 28, padding: '14px 16px', background: '#F5F5F7', borderRadius: 10 }}>
            <p style={{ fontSize: 12.5, color: '#86868B', lineHeight: 1.6, margin: 0 }}>
              Bu politikayla ilgili sorularınız için:{' '}
              <a href="mailto:destek@brsko.ai" style={{ color: '#0071E3', textDecoration: 'none' }}>destek@brsko.ai</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid #F2F2F7' }}>
          <button onClick={onClose}
            style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#0071E3', border: 'none', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: FONT }}>
            Anladım
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
