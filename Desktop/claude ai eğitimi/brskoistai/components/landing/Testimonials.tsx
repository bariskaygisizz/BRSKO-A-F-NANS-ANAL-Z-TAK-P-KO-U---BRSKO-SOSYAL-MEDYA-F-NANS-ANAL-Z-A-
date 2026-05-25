const testimonials = [
  {
    name: "Ayşe Kara",
    role: "E-ticaret Girişimcisi",
    avatar: "AK",
    text: "Daha önce video ajansına 5000₺ ödüyordum. Şimdi aynı kalitede videoyu 2 dakikada üretiyorum. Inanılmaz bir araç.",
    stars: 5,
  },
  {
    name: "Mehmet Demir",
    role: "Shopify Mağaza Sahibi",
    avatar: "MD",
    text: "TikTok'ta organik satış 3x arttı. Videoların kalitesi gerçekten etkileyici, müşteriler gerçek UGC sanıyor.",
    stars: 5,
  },
  {
    name: "Selin Yılmaz",
    role: "Sosyal Medya Yöneticisi",
    avatar: "SY",
    text: "10 farklı marka için video üretiyorum. BrskoistAI olmadan bu iş yükünü kaldıramazdım. Starter plan bana yetti.",
    stars: 5,
  },
  {
    name: "Burak Arslan",
    role: "Dropshipping Satıcısı",
    avatar: "BA",
    text: "6 platforma tek tıkla yayınlama özelliği oyun değiştirici. Her gün yeni video üretip test ediyorum.",
    stars: 5,
  },
  {
    name: "Zeynep Öztürk",
    role: "İçerik Üreticisi",
    avatar: "ZÖ",
    text: "Sora 2 kalitesi gerçekten çok iyi. Script yazımı da çok akıllıca, hashtag önerileri tutarlı.",
    stars: 5,
  },
  {
    name: "Can Şahin",
    role: "Amazon FBA Satıcısı",
    avatar: "CŞ",
    text: "Ürün fotoğrafından bu kadar iyi video çıkacağını beklmiyordum. Reklam maliyetlerim düştü.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Müşterilerimiz <span className="gradient-text">Ne Diyor?</span>
          </h2>
          <p className="text-zinc-400">1000+ satıcı BrskoistAI ile büyüyor</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
