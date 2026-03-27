import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../../_lib/admin'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
  try {
    const { userId, supabase } = await verifyAdmin(req)
    const { data } = await supabase
      .from('sent_emails')
      .select('id, subject, recipient_count, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    await logAdminAction(supabase, userId, 'view', 'email_history', undefined, undefined, req)

    return jsonResponse(data ?? [])
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
