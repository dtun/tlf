import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../../_lib/admin'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
  try {
    const { userId, supabase } = await verifyAdmin(req)
    const { data } = await supabase
      .from('mission_submissions')
      .select(`
        id, mission_title, evidence, ai_verdict, points_awarded, created_at,
        volunteers!inner(name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    const rows = (data ?? []).map(row => ({
      id: row.id,
      volunteer_name: (row.volunteers as unknown as { name: string })?.name ?? '',
      volunteer_email: (row.volunteers as unknown as { email: string })?.email ?? '',
      mission_title: row.mission_title,
      evidence: row.evidence,
      ai_verdict: row.ai_verdict,
      points_awarded: row.points_awarded,
      created_at: row.created_at,
    }))

    await logAdminAction(supabase, userId, 'list', 'pending_missions', undefined, undefined, req)

    return jsonResponse(rows)
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
