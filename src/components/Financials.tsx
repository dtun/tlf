import React from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface FinancialsProps {
  onBack: () => void;
  onNavigate?: (page: number) => void;
}

// ── Placeholder components — replace content when data is available ────────────

const StatCard: React.FC<{ value: string; label: string; accent?: boolean }> = ({ value, label, accent }) => (
  <div className={`rounded-xl p-4 border text-center ${accent ? 'bg-accentDim/10 border-accent/30' : 'bg-surface border-border'}`}>
    <div className={`text-2xl font-bold mb-1 ${accent ? 'text-accent' : 'text-textPrimary'}`}>{value}</div>
    <div className="text-sm text-textSecondary leading-snug">{label}</div>
  </div>
);

const BarRow: React.FC<{ label: string; pct: number; value: string; color?: string }> = ({ label, pct, value, color = 'bg-accent' }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs mb-1">
      <span className="text-textSecondary">{label}</span>
      <span className="text-textPrimary font-medium">{value}</span>
    </div>
    <div className="h-2 bg-surfaceHigh rounded-full overflow-hidden">
      <motion.div className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
    </div>
  </div>
);

export const Financials: React.FC<FinancialsProps> = ({ onBack, onNavigate }) => {
  return (
    <StepWrapper stepKey="financials">
      <div className="px-4 py-2">
        <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm mb-6 block">← Back</button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📊</span>
            <h2 className="text-3xl font-bold text-textPrimary">Financials</h2>
          </div>
          <p className="text-textSecondary text-sm mb-6">
            Full financial transparency — annual reports, expense breakdowns, and program outcomes.
          </p>
        </motion.div>

        {/* Coming soon banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="card border-accent/30 bg-accentDim/10 text-center mb-8 py-8">
          <div className="text-5xl mb-4">🔜</div>
          <h3 className="text-xl font-bold text-textPrimary mb-2">Coming Soon</h3>
          <p className="text-textSecondary text-sm leading-relaxed max-w-xs mx-auto mb-4">
            We are preparing our full financial disclosures. Check back soon for our annual report, expense breakdown, and program outcomes.
          </p>
          {onNavigate && (
            <button onClick={() => onNavigate(101)}
              className="text-sm font-semibold text-accent hover:text-accentHover transition-colors border border-accent/40 rounded-full px-4 py-1.5 hover:bg-accent/10">
              Stay Informed →
            </button>
          )}
        </motion.div>

        {/* Program stats — fill in when data is ready */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-6">
          <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-3">Program Highlights</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Replace placeholder values with real figures */}
            <StatCard value="—" label="Participants served" accent />
            <StatCard value="—" label="Housing outcomes" accent />
            <StatCard value="—" label="Total cash distributed" />
            <StatCard value="—" label="Cost per participant" />
          </div>
        </motion.div>

        {/* Revenue breakdown — fill in when data is ready */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="card mb-6">
          <h3 className="text-sm font-semibold text-textPrimary mb-1">Revenue</h3>
          <p className="text-xs text-textMuted mb-4">By source — replace percentages with actual figures</p>
          {/* Replace labels, pct, and value with real data */}
          <BarRow label="Individual donations" pct={0} value="—" />
          <BarRow label="AZ Tax Credit contributions" pct={0} value="—" />
          <BarRow label="Grants and foundations" pct={0} value="—" />
        </motion.div>

        {/* Expense breakdown — fill in when data is ready */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card mb-6">
          <h3 className="text-sm font-semibold text-textPrimary mb-1">Expenses</h3>
          <p className="text-xs text-textMuted mb-4">By category — replace percentages with actual figures</p>
          {/* Replace labels, pct, and value with real data */}
          <BarRow label="Direct cash to participants" pct={0} value="—" color="bg-accent" />
          <BarRow label="Program operations" pct={0} value="—" color="bg-blue-400/60" />
          <BarRow label="Research and evaluation" pct={0} value="—" color="bg-purple-400/60" />
          <BarRow label="Administration and fundraising" pct={0} value="—" color="bg-textMuted/40" />
        </motion.div>

        {/* Transparency credentials */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="card border-accent/20 mb-6">
          <h3 className="text-sm font-semibold text-textPrimary mb-3">Transparency and Accountability</h3>
          <div className="space-y-3 text-sm text-textSecondary">
            {[
              'Candid (GuideStar) Platinum Transparency Seal',
              '501(c)(3) registered nonprofit, EIN# 88-3607946',
              'Annual IRS Form 990 filed and publicly available',
              'Independent financial review conducted annually',
              'All program outcomes independently documented',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scale vision — fill in when data is ready */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="card mb-6">
          <h3 className="text-sm font-semibold text-textPrimary mb-3">What Scale Looks Like</h3>
          <div className="space-y-3">
            {/* Replace cost figures with current estimates */}
            {[
              { goal: 'End homelessness in Pima County', cost: '—', note: 'Est. 3,500 chronically homeless residents' },
              { goal: 'End homelessness statewide', cost: '—', note: 'Est. 14,000 homeless Arizonans' },
              { goal: 'Statewide UBI pilot (1,000 people)', cost: '—', note: '$500/month x 1,000 participants x 12 months' },
            ].map(item => (
              <div key={item.goal} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-textPrimary">{item.goal}</p>
                  <p className="text-xs text-textMuted">{item.note}</p>
                </div>
                <div className="text-accent font-bold text-sm flex-shrink-0">{item.cost}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* External links */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="space-y-3 mb-6">
          {/* Uncomment and update href when annual report PDF is ready */}
          {/* <a href="https://thelogicalfoundation.org/wp-content/uploads/..." target="_blank" rel="noopener noreferrer"
            className="btn-primary w-full text-center block">Download Annual Report (PDF) →</a> */}
          <a href="https://www.guidestar.org/profile/shared/8ecd9613-4d44-49f0-8de7-0b5a4a2605fb"
            target="_blank" rel="noopener noreferrer"
            className="btn-secondary w-full text-center block">
            View on Candid / GuideStar →
          </a>
        </motion.div>

        <button onClick={onBack} className="btn-secondary w-full">← Back</button>
      </div>
    </StepWrapper>
  );
};
