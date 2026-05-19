import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  tr: {
    translation: {
      welcome: "FinansKoç AI'ya Hoş Geldiniz",
      scanning: "Analiz Ediliyor...",
      ai_assistant: "Yapay Zeka Asistanı",
      income: "Gelir",
      expense: "Gider",
      balance: "Bakiye",
      predictive_analysis: "Öngörüsel Analiz",
      investment_advice: "Yatırım Tavsiyesi",
      scan_product: "Ürün Tarat",
      categories: "Kategoriler",
      health_score: "Sağlık Puanı",
      comparison: "Kıyaslama",
      save_success: "Başarıyla kaydedildi",
      risk_warning: "Risk Analizi",
      advantage: "Avantajlar",
      price_alert: "Fiyat Uyarısı"
    }
  },
  en: {
    translation: {
      welcome: "Welcome to FinansKoç AI",
      scanning: "Analyzing...",
      ai_assistant: "AI Assistant",
      income: "Income",
      expense: "Expense",
      balance: "Balance",
      predictive_analysis: "Predictive Analysis",
      investment_advice: "Investment Advice",
      scan_product: "Scan Product",
      categories: "Categories",
      health_score: "Health Score",
      comparison: "Comparison",
      save_success: "Successfully saved",
      risk_warning: "Risk Analysis",
      advantage: "Advantages",
      price_alert: "Price Alert"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
