'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  async function handleEmailAuth() {
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccessMsg('Check your email to confirm your account.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  async function handleGoogleAuth() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo" onClick={() => router.push('/')}>BOFFO_</div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccessMsg('') }}
          >
            LOGIN
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setSuccessMsg('') }}
          >
            SIGN UP
          </button>
        </div>

        <button className="auth-google-btn" onClick={handleGoogleAuth}>
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M47.532 24.552c0-1.636-.132-3.228-.388-4.776H24.48v9.03h12.984c-.56 3.02-2.252 5.576-4.8 7.292v6.06h7.772c4.548-4.192 7.096-10.368 7.096-17.606z" fill="#4285F4"/>
            <path d="M24.48 48c6.516 0 11.984-2.156 15.98-5.844l-7.772-6.06c-2.156 1.444-4.916 2.3-8.208 2.3-6.312 0-11.66-4.26-13.572-9.988H2.876v6.256C6.856 42.572 15.124 48 24.48 48z" fill="#34A853"/>
            <path d="M10.908 28.408A14.44 14.44 0 0 1 10.16 24c0-1.54.264-3.032.748-4.408v-6.256H2.876A23.97 23.97 0 0 0 .48 24c0 3.868.924 7.528 2.396 10.664l8.032-6.256z" fill="#FBBC05"/>
            <path d="M24.48 9.604c3.556 0 6.748 1.224 9.264 3.624l6.948-6.948C36.46 2.396 30.996 0 24.48 0 15.124 0 6.856 5.428 2.876 13.336l8.032 6.256C12.82 13.864 18.168 9.604 24.48 9.604z" fill="#EA4335"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <div className="auth-divider"><span>OR</span></div>

        {successMsg ? (
          <div className="auth-success">{successMsg}</div>
        ) : (
          <>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              className="auth-submit-btn"
              onClick={handleEmailAuth}
              disabled={loading}
            >
              {loading ? 'LOADING...' : mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
