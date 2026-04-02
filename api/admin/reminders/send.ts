import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../../_lib/admin'
import { createTransporter, FROM, buildEmailHtml } from '../../_lib/email'

function isAZTaxSeason(): boolean {
  const month = new Date().getMonth() + 1
  return month >= 11 || month <= 4
}

function isGivingTuesdaySeason(): boolean {
  const now = new Date()
  const month = now.getMonth() + 1
  if (month === 12) return true
  if (month === 11 && now.getDate() >= 26) return true
  return false
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
    try {
      await verifyAdmin(req)
      return jsonResponse({
        azTaxSeasonActive: isAZTaxSeason(),
        givingTuesdaySeasonActive: isGivingTuesdaySeason(),
        currentDate: new Date().toISOString(),
      })
    } catch (e) {
      const msg = (e as Error).message
      if (msg === 'Unauthorized') return errorResponse(401, msg)
      if (msg === 'Forbidden') return errorResponse(403, msg)
      return errorResponse(500, 'Internal server error')
    }
  }

  if (req.method !== 'POST') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')

  try {
    const { userId, supabase } = await verifyAdmin(req)
    const { campaign } = await req.json() as { campaign?: 'az_tax' | 'giving_tuesday' | 'test' }
    const results: string[] = []
    const transporter = createTransporter()

    if (campaign === 'az_tax' || campaign === 'test' || (!campaign && isAZTaxSeason())) {
      const subject = 'Your AZ Tax Credit pledge — time to act'
      const todayKey = new Date().toISOString().slice(0, 10)

      // Dedup via DB constraint (fix #10)
      const { data: alreadySent } = await supabase
        .from('sent_emails')
        .select('id')
        .eq('subject', subject)
        .gte('created_at', todayKey)
        .lt('created_at', todayKey + 'T23:59:59Z')
        .limit(1)
        .single()

      if (!alreadySent) {
        // Batched user fetch (fix #9) — fetch all profiles then batch-resolve emails
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name')
          .eq('verified', true)

        const recipients: Array<{ email: string; first_name: string }> = []
        const BATCH_SIZE = 50
        const allProfiles = profiles ?? []

        for (let i = 0; i < allProfiles.length; i += BATCH_SIZE) {
          const batch = allProfiles.slice(i, i + BATCH_SIZE)
          const resolved = await Promise.all(
            batch.map(async (p) => {
              const { data: { user } } = await supabase.auth.admin.getUserById(p.user_id)
              return user?.email ? { email: user.email, first_name: p.first_name } : null
            })
          )
          for (const r of resolved) {
            if (r) recipients.push(r)
          }
        }

        if (recipients.length > 0) {
          const body = `<p>Hi {{first_name}},</p>
<p>You made an Arizona Charitable Tax Credit pledge with The Logical Foundation. Contributions before <strong>April 15</strong> qualify for the current tax year.</p>
<p>The AZ Charitable Tax Credit lets you redirect up to <strong>$938 (single) or $1,877 (married filing jointly)</strong> of your Arizona state taxes directly to TLF.</p>
<div class="cta"><a href="https://app.thelogicalfoundation.org">Make Your Contribution Now</a></div>`

          for (const r of recipients) {
            const personalBody = body.replace('{{first_name}}', r.first_name || 'there')
            await transporter.sendMail({
              from: FROM, to: r.email, subject,
              html: buildEmailHtml('Your AZ Tax Credit Pledge', personalBody),
            })
          }

          await supabase.from('sent_emails').insert({
            subject, body_html: body, recipient_count: recipients.length, sent_by: userId,
          })
          results.push(`AZ Tax Credit: sent to ${recipients.length} recipients`)
        } else {
          results.push('AZ Tax Credit: no eligible recipients')
        }
      } else {
        results.push('AZ Tax Credit: already sent today')
      }
    }

    if (campaign === 'giving_tuesday' || campaign === 'test' || (!campaign && isGivingTuesdaySeason())) {
      const subject = 'Giving Tuesday — your pledge, your impact'
      const todayKey = new Date().toISOString().slice(0, 10)

      const { data: alreadySent } = await supabase
        .from('sent_emails')
        .select('id')
        .eq('subject', subject)
        .gte('created_at', todayKey)
        .lt('created_at', todayKey + 'T23:59:59Z')
        .limit(1)
        .single()

      if (!alreadySent) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name')
          .eq('verified', true)

        const recipients: Array<{ email: string; first_name: string }> = []
        const BATCH_SIZE = 50
        const allProfiles = profiles ?? []

        for (let i = 0; i < allProfiles.length; i += BATCH_SIZE) {
          const batch = allProfiles.slice(i, i + BATCH_SIZE)
          const resolved = await Promise.all(
            batch.map(async (p) => {
              const { data: { user } } = await supabase.auth.admin.getUserById(p.user_id)
              return user?.email ? { email: user.email, first_name: p.first_name } : null
            })
          )
          for (const r of resolved) {
            if (r) recipients.push(r)
          }
        }

        if (recipients.length > 0) {
          const body = `<p>Hi {{first_name}},</p>
<p>Today is <strong>Giving Tuesday</strong>. Year-end giving is the most impactful time to donate. Contributions before December 31 are tax-deductible.</p>
<div class="cta"><a href="https://app.thelogicalfoundation.org">Give Now</a></div>`

          for (const r of recipients) {
            const personalBody = body.replace('{{first_name}}', r.first_name || 'there')
            await transporter.sendMail({
              from: FROM, to: r.email, subject,
              html: buildEmailHtml('Giving Tuesday — Your Pledge, Your Impact', personalBody),
            })
          }

          await supabase.from('sent_emails').insert({
            subject, body_html: body, recipient_count: recipients.length, sent_by: userId,
          })
          results.push(`Giving Tuesday: sent to ${recipients.length} recipients`)
        } else {
          results.push('Giving Tuesday: no eligible recipients')
        }
      } else {
        results.push('Giving Tuesday: already sent today')
      }
    }

    if (results.length === 0) {
      return jsonResponse({ sent: false, message: 'No campaigns active. Pass campaign=az_tax, giving_tuesday, or test.' })
    }

    await logAdminAction(supabase, userId, 'send_reminders', 'reminders', undefined, { campaign, results }, req)

    return jsonResponse({ sent: true, results })
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
