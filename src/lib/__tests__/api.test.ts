import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock Supabase ────────────────────────────────────────────────────────────

const mockSupabase = vi.hoisted(() => ({
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    resend: vi.fn(),
    verifyOtp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  },
  from: vi.fn(),
}))

vi.mock('../supabase', () => ({ supabase: mockSupabase }))

import { auth, profile, pledge, volunteers, subscribe, ApiError } from '../api'

// ── Chainable query builder helper ───────────────────────────────────────────

function mockQuery(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}

  const handler = {
    get(_target: unknown, prop: string) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(resolvedValue)
      }
      if (!chain[prop]) {
        chain[prop] = vi.fn(() => new Proxy({}, handler))
      }
      return chain[prop]
    },
  }

  const proxy = new Proxy({}, handler)
  return { proxy, chain }
}

// ── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

// ── auth ─────────────────────────────────────────────────────────────────────

describe('auth.register', () => {
  it('calls supabase.auth.signUp with email, password, phone in metadata', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    })

    const result = await auth.register('a@b.com', '555', 'pass123')

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass123',
      options: { data: { phone: '555' } },
    })
    expect(result).toEqual({ userId: 'u1' })
  })

  it('throws ApiError(409) when Supabase says "already registered"', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    })

    await expect(auth.register('a@b.com', '555', 'pass')).rejects.toThrow(ApiError)
    await expect(auth.register('a@b.com', '555', 'pass')).rejects.toMatchObject({
      status: 409,
    })
  })
})

describe('auth.login', () => {
  it('calls signInWithPassword, queries profiles, returns userId + verified', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'u2' } },
      error: null,
    })

    const { proxy } = mockQuery({ data: { verified: true }, error: null })
    mockSupabase.from.mockReturnValue(proxy)

    const result = await auth.login('a@b.com', 'pass')

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
    })
    expect(result).toEqual({ userId: 'u2', verified: true })
  })

  it('throws ApiError(401) on bad credentials', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    await expect(auth.login('a@b.com', 'wrong')).rejects.toThrow(ApiError)
    await expect(auth.login('a@b.com', 'wrong')).rejects.toMatchObject({
      status: 401,
    })
  })
})

describe('auth.me', () => {
  it('combines getUser + profiles query + volunteers query', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u3', email: 'a@b.com', user_metadata: { phone: '555' }, email_confirmed_at: '2024-01-01' } },
      error: null,
    })

    // Two from() calls: profiles then volunteers
    const { proxy: profileProxy } = mockQuery({
      data: { verified: true, phone: '555', is_public: true, role: 'admin' },
      error: null,
    })
    const { proxy: volProxy } = mockQuery({
      data: { id: 'v1', points: 10, tier: 'sprout' },
      error: null,
    })

    let fromCallCount = 0
    mockSupabase.from.mockImplementation((table: string) => {
      fromCallCount++
      if (table === 'profiles') return profileProxy
      if (table === 'volunteers') return volProxy
      return profileProxy
    })

    const result = await auth.me()

    expect(result).toMatchObject({
      id: 'u3',
      email: 'a@b.com',
      verified: true,
      volunteerStatus: { id: 'v1', points: 10, tier: 'sprout' },
    })
  })

  it('throws ApiError(401) when unauthenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    await expect(auth.me()).rejects.toThrow(ApiError)
    await expect(auth.me()).rejects.toMatchObject({ status: 401 })
  })
})

describe('auth.logout', () => {
  it('calls signOut', () => {
    auth.logout()
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })
})

describe('auth.resetPassword', () => {
  it('calls updateUser then signOut (fix #16)', async () => {
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null })
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })

    const result = await auth.resetPassword('a@b.com', '123456', 'newpass')

    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpass' })
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()

    // Verify signOut was called AFTER updateUser
    const updateOrder = mockSupabase.auth.updateUser.mock.invocationCallOrder[0]
    const signOutOrder = mockSupabase.auth.signOut.mock.invocationCallOrder[0]
    expect(signOutOrder).toBeGreaterThan(updateOrder)

    expect(result).toEqual({ reset: true })
  })
})

// ── profile ──────────────────────────────────────────────────────────────────

describe('profile.get', () => {
  it('queries profiles, transforms snake_case to camelCase', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u4' } },
      error: null,
    })

    const { proxy } = mockQuery({
      data: {
        first_name: 'Jane',
        last_name: 'Doe',
        address_type: 'full',
        street: '123 Main',
        city: 'Tempe',
        state_region: 'AZ',
        postal_code: '85281',
        country: 'US',
        homeless_description: null,
        giver_type: 'individual',
      },
      error: null,
    })
    mockSupabase.from.mockReturnValue(proxy)

    const result = await profile.get()

    expect(result).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      addressType: 'full',
      street: '123 Main',
      city: 'Tempe',
      stateRegion: 'AZ',
      postalCode: '85281',
      country: 'US',
      homelessDescription: undefined,
      giverType: 'individual',
    })
  })

  it('returns null when unauthenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const result = await profile.get()
    expect(result).toBeNull()
  })
})

