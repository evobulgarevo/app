import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function extractKeywords(idea: string): string[] {
  const stopwords = new Set(['a','an','the','and','or','for','to','of','in','on','with','is','that','this','i','my','we','our','it','are','be','as','by'])
  return idea
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(w => w.length > 3 && !stopwords.has(w))
    .slice(0, 5)
}

export async function POST(req: NextRequest) {
  const { idea } = await req.json()
  if (!idea) return NextResponse.json({ error: 'No idea provided' }, { status: 400 })

  const keywords = extractKeywords(idea)
  const searchTerm = keywords[0] || idea.split(' ')[0]

  // Find similar startups
  const { data: similarStartups } = await supabase
    .from('raw_startups')
    .select('name, data')
    .or(keywords.map(k => `name.ilike.%${k}%`).join(','))
    .limit(6)

  // Find YC startups in similar space
  const { data: ycStartups } = await supabase
    .from('raw_startups')
    .select('name, data')
    .eq('source', 'yc')
    .or(keywords.map(k => `name.ilike.%${k}%`).join(','))
    .limit(4)

  // Get funding data for similar companies
  const { data: fundingData } = await supabase
    .from('raw_funding_rounds')
    .select('name, data')
    .or(keywords.map(k => `name.ilike.%${k}%`).join(','))
    .limit(10)

  // Get relevant investors
  const { data: investors } = await supabase
    .from('raw_investors')
    .select('name, data')
    .or(keywords.map(k => `name.ilike.%${k}%`).join(','))
    .limit(6)

  // Compute funding stats
  const fundingAmounts = (fundingData || [])
    .map(r => parseFloat(r.data?.raised_amount_usd || r.data?.raised_amount || '0'))
    .filter(n => n > 0)

  const avgFunding = fundingAmounts.length
    ? Math.round(fundingAmounts.reduce((a, b) => a + b, 0) / fundingAmounts.length)
    : 0

  const totalFunding = fundingAmounts.reduce((a, b) => a + b, 0)

  const roundTypes = (fundingData || [])
    .map(r => r.data?.funding_round_type || r.data?.round_type)
    .filter(Boolean)

  const seedCount = roundTypes.filter(r => r?.toLowerCase().includes('seed')).length
  const seriesACount = roundTypes.filter(r => r?.toLowerCase().includes('series_a') || r?.toLowerCase().includes('series a')).length

  return NextResponse.json({
    similarStartups: (similarStartups || []).map(s => ({
      name: s.name,
      category: s.data?.category_list || s.data?.industries?.[0] || s.data?.subindustry || 'N/A',
      status: s.data?.status || s.data?.operatingStatus || 'Unknown',
      country: s.data?.country_code || s.data?.country || 'N/A',
      source: s.data?.source || 'kaggle',
    })),
    ycStartups: (ycStartups || []).map(s => ({
      name: s.name,
      batch: s.data?.batch || 'N/A',
      description: s.data?.oneLineDesc || s.data?.longDesc?.slice(0, 100) || '',
      status: s.data?.status || 'Active',
    })),
    fundingInsights: {
      totalDeals: fundingAmounts.length,
      avgRoundSize: avgFunding,
      totalFunding,
      seedDeals: seedCount,
      seriesADeals: seriesACount,
      topRound: Math.max(...fundingAmounts, 0),
    },
    investors: (investors || []).map(i => ({
      name: i.name,
      type: i.data?.investor_types || i.data?.type || 'VC',
      country: i.data?.country_code || i.data?.country || 'N/A',
    })),
    keywords,
    searchTerm,
  })
}
