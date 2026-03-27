import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../../_lib/admin'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
  try {
    const { userId, supabase } = await verifyAdmin(req)
    const { volunteerId, activity, points, notes } = await req.json() as {
      volunteerId?: string; activity?: string; points?: number; notes?: string
    }
    if (!volunteerId || !activity || !points) return errorResponse(400, 'volunteerId, activity, and points required')

    await supabase.from('volunteer_activities').insert({
      volunteer_id: volunteerId, activity, points, notes: notes ?? null,
    })

    // Recalculate via database function
    await supabase.rpc('recalculate_volunteer_points', { vol_id: volunteerId })

    const { data: vol } = await supabase
      .from('volunteers')
      .select('points, tier')
      .eq('id', volunteerId)
      .single()

    await logAdminAction(supabase, userId, 'award_points', 'volunteer', volunteerId, { activity, points }, req)

    return jsonResponse({ points: vol?.points ?? 0, tier: vol?.tier ?? 'seed' })
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