describe('profile.save', () => {
  it('upserts with correct column mapping', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u5' } },
      error: null,
    })

    const { proxy, chain } = mockQuery({ data: null, error: null })
    mockSupabase.from.mockReturnValue(proxy)

    await profile.save({
      firstName: 'Jane',
      lastName: 'Doe',
      addressType: 'full',
      street: '123 Main',
      giverType: 'individual',
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(chain['upsert']).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'u5',
        first_name: 'Jane',
        last_name: 'Doe',
        address_type: 'full',
        street: '123 Main',
        giver_type: 'individual',
      }),
      { onConflict: 'user_id' }
    )
  })
})

// ── pledge ───────────────────────────────────────────────────────────────────

describe('pledge.get', () => {
  it('queries with nested pledge_items, transforms numeric fields to strings', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u6' } },
      error: null,
    })

    const { proxy } = mockQuery({
      data: {
        impact_zone: 'arizona',
        custom_impact_zone: null,
        homelessness_priority: true,
        pledge_items: [
          {
            pledge_type: 'income_based',
            cadence: 'annual',
            estimated_income: 50000,
            income_percent: 1,
            estimated_net_worth: null,
            wealth_percent: null,
            vehicle_year: null,
            vehicle_make: null,
            vehicle_model: null,
            vehicle_mileage: null,
            vehicle_condition: null,
            property_address: null,
            property_type: null,
            estimated_property_value: null,
            other_description: null,
          },
        ],
      },
      error: null,
    })
    mockSupabase.from.mockReturnValue(proxy)

    const result = await pledge.get()

    expect(result).toMatchObject({
      impactZone: 'arizona',
      homelessnessPriority: true,
      pledges: [
        expect.objectContaining({
          pledgeType: 'income_based',
          cadence: 'annual',
          estimatedIncome: '50000',
          incomePercent: '1',
        }),
      ],
    })
  })
})

// ── volunteers ───────────────────────────────────────────────────────────────

describe('volunteers.leaderboard', () => {
  it('queries with .gt().order().limit()', async () => {
    const { proxy, chain } = mockQuery({
      data: [
        { name: 'Alice', points: 100, tier: 'oak' },
        { name: 'Bob', points: 50, tier: 'sprout' },
      ],
      error: null,
    })
    mockSupabase.from.mockReturnValue(proxy)

    const result = await volunteers.leaderboard()

    expect(mockSupabase.from).toHaveBeenCalledWith('volunteers')
    expect(chain['select']).toHaveBeenCalledWith('name, points, tier')
    expect(chain['gt']).toHaveBeenCalledWith('points', 0)
    expect(chain['order']).toHaveBeenCalledWith('points', { ascending: false })
    expect(chain['limit']).toHaveBeenCalledWith(25)
    expect(result).toHaveLength(2)
  })
})

describe('volunteers.apply', () => {
  it('returns existing volunteer when found', async () => {
    const { proxy } = mockQuery({
      data: { id: 'v1', points: 50, tier: 'sprout' },
      error: null,
    })
    mockSupabase.from.mockReturnValue(proxy)

    const result = await volunteers.apply({
      name: 'Alice',
      email: 'ALICE@B.COM',
    })

    expect(result).toEqual({
      volunteerId: 'v1',
      points: 50,
      tier: 'sprout',
      existing: true,
    })
  })

  it('inserts new volunteer with trimmed/lowercased email', async () => {
    // First call: select (no existing) — returns null data
    const { proxy: selectProxy } = mockQuery({ data: null, error: null })
    // Second call: insert — returns new record
    const { proxy: insertProxy, chain: insertChain } = mockQuery({
      data: { id: 'v2' },
      error: null,
    })

    let callCount = 0
    mockSupabase.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return selectProxy
      return insertProxy
    })

    const result = await volunteers.apply({
      name: '  Bob  ',
      email: '  BOB@B.COM  ',
      phone: ' 555 ',
    })

    expect(result).toEqual({ volunteerId: 'v2', points: 0, tier: 'seed' })
    // Verify the insert was called with trimmed/lowercased values
    expect(insertChain['insert']).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bob',
        email: 'bob@b.com',
        phone: '555',
      })
    )
  })
})

// ── subscribe ────────────────────────────────────────────────────────────────

describe('subscribe.add', () => {
  it('upserts with lowercase email', async () => {
    const { proxy, chain } = mockQuery({ data: null, error: null })
    mockSupabase.from.mockReturnValue(proxy)

    await subscribe.add('  TEST@B.COM  ', 'Jane')

    expect(mockSupabase.from).toHaveBeenCalledWith('subscribers')
    expect(chain['upsert']).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@b.com',
        first_name: 'Jane',
        source: 'website',
      }),
      { onConflict: 'email', ignoreDuplicates: true }
    )
  })
})
