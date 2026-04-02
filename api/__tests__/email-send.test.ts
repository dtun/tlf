import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(),
    })),
  },
}))

import { createTransporter, buildEmailHtml } from '../../api/_lib/email'
import { sanitizeHtml } from '../../api/_lib/sanitize'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createTransporter', () => {
  it('throws when SMTP_PASS is not set (fix #7)', () => {
    delete process.env.SMTP_PASS
    expect(() => createTransporter()).toThrow('SMTP_PASS is required')
  })
})

describe('buildEmailHtml', () => {
  it('produces valid HTML with subject and body', () => {
    const html = buildEmailHtml('Test Subject', '<p>Hello world</p>')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Test Subject')
    expect(html).toContain('<p>Hello world</p>')
    expect(html).toContain('The Logical Foundation')
  })
})

describe('email HTML sanitization (fix #4)', () => {
  it('HTML body is sanitized before being included in email template', () => {
    const maliciousBody = '<p>Hello</p><script>alert("xss")</script><div onclick="steal()">Click</div>'
    const cleanBody = sanitizeHtml(maliciousBody)
    const html = buildEmailHtml('Newsletter', cleanBody)
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('onclick')
    expect(html).toContain('<p>Hello</p>')
  })
})
