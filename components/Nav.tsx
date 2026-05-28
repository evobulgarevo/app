'use client'

import { useRouter } from 'next/navigation'

export default function Nav() {
  const router = useRouter()

  return (
    <nav>
      <div className="nav-inner">
        <div className="logo" onClick={() => router.push('/')}>BOFFO_</div>
        <ul className="nav-links" />
        <button className="nav-cta nav-cta--disabled" disabled>
          SIGN-UP / LOGIN<sup className="nav-cta-sup">coming soon</sup>
        </button>
      </div>
    </nav>
  )
}
