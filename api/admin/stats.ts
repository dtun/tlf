import { verifyAdmin, validateOrigin, logAdminAction, errorResponse, jsonResponse } from '../_lib/admin'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return errorResponse(405, 'Method not allowed')
  if (!validateOrigin(req)) return errorResponse(403, 'Origin not allowed')
  try {
    const { userId, supabase } = await verifyAdmin(req)

    const [
      { count: totalUsers },
      { count: verifiedUsers },
      { count: totalPledgeItems },
      { count: azTaxCredit },
      { count: ffInterest },
      { count: comingleInterest },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('pledge_items').select('*', { count: 'exact', head: true }),
      supabase.from('az_tax_credit').select('*', { count: 'exact', head: true }).eq('will_use_credit', true),
      supabase.from('foundation_fund_opinions').select('*', { count: 'exact', head: true }).eq('opinion', 'good'),
      supabase.from('comingle_opinions').select('*', { count: 'exact', head: true }).eq('opinion', 'good'),
    ])

    const { data: pledgeItems } = await supabase
      .from('pledge_items')
      .select('pledge_type, estimated_income, income_percent, estimated_net_worth, wealth_percent')

    let estimatedAnnualValue = 0
    for (const item of pledgeItems ?? []) {
      if (item.pledge_type === 'income_based' && item.estimated_income && item.income_percent) {
        estimatedAnnualValue += (item.estimated_income * item.income_percent) / 100
      } else if (item.pledge_type === 'wealth_based' && item.estimated_net_worth && item.wealth_percent) {
        estimatedAnnualValue += (item.estimated_net_worth * item.wealth_percent) / 100
      }
    }

    await logAdminAction(supabase, userId, 'view', 'stats', undefined, undefined, req)

    return jsonResponse({
      totalUsers: totalUsers ?? 0,
      verifiedUsers: verifiedUsers ?? 0,
      totalPledgeItems: totalPledgeItems ?? 0,
      estimatedAnnualValue,
      azTaxCreditCommitments: azTaxCredit ?? 0,
      foundationFundInterest: ffInterest ?? 0,
      comingleInterest: comingleInterest ?? 0,
    })
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'Unauthorized') return errorResponse(401, msg)
    if (msg === 'Forbidden') return errorResponse(403, msg)
    return errorResponse(500, 'Internal server error')
  }
}
