'use client'

import { useRouter, usePathname } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const NAV_ITEMS = [
  { label: 'Ideas',       icon: '◈', href: '/ideas' },
  { label: 'Validations', icon: '◎', href: null },
  { label: 'Iterations',  icon: '⟳', href: null },
  { label: 'Analytics',   icon: '▦', href: null },
  { label: "MVP's",       icon: '◆', href: null },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="sidebar-shell">
      <div className="sidebar-shell-nav"><Nav /></div>
      <div className="sidebar">
        <div className="sidebar-label">COMMAND CENTER</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ label, icon, href }) => {
            const isActive = href && pathname.startsWith(href)
            const isDisabled = !href
            return (
              <a
                key={label}
                className={[
                  'sidebar-link',
                  isDisabled ? 'sidebar-link--disabled' : '',
                  isActive ? 'sidebar-link--active' : '',
                ].join(' ')}
                onClick={href ? () => router.push(href) : undefined}
                style={{ cursor: href ? 'pointer' : 'default' }}
              >
                <span className="sidebar-icon">{icon}</span>
                <span className="sidebar-link-text">{label}</span>
                {isDisabled && <span className="sidebar-soon">soon</span>}
                {isActive && <span className="sidebar-active-dot" />}
              </a>
            )
          })}
        </nav>
      </div>
      <div className="sidebar-shell-footer"><Footer /></div>
    </div>
  )
}
