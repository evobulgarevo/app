export interface Supporter {
  name: string
  date: string
  badge: string
}

export interface PitchData {
  title: string
  bullets: string[]
}

export interface MetricScore {
  name: string
  score: number
  cls: 'high' | 'mid' | 'low'
}

export const BASE_SUPPORTERS: Supporter[] = [
  { name: 'Yuki Tanaka',  date: '2h ago',  badge: 'EARLY' },
  { name: 'Marcus Webb',  date: '5h ago',  badge: 'EARLY' },
  { name: 'Priya Nair',   date: '11h ago', badge: '' },
  { name: 'Tom Erikson',  date: '1d ago',  badge: '' },
  { name: 'Layla Hassan', date: '2d ago',  badge: '' },
  { name: 'Dev Patel',    date: '3d ago',  badge: '' },
  { name: 'Soo-Jin Park', date: '4d ago',  badge: '' },
]

export const PITCH_DATA: PitchData[] = [
  {
    title: 'Unified Knowledge Retrieval for Knowledge Workers',
    bullets: [
      'Most professionals waste 4+ hours weekly hunting through scattered files, emails, and tools.',
      "Information fragmentation is the invisible tax on every knowledge worker's output.",
      'Unifying retrieval across all personal data sources with AI-native search turns lost time into recaptured leverage.',
      'Early signals show 3× productivity gains within the first week of adoption.',
    ],
  },
  {
    title: 'Zero-Cost Brand Identity for Pre-Revenue Founders',
    bullets: [
      'Founders spend $10K–$80K on branding before validating a single assumption.',
      'This eliminates the upfront design cost problem entirely for early-stage teams.',
      'Brand identities are auto-generated and tied to validated market positioning.',
      'You ship a real, investor-ready identity the same day demand is confirmed.',
    ],
  },
  {
    title: 'AI-Powered Care Coordination Layer for Healthcare Handoffs',
    bullets: [
      'Healthcare coordination failures cost the US $935B annually — mostly at the handoff.',
      'The moment care moves between providers, critical information stops moving with it.',
      'A lightweight AI layer surfaces the right context to the right clinician in real time.',
      'Early pilots show a 40% reduction in duplicate diagnostics and 28% fewer adverse events.',
    ],
  },
  {
    title: 'Continuous Ambient Onboarding for Enterprise Software Adoption',
    bullets: [
      'Enterprise software adoption fails 70% of the time due to change resistance.',
      'Traditional onboarding is a one-time event — users forget 80% within a week.',
      'This reframes onboarding as a continuous coaching loop embedded in real workflow.',
      'Every interaction becomes a micro-training moment without disrupting existing behavior.',
    ],
  },
]

export function generateScores(): MetricScore[] {
  return [
    { name: 'TOTAL\nADDRESSABLE\nMARKET', score: 78 + Math.floor(Math.random() * 18), cls: 'high' },
    { name: 'PAIN\nSEVERITY',              score: 82 + Math.floor(Math.random() * 15), cls: 'high' },
    { name: 'COMPETITIVE\nINTENSITY',      score: 55 + Math.floor(Math.random() * 25), cls: 'mid' },
    { name: 'TRACTION\nPROXY',             score: 60 + Math.floor(Math.random() * 30), cls: 'mid' },
    { name: 'FOUNDER\nMARKET FIT',         score: 70 + Math.floor(Math.random() * 25), cls: 'high' },
  ]
}
