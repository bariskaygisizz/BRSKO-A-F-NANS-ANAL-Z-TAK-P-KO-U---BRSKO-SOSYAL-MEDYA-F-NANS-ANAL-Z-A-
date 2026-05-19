/**
 * ============================================================
 * geminiService.js — BRSKO AI Motor Katmanı
 * ============================================================
 *
 * Bu dosya, tüm AI çağrılarını merkezi olarak yönetir.
 * Doğrudan Google Gemini'ye değil, OpenRouter proxy'sine
 * istek atar. Bu sayede:
 *   - API anahtarı tek bir yerden yönetilir (bu dosya).
 *   - Model değişikliği (ör. Gemini → Claude) tüm uygulamada
 *     tek satır değişiklikle yapılabilir.
 *   - Hata yönetimi merkezi tutulur; bileşenler try/catch
 *     yazmak zorunda kalmaz.
 *
 * Kullanılan model: google/gemini-2.5-flash (via OpenRouter)
 * Bağımlılık: Tarayıcı fetch API (polyfill gerekmez, Vite hedefi modern tarayıcılar)
 *
 * ⚠️  API anahtarı bu dosyada hardcoded tanımlıdır.
 *     Production ortamı için import.meta.env.VITE_OPENROUTER_KEY
 *     şeklinde .env dosyasına taşımak önerilir.
 */

// ─── API ANAHTARI & SABITLER ──────────────────────────────────

/**
 * OpenRouter API anahtarı.
 * Üretim ortamında environment variable olarak saklanmalıdır:
 *   VITE_OPENROUTER_KEY=sk-or-v1-...
 *
 * @type {string}
 */
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

/**
 * BRSKO AI sistem promptu — modelin karakterini ve davranış kurallarını belirler.
 *
 * Bu prompt her API çağrısında "system" rolüyle gönderilir. Amacı:
 *   1. Modelin kendini BRSKO AI olarak tanımlamasını sağlamak.
 *   2. Finans odaklı, kısa ve aksiyona yönelik cevaplar üretmesini yönlendirmek.
 *   3. Dil tutarlılığını garantilemek (Türkçe).
 *
 * @type {string}
 */
const SYSTEM_PROMPT = `Seni "BRSKO FİNANSAL ANALİZ TAKİP AI" olarak tanımlıyorum.
Görevin kullanıcının finansal kararlarına yardımcı olmak, piyasaları analiz etmek ve strateji üretmektir.
İsmin her zaman BRSKO AI'dır. Profesyonel, vizyoner ve disiplinli bir servet yönetmeni gibi davran.
Türkçe konuş. Cevapların kısa, net ve aksiyona yönelik olsun.`;

// ─── DÜŞÜK SEVİYE HTTP KATMANI ────────────────────────────────

/**
 * callOpenRouter — OpenRouter API'sine ham HTTP isteği atar.
 *
 * Neden ayrı bir fonksiyon?
 *   chatWithHistory ve financeCoach farklı mesaj formatlarıyla çalışır,
 *   ama her ikisi de aynı HTTP mantığını kullanır. DRY prensibi gereği
 *   bu ortak kod burada izole edilmiştir.
 *
 * @param {Array<{role: string, content: string}>} messages
 *   OpenAI-uyumlu mesaj dizisi. System prompt otomatik eklenir.
 * @returns {Promise<string>} Modelin ürettiği metin yanıtı
 * @throws {Error} Ağ hatası veya API hatasında fırlatır
 */
async function callOpenRouter(messages) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
      // HTTP-Referer: OpenRouter dashboard'da bu uygulamayı tanımlamak için.
      // X-Title: OpenRouter loglarında görünür; debug kolaylığı sağlar.
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "BRSKO AI"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      // max_tokens: çok uzun yanıtların maliyetini ve süresini kısıtlar.
      // Finans yorumları ve içerik üretimi için 2048 token yeterli.
      max_tokens: 2048,
      // System prompt her zaman mesaj dizisinin başına eklenir.
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages]
    })
  });
  const data = await response.json();
  // choices[0] → API her zaman en az bir seçenek döndürür (n=1 default)
  return data.choices[0].message.content;
}

// ─── DIŞA AKTARILAN API ───────────────────────────────────────

/**
 * chatWithHistory — Çok turlu sohbet (konuşma geçmişi ile).
 *
 * Kullanım senaryoları:
 *   - Ana sohbet ekranı (ChatPage) — önceki mesajları bağlam olarak gönderir.
 *   - CreatorPage araçları — tek turlu prompt olarak da kullanılabilir:
 *       await chatWithHistory([{ role: 'user', content: prompt }])
 *
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 *   Kronolojik sıralı konuşma geçmişi. System prompt bu dizi dışında tutulur.
 * @returns {Promise<string>} AI yanıtı veya hata mesajı (asla throw etmez)
 */
export async function chatWithHistory(messages) {
  // Boş dizi ile çağrılmayı erken yakala — API'ye gereksiz istek gitmesini önler
  if (!messages?.length) return "Lütfen bir mesaj iletin.";
  try {
    return await callOpenRouter(messages);
  } catch {
    // Kullanıcıya teknik hata mesajı yerine anlamlı bir Türkçe geri bildirim
    return "BRSKO AI sistem bağlantısı şu an yoğun. Lütfen tekrar deneyin.";
  }
}

/**
 * financeCoach — Tek turlu finans koçu çağrısı.
 *
 * chatWithHistory'den farkı: geçmiş mesaj yönetimini çağıran tarafa bırakmadan
 * doğrudan tek bir kullanıcı mesajıyla API'yi çağırır. Dashboard widget'ları
 * ve tek seferlik analizler için idealdir.
 *
 * @param {string} userMessage Kullanıcının sorusu veya komutu
 * @returns {Promise<string>} AI yanıtı veya hata mesajı (asla throw etmez)
 */
export async function financeCoach(userMessage) {
  if (!userMessage) return "Lütfen bir mesaj iletin.";
  try {
    return await callOpenRouter([{ role: "user", content: userMessage }]);
  } catch {
    return "BRSKO AI sistem bağlantısı şu an yoğun. Lütfen tekrar deneyin.";
  }
}

/**
 * getAIResponse — financeCoach için eski isimli wrapper.
 *
 * Geriye dönük uyumluluk (backward compatibility) için vardır.
 * Eski bileşenler bu isimle import ediyorsa kırılmaları önlenir.
 * Yeni kod doğrudan financeCoach veya chatWithHistory kullanmalıdır.
 *
 * @param {string} msg
 * @returns {Promise<string>}
 * @deprecated financeCoach() kullanın
 */
export const getAIResponse = async (msg) => {
  return await financeCoach(msg);
};
