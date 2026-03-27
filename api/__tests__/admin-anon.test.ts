import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: vi.fn(), rpc: vi.fn() })),
}))

import { createAnonClient } from '../../api/_lib/admin'
import { createClient } from '@supabase/supabase-js'

describe('createAnonClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
    process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  it('calls createClient with the anon key', () => {
    createAnonClient()
    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
  })

  it('does not use the service role key', () => {
    createAnonClient()
    expect(createClient).not.toHaveBeenCalledWith(
      expect.anything(),
      'test-service-key'
    )
  })
})
