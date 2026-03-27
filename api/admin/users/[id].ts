import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../../_lib/admin'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
  try {
    const { userId, supabase } = await verifyAdmin(req)
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    if (!id) return errorResponse(400, 'User ID required')

    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(id)
    if (!authUser) return errorResponse(404, 'Not found')

    // Column-filtered queries (fix #12)
    const [profile, pledge, azTax, ffOpinion, comingleOpinion] = await Promise.all([
      supabase.from('profiles').select('user_id, first_name, last_name, giver_type, verified, role, created_at').eq('user_id', id).single().then(r => r.data),
      supabase.from('ubi_pledges').select('id, user_id, created_at').eq('user_id', id).single().then(r => r.data),
      supabase.from('az_tax_credit').select('id, user_id, will_use_credit, created_at').eq('user_id', id).single().then(r => r.data),
      supabase.from('foundation_fund_opinions').select('id, user_id, opinion, created_at').eq('user_id', id).single().then(r => r.data),
      supabase.from('comingle_opinions').select('id, user_id, opinion, created_at').eq('user_id', id).single().then(r => r.data),
    ])

    let pledgeItems: unknown[] = []
    if (pledge) {
      const { data } = await supabase.from('pledge_items').select('id, ubi_pledge_id, pledge_type, estimated_income, income_percent, estimated_net_worth, wealth_percent, created_at').eq('ubi_pledge_id', pledge.id)
      pledgeItems = data ?? []
    }

    await logAdminAction(supabase, userId, 'view', 'user', id, undefined, req)

    return jsonResponse({
      user: { id: authUser.id, email: authUser.email, verified: profile?.verified ?? false, role: profile?.role ?? 'user', created_at: authUser.created_at },
      profile, pledge, pledgeItems, azTax, ffOpinion, comingleOpinion,
    })
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
