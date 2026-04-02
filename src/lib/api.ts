/**
 * Typed API client backed by Supabase.
 *
 * User-facing operations use the Supabase JS client directly (with RLS).
 * Admin operations call Vercel serverless functions at /api/admin/*.
 */
import { supabase } from './supabase'

// ── ApiError ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body: unknown = {}
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function serverRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data as { error?: string }).error ?? 'Request failed',
      data
    )
  }

  return data as T
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterResult {
  userId: string
}

export interface LoginResult {
  userId: string
  verified: boolean
}

export const auth = {
  async register(
    email: string,
    phone: string,
    password: string
  ): Promise<RegisterResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone } },
    })
    if (error) {
      if (error.message?.includes('already registered')) {
        throw new ApiError(409, 'Account already exists')
      }
      throw new ApiError(400, error.message)
    }
    return { userId: data.user?.id ?? '' }
  },

  async login(email: string, password: string): Promise<LoginResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw new ApiError(401, error.message)
    }
    const { data: profileData } = await supabase
      .from('profiles')
      .select('verified')
      .eq('user_id', data.user.id)
      .single()
    return {
      userId: data.user.id,
      verified: profileData?.verified ?? false,
    }
  },

  async sendCode(method: 'email' | 'text'): Promise<{ sent: boolean }> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError(401, 'Not authenticated')

    if (method === 'email') {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
      })
      if (error) throw new ApiError(400, error.message)
      return { sent: true }
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
    })
    if (error) throw new ApiError(400, error.message)
    return { sent: true }
  },

  async verifyCode(code: string): Promise<{ verified: boolean }> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError(401, 'Not authenticated')

    const { error } = await supabase.auth.verifyOtp({
      email: user.email!,
      token: code,
      type: 'email',
    })
    if (error) throw new ApiError(400, error.message)

    await supabase
      .from('profiles')
      .update({ verified: true })
      .eq('user_id', user.id)

    return { verified: true }
  },

  async me(): Promise<{
    id: string
    email: string
    phone: string
    verified: boolean
    is_public: boolean
    role: string
    volunteerStatus: { id: string; points: number; tier: string } | null
  }> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) throw new ApiError(401, 'Not authenticated')

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('id, points, tier')
      .eq('email', user.email!)
      .single()

    return {
      id: user.id,
      email: user.email ?? '',
      phone: profileData?.phone ?? user.user_metadata?.phone ?? '',
      verified: profileData?.verified ?? !!user.email_confirmed_at,
      is_public: profileData?.is_public ?? false,
      role: profileData?.role ?? 'user',
      volunteerStatus: volunteer
        ? { id: volunteer.id, points: volunteer.points, tier: volunteer.tier }
        : null,
    }
  },

  logout(): void {
    supabase.auth.signOut()
  },

  async forgotPassword(email: string): Promise<{ sent: boolean }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw new ApiError(400, error.message)
    return { sent: true }
  },

  /** fix #16: logout after password change */
  async resetPassword(
    _email: string,
    _code: string,
    password: string
  ): Promise<{ reset: boolean }> {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new ApiError(400, error.message)
    await supabase.auth.signOut()
    return { reset: true }
  },

  isLoggedIn(): boolean {
    const key = `sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
    return !!localStorage.getItem(key)
  },
}

// ── Profile ──────────────────────────────────────────────────────────────────

export interface ProfilePayload {
  firstName: string
  lastName: string
  addressType: string
  street?: string
  city?: string
  stateRegion?: string
  postalCode?: string
  country?: string
  homelessDescription?: string
  giverType: string
}

export const profile = {
  async get(): Promise<ProfilePayload | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !data) return null

    return {
      firstName: data.first_name,
      lastName: data.last_name,
      addressType: data.address_type,
      street: data.street ?? undefined,
      city: data.city ?? undefined,
      stateRegion: data.state_region ?? undefined,
      postalCode: data.postal_code ?? undefined,
      country: data.country ?? undefined,
      homelessDescription: data.homeless_description ?? undefined,
      giverType: data.giver_type,
    }
  },

  async save(payload: ProfilePayload): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError(401, 'Not authenticated')

    const { error } = await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        first_name: payload.firstName,
        last_name: payload.lastName,
        address_type: payload.addressType,
        street: payload.street ?? null,
        city: payload.city ?? null,
        state_region: payload.stateRegion ?? null,
        postal_code: payload.postalCode ?? null,
        country: payload.country ?? null,
        homeless_description: payload.homelessDescription ?? null,
        giver_type: payload.giverType,
      },
      { onConflict: 'user_id' }
    )
    if (error) throw new ApiError(400, error.message)
  },

  async setVisibility(isPublic: boolean): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError(401, 'Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ is_public: isPublic })
      .eq('user_id', user.id)
    if (error) throw new ApiError(400, error.message)
  },
}

// ── Pledge ───────────────────────────────────────────────────────────────────

export interface PledgePayload {
  impactZone: string
  customImpactZone?: string
  homelessnessPriority?: boolean | null
  pledges: Array<{
    pledgeType: string
    cadence?: string
    estimatedIncome?: string
    incomePercent?: string
    estimatedNetWorth?: string
    wealthPercent?: string
    vehicleYear?: string
    vehicleMake?: string
    vehicleModel?: string
    vehicleMileage?: string
    vehicleCondition?: string
    propertyAddress?: string
    propertyType?: string
    estimatedPropertyValue?: string
    otherDescription?: string
    otherEstimatedValue?: string
    cryptoEstimatedValue?: string
    vehicleEstimatedValue?: string
  }>
}

export const pledge = {
  async get(): Promise<PledgePayload | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: pledgeData, error } = await supabase
      .from('ubi_pledges')
      .select('*, pledge_items(*)')
      .eq('user_id', user.id)
      .single()

    if (error || !pledgeData) return null

    return {
      impactZone: pledgeData.impact_zone,
      customImpactZone: pledgeData.custom_impact_zone ?? undefined,
      homelessnessPriority: pledgeData.homelessness_priority,
      pledges: (pledgeData.pledge_items ?? []).map(
        (item: Record<string, unknown>) => ({
          pledgeType: item.pledge_type as string,
          cadence: (item.cadence as string) ?? undefined,
          estimatedIncome:
            item.estimated_income != null
              ? String(item.estimated_income)
              : undefined,
          incomePercent:
            item.income_percent != null
              ? String(item.income_percent)
              : undefined,
          estimatedNetWorth:
            item.estimated_net_worth != null
              ? String(item.estimated_net_worth)
              : undefined,
          wealthPercent:
            item.wealth_percent != null
              ? String(item.wealth_percent)
              : undefined,
          vehicleYear: (item.vehicle_year as string) ?? undefined,
          vehicleMake: (item.vehicle_make as string) ?? undefined,
          vehicleModel: (item.vehicle_model as string) ?? undefined,
          vehicleMileage:
            item.vehicle_mileage != null
              ? String(item.vehicle_mileage)
              : undefined,
          vehicleCondition: (item.vehicle_condition as string) ?? undefined,
          propertyAddress: (item.property_address as string) ?? undefined,
          propertyType: (item.property_type as string) ?? undefined,
          estimatedPropertyValue:
            item.estimated_property_value != null
              ? String(item.estimated_property_value)
              : undefined,
          otherDescription: (item.other_description as string) ?? undefined,
        })
      ),
    }
  },

  async save(payload: PledgePayload): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError(401, 'Not authenticated')

    const { data: pledgeRow, error: pledgeError } = await supabase
      .from('ubi_pledges')
      .upsert(
        {
          user_id: user.id,
          impact_zone: payload.impactZone,
          custom_impact_zone: payload.customImpactZone ?? null,
          homelessness_priority: payload.homelessnessPriority ?? null,
        },
        { onConflict: 'user_id' }
      )
      .select('id')
      .single()

    if (pledgeError || !pledgeRow)
      throw new ApiError(
        400,
        pledgeError?.message ?? 'Failed to save pledge'
      )

    await supabase
      .from('pledge_items')
      .delete()
      .eq('ubi_pledge_id', pledgeRow.id)

    if (payload.pledges.length > 0) {
      const items = payload.pledges.map((p, i) => ({
        ubi_pledge_id: pledgeRow.id,
        pledge_type: p.pledgeType,
        cadence: p.cadence || null,
        estimated_income: p.estimatedIncome
          ? parseFloat(p.estimatedIncome)
          : null,
        income_percent: p.incomePercent
          ? parseFloat(p.incomePercent)
          : null,
        estimated_net_worth: p.estimatedNetWorth
          ? parseFloat(p.estimatedNetWorth)
          : null,
        wealth_percent: p.wealthPercent
          ? parseFloat(p.wealthPercent)
          : null,
        vehicle_year: p.vehicleYear || null,
        vehicle_make: p.vehicleMake || null,
        vehicle_model: p.vehicleModel || null,
        vehicle_mileage: p.vehicleMileage
          ? parseInt(p.vehicleMileage)
          : null,
        vehicle_condition: p.vehicleCondition || null,
        property_address: p.propertyAddress || null,
        property_type: p.propertyType || null,
        estimated_property_value: p.estimatedPropertyValue
          ? parseFloat(p.estimatedPropertyValue)
          : null,
        other_description: p.otherDescription || null,
        sort_order: i,
      }))

      const { error: itemsError } = await supabase
        .from('pledge_items')
        .insert(items)
      if (itemsError) throw new ApiError(400, itemsError.message)
    }
  },
}

// ── Programs ─────────────────────────────────────────────────────────────────

export const programs = {
  async saveAZTaxCredit(data: {
    filesAZTax: boolean
    willUseCredit?: boolean | null
    wantsCarryForward?: boolean | null
  }): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError(401, 'Not authenticated')

    const { error } = await supabase.from('az_tax_credit').upsert(
      {
        user_id: user.id,
        files_az_tax: data.filesAZTax,
        will_use_credit: data.willUseCredit ?? null,
        wants_carry_forward: data.wantsCarryForward ?? null,
      },
      { onConflict: 'user_id' }
    )
    if (error) throw new ApiError(400, error.message)
  },

  async saveFoundationFund(data: {
    opinion: string
    comment?: string
  }): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError(401, 'Not authenticated')

    const { error } = await supabase.from('foundation_fund_opinions').upsert(
      {
        user_id: user.id,
        opinion: data.opinion,
        comment: data.comment ?? null,
      },
      { onConflict: 'user_id' }
    )
    if (error) throw new ApiError(400, error.message)
  },

  async saveComingle(data: {
    opinion: string
    comment?: string
  }): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError(401, 'Not authenticated')

    const { error } = await supabase.from('comingle_opinions').upsert(
      {
        user_id: user.id,
        opinion: data.opinion,
        comment: data.comment ?? null,
      },
      { onConflict: 'user_id' }
    )
    if (error) throw new ApiError(400, error.message)
  },
}

// ── Volunteers ───────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  name: string
  points: number
  tier: string
}

export const volunteers = {
  async leaderboard(): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('volunteers')
      .select('name, points, tier')
      .gt('points', 0)
      .order('points', { ascending: false })
      .limit(25)
    if (error) throw new ApiError(400, error.message)
    return data ?? []
  },

  async apply(applyData: {
    name: string
    email: string
    phone?: string
    skills?: string[]
    availability?: string
  }): Promise<{
    volunteerId: string
    points: number
    tier: string
    existing?: boolean
  }> {
    const email = applyData.email.toLowerCase().trim()

    const { data: existing } = await supabase
      .from('volunteers')
      .select('id, points, tier')
      .eq('email', email)
      .single()

    if (existing) {
      return {
        volunteerId: existing.id,
        points: existing.points,
        tier: existing.tier,
        existing: true,
      }
    }

    const { data: newVol, error } = await supabase
      .from('volunteers')
      .insert({
        name: applyData.name.trim(),
        email,
        phone: applyData.phone?.trim() || null,
        skills: applyData.skills ?? [],
        availability: applyData.availability?.trim() || null,
      })
      .select('id')
      .single()

    if (error) throw new ApiError(400, error.message)
    return { volunteerId: newVol!.id, points: 0, tier: 'seed' }
  },

  async me(email: string): Promise<{
    id: string
    name: string
    email: string
    points: number
    tier: string
    created_at: string
    activities: Array<{
      activity: string
      points: number
      created_at: string
    }>
  }> {
    const { data: vol, error } = await supabase
      .from('volunteers')
      .select('id, name, email, points, tier, created_at')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !vol) throw new ApiError(404, 'Not found')

    const { data: activities } = await supabase
      .from('volunteer_activities')
      .select('activity, points, created_at')
      .eq('volunteer_id', vol.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return { ...vol, activities: activities ?? [] }
  },
}

// ── Missions (public) ────────────────────────────────────────────────────────

export const missions = {
  async submit(data: {
    volunteerEmail: string
    missionId: string
    missionTitle: string
    missionPoints: number
    evidence: string
  }): Promise<{ submissionId: string; status: string; aiVerdict: string }> {
    return serverRequest('POST', '/missions/submit', data)
  },

  async my(
    email: string
  ): Promise<
    Array<{
      id: string
      mission_id: string
      mission_title: string
      status: string
      ai_verdict: string
      points_awarded: number
      created_at: string
    }>
  > {
    const { data: vol } = await supabase
      .from('volunteers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!vol) throw new ApiError(404, 'Not found')

    const { data: submissions, error } = await supabase
      .from('mission_submissions')
      .select(
        'id, mission_id, mission_title, status, ai_verdict, points_awarded, created_at'
      )
      .eq('volunteer_id', vol.id)
      .order('created_at', { ascending: false })

    if (error) throw new ApiError(400, error.message)
    return submissions ?? []
  },
}

// ── Subscribe (public) ───────────────────────────────────────────────────────

export const subscribe = {
  async add(email: string, firstName?: string): Promise<void> {
    const { error } = await supabase.from('subscribers').upsert(
      {
        email: email.toLowerCase().trim(),
        first_name: firstName?.trim() || null,
        source: 'website',
      },
      { onConflict: 'email', ignoreDuplicates: true }
    )
    if (error) throw new ApiError(400, error.message)
  },
}

// ── Admin (Vercel serverless functions) ──────────────────────────────────────

export const admin = {
  stats: () =>
    serverRequest<{
      totalUsers: number
      verifiedUsers: number
      totalPledgeItems: number
      estimatedAnnualValue: number
      azTaxCreditCommitments: number
      foundationFundInterest: number
      comingleInterest: number
    }>('GET', '/admin/stats'),

  users: (page = 1, search = '') =>
    serverRequest<{
      users: Array<{
        id: string
        first_name: string
        last_name: string
        email: string
        giver_type: string
        verified: boolean
        role: string
        pledge_count: string
        created_at: string
      }>
      total: number
      page: number
      limit: number
    }>(
      'GET',
      `/admin/users?page=${page}&search=${encodeURIComponent(search)}`
    ),

  user: (id: string) =>
    serverRequest<Record<string, unknown>>('GET', `/admin/users/${id}`),

  sendEmail: (data: {
    subject: string
    bodyHtml: string
    recipientType?: string
  }) =>
    serverRequest<{ sent: boolean; recipientCount: number }>(
      'POST',
      '/admin/email/send',
      data
    ),

  emailHistory: () =>
    serverRequest<
      Array<{
        id: string
        subject: string
        recipient_count: number
        created_at: string
      }>
    >('GET', '/admin/email/history'),

  subscribers: () =>
    serverRequest<
      Array<{
        id: string
        email: string
        first_name: string
        source: string
        created_at: string
      }>
    >('GET', '/admin/subscribers'),

  search: (query: string) =>
    serverRequest<{ answer: string; recordCount: number }>(
      'POST',
      '/admin/search',
      { query }
    ),

  volunteerList: () =>
    serverRequest<
      Array<{
        id: string
        name: string
        email: string
        phone: string
        skills: string[]
        points: number
        tier: string
        created_at: string
      }>
    >('GET', '/admin/volunteers/list'),

  awardPoints: (data: {
    volunteerId: string
    activity: string
    points: number
    notes?: string
  }) =>
    serverRequest<{ points: number; tier: string }>(
      'POST',
      '/admin/volunteers/award',
      data
    ),

  pendingMissions: () =>
    serverRequest<
      Array<{
        id: string
        volunteer_name: string
        volunteer_email: string
        mission_title: string
        evidence: string
        ai_verdict: string
        points_awarded: number
        created_at: string
      }>
    >('GET', '/admin/missions/pending'),

  reviewMission: (data: {
    submissionId: string
    decision: 'approved' | 'rejected'
  }) =>
    serverRequest<{ reviewed: boolean; decision: string }>(
      'POST',
      '/admin/missions/review',
      data
    ),

  reminderStatus: () =>
    serverRequest<{
      azTaxSeasonActive: boolean
      givingTuesdaySeasonActive: boolean
    }>('GET', '/admin/reminders/status'),

  sendReminder: (data: { campaign?: string }) =>
    serverRequest<{ sent: boolean; results?: string[] }>(
      'POST',
      '/admin/reminders/send',
      data
    ),
}
