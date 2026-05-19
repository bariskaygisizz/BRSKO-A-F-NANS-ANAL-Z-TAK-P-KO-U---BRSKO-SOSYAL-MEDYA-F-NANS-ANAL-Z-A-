import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Initialize Gemini API
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
       console.error("Missing GOOGLE_AI_API_KEY in environment variables.");
       // Fallback for hackathon demo if key is missing
       return NextResponse.json({ 
          text: "API Anahtarı bulunamadı. Lütfen .env.local dosyasına GOOGLE_AI_API_KEY ekleyin. (Demo Yanıtı: Piyasa şu an volatil, yatırımlarınızı çeşitlendirmelisiniz.)" 
       });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // System instruction injected to the prompt
    const systemInstruction = "Sen profesyonel Wall Street finans uzmanı ve AI yatırım danışmanısın. BRSKO AI platformunda çalışıyorsun. Yanıtların profesyonel, kurumsal, teknik ve güven verici olmalı. Analitik veriler sun. YTD (Yatırım Tavsiyesi Değildir) uyarısı ekle. Soru: ";
    
    const result = await model.generateContent(systemInstruction + prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
