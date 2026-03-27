import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../../_lib/admin'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
  try {
    const { userId, supabase } = await verifyAdmin(req)
    const { submissionId, decision } = await req.json() as {
      submissionId?: string; decision?: 'approved' | 'rejected'
    }
    if (!submissionId || !decision) return errorResponse(400, 'submissionId and decision required')

    const { data: sub } = await supabase
      .from('mission_submissions')
      .select('volunteer_id, mission_title, points_awarded')
      .eq('id', submissionId)
      .single()
    if (!sub) return errorResponse(404, 'Submission not found')

    await supabase
      .from('mission_submissions')
      .update({ status: decision, reviewed_by: userId, reviewed_at: new Date().toISOString() })
      .eq('id', submissionId)

    if (decision === 'approved' && sub.points_awarded > 0) {
      await supabase.from('volunteer_activities').insert({
        volunteer_id: sub.volunteer_id,
        activity: sub.mission_title,
        points: sub.points_awarded,
        notes: 'Approved by admin',
      })
      await supabase.rpc('recalculate_volunteer_points', { vol_id: sub.volunteer_id })
    }

    await logAdminAction(supabase, userId, 'review_mission', 'mission_submission', submissionId, { decision }, req)

    return jsonResponse({ reviewed: true, decision })
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
