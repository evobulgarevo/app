'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function Nav() {
  const router = useRouter()
  const pathname = usePathname()

  const links = [
    { label: 'ABOUT',      href: '/about' },
    { label: 'SERVICES',   href: '/services' },
    { label: 'TECHNOLOGY', href: '/technology' },
    { label: 'CONTACT',    href: '/contact' },
  ]

  return (
    <nav>
      <div className="nav-inner">
        <div className="logo" onClick={() => router.push('/')}>BOFFO</div>
        <ul className="nav-links">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a
                data-text={label}
                onClick={() => router.push(href)}
                style={{ color: pathname === href ? 'var(--accent)' : undefined }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
