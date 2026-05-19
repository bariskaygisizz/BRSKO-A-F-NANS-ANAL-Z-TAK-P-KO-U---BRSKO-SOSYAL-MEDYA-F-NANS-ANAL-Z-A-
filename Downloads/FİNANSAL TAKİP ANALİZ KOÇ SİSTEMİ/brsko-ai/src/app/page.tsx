import ChatRoom from "@/components/ChatRoom";
import GeminiAssistant from "@/components/GeminiAssistant";
import { Activity, TrendingUp, Shield, BarChart3, ChevronRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
      {/* Background Particles/Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--gold-glow)] blur-[150px] opacity-20 pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full glass-card !rounded-none border-t-0 border-x-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--gold)] p-2 rounded-lg shadow-[0_0_15px_var(--gold-glow)]">
              <Activity size={24} className="text-black" />
            </div>
            <span className="text-2xl font-black tracking-widest text-white">BRSKO<span className="text-[var(--gold)]">AI</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-[var(--gold)] transition-colors">Terminal</a>
            <a href="#" className="hover:text-[var(--gold)] transition-colors">Piyasalar</a>
            <a href="#" className="hover:text-[var(--gold)] transition-colors">Yapay Zeka</a>
          </div>
          <button className="bg-[var(--gold)] text-black px-6 py-2.5 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_var(--gold-glow)] flex items-center gap-2">
            Giriş Yap <ChevronRight size={16} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--gold)] bg-[var(--gold-glow)] text-[var(--gold)] text-xs font-bold mb-8 uppercase tracking-widest shadow-[0_0_20px_var(--gold-glow)]">
            <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
            Siber Finans Merkezi
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            Finansın <br/>
            <span className="gold-gradient drop-shadow-2xl">Yapay Zeka Destekli Geleceği</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Wall Street seviyesindeki analizleri, gerçek zamanlı verileri ve kişisel AI yatırım koçunu tek bir çatı altında birleştiren yeni nesil ekosistem.
          </p>
          <div className="flex justify-center gap-4">
             <button className="bg-[var(--gold)] text-black px-8 py-4 rounded-full font-black flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_var(--gold-glow)]">
                <Zap size={20} /> AI Analizi Başlat
             </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart / Stats Placeholder */}
          <div className="lg:col-span-2 space-y-8">
             <div className="glass-card p-8 glow-hover h-[300px] flex flex-col justify-center items-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                <BarChart3 size={64} className="text-[var(--gold)] mb-4 opacity-50 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold">Canlı Grafik Modülü Hazırlanıyor</h3>
                <p className="text-gray-500 mt-2">Recharts entegrasyonu aktif ediliyor...</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-6 glow-hover border-l-4 border-l-[var(--gold)]">
                   <p className="text-xs text-gray-400 font-bold uppercase mb-2">Bist 100 Endeksi</p>
                   <h4 className="text-3xl font-black mb-2">10,250.45</h4>
                   <span className="text-emerald-400 text-sm font-bold flex items-center gap-1"><TrendingUp size={16}/> +1.24%</span>
                </div>
                <div className="glass-card p-6 glow-hover border-l-4 border-l-blue-500">
                   <p className="text-xs text-gray-400 font-bold uppercase mb-2">Yapay Zeka Risk Skoru</p>
                   <h4 className="text-3xl font-black mb-2 text-white">Güvenli</h4>
                   <span className="text-blue-400 text-sm font-bold flex items-center gap-1"><Shield size={16}/> Portföy Optimizasyonu Tamamlandı</span>
                </div>
             </div>
          </div>

          {/* AI & Chat Sidebar */}
          <div className="space-y-8">
             {/* Gemini Assistant */}
             <GeminiAssistant />
             
             {/* Live Chat */}
             <ChatRoom />
          </div>

        </div>
      </main>
    </div>
  );
}
