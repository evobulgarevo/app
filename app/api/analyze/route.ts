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
  try {
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
            content: `You are a startup analyst. Given a startup idea, return ONLY a JSON object with no explanation, no markdown, no code blocks. Just raw JSON like this:
{"industry":"E-Commerce","businessModel":"marketplace","categories":["resale","marketplace","footwear"],"keywords":["resale","secondhand","shoes"]}`
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
    let text = (data.choices?.[0]?.message?.content || '{}').trim()
    console.log('Groq raw response:', text)
    // Strip markdown code blocks if present
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(text)

    return {
      industry: parsed.industry || 'Technology',
      businessModel: parsed.businessModel || 'marketplace',
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    }
  } catch {
    return {
      industry: 'Technology',
      businessModel: 'marketplace',
      categories: [],
      keywords: idea.toLowerCase().split(' ').filter((w: string) => w.length > 4).slice(0, 3),
    }
  }
}

export async function POST(req: NextRequest) {
  const { idea } = await req.json()
  if (!idea) return NextResponse.json({ error: 'No idea provided' }, { status: 400 })

  const extracted = await extractWithGroq(idea)
  const { categories, keywords, industry, businessModel } = extracted

  const combined = [...categories, ...keywords]
  const searchTerms = Array.from(new Set(combined)).slice(0, 5)
  const primaryTerm = searchTerms[0] || ''

  if (!primaryTerm) {
    return NextResponse.json({
      industry,
      businessModel,
      searchTerms,
      similarStartups: [],
      ycStartups: [],
      fundingInsights: { totalDeals: 0, avgRoundSize: 0, totalFunding: 0, seedDeals: 0, seriesADeals: 0, topRound: 0 },
      investors: [],
    })
  }

  const categoryFilter = searchTerms.map(t => `data->>category_list.ilike.%${t}%`).join(',')

  const { data: similarStartups } = await supabase
    .from('raw_startups')
    .select('name, data')
    .or(categoryFilter)
    .limit(6)

  const ycFilter = searchTerms.map(t => `data->>oneLineDesc.ilike.%${t}%,data->>industries.ilike.%${t}%`).join(',')

  const { data: ycStartups } = await supabase
    .from('raw_startups')
    .select('name, data')
    .eq('source', 'yc')
    .or(ycFilter)
    .limit(4)

  const { data: fundingData } = await supabase
    .from('raw_funding_rounds')
    .select('name, data')
    .or(categoryFilter)
    .limit(20)

  const { data: investors } = await supabase
    .from('raw_investors')
    .select('name, data')
    .or(searchTerms.map(t => `name.ilike.%${t}%`).join(','))
    .limit(6)

  const fundingAmounts = (fundingData || [])
    .map((r: {data: Record<string, string>}) => parseFloat(r.data?.raised_amount_usd || r.data?.raised_amount || '0'))
    .filter((n: number) => n > 0)

  const avgFunding = fundingAmounts.length
    ? Math.round(fundingAmounts.reduce((a: number, b: number) => a + b, 0) / fundingAmounts.length)
    : 0

  const totalFunding = fundingAmounts.reduce((a: number, b: number) => a + b, 0)

  const roundTypes = (fundingData || [])
    .map((r: {data: Record<string, string>}) => r.data?.funding_round_type || r.data?.round_type)
    .filter(Boolean)

  const seedCount = roundTypes.filter((r: string) => r?.toLowerCase().includes('seed')).length
  const seriesACount = roundTypes.filter((r: string) =>
    r?.toLowerCase().includes('series_a') || r?.toLowerCase().includes('series a')
  ).length

  return NextResponse.json({
    industry,
    businessModel,
    searchTerms,
    similarStartups: (similarStartups || []).map((s: {name: string, data: Record<string, string>}) => ({
      name: s.name,
      category: s.data?.category_list || 'N/A',
      status: s.data?.status || 'Unknown',
      country: s.data?.country_code || 'N/A',
    })),
    ycStartups: (ycStartups || []).map((s: {name: string, data: Record<string, string>}) => ({
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
      topRound: fundingAmounts.length > 0 ? Math.max(...fundingAmounts) : 0,
    },
    investors: (investors || []).map((i: {name: string, data: Record<string, string>}) => ({
      name: i.name,
      type: i.data?.investor_types || i.data?.type || 'VC',
      country: i.data?.country_code || i.data?.country || 'N/A',
    })),
  })
}
