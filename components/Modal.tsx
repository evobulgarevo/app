'use client'

import { useState, useRef, useEffect } from 'react'
import { Supporter } from '@/lib/data'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (supporter: Supporter) => void
}

export default function Modal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [success, setSuccess] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) setSuccess(false)
  }, [isOpen])

  function processPayment() {
    const name = nameRef.current?.value.trim() || 'Anonymous'
    setSuccess(true)
    setTimeout(() => {
      onSuccess({ name, date: 'just now', badge: 'EARLY' })
      onClose()
    }, 2200)
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>

        {success ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <div className="success-text">Payment confirmed.</div>
            <p className="success-sub">
              You&apos;re now a Visionary Supporter.<br />
              {nameRef.current?.value.trim() || 'Anonymous'} has been added to the list.<br /><br />
              Stripe receipt sent to your email.
            </p>
          </div>
        ) : (
          <>
            <div className="modal-title">Become a Visionary Supporter</div>
            <p className="modal-sub">
              You&apos;re committing $1 as a real demand signal. You&apos;ll be listed publicly as a founding supporter of this idea.
            </p>
            <div className="modal-field">
              <label className="modal-label">Name (shown publicly)</label>
              <input ref={nameRef} className="modal-input" type="text" placeholder="Your name" />
            </div>
            <div className="modal-field">
              <label className="modal-label">Email</label>
              <input className="modal-input" type="email" placeholder="you@company.com" />
            </div>
            <div className="modal-field">
              <label className="modal-label">Card number</label>
              <input className="modal-input" type="text" placeholder="4242 4242 4242 4242" maxLength={19} />
            </div>
            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Expiry</label>
                <input className="modal-input" type="text" placeholder="MM / YY" maxLength={7} />
              </div>
              <div className="modal-field">
                <label className="modal-label">CVC</label>
                <input className="modal-input" type="text" placeholder="123" maxLength={3} />
              </div>
            </div>
            <button className="modal-pay-btn" onClick={processPayment}>PAY $1.00 — CONFIRM DEMAND</button>
            <div className="modal-stripe-note">POWERED BY STRIPE · SECURE · ENCRYPTED</div>
          </>
        )}
      </div>
    </div>
  )
}
