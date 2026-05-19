import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Search, Zap, Shield, Target, Globe, RefreshCcw } from 'lucide-react';
import { financeCoach } from '../services/geminiService';
import './ProductAnalyzer.css';

const ProductAnalyzer = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const webcamRef = useRef(null);

  const capture = useCallback(async () => {
    setAnalyzing(true);
    const aiAnalysis = await financeCoach("Bu bir siber ürün taramasıdır. Lütfen ürünün pazar değerini ve yatırım potansiyelini analiz et.", { balance: 2500000 });
    
    setResult({
      aiReport: aiAnalysis,
      timestamp: new Date().toLocaleTimeString()
    });
    
    setAnalyzing(false);
  }, [webcamRef]);

  return (
    <div className="h-full flex flex-col gap-6">
      {!result ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <div className="camera-box w-full aspect-video relative group">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
            <div className="scan-line" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          </div>
          
          <div className="mt-8 text-center">
            <h3 className="text-xl font-bold mb-2">Piyasa Tarayıcı</h3>
            <p className="text-gray-400 text-sm mb-6">Herhangi bir ürünü veya piyasa verisini kameraya gösterin, AI anında analiz etsin.</p>
            <button className="yt-button px-10 py-3 flex items-center gap-3 mx-auto" onClick={capture} disabled={analyzing}>
              {analyzing ? <RefreshCcw className="animate-spin" /> : <Camera size={20} />}
              {analyzing ? "ANALİZ EDİLİYOR..." : "TARAMAYI BAŞLAT"}
            </button>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto w-full"
        >
          <div className="yt-card">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <Target className="text-blue-500" size={24} />
                   </div>
                   <div>
                      <h2 className="text-xl font-bold">Analiz Sonucu</h2>
                      <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">FinTube Vision AI • {result.timestamp}</p>
                   </div>
                </div>
                <button className="yt-button-secondary text-sm" onClick={() => setResult(null)}>YENİ TARAMA</button>
             </div>

             <div className="ai-report-box mb-8">
                {result.aiReport}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#121212] p-4 rounded-xl border border-[#303030] flex items-center gap-3">
                   <Shield className="text-green-500" size={20} />
                   <span className="text-xs font-bold">Güvenli Analiz</span>
                </div>
                <div className="bg-[#121212] p-4 rounded-xl border border-[#303030] flex items-center gap-3">
                   <Globe className="text-blue-500" size={20} />
                   <span className="text-xs font-bold">Küresel Veri</span>
                </div>
                <div className="bg-[#121212] p-4 rounded-xl border border-[#303030] flex items-center gap-3">
                   <Zap className="text-yellow-500" size={20} />
                   <span className="text-xs font-bold">Anlık Çözüm</span>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductAnalyzer;

