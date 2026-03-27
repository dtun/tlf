import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';
import type { PledgeItem } from '../types';

/** Renders the GiveButter widget by injecting the custom element after mount.
 *  Using innerHTML avoids React's custom-element upgrade timing issues. */
const GiveButterWidget: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Clear and inject fresh so the element is created after the script has run
    el.innerHTML = '';
    const widget = document.createElement('givebutter-widget');
    widget.setAttribute('id', campaignId);
    el.appendChild(widget);
  }, [campaignId]);

  return <div ref={ref} className="min-h-[420px] w-full" />;
};

interface DonatePageProps {
  onBack: () => void;
  pledges?: PledgeItem[];
  onNavigate?: (page: number) => void;
}

/** Compute an estimated annual cash commitment from pledge items. Returns null if no numeric estimate is possible. */
function estimateAnnualCommitment(pledges: PledgeItem[]): number | null {
  let total = 0;
  let hasEstimate = false;

  for (const p of pledges) {
    const cadenceMultiplier = p.cadence === 'monthly' ? 12 : 1; // annual or planned = 1×

    if (p.pledgeType === 'income_based') {
      const income = parseFloat(p.estimatedIncome.replace(/[^0-9.]/g, ''));
      const pct = parseFloat(p.incomePercent);
      if (!isNaN(income) && !isNaN(pct)) {
        total += (income * pct) / 100 * cadenceMultiplier;
        hasEstimate = true;
      }
    } else if (p.pledgeType === 'wealth_based') {
      const wealth = parseFloat(p.estimatedNetWorth.replace(/[^0-9.]/g, ''));
      const pct = parseFloat(p.wealthPercent);
      if (!isNaN(wealth) && !isNaN(pct)) {
        total += (wealth * pct) / 100 * cadenceMultiplier;
        hasEstimate = true;
      }
    } else if (p.pledgeType === 'vehicle') {
      const val = parseFloat(p.vehicleEstimatedValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) { total += val; hasEstimate = true; }
    } else if (p.pledgeType === 'real_estate') {
      const val = parseFloat(p.estimatedPropertyValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) { total += val; hasEstimate = true; }
    } else if (p.pledgeType === 'crypto') {
      const val = parseFloat(p.cryptoEstimatedValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) { total += val; hasEstimate = true; }
    } else if (p.pledgeType === 'other') {
      const val = parseFloat(p.otherEstimatedValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) { total += val; hasEstimate = true; }
    }
  }

  return hasEstimate && total > 0 ? Math.round(total) : null;
}

export const DonatePage: React.FC<DonatePageProps> = ({ onBack, pledges = [], onNavigate }) => {
  const commitment = estimateAnnualCommitment(pledges);
  const hasPledges = pledges.length > 0;

  return (
    <StepWrapper stepKey="donate">
      <div className="px-4 py-2">
        <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm mb-6 block">← Back</button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💚</span>
            <h2 className="text-3xl font-bold text-textPrimary">Donate</h2>
          </div>
          <div className="flex items-start gap-3 bg-yellow-900/30 border border-yellow-600/50 rounded-xl px-4 py-3 mb-6">
            <span className="text-yellow-400 text-lg flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-sm font-medium text-yellow-200 leading-snug">
              When prompted, set the GiveButter tip to <strong>$0</strong> so your full gift reaches TLF.
            </p>
          </div>
        </motion.div>

        {/* Pledge commitment banner — shown when the user has an active pledge */}
        {hasPledges && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="card border-accent/40 bg-accentDim/10 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🤝</span>
              <div>
                <p className="text-sm font-semibold text-textPrimary mb-0.5">Your UBI Giving Pledge</p>
                {commitment !== null ? (
                  <>
                    <p className="text-accent text-xl font-bold mb-1">
                      ${commitment.toLocaleString()}
                      <span className="text-sm font-normal text-textMuted ml-1">estimated commitment</span>
                    </p>
                    <p className="text-sm text-textSecondary">
                      Use the form below to fulfill your pledge. You can give all at once or in installments.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-textSecondary">
                    You have {pledges.length} active pledge{pledges.length > 1 ? 's' : ''}. Use the form below to make your donation.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* GiveButter widget */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8">
          <GiveButterWidget campaignId="gKDOwp" />
        </motion.div>

        {/* Tax info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
          className="card border-accent/30 bg-accentDim/10 mb-8 text-center">
          <p className="text-sm text-textSecondary mb-1">Tax-deductible 501(c)(3) nonprofit</p>
          <p className="text-accent font-bold">EIN# 88-3607946</p>
        </motion.div>

        {/* Payment methods */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }}
          className="card mb-8">
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">Payment Methods</h3>
          <div className="flex flex-wrap gap-2">
            {['Credit / Debit Card', 'PayPal', 'Venmo', 'Zelle', 'ACH / Bank Transfer', 'Wire Transfer', 'Stocks', 'Crypto'].map(m => (
              <span key={m} className="text-xs text-textSecondary border border-border rounded-full px-3 py-1">{m}</span>
            ))}
          </div>
        </motion.div>

        {/* FAQ link */}
        {onNavigate && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}
            className="card border-border/50 text-center mb-8">
            <p className="text-sm text-textSecondary mb-2">Questions about tax deductions, employer matching, or how funds are used?</p>
            <button onClick={() => onNavigate(106)}
              className="text-sm font-semibold text-accent hover:text-accentHover transition-colors">
              View full FAQ →
            </button>
          </motion.div>
        )}

        <div className="mt-2">
          <button onClick={onBack} className="btn-secondary w-full">← Back</button>
        </div>
      </div>
    </StepWrapper>
  );
};
