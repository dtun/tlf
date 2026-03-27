import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert })
const mockAnonClient = { from: mockFrom }

vi.mock('../../api/_lib/admin', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../api/_lib/admin')>()
  return {
    ...original,
    createAnonClient: vi.fn(() => mockAnonClient),
    createServiceClient: vi.fn(() => {
      throw new Error('Public endpoint must not use createServiceClient')
    }),
  }
})

import handler from '../../api/contact/volunteer'
import { createAnonClient, createServiceClient } from '../../api/_lib/admin'

describe('volunteer handler uses anon client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ insert: mockInsert })
    mockInsert.mockResolvedValue({ data: null, error: null })
  })

  it('calls createAnonClient, not createServiceClient', async () => {
    const req = new Request('http://localhost/api/contact/volunteer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    expect(createAnonClient).toHaveBeenCalled()
    expect(createServiceClient).not.toHaveBeenCalled()
  })
})
