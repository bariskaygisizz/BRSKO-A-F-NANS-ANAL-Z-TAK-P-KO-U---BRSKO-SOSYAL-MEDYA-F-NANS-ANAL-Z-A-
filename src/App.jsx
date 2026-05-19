import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Calculator,
  ChartNoAxesCombined,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const starterMessages = [
  {
    role: 'assistant',
    content:
      'Merhaba, ben BRSKO AI. Gelir, gider, borc, tasarruf veya yatirim planini birlikte netlestirebiliriz. Nereden baslayalim?',
  },
]

const cashFlow = [
  { month: 'Oca', saving: 5200 },
  { month: 'Sub', saving: 6100 },
  { month: 'Mar', saving: 5800 },
  { month: 'Nis', saving: 7600 },
  { month: 'May', saving: 9100 },
  { month: 'Haz', saving: 11800 },
]

const quickPrompts = [
  'Gelirim 45.000 TL, giderim 31.000 TL. Bana tasarruf plani yap.',
  'Kredi karti borcumu kapatmak icin 90 gunluk plan hazirla.',
  'Dusuk riskli yatirim icin nelere dikkat etmeliyim?',
]

function App() {
  const [messages, setMessages] = useState(starterMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  const stats = useMemo(
    () => [
      { label: 'Aylik nakit akisi', value: '17.000 TL', icon: WalletCards },
      { label: 'Tasarruf hedefi', value: '%24', icon: ChartNoAxesCombined },
      { label: 'Risk kontrolu', value: 'Aktif', icon: ShieldCheck },
    ],
    [],
  )

  async function sendMessage(text = input) {
    const cleanText = text.trim()
    if (!cleanText || isSending) return

    const nextMessages = [...messages, { role: 'user', content: cleanText }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setIsSending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'AI yaniti alinamadi')
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.reply || 'Yaniti su an okuyamadim.' },
      ])
    } catch (err) {
      setError(
        err.message === 'API key not configured'
          ? 'OpenRouter API anahtari sunucuda tanimli degil. Canli ortamda OPENROUTER_API_KEY ekleyin.'
          : err.message,
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="sidebar" aria-label="BRSKO AI finans paneli">
          <div className="brand">
            <span className="brand-mark">
              <BrainCircuit size={22} />
            </span>
            <div>
              <strong>BRSKO AI</strong>
              <span>Finans analiz takip kocu</span>
            </div>
          </div>

          <div className="score-panel">
            <span className="eyebrow">Bugunku finans skoru</span>
            <strong>82</strong>
            <p>Gelir, gider ve tasarruf dengesinde guclu sinyal var.</p>
          </div>

          <div className="stats-grid">
            {stats.map((item) => {
              const Icon = item.icon
              return (
                <div className="stat-card" key={item.label}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              )
            })}
          </div>

          <div className="chart-panel">
            <div className="panel-heading">
              <span>Nakit akisi</span>
              <ArrowUpRight size={17} />
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={cashFlow} margin={{ top: 12, right: 6, left: -26, bottom: 0 }}>
                <defs>
                  <linearGradient id="saving" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18a999" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#18a999" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#d9e2dc" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip formatter={(value) => `${value.toLocaleString('tr-TR')} TL`} />
                <Area type="monotone" dataKey="saving" stroke="#127d73" strokeWidth={3} fill="url(#saving)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </aside>

        <section className="chat-panel" aria-label="BRSKO AI sohbet">
          <header className="chat-header">
            <div>
              <span className="eyebrow">AI finans asistani</span>
              <h1>Parani daha net yonet.</h1>
            </div>
            <div className="live-pill">
              <Sparkles size={16} />
              Canli
            </div>
          </header>

          <div className="quick-prompts">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="messages" aria-live="polite">
            {messages.map((message, index) => (
              <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
                <span className="avatar">{message.role === 'assistant' ? <Bot size={17} /> : <Calculator size={17} />}</span>
                <p>{message.content}</p>
              </article>
            ))}
            {isSending && (
              <article className="message assistant">
                <span className="avatar">
                  <Loader2 className="spin" size={17} />
                </span>
                <p>Analiz ediyorum...</p>
              </article>
            )}
          </div>

          {error && <div className="error-box">{error}</div>}

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Finans sorunu yaz..."
              aria-label="Finans sorusu"
            />
            <button type="submit" disabled={isSending || !input.trim()} aria-label="Gonder">
              {isSending ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </section>
      </section>
    </main>
  )
}

export default App
