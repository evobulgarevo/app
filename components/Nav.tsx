'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function Nav() {
  const router = useRouter()
  const pathname = usePathname()

  const links = [
    { label: 'Home',       href: '/' },
    { label: 'Technology', href: '/technology' },
    { label: 'About',      href: '/about' },
    { label: 'Contact',    href: '/contact' },
  ]

  return (
    <nav>
      <div className="nav-inner">
        <div className="logo" onClick={() => router.push('/')}>BOFFO_</div>
        <ul className="nav-links">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a
                onClick={() => router.push(href)}
                data-active={pathname === href ? 'true' : 'false'}
                style={{ cursor: 'pointer' }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button className="nav-cta" onClick={() => router.push('/')}>
          Validate Idea <span style={{ fontSize: '8px', opacity: 0.5, marginLeft: '4px' }}>[PROTOTYPE V0.0.1]</span>
        </button>
      </div>
    </nav>
  )
}
