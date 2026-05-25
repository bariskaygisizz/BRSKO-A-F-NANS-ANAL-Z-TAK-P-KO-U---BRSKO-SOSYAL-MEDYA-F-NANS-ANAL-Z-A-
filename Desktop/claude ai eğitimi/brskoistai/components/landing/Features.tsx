const features = [
  { icon: "🎯", title: "Sora 2 Kalitesi", desc: "OpenAI'ın en gelişmiş video modeli. Gerçekçi, akıcı ve sinematik UGC içerikler." },
  { icon: "⚡", title: "2-3 Dakikada Hazır", desc: "Geleneksel video prodüksiyonu günler alır. Bizde 2-3 dakika." },
  { icon: "📱", title: "6 Platform, 1 Tıklama", desc: "TikTok, Instagram, YouTube, Facebook, LinkedIn ve X'e otomatik yayınlama." },
  { icon: "🧠", title: "AI Script Yazarı", desc: "GPT-4o ürününüzü analiz eder, viral hook'lar ve hashtag'ler yazar." },
  { icon: "📊", title: "Video Geçmişi", desc: "Tüm ürettiğiniz videolar dashboard'ınızda saklı ve erişilebilir." },
  { icon: "🔒", title: "Güvenli & Özel", desc: "Tüm veriler şifreli, görseller işlemden sonra silinir." },
  { icon: "📐", title: "9:16 Dikey Format", desc: "TikTok ve Reels için optimize edilmiş dikey video formatı." },
  { icon: "🌍", title: "Çoklu Dil Desteği", desc: "Türkçe, İngilizce ve daha fazla dilde script üretimi." },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Her Şey <span className="gradient-text">Dahil</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Video prodüksiyon ajansına binlerce lira ödemek yerine, saniyeler içinde profesyonel sonuç.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { n: "10K+", l: "Video üretildi" },
            { n: "%94", l: "Müşteri memnuniyeti" },
            { n: "6", l: "Platform desteği" },
            { n: "2dk", l: "Ortalama üretim süresi" },
          ].map((s, i) => (
            <div key={i} className="text-center glass rounded-2xl p-6">
              <div className="text-3xl font-bold gradient-text mb-1">{s.n}</div>
              <div className="text-xs text-zinc-400">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
