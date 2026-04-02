import DOMPurify from 'dompurify'

export function sanitizeHtmlClient(html: string): string {
  return DOMPurify.sanitize(html)
}
