import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const techItems = [
  {
    num: '01',
    name: 'FINE-TUNED DOMAIN MODELS',
    desc: 'Base models fine-tuned on curated datasets of VC deal memos, startup post-mortems, and market research. The model knows what killed 10,000 startups before yours.',
  },
  {
    num: '02',
    name: 'PRECISION CONTEXT ENGINEERING',
    desc: 'Not prompt engineering — context engineering. We construct a full analytical environment: competitor signals, market proxies, user behavior patterns, and economic timing. The model sees the whole picture.',
  },
  {
    num: '03',
    name: 'VC METRIC FRAMEWORK',
    desc: 'Five scoring dimensions built from analysis of 3,000+ VC deal decisions: Total Addressable Market, Problem Severity, Competitive Intensity, Traction Proximity, and Founder-Market Fit. Each scored 0–100 independently, then weighted into a composite.',
  },
  {
    num: '04',
    name: 'REAL-TIME DEMAND SIGNAL',
    desc: 'Stripe integration isn\'t cosmetic. Every $1 payment is a behavioral commitment — qualitatively different from a newsletter signup or an upvote. We track conversion rate, dwell time, and abandonment as secondary signals.',
  },
  {
    num: '05',
    name: 'LANDING PAGE SYNTHESIS',
    desc: 'Auto-generated pages are produced from the same context used for scoring. The pitch, metrics, and copy are structurally consistent — not separately prompted. One source of truth, one coherent product story.',
  },
]

export default function TechnologyPage() {
  return (
    <>
      <Nav />
      <div className="wrap page-enter">
        <div className="inner-hero">
          <div className="inner-tag">TECHNOLOGY</div>
          <div className="inner-h1">Under the hood.</div>
          <p className="inner-sub">Precision context engineering meets fine-tuned domain knowledge. Here&apos;s what actually runs when you hit validate.</p>
        </div>
        {techItems.map(t => (
          <div className="tech-item" key={t.num}>
            <div className="tech-num">{t.num}</div>
            <div>
              <div className="tech-name">{t.name}</div>
              <p className="tech-desc">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  )
}
