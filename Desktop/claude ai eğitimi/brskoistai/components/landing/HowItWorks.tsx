const steps = [
  {
    n: "01",
    icon: "📸",
    title: "Ürün Görseli Yükle",
    desc: "E-ticaret ürününüzün fotoğrafını veya URL'sini yapıştırın. JPG, PNG ve WebP desteklenir.",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    n: "02",
    icon: "✍️",
    title: "Tanıtım Metni Gir",
    desc: "Ürününüzü kısaca tanıtın. Hedef kitle, öne çıkan özellikler, kampanya mesajı.",
    color: "from-pink-500/20 to-pink-500/5",
  },
  {
    n: "03",
    icon: "🤖",
    title: "AI Analiz Eder",
    desc: "GPT-4o görselinizi analiz eder, 12 saniyelik UGC script yazar ve en iyi videoyu tasarlar.",
    color: "from-indigo-500/20 to-indigo-500/5",
  },
  {
    n: "04",
    icon: "🎬",
    title: "Sora 2 Video Üretir",
    desc: "OpenAI'ın Sora 2 modeli görselinizden sinematik UGC videosu oluşturur. Ortalama 2-3 dakika.",
    color: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    n: "05",
    icon: "🚀",
    title: "Otomatik Yayınla",
    desc: "Video hazırlanır hazırlanmaz TikTok, Instagram Reels, YouTube Shorts, Facebook ve daha fazlasına yayınlanır.",
    color: "from-green-500/20 to-green-500/5",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            5 Adımda <span className="gradient-text">Viral Video</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Karmaşık video prodüksiyonu yok. Yalnızca yükle, yaz, bekle — profesyonel UGC video hazır.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative flex flex-col items-center text-center">
                <div className={`w-full glass rounded-2xl p-6 bg-gradient-to-b ${s.color} hover:scale-105 transition-transform duration-300`}>
                  <div className="text-xs font-mono text-purple-400 mb-3">{s.n}</div>
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="font-semibold text-sm mb-2">{s.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
