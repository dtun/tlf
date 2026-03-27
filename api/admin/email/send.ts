import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../../_lib/admin'
import { createTransporter, FROM, buildEmailHtml } from '../../_lib/email'
import { sanitizeHtml } from '../../_lib/sanitize'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
  try {
    const { userId, supabase } = await verifyAdmin(req)
    const { subject, bodyHtml, recipientType } = await req.json() as {
      subject?: string; bodyHtml?: string; recipientType?: 'subscribers' | 'users' | 'all'
    }

    if (!subject || !bodyHtml) return errorResponse(400, 'subject and bodyHtml required')

    // Sanitize HTML body before inclusion (fix #4)
    const cleanBodyHtml = sanitizeHtml(bodyHtml)

    let emails: string[] = []
    const type = recipientType ?? 'subscribers'

    if (type === 'subscribers' || type === 'all') {
      const { data } = await supabase.from('subscribers').select('email')
      emails.push(...(data ?? []).map(r => r.email))
    }
    if (type === 'users' || type === 'all') {
      const { data } = await supabase.from('profiles').select('user_id').eq('verified', true)
      for (const p of data ?? []) {
        const { data: { user } } = await supabase.auth.admin.getUserById(p.user_id)
        if (user?.email) emails.push(user.email)
      }
    }
    emails = [...new Set(emails)]
    if (emails.length === 0) return errorResponse(400, 'No recipients found')

    const html = buildEmailHtml(subject, cleanBodyHtml)
    const transporter = createTransporter()

    const BATCH = 50
    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH)
      await transporter.sendMail({ from: FROM, bcc: batch, subject, html })
    }

    await supabase.from('sent_emails').insert({
      subject, body_html: cleanBodyHtml, recipient_count: emails.length, sent_by: userId,
    })

    await logAdminAction(supabase, userId, 'send_email', 'email', undefined, { subject, recipientCount: emails.length, recipientType: type }, req)

    return jsonResponse({ sent: true, recipientCount: emails.length })
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
