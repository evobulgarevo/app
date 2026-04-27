import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <>
      <Nav />
      <div className="wrap page-enter">
        <div className="inner-hero">
          <div className="inner-tag">ABOUT BOFFO</div>
          <div className="inner-h1">Built for builders who ship.</div>
          <p className="inner-sub">
            Boffo is a demand validation engine for founders who refuse to build in the dark. We combine fine-tuned language models with precision context engineering to give you the signal before you write a single line of code.
          </p>
        </div>
        <div className="content-block">
          <div className="block-label">The problem</div>
          <p className="block-body">72% of startups fail because they build something nobody wants. Traditional market research takes months and costs tens of thousands of dollars. By the time insights land, the market has moved. Boffo compresses this into seconds.</p>
        </div>
        <div className="content-block">
          <div className="block-label">Our approach</div>
          <p className="block-body">We don&apos;t guess. We model. Every idea is stress-tested against a curated library of VC-grade evaluation frameworks, cross-referenced against real market behavior, competitor momentum, and early user signal patterns. The output is a viability score with teeth.</p>
        </div>
        <div className="content-block">
          <div className="block-label">Who we&apos;re for</div>
          <p className="block-body">Solo founders. Early-stage teams. Operators going independent. Investors vetting deal flow. Anyone who needs a fast, honest answer before committing time, money, and reputation to an idea.</p>
        </div>
        <div className="content-block">
          <div className="block-label">The name</div>
          <p className="block-body">Boffo: an old showbiz term for a smash hit. We named it after the outcome every founder is chasing — and the thing most never validate before they start building.</p>
        </div>
      </div>
      <Footer />
    </>
  )
}
