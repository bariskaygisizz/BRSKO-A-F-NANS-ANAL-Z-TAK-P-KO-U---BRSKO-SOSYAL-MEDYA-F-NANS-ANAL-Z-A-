const SYSTEM_PROMPT = `Sen BRSKO AI adinda, yapay zeka destekli kisisel finans asistanisin.
Gorevin:
- Kullanicinin finansal sorularina net, zeki ve motive edici yanitlar vermek
- Butce analizi, tasarruf planlari ve yatirim konusunda egitici bilgiler sunmak
- Sicak, samimi ve profesyonel bir dil kullanmak
- Her zaman Turkce konusmak
- Kisa, oz ve anlasilir olmak
- Finansal konularda kisa bir risk uyarisi eklemek
Asla robot gibi konusma. Gercek bir finans kocu gibi davran.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const { messages = [] } = req.body || {};
    const payload = {
      model: process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((message) => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content || message.text || '',
        })),
      ],
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.PUBLIC_SITE_URL || req.headers.origin || 'https://brsko-ai.vercel.app',
        'X-Title': 'BRSKO AI Finance',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'OpenRouter request failed',
        detail: data,
      });
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(500).json({ error: 'Unexpected AI response', detail: data });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
