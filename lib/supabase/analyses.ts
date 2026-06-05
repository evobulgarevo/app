import { createClient } from './server'

export interface SavedAnalysis {
  id: string
  idea: string
  result: object
  score: number | null
  created_at: string
}

export async function saveAnalysis({
  idea,
  inputs,
  result,
  score,
}: {
  idea: string
  inputs: Record<string, string>
  result: object
  score: number
}): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: user.id,
      idea,
      traction: inputs.traction,
      technical: inputs.technical,
      team: inputs.team,
      speed: inputs.speed,
      result,
      score,
    })
    .select('id')
    .single()

  if (error) { console.error('saveAnalysis error:', error.message); return null }
  return data.id
}

export async function getUserAnalyses(): Promise<SavedAnalysis[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('analyses')
    .select('id, idea, result, score, created_at')
    .order('created_at', { ascending: false })

  if (error) { console.error('getUserAnalyses error:', error.message); return [] }
  return data ?? []
}

export async function getAnalysisById(id: string): Promise<SavedAnalysis | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('analyses')
    .select('id, idea, result, score, created_at')
    .eq('id', id)
    .single()

  if (error) { return null }
  return data
}
