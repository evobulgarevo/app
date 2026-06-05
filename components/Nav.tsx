'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'ACCOUNT'

  return (
    <nav>
      <div className="nav-inner">
        <div className="logo" onClick={() => router.push('/')}>
          BOFFO<span className="logo-cursor" />
        </div>

        {user ? (
          <div className="nav-user-menu" style={{ marginLeft: 'auto' }}>
            <button
              className="nav-cta"
              onClick={() => setMenuOpen(o => !o)}
            >
              {displayName.toUpperCase()}
              <span style={{ marginLeft: 6, fontSize: 8, opacity: 0.5 }}>▾</span>
            </button>
            {menuOpen && (
              <>
                <div className="nav-menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="nav-dropdown">
                  <div className="nav-dropdown-email">{user.email}</div>
                  <button className="nav-dropdown-item" onClick={handleSignOut}>
                    SIGN OUT
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button className="nav-cta" style={{ marginLeft: 'auto' }} onClick={() => router.push('/login')}>
            SIGN UP / LOGIN
          </button>
        )}
      </div>
    </nav>
  )
}
