import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ── anon client mock (used for public operations) ── */
const anonSelect = vi.fn()
const anonEq = vi.fn()
const anonSingle = vi.fn()
const anonInsert = vi.fn()
const anonFrom = vi.fn()
const mockAnonClient = { from: anonFrom, rpc: vi.fn() }

/* ── service client mock (used for admin auto-approve operations) ── */
const svcFrom = vi.fn()
const svcRpc = vi.fn()
const mockServiceClient = { from: svcFrom, rpc: svcRpc }

vi.mock('../../api/_lib/admin', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../api/_lib/admin')>()
  return {
    ...original,
    createAnonClient: vi.fn(() => mockAnonClient),
    createServiceClient: vi.fn(() => mockServiceClient),
  }
})

vi.mock('../../api/_lib/sanitize', () => ({
  sanitizeEvidence: vi.fn((e: string) => e),
  wrapEvidenceForLLM: vi.fn((e: string) => `<evidence>${e}</evidence>`),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import handler from '../../api/missions/submit'
import { createAnonClient, createServiceClient } from '../../api/_lib/admin'

function setupAnonChain({ volunteerData }: { volunteerData: unknown }) {
  anonSingle.mockResolvedValue({ data: volunteerData })
  anonEq.mockReturnValue({ single: anonSingle })
  anonSelect.mockReturnValue({ eq: anonEq })
  anonInsert.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { id: 'sub-1' } }),
    }),
  })
  anonFrom.mockImplementation((table: string) => {
    if (table === 'volunteers') return { select: anonSelect }
    if (table === 'mission_submissions') return { insert: anonInsert }
    return { insert: vi.fn().mockResolvedValue({ data: null }) }
  })
}

function setupServiceChain() {
  const svcUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: null }),
  })
  const svcInsert = vi.fn().mockResolvedValue({ data: null })
  const svcSelect = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { points: 100, tier: 'sprout' } }),
    }),
  })
  svcFrom.mockImplementation((table: string) => {
    if (table === 'mission_submissions') return { update: svcUpdate }
    if (table === 'volunteer_activities') return { insert: svcInsert }
    if (table === 'volunteers') return { select: svcSelect }
    return {}
  })
  svcRpc.mockResolvedValue({ data: null })
}

describe('missions/submit uses correct clients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.OPENAI_API_KEY
  })

  it('uses only createAnonClient when volunteer not found (no auto-approve path)', async () => {
    setupAnonChain({ volunteerData: null })

    const req = new Request('http://localhost/api/missions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        volunteerEmail: 'nobody@example.com',
        missionId: 'm-1',
        missionTitle: 'Test Mission',
        evidence: 'I did it',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    expect(createAnonClient).toHaveBeenCalled()
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('uses createServiceClient only for auto-approve admin operations', async () => {
    setupAnonChain({ volunteerData: { id: 'vol-1', name: 'Test' } })
    setupServiceChain()

    process.env.OPENAI_API_KEY = 'test-key'
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Looks good. VERDICT: APPROVE' } }],
      }),
    })

    const req = new Request('http://localhost/api/missions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        volunteerEmail: 'test@example.com',
        missionId: 'm-1',
        missionTitle: 'Test Mission',
        missionPoints: 50,
        evidence: 'Completed the task successfully',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)

    // Anon client used for volunteer lookup + initial submission insert
    expect(createAnonClient).toHaveBeenCalled()

    // Service client used for auto-approve admin operations
    expect(createServiceClient).toHaveBeenCalled()

    // Verify service client handled the admin tables
    expect(svcFrom).toHaveBeenCalledWith('mission_submissions')
    expect(svcFrom).toHaveBeenCalledWith('volunteer_activities')
    expect(svcRpc).toHaveBeenCalledWith('recalculate_volunteer_points', { vol_id: 'vol-1' })

    delete process.env.OPENAI_API_KEY
  })
})
