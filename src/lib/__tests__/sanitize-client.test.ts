import { describe, it, expect } from 'vitest'
import { sanitizeHtmlClient } from '../sanitize-client'

describe('sanitizeHtmlClient', () => {
  it('allows safe HTML tags and attributes', () => {
    const input = '<p>Hello <strong>world</strong></p>'
    expect(sanitizeHtmlClient(input)).toBe(input)
  })

  it('strips script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>'
    expect(sanitizeHtmlClient(input)).not.toContain('<script>')
    expect(sanitizeHtmlClient(input)).not.toContain('alert')
  })

  it('strips onerror event handlers', () => {
    const input = '<img src=x onerror="alert(1)">'
    const result = sanitizeHtmlClient(input)
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('alert')
  })

  it('strips javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">click</a>'
    const result = sanitizeHtmlClient(input)
    expect(result).not.toContain('javascript:')
  })

  it('preserves email template tags used by the app', () => {
    const input = '<h2>Subject</h2><p>Body text</p><a href="https://example.com" target="_blank">Link</a><br><hr>'
    const result = sanitizeHtmlClient(input)
    expect(result).toContain('<h2>')
    expect(result).toContain('<a href="https://example.com"')
    expect(result).toContain('<br>')
    expect(result).toContain('<hr>')
  })
})
