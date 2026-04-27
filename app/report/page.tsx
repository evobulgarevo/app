'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Modal from '@/components/Modal'
import { BASE_SUPPORTERS, PITCH_DATA, generateScores, Supporter, MetricScore, PitchData } from '@/lib/data'

type Phase = 'loading' | 'report'

const LOADING_STEPS = [
  'RUNNING VC METRIC MODELS...',
  'SCORING MARKET SIGNALS...',
  'GENERATING PITCH ANALYSIS...',
  'COMPOSING REPORT...',
]

export default function ReportPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [loadingStep, setLoadingStep] = useState(0)
  const [fillWidth, setFillWidth] = useState(0)
  const [idea, setIdea] = useState('')
  const [pitch, setPitch] = useState<PitchData | null>(null)
  const [scores, setScores] = useState<MetricScore[]>([])
  const [overall, setOverall] = useState(0)
  const [supporters, setSupporters] = useState<Supporter[]>([...BASE_SUPPORTERS])
  const [modalOpen, setModalOpen] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const storedIdea = sessionStorage.getItem('boffo_idea') || 'Your startup idea'
    setIdea(storedIdea)

    // Kick off loading bar
    setTimeout(() => setFillWidth(100), 50)

    // Cycle loading text
    let step = 0
    const si = setInterval(() => {
      step++
      if (step < LOADING_STEPS.length) setLoadingStep(step)
    }, 600)

    // Resolve to report
    setTimeout(() => {
      clearInterval(si)
      const generatedScores = generateScores()
      const avg = Math.round(generatedScores.reduce((a, b) => a + b.score, 0) / generatedScores.length)
      const pd = PITCH_DATA[Math.floor(Math.random() * PITCH_DATA.length)]
      setScores(generatedScores)
      setOverall(avg)
      setPitch(pd)
      setPhase('report')
    }, 2600)
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

        {pitch && (
          <div className="pitch-block">
            <div className="pitch-idea-title">{pitch.title}</div>
            <ul className="pitch-list">
              {pitch.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        )}

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
              Strong market pull detected across VC metrics. Founder-market fit is compelling. Real user demand signals are positive.
            </div>
          </div>
        </div>

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
