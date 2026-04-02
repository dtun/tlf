import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../_lib/admin'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
  try {
    const { userId, supabase } = await verifyAdmin(req)
    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
    const search = url.searchParams.get('search')?.trim() ?? ''
    const limit = 50

    // Get users from auth.users via admin API
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers({
      page,
      perPage: limit,
    })
    if (authError) return errorResponse(500, authError.message)

    // Column-filtered queries (fix #12)
    const userIds = authUsers.map(u => u.id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, giver_type, verified, role')
      .in('user_id', userIds)

    const { data: pledges } = await supabase
      .from('ubi_pledges')
      .select('user_id, pledge_items(id)')
      .in('user_id', userIds)

    const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]))
    const pledgeMap = new Map((pledges ?? []).map(p => [p.user_id, (p.pledge_items as unknown[])?.length ?? 0]))

    let users = authUsers.map(u => {
      const p = profileMap.get(u.id)
      return {
        id: u.id,
        first_name: p?.first_name ?? '',
        last_name: p?.last_name ?? '',
        email: u.email ?? '',
        giver_type: p?.giver_type ?? '',
        verified: p?.verified ?? false,
        role: p?.role ?? 'user',
        pledge_count: String(pledgeMap.get(u.id) ?? 0),
        created_at: u.created_at,
      }
    })

    if (search) {
      const s = search.toLowerCase()
      users = users.filter(u =>
        u.email.toLowerCase().includes(s) ||
        u.first_name.toLowerCase().includes(s) ||
        u.last_name.toLowerCase().includes(s)
      )
    }

    await logAdminAction(supabase, userId, 'list', 'users', undefined, { page, search: search || undefined }, req)

    return jsonResponse({ users, total: users.length, page, limit })
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
