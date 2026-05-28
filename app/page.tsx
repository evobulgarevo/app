'use client'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const QUESTIONS = [
  {
    id: 'idea',
    label: 'WHAT PAIN POINT DOES YOUR IDEA SOLVE?',
    placeholder: 'e.g. reduces churn for SaaS companies...',
    type: 'input',
  },
  {
    id: 'traction',
    label: 'WHAT IS YOUR CURRENT TRACTION?',
    placeholder: 'e.g. 50 beta users, $2K MRR, just an idea...',
    type: 'input',
  },
  {
    id: 'technical',
    label: 'CAN YOU BUILD THIS YOURSELF?',
    options: ['Yes — I am technical', 'Partly — some technical skills', 'No — I need a technical co-founder'],
    type: 'select',
  },
  {
    id: 'team',
    label: 'TEAM SIZE',
    options: ['Solo founder', '2 founders', '3+ founders'],
    type: 'select',
  },
  {
    id: 'speed',
    label: 'HOW FAST HAVE YOU MOVED SO FAR?',
    options: ['Idea only — nothing built yet', 'Built something in < 1 month', 'Shipping and iterating weekly'],
    type: 'select',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const current = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1

  function handleNext(value?: string) {
    const val = value || answers[current.id] || ''
    if (!val.trim()) return
    const updated = { ...answers, [current.id]: val }
    setAnswers(updated)
    if (isLast) {
      sessionStorage.setItem('boffo_idea', updated.idea)
      sessionStorage.setItem('boffo_data', JSON.stringify(updated))
      router.push('/report')
    } else {
      setStep(s => s + 1)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleNext()
  }

  const progress = ((step) / QUESTIONS.length) * 100

  return (
    <>
      <Nav />
      <div className="wrap page-enter">
        <section className="hero">

          {/* ── two-column layout ── */}
          <div className="hero-cols">

            {/* LEFT: hero copy */}
            <div className="hero-left">
              <div className="eyebrow">Demand validation engine</div>
              <p className="hero-sub">
                Boffo fine-tunes models &amp; uses precise context engineering to validate demand against must-have VC metrics &amp; real user data.
              </p>
              <div className="poc-disclaimer">
                <div className="poc-version">VERSION 0.0.0.1 — PROOF OF CONCEPT</div>
                <p className="poc-text">
                  This is an early-stage POC. Validation is run against a dataset of 200,000+ startups, 50,000+ funding rounds, and 80,000+ investment records.
                </p>
                <p className="poc-note">
                  ⚠ Dataset sourced from 2010 onwards. Results reflect historical market patterns and may not capture emerging trends or recent market shifts.
                </p>
              </div>
            </div>

            {/* RIGHT: form */}
            <div className="hero-right">
              <div className="validate-box">
                <div className="systems-go">
                  ALL SYSTEMS GO<span className="cursor-blink">_</span>
                </div>

                <div className="intake-progress">
                  <div className="intake-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="intake-step-label">STEP {step + 1} OF {QUESTIONS.length}</div>
                <div className="intake-question">{current.label}</div>

                {current.type === 'input' && (
                  <div className="validate-row">
                    <input
                      key={current.id}
                      className="validate-input"
                      type="text"
                      placeholder={current.placeholder}
                      value={answers[current.id] || ''}
                      onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <button className="validate-btn" onClick={() => handleNext()}>
                      {isLast ? 'VALIDATE' : 'PROCEED'} <span className="btn-arrow">▶</span>
                    </button>
                  </div>
                )}

                {current.type === 'select' && (
                  <div className="select-options">
                    {current.options!.map(opt => (
                      <button
                        key={opt}
                        className={`select-option ${answers[current.id] === opt ? 'selected' : ''}`}
                        onClick={() => handleNext(opt)}
                      >
                        <span className="option-arrow">›</span> {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>{/* end hero-cols */}

          <div className="stats-row">
            <div className="stat"><div className="stat-num">50M+</div><div className="stat-label">Startups launch every year.</div></div>
            <div className="stat"><div className="stat-num">42%</div><div className="stat-label">Fail due to no market need.</div></div>
            <div className="stat"><div className="stat-num">300B+</div><div className="stat-label">Invested into startups annually ($$$).</div></div>
            <div className="stat"><div className="stat-num">0</div><div className="stat-label">Structured validation by most founders.</div></div>
          </div>

        </section>
      </div>
      <Footer />
    </>
  )
}
