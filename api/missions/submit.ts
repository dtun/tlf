import { createServiceClient, errorResponse, jsonResponse } from '../_lib/admin'
import { sanitizeEvidence, wrapEvidenceForLLM } from '../_lib/sanitize'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return errorResponse(405, 'Method not allowed')

  try {
    const supabase = createServiceClient()
    const { volunteerEmail, missionId, missionTitle, missionPoints, evidence } = await req.json() as {
      volunteerEmail?: string; missionId?: string; missionTitle?: string; missionPoints?: number; evidence?: string
    }

    if (!volunteerEmail || !missionId || !missionTitle || !evidence) {
      return errorResponse(400, 'volunteerEmail, missionId, missionTitle, and evidence are required')
    }

    // Sanitize evidence (fix #1) and truncate to 2000 chars (fix #11)
    const cleanEvidence = sanitizeEvidence(evidence)

    const { data: vol } = await supabase
      .from('volunteers')
      .select('id, name')
      .eq('email', volunteerEmail.toLowerCase().trim())
      .single()

    // Generic response regardless of volunteer lookup (fix #8 — no email enumeration)
    if (!vol) {
      return jsonResponse({
        message: 'Submission received. If your email is registered, it will be reviewed.',
      })
    }

    let aiVerdict = 'Pending manual review.'
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      try {
        // Wrap evidence for LLM with boundary markers (fix #1)
        const wrappedEvidence = wrapEvidenceForLLM(cleanEvidence)

        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a volunteer coordinator for The Logical Foundation, a UBI nonprofit.
A volunteer has submitted evidence of completing a mission. Evaluate whether the evidence is credible.
Mission: "${missionTitle}"
Respond in 2-3 sentences. End with: VERDICT: APPROVE, VERDICT: REVIEW, or VERDICT: REJECT`,
              },
              { role: 'user', content: wrappedEvidence },
            ],
            max_tokens: 200,
            temperature: 0.2,
          }),
        })
        if (aiRes.ok) {
          const data = await aiRes.json() as { choices: Array<{ message: { content: string } }> }
          aiVerdict = data.choices[0]?.message?.content ?? aiVerdict
        }
      } catch { /* fall through to manual review */ }
    }

    const { data: row } = await supabase
      .from('mission_submissions')
      .insert({
        volunteer_id: vol.id, mission_id: missionId, mission_title: missionTitle,
        evidence: cleanEvidence, ai_verdict: aiVerdict, points_awarded: missionPoints ?? 0,
      })
      .select('id')
      .single()

    if (aiVerdict.includes('VERDICT: APPROVE') && missionPoints) {
      await supabase
        .from('mission_submissions')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', row?.id)

      await supabase.from('volunteer_activities').insert({
        volunteer_id: vol.id, activity: missionTitle,
        points: missionPoints, notes: 'Auto-approved by AI verification',
      })

      await supabase.rpc('recalculate_volunteer_points', { vol_id: vol.id })

      const { data: updated } = await supabase
        .from('volunteers')
        .select('points, tier')
        .eq('id', vol.id)
        .single()

      return jsonResponse({
        message: 'Submission received. If your email is registered, it will be reviewed.',
        submissionId: row?.id, status: 'approved', aiVerdict,
        pointsAwarded: missionPoints, newTotal: updated?.points ?? 0, tier: updated?.tier ?? 'seed',
      })
    }

    return jsonResponse({
      message: 'Submission received. If your email is registered, it will be reviewed.',
      submissionId: row?.id, status: 'pending', aiVerdict,
    })
  } catch {
    return errorResponse(500, 'Internal server error')
  }
}
