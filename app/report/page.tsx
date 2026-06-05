'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Modal from '@/components/Modal'
import { BASE_SUPPORTERS, Supporter } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

type Phase = 'loading' | 'report'

const LOADING_STEPS = [
  'QUERYING STARTUP DATABASE...',
  'SCANNING FUNDING ROUNDS...',
  'RUNNING YC EVALUATION FRAMEWORK...',
  'COMPOSING REPORT...',
]

interface YCAnalysis {
  founderScore: number
  founderFeedback: string
  marketScore: number
  marketFeedback: string
  tractionScore: number
  tractionFeedback: string
  speedScore: number
  speedFeedback: string
  ycVerdict: string
  topStrength: string
  topWeakness: string
  nextStep: string
}

interface AnalysisData {
  industry: string
  businessModel: string
  ycAnalysis: YCAnalysis | null
  similarStartups: { name: string; category: string; status: string; country: string; funding: string }[]
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
}

function formatUSD(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return n > 0 ? `$${n}` : 'N/A'
}

function ScoreBar({ score, label, feedback }: { score: number; label: string; feedback: string }) {
  const cls = score >= 75 ? 'high' : score >= 55 ? 'mid' : 'low'
  return (
    <div className="yc-score-row">
      <div className="yc-score-header">
        <span className="yc-score-label">{label}</span>
        <span className={`yc-score-num ${cls}`}>{score}</span>
      </div>
      <div className="metric-bar-wrap">
        <div className={`metric-bar ${cls}`} style={{ width: `${score}%` }} />
      </div>
      <div className="yc-score-feedback">{feedback}</div>
    </div>
  )
}

function ReportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const analysisId = searchParams.get('id')

  const [phase, setPhase] = useState<Phase>('loading')
  const [loadingStep, setLoadingStep] = useState(0)
  const [fillWidth, setFillWidth] = useState(0)
  const [idea, setIdea] = useState('')
  const [supporters, setSupporters] = useState<Supporter[]>([...BASE_SUPPORTERS])
  const [modalOpen, setModalOpen] = useState(false)
  const [data, setData] = useState<AnalysisData | null>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    setTimeout(() => setFillWidth(100), 50)
    let step = 0
    const si = setInterval(() => {
      step++
      if (step < LOADING_STEPS.length) setLoadingStep(step)
    }, 900)

    // Load from DB if we have an id, otherwise run fresh from sessionStorage
    if (analysisId) {
      const supabase = createClient()
      supabase
        .from('analyses')
        .select('idea, result')
        .eq('id', analysisId)
        .single()
        .then(({ data: row }) => {
          clearInterval(si)
          if (row) {
            setIdea(row.idea)
            setData(row.result as AnalysisData)
          }
          setPhase('report')
        })
    } else {
      const storedIdea = sessionStorage.getItem('boffo_idea') || 'Your startup idea'
      const storedData = sessionStorage.getItem('boffo_data')
      const parsed = storedData ? JSON.parse(storedData) : {}
      setIdea(storedIdea)

      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: storedIdea,
          traction: parsed.traction,
          technical: parsed.technical,
          team: parsed.team,
          speed: parsed.speed,
        }),
      })
        .then(r => r.json())
        .then((result: AnalysisData & { analysisId?: string }) => {
          clearInterval(si)
          // Update URL to the saved analysis so refresh/share works
          if (result.analysisId) {
            window.history.replaceState(null, '', `/report?id=${result.analysisId}`)
          }
          setData(result)
          setPhase('report')
        })
        .catch(() => { clearInterval(si); setPhase('report') })
    }
  }, [analysisId])

  function handleSupporterSuccess(supporter: Supporter) {
    setSupporters(prev => [supporter, ...prev])
    setModalOpen(false)
  }

  const yc = data?.ycAnalysis
  const overallScore = yc
    ? Math.round((yc.founderScore + yc.marketScore + yc.tractionScore + yc.speedScore) / 4)
    : 0
  const verdict = yc?.ycVerdict || ''
  const verdictCls = verdict.includes('STRONG') ? 'verdict-strong' : verdict.includes('IMPROVEMENTS') ? 'verdict-mid' : 'verdict-weak'

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
        <button className="back-btn" onClick={() => router.push('/ideas')}>← BACK TO IDEAS</button>

        <div className="report-header">
          <div className="report-tag">VALIDATION REPORT · LIVE</div>
          <div className="report-h1">DEMAND ANALYSIS</div>
          <div className="idea-display">IDEA: {idea.toUpperCase()}</div>
          {data?.industry && (
            <div className="report-meta">
              <span className="meta-tag">{data.industry}</span>
              <span className="meta-tag">{data.businessModel}</span>
            </div>
          )}
        </div>

        {yc && (
          <>
            <div className="overall-score">
              <div className="big-score">{overallScore}</div>
              <div className="score-info">
                <div className={`score-verdict ${verdictCls}`}>{verdict}</div>
                <div className="score-desc">
                  <strong>Strength:</strong> {yc.topStrength}<br />
                  <strong>Weakness:</strong> {yc.topWeakness}
                </div>
              </div>
            </div>

            <div className="data-section">
              <div className="section-label">YC EVALUATION FRAMEWORK</div>
              <div className="yc-scores">
                <ScoreBar score={yc.founderScore} label="FOUNDER QUALITY" feedback={yc.founderFeedback} />
                <ScoreBar score={yc.marketScore} label="MARKET POTENTIAL" feedback={yc.marketFeedback} />
                <ScoreBar score={yc.tractionScore} label="TRACTION SIGNAL" feedback={yc.tractionFeedback} />
                <ScoreBar score={yc.speedScore} label="EXECUTION SPEED" feedback={yc.speedFeedback} />
              </div>
            </div>

            <div className="next-step-block">
              <div className="next-step-label">RECOMMENDED NEXT ACTION</div>
              <div className="next-step-text">› {yc.nextStep}</div>
            </div>
          </>
        )}

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
                    <div className="startup-meta">
                      {s.category !== 'N/A' ? s.category : ''}
                      {s.country !== 'N/A' ? ` · ${s.country}` : ''}
                      {parseFloat(s.funding) > 0 ? ` · ${formatUSD(parseFloat(s.funding))} raised` : ''}
                    </div>
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleSupporterSuccess} />
    </>
  )
}

export default function ReportPageWrapper() {
  return (
    <Suspense fallback={<div className="wrap"><div className="loading-state"><div className="loading-text">LOADING...</div></div></div>}>
      <ReportPage />
    </Suspense>
  )
}
