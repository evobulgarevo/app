'use client'

import { useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function runValidation() {
    const value = inputRef.current?.value.trim()
    if (!value) { inputRef.current?.focus(); return }
    // Store idea in sessionStorage for the report page to pick up
    sessionStorage.setItem('boffo_idea', value)
    router.push('/report')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') runValidation()
  }

  return (
    <>
      <Nav />
      <div className="wrap page-enter">
        <section className="hero">
          <div className="eyebrow">Demand validation engine</div>
          <div className="hero-h1-wrap">
            <div className="h1-ghost r" aria-hidden="true">VALIDATE DEMAND{'\n'}BEFORE YOU BUILD.</div>
            <div className="h1-ghost b" aria-hidden="true">VALIDATE DEMAND{'\n'}BEFORE YOU BUILD.</div>
            <h1>VALIDATE DEMAND<br />BEFORE YOU BUILD.</h1>
          </div>
          <p className="hero-sub">
            Boffo fine-tunes models &amp; uses precise context engineering to validate demand against must-have VC metrics &amp; real user data.
          </p>
          <div className="validate-box">
            <div className="validate-row">
              <input
                ref={inputRef}
                className="validate-input"
                type="text"
                placeholder="What pain point does your idea solve?"
                onKeyDown={handleKeyDown}
              />
              <button className="validate-btn" onClick={runValidation}>VALIDATE</button>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat"><div className="stat-num">847</div><div className="stat-label">Ideas validated</div></div>
            <div className="stat"><div className="stat-num">92%</div><div className="stat-label">Accuracy rate</div></div>
            <div className="stat"><div className="stat-num">$4.2M</div><div className="stat-label">Funding raised</div></div>
            <div className="stat"><div className="stat-num">3.1K</div><div className="stat-label">Visionaries</div></div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
