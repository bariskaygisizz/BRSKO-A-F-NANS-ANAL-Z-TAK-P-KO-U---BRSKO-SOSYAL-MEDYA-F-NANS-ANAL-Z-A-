import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { LANGUAGES } from '../i18n/languages';

const FONT = '-apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif';

const SUPPORTED = new Set(['tr','en','de','fr','es','it','pt','ru','ar','zh','ja','ko','nl','pl','sv']);

export default function LanguageSelector({ current, onSelect, onClose, T }) {
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 80);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.native.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  }, [query]);

  const isDark = T?.bg === '#000000';
  const bg = isDark ? '#111111' : '#FFFFFF';
  const bg2 = isDark ? '#1C1C1E' : '#F5F5F7';
  const text = isDark ? '#F5F5F7' : '#1D1D1F';
  const text2 = isDark ? 'rgba(255,255,255,0.45)' : '#6E6E73';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E5E5EA';
  const inputBg = isDark ? '#2C2C2E' : '#F2F2F7';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : '#F5F5F7';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: bg, borderRadius: 22, width: '100%', maxWidth: 540, maxHeight: '82vh', display: 'flex', flexDirection: 'column', boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.7)' : '0 32px 80px rgba(0,0,0,0.18)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: text, letterSpacing: '-0.02em', margin: 0 }}>Dil Seçin</h2>
              <p style={{ fontSize: 12, color: text2, margin: '3px 0 0' }}>Select Language · Sprache wählen · 言語を選択</p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: bg2, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: text2, flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color={text2} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ara... Search... Suchen..."
              style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 10, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Currently selected */}
        {!query && (
          <div style={{ padding: '10px 16px 4px', flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: text2, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Seçili Dil</div>
            {(() => {
              const lang = LANGUAGES.find(l => l.code === current);
              if (!lang) return null;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 11, background: 'rgba(0,113,227,0.08)', border: '1.5px solid rgba(0,113,227,0.25)' }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{lang.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{lang.native}</div>
                    <div style={{ fontSize: 11, color: text2 }}>{lang.name}</div>
                  </div>
                  <Check size={16} color="#0071E3" />
                </div>
              );
            })()}
          </div>
        )}

        {/* Language List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 10px 12px' }}>
          {!query && (
            <div style={{ fontSize: 10, fontWeight: 600, color: text2, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '8px 6px 6px' }}>Tüm Diller · All Languages</div>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: text2, fontSize: 14 }}>Sonuç bulunamadı</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {filtered.map(lang => {
              const isSelected = lang.code === current;
              const hasFullTranslation = SUPPORTED.has(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => { onSelect(lang.code); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px',
                    borderRadius: 10, border: isSelected ? '1.5px solid #0071E3' : '1.5px solid transparent',
                    background: isSelected ? 'rgba(0,113,227,0.08)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', fontFamily: FONT,
                    transition: 'all 0.1s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = hoverBg; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{lang.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? '#0071E3' : text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lang.native}
                    </div>
                    <div style={{ fontSize: 10, color: text2 }}>{lang.name}</div>
                  </div>
                  {isSelected && <Check size={13} color="#0071E3" style={{ flexShrink: 0 }} />}
                  {hasFullTranslation && !isSelected && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#30D158', flexShrink: 0 }} title="Tam çeviri mevcut" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer legend */}
        <div style={{ padding: '10px 18px', borderTop: `1px solid ${border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#30D158', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: text2 }}>Tam çeviri mevcut · Full translation available</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
