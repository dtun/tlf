import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../_lib/admin'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
  try {
    const { userId, supabase } = await verifyAdmin(req)
    const { query: nlQuery } = await req.json() as { query?: string }
    if (!nlQuery) return errorResponse(400, 'query required')

    // Spending control (fix #11) — limit query length
    const sanitizedQuery = nlQuery.slice(0, 500)

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return errorResponse(503, 'AI search not configured')

    const [
      { count: userCount },
      { count: subCount },
      { count: pledgeCount },
      { count: volCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }),
      supabase.from('pledge_items').select('*', { count: 'exact', head: true }),
      supabase.from('volunteers').select('*', { count: 'exact', head: true }),
    ])

    const q = sanitizedQuery.toLowerCase()
    const results: Record<string, unknown> = {}

    if (q.includes('subscriber') || q.includes('newsletter') || q.includes('email')) {
      const { data } = await supabase.from('subscribers').select('email, first_name, source, created_at').order('created_at', { ascending: false }).limit(200)
      results.subscribers = data
    }
    if (q.includes('volunteer')) {
      const { data } = await supabase.from('volunteers').select('name, email, skills, points, tier, created_at').order('points', { ascending: false }).limit(200)
      results.volunteers = data
    }
    if (Object.keys(results).length === 0) {
      const { data } = await supabase.from('subscribers').select('email, first_name, source').limit(200)
      results.subscribers = data
    }

    const systemPrompt = `You are a data analyst for The Logical Foundation, a UBI nonprofit.
Database summary: ${userCount ?? 0} users, ${subCount ?? 0} newsletter subscribers, ${pledgeCount ?? 0} pledge items, ${volCount ?? 0} volunteers.
Answer concisely with key statistics and insights. Keep under 400 words. Format with markdown.`

    // Spending control (fix #11) — truncate data payload and cap max_tokens
    const dataPayload = JSON.stringify(results, null, 2).slice(0, 8000)

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Query: "${sanitizedQuery}"\n\nData:\n${dataPayload}` },
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    })

    if (!aiRes.ok) return errorResponse(502, 'AI service error')
    const aiData = await aiRes.json() as { choices: Array<{ message: { content: string } }> }
    const answer = aiData.choices[0]?.message?.content ?? 'No response'

    await logAdminAction(supabase, userId, 'search', 'ai_search', undefined, { query: sanitizedQuery }, req)

    return jsonResponse({
      answer,
      recordCount: Object.values(results).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0),
    })
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
