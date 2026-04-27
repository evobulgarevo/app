'use client'

import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function ContactPage() {
  return (
    <>
      <Nav />
      <div className="wrap page-enter">
        <div className="inner-hero">
          <div className="inner-tag">CONTACT</div>
          <div className="inner-h1">Let&apos;s talk demand.</div>
          <p className="inner-sub">Whether you&apos;re validating an idea, building an accelerator integration, or just want to know how the scoring works — we&apos;re here.</p>
        </div>
        <div className="content-block">
          <div className="block-label">Send a message</div>
          <div className="contact-field">
            <label className="field-label">Name</label>
            <input className="field-input" type="text" placeholder="Your name" />
          </div>
          <div className="contact-field">
            <label className="field-label">Email</label>
            <input className="field-input" type="email" placeholder="you@company.com" />
          </div>
          <div className="contact-field">
            <label className="field-label">Message</label>
            <textarea className="field-input" placeholder="Tell us what you&apos;re building..." />
          </div>
          <button
            className="submit-btn"
            onClick={() => alert("Message sent — we'll be in touch within 24 hours.")}
          >
            SEND MESSAGE
          </button>
        </div>
        <div className="content-block">
          <div className="block-label">Direct</div>
          <p className="block-body">hello@boffo.ai &nbsp;·&nbsp; @boffo_validate &nbsp;·&nbsp; SF / Remote</p>
        </div>
      </div>
      <Footer />
    </>
  )
}
