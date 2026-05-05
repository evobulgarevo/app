'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Modal from '@/components/Modal'
import { BASE_SUPPORTERS, generateScores, Supporter, MetricScore } from '@/lib/data'

type Phase = 'loading' | 'report'

const LOADING_STEPS = [
  'QUERYING STARTUP DATABASE...',
  'SCANNING FUNDING ROUNDS...',
  'IDENTIFYING INVESTORS...',
  'COMPOSING REPORT...',
]

interface AnalysisData {
  similarStartups: { name: string; category: string; status: string; country: string }[]
  ycStartups: { name: string; batch: string; description: string; status: string }[]
  fundingInsights: {
    totalDeals: number
    avgRoundSize: number
    totalFunding: number
    seedDeals: number
    seriesADeals: number
    topRound: number
  }
  investors: { name: string; type: string; country: string }[]
  keywords: string[]
  searchTerm: string
}

function formatUSD(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return n > 0 ? `$${n}` : 'N/A'
}

export default function ReportPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [loadingStep, setLoadingStep] = useState(0)
  const [fillWidth, setFillWidth] = useState(0)
  const [idea, setIdea] = useState('')
  const [scores, setScores] = useState<MetricScore[]>([])
  const [overall, setOverall] = useState(0)
  const [supporters, setSupporters] = useState<Supporter[]>([...BASE_SUPPORTERS])
  const [modalOpen, setModalOpen] = useState(false)
  const [data, setData] = useState<AnalysisData | null>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const storedIdea = sessionStorage.getItem('boffo_idea') || 'Your startup idea'
    setIdea(storedIdea)

    setTimeout(() => setFillWidth(100), 50)

    let step = 0
    const si = setInterval(() => {
      step++
      if (step < LOADING_STEPS.length) setLoadingStep(step)
    }, 700)

    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: storedIdea }),
    })
      .then(r => r.json())
      .then((result: AnalysisData) => {
        clearInterval(si)
        const generatedScores = generateScores()
        const avg = Math.round(generatedScores.reduce((a, b) => a + b.score, 0) / generatedScores.length)
        setScores(generatedScores)
        setOverall(avg)
        setData(result)
        setPhase('report')
      })
      .catch(() => {
        clearInterval(si)
        const generatedScores = generateScores()
        const avg = Math.round(generatedScores.reduce((a, b) => a + b.score, 0) / generatedScores.length)
        setScores(generatedScores)
        setOverall(avg)
        setPhase('report')
      })
  }, [])

  function handleSupporterSuccess(supporter: Supporter) {
    setSupporters(prev => [supporter, ...prev])
    setModalOpen(false)
  }

  const verdict =
    overall >= 80 ? 'HIGH VIABILITY' : overall >= 65 ? 'MODERATE VIABILITY' : 'NEEDS REFINEMENT'

  if (phase === 'loading') {
    return (
      <>
        <Nav />
        <div className="wrap page-enter">
          <div className="loading-state">
            <div className="loading-bar">
              <div className="loading-fill" style={{ width: `${fillWidth}%` }} />
            </div>
            <div className="loading-text">ANALYZING MARKET</div>
            <div className="loading-sub">{LOADING_STEPS[loadingStep]}</div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="wrap page-enter">
        <button className="back-btn" onClick={() => router.push('/')}>← BACK</button>

        <div className="report-header">
          <div className="report-tag">VALIDATION REPORT · LIVE</div>
          <div className="report-h1">DEMAND ANALYSIS</div>
          <div className="idea-display">IDEA: {idea.toUpperCase()}</div>
        </div>

        <div className="metrics-title">VC VIABILITY SCORES</div>
        <div className="metrics-grid">
          {scores.map((m, i) => (
            <div className="metric-card" key={i}>
              <div className={`metric-score ${m.cls}`}>{m.score}</div>
              <div className="metric-bar-wrap">
                <div className={`metric-bar ${m.cls}`} style={{ width: `${m.score}%` }} />
              </div>
              <div className="metric-name" style={{ whiteSpace: 'pre-line' }}>{m.name}</div>
            </div>
          ))}
        </div>

        <div className="overall-score">
          <div className="big-score">{overall}</div>
          <div className="score-info">
            <div className="score-verdict">{verdict}</div>
            <div className="score-desc">
              {data?.similarStartups?.length
                ? `${data.similarStartups.length} similar companies found in our database. ${data.fundingInsights?.totalDeals || 0} funding events tracked in this space.`
                : 'Market signal analysis complete. Review the data below.'}
            </div>
          </div>
        </div>

        {data?.fundingInsights && data.fundingInsights.totalDeals > 0 && (
          <div className="data-section">
            <div className="section-label">FUNDING INTELLIGENCE</div>
            <div className="funding-grid">
              <div className="funding-stat">
                <div className="funding-num">{data.fundingInsights.totalDeals}</div>
                <div className="funding-label">DEALS TRACKED</div>
              </div>
              <div className="funding-stat">
                <div className="funding-num">{formatUSD(data.fundingInsights.avgRoundSize)}</div>
                <div className="funding-label">AVG ROUND SIZE</div>
              </div>
              <div className="funding-stat">
                <div className="funding-num">{formatUSD(data.fundingInsights.topRound)}</div>
                <div className="funding-label">LARGEST ROUND</div>
              </div>
              <div className="funding-stat">
                <div className="funding-num">{data.fundingInsights.seedDeals}</div>
                <div className="funding-label">SEED DEALS</div>
              </div>
            </div>
          </div>
        )}

        {data?.similarStartups && data.similarStartups.length > 0 && (
          <div className="data-section">
            <div className="section-label">SIMILAR COMPANIES IN DATABASE</div>
            <div className="startup-list">
              {data.similarStartups.map((s, i) => (
                <div className="startup-row" key={i}>
                  <div className="startup-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="startup-info">
                    <div className="startup-name">{s.name}</div>
                    <div className="startup-meta">{s.category !== 'N/A' ? s.category : ''}{s.country !== 'N/A' ? ` · ${s.country}` : ''}</div>
                  </div>
                  <div className={`startup-status status-${s.status?.toLowerCase()}`}>{s.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.ycStartups && data.ycStartups.length > 0 && (
          <div className="data-section">
            <div className="section-label">Y COMBINATOR COMPANIES IN THIS SPACE</div>
            <div className="startup-list">
              {data.ycStartups.map((s, i) => (
                <div className="startup-row" key={i}>
                  <div className="startup-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="startup-info">
                    <div className="startup-name">{s.name}</div>
                    {s.description && <div className="startup-meta">{s.description}</div>}
                  </div>
                  {s.batch && s.batch !== 'N/A' && <div className="yc-batch">{s.batch}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.investors && data.investors.length > 0 && (
          <div className="data-section">
            <div className="section-label">INVESTORS ACTIVE IN THIS SPACE</div>
            <div className="investor-list">
              {data.investors.map((inv, i) => (
                <div className="investor-tag" key={i}>{inv.name}</div>
              ))}
            </div>
          </div>
        )}

        <div className="stripe-section">
          <div className="stripe-question">Will you pay for this?</div>
          <div className="stripe-sub">
            Join the founding cohort. $1 today signals real intent — no fluff, no fake traction.<br />
            Every supporter is listed publicly as a Visionary Supporter of the founder.
          </div>
          <button className="pay-btn" onClick={() => setModalOpen(true)}>
            YES, I&apos;D PAY <span className="price">$1</span>
          </button>
          <div className="stripe-badge">SECURED BY STRIPE · 256-BIT TLS</div>
        </div>

        <div className="supporters-section">
          <div className="supporters-header">
            <div className="supporters-title">VISIONARY SUPPORTERS OF THE FOUNDER</div>
            <div className="supporters-count">{supporters.length}</div>
          </div>
          <div>
            {supporters.map((s, i) => (
              <div className="supporter-item" key={i}>
                <div className="supporter-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="supporter-dot" />
                <div className="supporter-name">{s.name}</div>
                {s.badge && <div className="supporter-badge">{s.badge}</div>}
                <div className="supporter-date">{s.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSupporterSuccess}
      />
    </>
  )
}
