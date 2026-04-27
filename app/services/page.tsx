import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const services = [
  { icon: '01', name: 'IDEA VALIDATION', desc: 'Fine-tuned models evaluate your pain point against real market signals. Get a score, a verdict, and a breakdown — not a gut feel.' },
  { icon: '02', name: 'VC METRIC SCORING', desc: '5 must-have VC evaluation criteria modeled in real-time: TAM, pain intensity, competition, traction proxy, and founder fit.' },
  { icon: '03', name: 'LANDING PAGE BUILD', desc: 'Boffo auto-generates a minimal, high-conversion landing page built around your 15-second elevator pitch and key metrics.' },
  { icon: '04', name: 'DEMAND CAPTURE', desc: 'Stripe-integrated $1 commitment flow converts curiosity into real signal. Every payer is a data point. Every list is proof of demand.' },
]

export default function ServicesPage() {
  return (
    <>
      <Nav />
      <div className="wrap page-enter">
        <div className="inner-hero">
          <div className="inner-tag">SERVICES</div>
          <div className="inner-h1">The full stack of validation.</div>
          <p className="inner-sub">Four precision tools, one integrated workflow. Go from pain-point hypothesis to funded landing page in under 60 seconds.</p>
        </div>
        <div className="service-grid">
          {services.map(s => (
            <div className="service-card" key={s.icon}>
              <div className="service-icon">{s.icon}</div>
              <div className="service-name">{s.name}</div>
              <p className="service-desc">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="content-block">
          <div className="block-label">Pricing</div>
          <p className="block-body">Boffo runs on a simple model: validate free, publish at cost. One validation is always free. Publish your landing page and capture demand for $29/month. Enterprise plans available for VC firms and accelerators.</p>
        </div>
      </div>
      <Footer />
    </>
  )
}
