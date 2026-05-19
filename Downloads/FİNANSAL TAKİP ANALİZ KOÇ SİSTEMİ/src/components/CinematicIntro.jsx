import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FinTube AI - Cinematic Intro
 * Modern, clean, and professional.
 */

const images = [
  "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000", // Boğaz Köprüsü Gece
  "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2000", // Boğaz Köprüsü Gündüz
  "https://images.unsplash.com/photo-1552857407-c7e8defc9f96?q=80&w=2000", // İstanbul Boğazı
  "https://images.unsplash.com/photo-1590604153044-8e1f0e21a833?q=80&w=2000"  // Modern Marina
];

const CinematicIntro = ({ onComplete }) => {
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg(prev => (prev < images.length - 1 ? prev + 1 : prev));
    }, 1200);

    const timer = setTimeout(onComplete, 5500);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fintube-intro">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentImg}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="intro-bg"
          style={{ backgroundImage: `url(${images[currentImg]})` }}
        />
      </AnimatePresence>
      
      <div className="intro-overlay"></div>

      <div className="intro-content">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="logo-container"
        >
          <div className="logo-box">
             <h1 className="logo-text">Fin<span className="text-red">Tube</span> AI</h1>
          </div>
          <p className="intro-subtitle">SİBER FİNANS ANALİZ MERKEZİ</p>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
            className="progress-bar-red"
          />
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .fintube-intro {
          position: fixed;
          inset: 0;
          background: #0f0f0f;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .intro-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          filter: brightness(40%) grayscale(20%);
        }
        .intro-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, #0f0f0f 80%);
        }
        .intro-content {
          position: relative;
          text-align: center;
          z-index: 10;
        }
        .logo-text {
          font-size: 8rem;
          font-weight: 800;
          color: white;
          letter-spacing: -4px;
          margin-bottom: 10px;
        }
        .text-red { color: #ff0000; }
        .intro-subtitle {
          font-size: 1rem;
          letter-spacing: 10px;
          color: #aaa;
          font-weight: 500;
          margin-top: 20px;
        }
        .progress-bar-red {
          height: 4px;
          background: #ff0000;
          margin-top: 40px;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
          border-radius: 2px;
        }
        @media (max-width: 768px) {
          .logo-text { font-size: 4rem; }
          .intro-subtitle { font-size: 0.6rem; letter-spacing: 5px; }
        }
      `}} />
    </div>
  );
};

export default CinematicIntro
