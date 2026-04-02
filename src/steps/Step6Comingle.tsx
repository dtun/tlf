import React from 'react';
import { motion } from 'framer-motion';
import { Comingle } from '../types';
import { NavButtons } from '../components/NavButtons';
import { StepWrapper } from '../components/StepWrapper';

interface Step6Props {
  comingle: Comingle;
  onChange: (patch: Partial<Comingle>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Comingle logo: green C + blue O connected as an infinity symbol
const ComingleLogo: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 120 66" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Green C, left loop of infinity */}
    <circle cx="33" cy="33" r="26" fill="none" stroke="#00cc44" strokeWidth="10"/>
    {/* Mask out the right side of the C to make it open toward the O */}
    <rect x="46" y="7" width="20" height="52" fill="#0a0a0a"/>

    {/* Blue O, right loop of infinity */}
    <circle cx="87" cy="33" r="26" fill="none" stroke="#3b82f6" strokeWidth="10"/>
    {/* Mask out the left side of the O where it overlaps with C */}
    <rect x="54" y="7" width="20" height="52" fill="#0a0a0a"/>

    {/* Connecting bridge, the shared center of the infinity */}
    <rect x="54" y="26" width="12" height="14" fill="#0a0a0a"/>
  </svg>
);

export const Step6Comingle: React.FC<Step6Props> = ({
  comingle,
  onChange,
  onNext,
  onBack,
}) => {
  return (
    <StepWrapper stepKey="step6">
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 mb-1">
          <ComingleLogo size={64} />
          <div>
            <h2 className="text-2xl font-bold text-textPrimary">Comingle</h2>
            <span className="text-xs font-semibold text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        <p className="text-textSecondary text-sm mt-3 mb-4 leading-relaxed">
          Comingle is a <span className="text-textPrimary font-medium">money-sharing app</span>, a network of people pledging to share a portion of their income so that everyone has a weekly guaranteed income.
        </p>

        {/* How it works */}
        <div className="card mb-4">
          <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">How It Works</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">1️⃣</span>
              <p className="text-sm text-textSecondary">
                <span className="text-textPrimary font-medium">Everyone pledges 7% of their income.</span> Your bank connects securely - Comingle never sees your credentials.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">2️⃣</span>
              <p className="text-sm text-textSecondary">
                <span className="text-textPrimary font-medium">Everyone gets back the average contribution.</span> You give on high-income weeks, receive on low-income weeks.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">3️⃣</span>
              <p className="text-sm text-textSecondary">
                <span className="text-textPrimary font-medium">97% of contributions go directly to members.</span> Near-zero fees, weekly payouts, geographic targeting down to the zip code.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { value: '7%', label: 'Income pledged', color: 'text-green-400' },
            { value: '97%', label: 'Goes to members', color: 'text-blue-400' },
            { value: '~$50', label: 'Weekly floor', color: 'text-accent' },
          ].map(s => (
            <div key={s.label} className="bg-surfaceHigh rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-textSecondary mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Preview feature */}
        <div className="card mb-4 border-blue-800/40 bg-blue-950/20">
          <p className="text-sm text-textSecondary leading-relaxed">
            <span className="text-blue-300 font-semibold">Preview before you commit:</span> When you connect your bank, you can look back at 24 weeks of activity to see exactly how membership would have impacted your income, no obligation until you're ready.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-textPrimary mb-4">What do you think?</h3>

        <div className="flex gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => onChange({ opinion: 'terrible' })}
            className={`flex-1 py-4 rounded-xl font-semibold border-2 transition-all duration-200 ${
              comingle.opinion === 'terrible'
                ? 'border-danger bg-danger/10 text-danger'
                : 'border-border text-textSecondary hover:border-danger/50'
            }`}>
            😬 Terrible Idea
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => onChange({ opinion: 'good' })}
            className={`flex-1 py-4 rounded-xl font-semibold border-2 transition-all duration-200 ${
              comingle.opinion === 'good'
                ? 'border-accent bg-accentDim/30 text-accent'
                : 'border-border text-textSecondary hover:border-accent/50'
            }`}>
            🙌 Good Idea, I'd Join
          </motion.button>
        </div>

        {comingle.opinion && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Any thoughts? <span className="text-textSecondary">(optional)</span>
            </label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="Share your feedback..."
              value={comingle.comment}
              onChange={e => onChange({ comment: e.target.value })} />
          </motion.div>
        )}

        <NavButtons
          onNext={onNext}
          onBack={onBack}
          nextDisabled={comingle.opinion === null}
          nextLabel="Continue to Review"
        />
      </div>
    </StepWrapper>
  );
};
