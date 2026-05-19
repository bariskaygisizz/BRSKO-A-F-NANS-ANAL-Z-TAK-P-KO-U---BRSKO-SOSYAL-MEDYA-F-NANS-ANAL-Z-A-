import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BrskoLogo from './BrskoLogo';

const FONT = '-apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif';

export default function IntroScreen({ onComplete }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeOut = setTimeout(() => setLeaving(true), 2000);
    const done = setTimeout(onComplete, 2600);
    return () => { clearTimeout(fadeOut); clearTimeout(done); };
  }, [onComplete]);

  return (
    <motion.div
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 28, fontFamily: FONT,
      }}
    >
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <BrskoLogo size={96} />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          fontSize: 36, fontWeight: 700, color: 'white',
          letterSpacing: '-0.04em', marginBottom: 10, lineHeight: 1,
        }}>
          BRSKO AI
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', fontWeight: 400, letterSpacing: '-0.01em' }}
        >
          Yapay Zeka Destekli Finansal Koç
        </motion.div>
      </motion.div>

      {/* Subtle bottom loading bar */}
      <motion.div
        style={{
          position: 'absolute', bottom: 60,
          width: 48, height: 2, borderRadius: 1,
          background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          transition={{ delay: 0.2, duration: 1.8, ease: 'easeInOut' }}
          style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.45)', borderRadius: 1 }}
        />
      </motion.div>
    </motion.div>
  );
}
