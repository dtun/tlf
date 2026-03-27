import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function verifyAdmin(req: Request): Promise<{ userId: string; supabase: ReturnType<typeof createClient> }> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) throw new Error('Unauthorized')
  const token = authHeader.replace('Bearer ', '')
  const supabase = createServiceClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return { userId: user.id, supabase }
}

export function validateOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // Same-origin requests don't send Origin
  const allowed = (process.env.ALLOWED_ORIGINS ?? 'https://thelogicalfoundation.org,https://app.thelogicalfoundation.org,http://localhost:5173').split(',')
  return allowed.includes(origin)
}

export async function logAdminAction(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  req?: Request
) {
  await supabase.from('admin_audit_log').insert({
    admin_user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId ?? null,
    details: details ?? null,
    ip_address: req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
  })
}

export function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
