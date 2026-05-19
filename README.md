# BRSKO AI — Finans Analiz & Takip Koçu

BRSKO AI, OpenRouter üzerinden çalışan yapay zeka destekli bir kişisel finans asistanıdır. React + Vite tabanlı bir arayüz ve Node.js (Express) backend içerir. Vercel'de serverless function olarak da çalışabilir.

## Özellikler

- Türkçe konuşan AI finans koçu (OpenRouter / Gemma-3)
- - Sohbet tabanlı bütçe, tasarruf ve yatırım önerileri
  - - Tasarruf grafiği ve hızlı promptlar
    - - Hem klasik Node sunucu (`server.js`) hem de Vercel serverless (`api/chat.js`) modu
     
      - ## Gereksinimler
     
      - - Node.js 18 veya üstü
        - - npm 9+
          - - Ücretsiz bir [OpenRouter](https://openrouter.ai) hesabı ve API anahtarı
            - - (Opsiyonel) Bir Supabase projesi
             
              - ## 1) Projeyi klonlayın
             
              - ```bash
                git clone https://github.com/bariskaygisizz/BRSKO-A-F-NANS-ANAL-Z-TAK-P-KO-U---BRSKO-SOSYAL-MEDYA-F-NANS-ANAL-Z-A-.git
                cd BRSKO-A-F-NANS-ANAL-Z-TAK-P-KO-U---BRSKO-SOSYAL-MEDYA-F-NANS-ANAL-Z-A-
                npm install
                ```

                ## 2) Ortam değişkenleri (.env)

                Proje kökünde `.env` dosyası oluşturun (`.env.example` dosyasını kopyalayabilirsiniz). **Bu dosyayı asla commit etmeyin.**

                ```env
                # Backend (server.js / api/chat.js)
                OPENROUTER_API_KEY=sk-or-v1-buraya-kendi-anahtarinizi-yazin
                OPENROUTER_MODEL=google/gemma-3-27b-it:free
                PORT=3002
                PUBLIC_SITE_URL=http://localhost:5173

                # Frontend (Vite)
                VITE_SUPABASE_URL=https://xxxx.supabase.co
                VITE_SUPABASE_ANON_KEY=eyJ...
                ```

                OpenRouter anahtarınızı https://openrouter.ai/keys adresinden ücretsiz alabilirsiniz.

                ## 3) Geliştirme modunda çalıştırma (lokal)

                İki ayrı terminal açın:

                **Terminal 1 — Backend (port 3002):**
                ```bash
                npm run server
                ```

                **Terminal 2 — Frontend (port 5173):**
                ```bash
                npm run dev
                ```

                Tarayıcıdan `http://localhost:5173` adresini açın. Vite, `/api/*` isteklerini otomatik olarak 3002'ye proxy'ler.

                ## 4) Production build (tek sunucu)

                ```bash
                npm run build
                npm start
                ```

                Bu komut hem React arayüzünü hem de API'yi `http://localhost:3002` üzerinde servis eder.

                ## 5) Canlıya alma — Vercel (önerilen)

                1. https://vercel.com hesabına girin → **Add New → Project** → bu GitHub reposunu seçin.
                2. 2. Ayarlar:
                   3.    - **Framework Preset:** Vite
                         -    - **Build Command:** `npm run build`
                              -    - **Output Directory:** `dist`
                                   -    - **Install Command:** `npm install`
                                        - 3. **Environment Variables** sekmesinden şunları ekleyin:
                                          4.    - `OPENROUTER_API_KEY` → yeni anahtarınız
                                                -    - `OPENROUTER_MODEL` → `google/gemma-3-27b-it:free`
                                                     -    - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (kullanıyorsanız)
                                                          - 4. **Deploy** butonuna basın. `api/chat.js` otomatik olarak serverless function olur ve `https://<projeniz>.vercel.app/api/chat` adresinden çalışır.
                                                           
                                                            5. ## 5b) Alternatif — Render / Railway (tek Node sunucusu)
                                                           
                                                            6. - **Build Command:** `npm install && npm run build`
                                                               - - **Start Command:** `npm start`
                                                                 - - Environment Variables sekmesine yukarıdaki `.env` değişkenlerini girin.
                                                                   - - Public URL'iniz hazır.
                                                                    
                                                                     - ## Proje yapısı
                                                                    
                                                                     - ```
                                                                       ├── api/              # Vercel serverless functions
                                                                       │   ├── chat.js       # POST /api/chat — OpenRouter proxy
                                                                       │   └── health.js     # GET  /api/health
                                                                       ├── src/              # React uygulaması
                                                                       │   ├── App.jsx
                                                                       │   ├── main.jsx
                                                                       │   └── styles.css
                                                                       ├── server.js         # Lokal/self-hosted Express sunucu
                                                                       ├── vite.config.js
                                                                       ├── package.json
                                                                       └── .env.example
                                                                       ```

                                                                       ## Güvenlik notu

                                                                       - `.env` dosyası `.gitignore` ile yok sayılır. **API anahtarlarınızı asla repoya commit etmeyin.**
                                                                       - - Yanlışlıkla bir anahtar sızdırdıysanız OpenRouter ve Supabase panellerinden anahtarı hemen iptal edip yenisini üretin.
                                                                        
                                                                         - ## Lisans
                                                                        
                                                                         - MIT
                                                                         - 
