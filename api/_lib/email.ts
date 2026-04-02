import nodemailer from 'nodemailer'

export function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!pass) {
    throw new Error('SMTP_PASS is required. Email sending is disabled without SMTP credentials.')
  }

  return nodemailer.createTransport({
    host: host ?? 'smtp.gmail.com',
    port: Number(port ?? 587),
    secure: false,
    auth: { user: user ?? 'info@thelogicalfoundation.org', pass },
  })
}

export const FROM = `"The Logical Foundation" <${process.env.SMTP_USER ?? 'info@thelogicalfoundation.org'}>`

export function buildEmailHtml(subject: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${subject}</title>
<style>
  body { margin: 0; padding: 0; background: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 16px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #0d2137 0%, #0a3d2e 100%); padding: 32px 32px 24px; text-align: center; }
  .logo-text { font-size: 13px; font-weight: 700; color: #4ade80; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
  .header h1 { margin: 0; font-size: 26px; font-weight: 800; color: #f0f6fc; line-height: 1.25; }
  .body { padding: 32px; color: #c9d1d9; font-size: 15px; line-height: 1.7; }
  .body a { color: #4ade80; text-decoration: none; }
  .footer { padding: 24px 32px; background: #0d1117; text-align: center; }
  .footer p { margin: 0 0 6px; font-size: 12px; color: #8b949e; }
  .footer a { color: #4ade80; text-decoration: none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="logo-text">The Logical Foundation</div>
      <h1>${subject}</h1>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>The Logical Foundation &middot; 501(c)(3) Nonprofit &middot; EIN# 88-3607946</p>
      <p><a href="https://thelogicalfoundation.org">thelogicalfoundation.org</a> &middot; <a href="mailto:info@thelogicalfoundation.org">info@thelogicalfoundation.org</a></p>
      <p style="margin-top:12px;font-size:11px;color:#6e7681;">You're receiving this because you subscribed at thelogicalfoundation.org.<br/>
      To unsubscribe, reply with "unsubscribe" in the subject line.</p>
    </div>
  </div>
</div>
</body>
</html>`
}
