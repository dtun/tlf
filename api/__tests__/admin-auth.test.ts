import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase before importing the module
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

import { verifyAdmin, validateOrigin } from '../../api/_lib/admin'

beforeEach(() => {
  vi.clearAllMocks()
  mockFrom.mockReturnValue({ select: mockSelect })
  mockSelect.mockReturnValue({ eq: mockEq })
  mockEq.mockReturnValue({ single: mockSingle })
})

describe('verifyAdmin', () => {
  it('throws when no auth header', async () => {
    const req = new Request('http://localhost/api/admin/stats', {
      headers: {},
    })
    await expect(verifyAdmin(req)).rejects.toThrow('Unauthorized')
  })

  it('throws when token is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('invalid') })
    const req = new Request('http://localhost/api/admin/stats', {
      headers: { authorization: 'Bearer bad-token' },
    })
    await expect(verifyAdmin(req)).rejects.toThrow('Unauthorized')
  })

  it('throws when user is not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'user' } })
    const req = new Request('http://localhost/api/admin/stats', {
      headers: { authorization: 'Bearer valid-token' },
    })
    await expect(verifyAdmin(req)).rejects.toThrow('Forbidden')
  })

  it('returns userId and supabase client on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' } })
    const req = new Request('http://localhost/api/admin/stats', {
      headers: { authorization: 'Bearer valid-token' },
    })
    const result = await verifyAdmin(req)
    expect(result.userId).toBe('admin-1')
    expect(result.supabase).toBeDefined()
  })
})

describe('validateOrigin', () => {
  it('returns true for allowed origins', () => {
    const req = new Request('http://localhost/api/admin/stats', {
      headers: { origin: 'http://localhost:5173' },
    })
    expect(validateOrigin(req)).toBe(true)
  })

  it('returns false for disallowed origins', () => {
    const req = new Request('http://localhost/api/admin/stats', {
      headers: { origin: 'https://evil.com' },
    })
    expect(validateOrigin(req)).toBe(false)
  })
})
