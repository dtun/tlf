import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; resetTime: number }>()

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/missions/submit': { max: 5, windowMs: 60_000 },
  '/api/contact/volunteer': { max: 5, windowMs: 60_000 },
  '/api/admin/search': { max: 20, windowMs: 60_000 },
  '/api/admin/email/send': { max: 3, windowMs: 60_000 },
  default: { max: 100, windowMs: 60_000 },
}

function getLimit(pathname: string) {
  return LIMITS[pathname] ?? LIMITS.default
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const pathname = req.nextUrl.pathname
  const key = `${ip}:${pathname}`
  const limit = getLimit(pathname)
  const now = Date.now()

  const entry = rateLimit.get(key)
  if (!entry || now > entry.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + limit.windowMs })
    return NextResponse.next()
  }

  entry.count++
  if (entry.count > limit.max) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((entry.resetTime - now) / 1000)) } }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
