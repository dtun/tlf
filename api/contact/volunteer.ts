import { createAnonClient, errorResponse, jsonResponse } from '../_lib/admin'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return errorResponse(405, 'Method not allowed')

  try {
    const supabase = createAnonClient()
    const { name, email, message } = await req.json() as {
      name?: string; email?: string; message?: string
    }
    if (!name || !email || !message) return errorResponse(400, 'name, email, and message are required')

    await supabase.from('volunteer_inquiries').insert({
      name: name.trim(), email: email.trim(), message: message.trim(),
    })

    return jsonResponse({ submitted: true })
  } catch {
    return errorResponse(500, 'Internal server error')
  }
}
