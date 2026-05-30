'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'

type Phase = 'loading' | 'report' | 'empty'

const LOADING_STEPS = [
  'QUERYING STARTUP DATABASE...',
  'SCANNING FUNDING ROUNDS...',
  'RUNNING YC EVALUATION FRAMEWORK...',
  'COMPOSING REPORT...',
]

const PLACEHOLDER_MODULES = [
  { icon: '◎', label: 'YC Evaluation Framework' },
  { icon: '▦', label: 'Funding Intelligence' },
  { icon: '◈', label: 'Similar Companies' },
  { icon: '◆', label: 'Active Investors' },
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

export default function IdeasPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [loadingStep, setLoadingStep] = useState(0)
  const [idea, setIdea] = useState('')
  const [data, setData] = useState<AnalysisData | null>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const stored = sessionStorage.getItem('boffo_data')
    if (!stored) { setPhase('empty'); return }

    const parsed = JSON.parse(stored)
    setIdea(parsed.idea || '')

    let s = 0
    const si = setInterval(() => {
      s++
      if (s < LOADING_STEPS.length) setLoadingStep(s)
    }, 900)

    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: parsed.idea,
        traction: parsed.traction,
        technical: parsed.technical,
        team: parsed.team,
        speed: parsed.speed,
      }),
    })
      .then(r => r.json())
      .then((result: AnalysisData) => {
        clearInterval(si)
        setData(result)
        setPhase('report')
      })
      .catch(() => {
        clearInterval(si)
        setPhase('report')
      })
  }, [])

  const yc = data?.ycAnalysis
  const overallScore = yc
    ? Math.round((yc.founderScore + yc.marketScore + yc.tractionScore + yc.speedScore) / 4)
    : 0
  const verdict = yc?.ycVerdict || ''
  const verdictCls = verdict.includes('STRONG')
    ? 'verdict-strong'
    : verdict.includes('IMPROVEMENTS')
    ? 'verdict-mid'
    : 'verdict-weak'

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-shell page-enter">
        <div className="main-shell-nav"><Nav /></div>

        <div className="main-content">
          <div className="ideas-shell">

            {/* ── Page header ── */}
            <div className="ideas-header">
              <div className="ideas-breadcrumb">
                <span className="ideas-breadcrumb-item" onClick={() => router.push('/')}>HOME</span>
                <span className="ideas-breadcrumb-sep">›</span>
                <span className="ideas-breadcrumb-item ideas-breadcrumb-item--active">IDEAS</span>
              </div>
              <div className="ideas-title-row">
                <div className="ideas-page-title">IDEAS</div>
                <button className="ideas-new-btn" onClick={() => router.push('/')}>
                  + NEW IDEA
                </button>
              </div>
            </div>

            {/* ── Loading state ── */}
            {phase === 'loading' && (
              <div className="ideas-loading">
                <div className="ideas-loading-bar">
                  <div className="ideas-loading-fill" style={{ width: '100%' }} />
                </div>
                <div className="ideas-loading-label">ANALYZING MARKET</div>
                <div className="loading-sub">{LOADING_STEPS[loadingStep]}</div>
                <div className="placeholder-modules ideas-loading-modules">
                  {PLACEHOLDER_MODULES.map(({ icon, label }, i) => (
                    <div key={label} className="placeholder-module">
                      <span className="placeholder-icon">{icon}</span>
                      <span className="placeholder-label">{label}</span>
                      <span className={`placeholder-status ${i <= loadingStep ? 'placeholder-status--active' : ''}`}>
                        {i <= loadingStep ? 'SCANNING' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Empty state ── */}
            {phase === 'empty' && (
              <div className="ideas-empty">
                <div className="ideas-empty-icon">◈</div>
                <div className="ideas-empty-title">NO IDEAS YET</div>
                <p className="ideas-empty-sub">Submit your first idea to see your demand analysis report here.</p>
                <button className="validate-btn" style={{ maxWidth: 280 }} onClick={() => router.push('/')}>
                  VALIDATE AN IDEA <span className="btn-arrow">▶</span>
                </button>
              </div>
            )}

            {/* ── Report ── */}
            {phase === 'report' && (
              <div className="ideas-report">

                {/* Report header */}
                <div className="ideas-report-header">
                  <div className="report-tag">VALIDATION REPORT · LIVE</div>
                  <div className="ideas-report-h1">DEMAND ANALYSIS</div>
                  <div className="ideas-report-idea">IDEA: {idea.toUpperCase()}</div>
                  {data?.industry && (
                    <div className="report-meta">
                      <span className="meta-tag">{data.industry}</span>
                      <span className="meta-tag">{data.businessModel}</span>
                    </div>
                  )}
                </div>

                {/* YC Verdict */}
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

                {/* Funding */}
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

                {/* Similar startups */}
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

                {/* YC companies */}
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

                {/* Investors */}
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

              </div>
            )}

          </div>
        </div>

        <div className="main-shell-footer"><Footer /></div>
      </div>
    </div>
  )
}
