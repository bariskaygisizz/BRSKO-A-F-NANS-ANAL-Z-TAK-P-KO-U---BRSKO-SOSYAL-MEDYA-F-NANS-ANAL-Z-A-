"use client";
import Link from "next/link";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Ücretsiz",
    price: "₺0",
    period: "",
    desc: "Deneyimlemek için mükemmel",
    credits: "3 video",
    features: [
      "3 video kredisi",
      "9:16 dikey format",
      "Sora 2 motoru",
      "Video indirme",
      "Temel destek",
    ],
    cta: "Hemen Başla",
    href: "/auth/signup",
    highlighted: false,
    badge: null,
  },
  {
    name: "Starter",
    price: "₺299",
    period: "/ay",
    desc: "Büyüyen markalar için ideal",
    credits: "50 video/ay",
    features: [
      "50 video kredisi/ay",
      "6 platform otomatik yayın",
      "AI caption & hashtag",
      "Video geçmişi (90 gün)",
      "Öncelikli destek",
      "Blotato entegrasyonu",
    ],
    cta: "Starter Başlat",
    href: "/auth/signup?plan=starter",
    highlighted: true,
    badge: "En Popüler",
  },
  {
    name: "Pro",
    price: "₺799",
    period: "/ay",
    desc: "Ajanslar ve büyük markalar için",
    credits: "Sınırsız",
    features: [
      "Sınırsız video kredisi",
      "6 platform + özel entegrasyon",
      "AI caption & hashtag",
      "Sınırsız video geçmişi",
      "7/24 öncelikli destek",
      "API erişimi",
      "Ekip hesabı (3 kişi)",
      "Özel watermark kaldırma",
    ],
    cta: "Pro Başlat",
    href: "/auth/signup?plan=pro",
    highlighted: false,
    badge: null,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Basit, <span className="gradient-text">Şeffaf Fiyatlar</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Kredi kartı gerekmez. İstediğiniz zaman iptal edin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 sm:p-8 flex flex-col gap-6 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-purple-500/20 to-pink-500/10 border border-purple-500/50 shadow-xl shadow-purple-500/10"
                  : "glass"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  {plan.highlighted && <Zap size={16} className="text-purple-400" />}
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-zinc-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{plan.desc}</p>
                <div className="mt-2 text-sm font-medium text-purple-300">{plan.credits}</div>
              </div>

              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check size={14} className="text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-auto text-center font-semibold py-3 px-6 rounded-full transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30"
                    : "glass hover:bg-white/10 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-500 mt-8">
          Tüm planlar Lemon Squeezy üzerinden güvenli ödeme ile işlenir.
          İptal ettiğinizde bir sonraki dönemde ücret kesilmez.
        </p>
      </div>
    </section>
  );
}
