import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function extractWithGroq(idea: string): Promise<{
  categories: string[]
  keywords: string[]
  industry: string
  businessModel: string
}> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are a startup analyst. Given a startup idea, extract structured data.
Return ONLY a JSON object with no explanation, no markdown, no code blocks. Just raw JSON.
Format:
{
  "industry": "single industry name e.g. E-Commerce, HealthTech, FinTech",
  "businessModel": "e.g. marketplace, saas, consumer, b2b",
  "categories": ["3-5 short category tags used in startup databases e.g. resale, marketplace, footwear, fashion"],
  "keywords": ["3-5 keywords to search startup databases with e.g. resale, secondhand, shoes"]
}`
        },
        {
          role: 'user',
          content: `Startup idea: "${idea}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 200,
    })
  })

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'

  try {
    return JSON.parse(text)
  } catch {
    // fallback if JSON parse fails
    return {
      industry: 'Technology',
      businessModel: 'marketplace',
      categories: [],
      keywords: idea.toLowerCase().split(' ').filter(w => w.length > 4).slice(0, 3)
    }
  }
}

export async function POST(req: NextRequest) {
  const { idea } = await req.json()
  if (!idea) return NextResponse.json({ error: 'No idea provided' }, { status: 400 })

  // Use Groq to intelligently extract search terms
  const extracted = await extractWithGroq(idea)
  const { categories, keywords, industry, businessModel } = extracted

  const searchTerms = [...new Set([...categories, ...keywords])].slice(0, 5)
  const primaryTerm = searchTerms[0] || ''
  const secondaryTerm = searchTerms[1] || ''

  // Find similar startups by category
  const categoryFilter = searchTerms
    .map(t => `data->>category_list.ilike.%${t}%`)
    .join(',')

  const { data: similarStartups } = await supabase
    .from('raw_startups')
    .select('name, data')
    .or(categoryFilter)
    .limit(6)

  // Find YC startups
  const ycFilter = searchTerms
    .map(t => `data->>oneLineDesc.ilike.%${t}%,data->>industries.ilike.%${t}%`)
    .join(',')

  const { data: ycStartups } = await supabase
    .from('raw_startups')
    .select('name, data')
    .eq('source', 'yc')
    .or(ycFilter)
    .limit(4)

  // Get funding data
  const { data: fundingData } = await supabase
    .from('raw_funding_rounds')
    .select('name, data')
    .or(categoryFilter)
    .limit(20)

  // Get investors
  const { data: investors } = await supabase
    .from('raw_investors')
    .select('name, data')
    .or(searchTerms.map(t => `name.ilike.%${t}%`).join(','))
    .limit(6)

  // Funding stats
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
  const seriesACount = roundTypes.filter(r =>
    r?.toLowerCase().includes('series_a') || r?.toLowerCase().includes('series a')
  ).length

  return NextResponse.json({
    industry,
    businessModel,
    searchTerms,
    similarStartups: (similarStartups || []).map(s => ({
      name: s.name,
      category: s.data?.category_list || s.data?.industries?.[0] || 'N/A',
      status: s.data?.status || 'Unknown',
      country: s.data?.country_code || s.data?.country || 'N/A',
    })),
    ycStartups: (ycStartups || []).map(s => ({
      name: s.name,
      batch: s.data?.batch || 'N/A',
      description: s.data?.oneLineDesc || '',
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
  })
}
