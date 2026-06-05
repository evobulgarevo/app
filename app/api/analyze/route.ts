import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { saveAnalysis } from '@/lib/supabase/analyses'

const supabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function callGroq(systemPrompt: string, userPrompt: string, maxTokens = 400): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    })
  })
  const data = await res.json()
  let text = (data.choices?.[0]?.message?.content || '').trim()
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()
  return text
}

async function extractCategories(idea: string) {
  const text = await callGroq(
    `You are a startup analyst. Return ONLY raw JSON, no markdown, no explanation.
The categories field MUST use only these exact values: software, web, ecommerce, games_video, mobile, advertising, consulting, enterprise, biotech, hardware, education, public_relations, network_hosting, search, cleantech, health, finance, social, security, medical, analytics, legal, travel, local, hospitality, news, semiconductor, manufacturing, sports, other
Example: {"industry":"E-Commerce","businessModel":"marketplace","categories":["ecommerce","web","social"],"keywords":["resale","secondhand","shoes"]}
Always return 2-3 categories and 3 keywords.`,
    `Startup idea: "${idea}"`
  )
  try {
    const parsed = JSON.parse(text)
    return {
      industry: parsed.industry || 'Technology',
      businessModel: parsed.businessModel || 'marketplace',
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    }
  } catch {
    return { industry: 'Technology', businessModel: 'marketplace', categories: [], keywords: [] }
  }
}

async function generateYCAnalysis(inputs: {
  idea: string
  traction: string
  technical: string
  team: string
  speed: string
  industry: string
  marketDeals: number
  avgRound: number
}) {
  const text = await callGroq(
    `You are a YC partner evaluating a startup application. Be direct, honest, and specific. Return ONLY raw JSON.
Format:
{
  "founderScore": 0-100,
  "founderFeedback": "2 sentences max, specific to their inputs",
  "marketScore": 0-100,
  "marketFeedback": "2 sentences max, data-driven",
  "tractionScore": 0-100,
  "tractionFeedback": "2 sentences max",
  "speedScore": 0-100,
  "speedFeedback": "1 sentence",
  "ycVerdict": "STRONG APPLY | APPLY WITH IMPROVEMENTS | NOT READY YET",
  "topStrength": "single biggest strength in 10 words",
  "topWeakness": "single biggest weakness in 10 words",
  "nextStep": "single most important action to take now in 15 words"
}`,
    `Idea: ${inputs.idea}
Traction: ${inputs.traction}
Technical ability: ${inputs.technical}
Team: ${inputs.team}
Execution speed: ${inputs.speed}
Industry: ${inputs.industry}
Similar companies in DB: ${inputs.marketDeals}
Avg funding in space: $${inputs.avgRound.toLocaleString()}`,
    600
  )
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { idea, traction, technical, team, speed } = body
  if (!idea) return NextResponse.json({ error: 'No idea provided' }, { status: 400 })

  const extracted = await extractCategories(idea)
  const { categories, keywords, industry, businessModel } = extracted
  const combined = [...categories, ...keywords]
  const searchTerms = Array.from(new Set(combined)).slice(0, 5)
  const primaryTerm = searchTerms[0] || ''

  let similarStartups: {name: string, data: Record<string, string>}[] = []
  let ycStartups: {name: string, data: Record<string, string>}[] = []
  let fundingData: {name: string, data: Record<string, string>}[] = []
  let investors: {name: string, data: Record<string, string>}[] = []

  if (primaryTerm) {
    const categoryFilter = searchTerms.map(t => `data->>category_code.eq.${t}`).join(',')
    const ycFilter = searchTerms.map(t => `data->>oneLineDesc.ilike.%${t}%,data->>industries.ilike.%${t}%`).join(',')

    const [s, y, f, i] = await Promise.all([
      supabase.from('raw_startups').select('name, data').or(categoryFilter).gt('data->>funding_total_usd', '0').order('data->funding_total_usd', { ascending: false }).limit(6),
      supabase.from('raw_startups').select('name, data').eq('source', 'yc').or(ycFilter).limit(4),
      supabase.from('raw_funding_rounds').select('name, data').or(categoryFilter).limit(20),
      supabase.from('raw_investors').select('name, data').or(searchTerms.map(t => `name.ilike.%${t}%`).join(',')).limit(6),
    ])

    similarStartups = s.data || []
    ycStartups = y.data || []
    fundingData = f.data || []
    investors = i.data || []
  }

  const fundingAmounts = fundingData
    .map(r => parseFloat(r.data?.raised_amount_usd || r.data?.raised_amount || '0'))
    .filter(n => n > 0)

  const avgFunding = fundingAmounts.length
    ? Math.round(fundingAmounts.reduce((a, b) => a + b, 0) / fundingAmounts.length)
    : 0

  const totalFunding = fundingAmounts.reduce((a, b) => a + b, 0)
  const roundTypes = fundingData.map(r => r.data?.funding_round_type || r.data?.round_type).filter(Boolean)
  const seedCount = roundTypes.filter(r => r?.toLowerCase().includes('seed')).length
  const seriesACount = roundTypes.filter(r => r?.toLowerCase().includes('series_a') || r?.toLowerCase().includes('series a')).length

  const ycAnalysis = await generateYCAnalysis({
    idea,
    traction: traction || 'Not specified',
    technical: technical || 'Not specified',
    team: team || 'Not specified',
    speed: speed || 'Not specified',
    industry,
    marketDeals: fundingAmounts.length,
    avgRound: avgFunding,
  })

  const responsePayload = {
    industry,
    businessModel,
    searchTerms,
    ycAnalysis,
    similarStartups: similarStartups.map(s => ({
      name: s.name,
      category: s.data?.category_code || 'N/A',
      status: s.data?.status || 'Unknown',
      country: s.data?.country_code || 'N/A',
      funding: s.data?.funding_total_usd || '0',
    })),
    ycStartups: ycStartups.map(s => ({
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
    investors: investors.map(i => ({
      name: i.name,
      type: i.data?.investor_types || i.data?.type || 'VC',
      country: i.data?.country_code || i.data?.country || 'N/A',
    })),
  }

  const overallScore = ycAnalysis
    ? Math.round((ycAnalysis.founderScore + ycAnalysis.marketScore + ycAnalysis.tractionScore + ycAnalysis.speedScore) / 4)
    : 0

  const analysisId = await saveAnalysis({
    idea,
    inputs: { traction, technical, team, speed },
    result: responsePayload,
    score: overallScore,
  })

  return NextResponse.json({ ...responsePayload, analysisId })
}
