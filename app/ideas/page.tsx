'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/client'

interface SavedAnalysis {
  id: string
  idea: string
  score: number | null
  created_at: string
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null
  const cls = score >= 75 ? 'high' : score >= 55 ? 'mid' : 'low'
  return <span className={`ideas-score-badge ideas-score-badge--${cls}`}>{score}</span>
}

export default function IdeasPage() {
  const router = useRouter()
  const supabase = createClient()
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }

      supabase
        .from('analyses')
        .select('id, idea, score, created_at')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setAnalyses(data ?? [])
          setLoading(false)
        })
    })
  }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell page-enter">
        <div className="main-shell-nav"><Nav /></div>
        <div className="main-content">
          <div className="ideas-shell">

            <div className="ideas-header">
              <div className="ideas-breadcrumb">
                <span className="ideas-breadcrumb-item" onClick={() => router.push('/')}>HOME</span>
                <span className="ideas-breadcrumb-sep">›</span>
                <span className="ideas-breadcrumb-item ideas-breadcrumb-item--active">IDEAS</span>
              </div>
              <div className="ideas-title-row">
                <div className="ideas-page-title">IDEAS</div>
                <button className="ideas-new-btn" onClick={() => router.push('/')}>+ NEW IDEA</button>
              </div>
            </div>

            {loading && (
              <div className="ideas-loading">
                <div className="ideas-loading-bar">
                  <div className="ideas-loading-fill" style={{ width: '60%' }} />
                </div>
                <div className="ideas-loading-label">LOADING YOUR IDEAS...</div>
              </div>
            )}

            {!loading && analyses.length === 0 && (
              <div className="ideas-empty">
                <div className="ideas-empty-icon">◈</div>
                <div className="ideas-empty-title">NO IDEAS YET</div>
                <p className="ideas-empty-sub">Submit your first idea to see your demand analysis report here.</p>
                <button className="validate-btn" style={{ maxWidth: 280 }} onClick={() => router.push('/')}>
                  VALIDATE AN IDEA <span className="btn-arrow">▶</span>
                </button>
              </div>
            )}

            {!loading && analyses.length > 0 && (
              <div className="ideas-list">
                {analyses.map((a, i) => (
                  <div
                    key={a.id}
                    className="ideas-list-row"
                    onClick={() => router.push(`/report?id=${a.id}`)}
                  >
                    <div className="ideas-list-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="ideas-list-info">
                      <div className="ideas-list-idea">{a.idea}</div>
                      <div className="ideas-list-date">{formatDate(a.created_at)}</div>
                    </div>
                    <ScoreBadge score={a.score} />
                    <div className="ideas-list-arrow">›</div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
        <div className="main-shell-footer"><Footer /></div>
      </div>
    </div>
  )
}
