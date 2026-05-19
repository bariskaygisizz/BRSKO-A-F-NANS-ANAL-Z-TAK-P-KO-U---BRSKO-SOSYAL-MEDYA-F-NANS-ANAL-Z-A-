"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, Send } from "lucide-react";

export default function GeminiAssistant() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: "assistant", text: "BRSKO AI Sistemine hoş geldiniz. Piyasa analizi, portföy optimizasyonu veya hisse önerisi için bana danışabilirsiniz." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });
      
      const data = await res.json();
      
      if (data.text) {
        setMessages(prev => [...prev, { role: "assistant", text: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: "Bağlantı hatası oluştu. Lütfen tekrar deneyin." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Sunucu hatası. API anahtarınızı kontrol edin." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-[500px] overflow-hidden border-[var(--gold-glow)]">
      <div className="p-4 border-b border-[var(--glass-border)] flex items-center gap-3 bg-gradient-to-r from-[rgba(212,175,55,0.1)] to-transparent">
        <div className="p-2 bg-[var(--gold)] rounded-xl text-black">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg gold-gradient">BRSKO AI Asistanı</h3>
          <p className="text-[10px] text-gray-400">Powered by Gemini Pro</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--gold)] blur-[100px] opacity-10 pointer-events-none" />
        
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex \${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-lg \${msg.role === "user" ? "bg-[var(--gold)] text-black font-medium rounded-tr-sm" : "bg-[rgba(255,255,255,0.02)] border border-[var(--glass-border)] text-gray-200 rounded-tl-sm backdrop-blur-md"}`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[rgba(255,255,255,0.02)] border border-[var(--glass-border)] p-4 rounded-2xl rounded-tl-sm text-sm text-[var(--gold)] flex items-center gap-2">
              <Sparkles size={16} className="animate-pulse" />
              AI Analiz Ediyor...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[rgba(0,0,0,0.3)] border-t border-[var(--glass-border)]">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Finansal bir soru sor..."
            className="flex-1 bg-transparent border border-[var(--glass-border)] rounded-full pl-4 pr-12 py-3 text-sm outline-none focus:border-[var(--gold)] transition-colors text-white placeholder-gray-500"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--gold)] p-2 hover:scale-110 transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
