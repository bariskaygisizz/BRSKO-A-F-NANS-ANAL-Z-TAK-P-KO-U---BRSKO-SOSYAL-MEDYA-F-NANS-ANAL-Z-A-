import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FONT = '-apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif';

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async () => {
    setError(''); setInfo('');
    if (!email || !password) { setError('E-posta ve şifre zorunlu.'); return; }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı.'); return; }
    setLoading(true);

    if (mode === 'register') {
      const { data, error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.session) { onSuccess(data.user); }
      else { setInfo('E-postanıza doğrulama bağlantısı gönderildi.'); }
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError('E-posta veya şifre hatalı.'); setLoading(false); return; }
    onSuccess(data.user);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#FFFFFF', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 400, position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.15)', fontFamily: FONT, color: '#1D1D1F' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', background: '#F2F2F7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#86868B' }}>
          <X size={13} />
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>BRSKO AI</span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6, color: '#1D1D1F' }}>
          {mode === 'login' ? 'Hoş geldiniz' : 'Hesap oluştur'}
        </h2>
        <p style={{ fontSize: 14, color: '#6E6E73', marginBottom: 24, lineHeight: 1.5 }}>
          {mode === 'login' ? 'Finansal AI koçunuza giriş yapın.' : 'Ücretsiz başlayın, istediğiniz zaman yükseltin.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'register' && (
            <Field icon={<User size={14} color="#86868B" />} placeholder="Adınız" value={name} onChange={setName} />
          )}
          <Field icon={<Mail size={14} color="#86868B" />} placeholder="E-posta" type="email" value={email} onChange={setEmail} />
          <Field icon={<Lock size={14} color="#86868B" />} placeholder="Şifre" type="password" value={password} onChange={setPassword} onEnter={submit} />
        </div>

        {error && <p style={{ fontSize: 13, color: '#FF3B30', marginTop: 10, lineHeight: 1.4 }}>{error}</p>}
        {info && <p style={{ fontSize: 13, color: '#30D158', marginTop: 10, lineHeight: 1.4 }}>{info}</p>}

        <button
          onClick={submit} disabled={loading}
          style={{ width: '100%', marginTop: 16, padding: '13px', borderRadius: 12, background: '#0071E3', border: 'none', color: 'white', fontSize: 15, fontWeight: 400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1, fontFamily: FONT, transition: 'background 0.15s, opacity 0.15s' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0077ED'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0071E3'; }}
        >
          {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
          {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6E6E73', marginTop: 16 }}>
          {mode === 'login' ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setInfo(''); }}
            style={{ background: 'none', border: 'none', color: '#0071E3', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: FONT }}
          >
            {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

function Field({ icon, placeholder, type = 'text', value, onChange, onEnter }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F5F5F7', border: '1px solid #E5E5EA', borderRadius: 10, padding: '11px 14px', transition: 'border-color 0.15s' }}
      onFocusCapture={e => e.currentTarget.style.borderColor = '#0071E3'}
      onBlurCapture={e => e.currentTarget.style.borderColor = '#E5E5EA'}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#1D1D1F', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}
      />
    </div>
  );
}
