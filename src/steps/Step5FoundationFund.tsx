import React from 'react';
import { motion } from 'framer-motion';
import { FoundationFund } from '../types';
import { NavButtons } from '../components/NavButtons';
import { StepWrapper } from '../components/StepWrapper';

interface Step5Props {
  foundationFund: FoundationFund;
  onChange: (patch: Partial<FoundationFund>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5FoundationFund: React.FC<Step5Props> = ({
  foundationFund,
  onChange,
  onNext,
  onBack,
}) => {
  return (
    <StepWrapper stepKey="step5">
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🏦</span>
          <div>
            <h2 className="text-2xl font-bold text-textPrimary">The Foundation Fund</h2>
            <span className="text-xs font-semibold text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        <div className="card mt-4 mb-6">
          <p className="text-textSecondary text-sm leading-relaxed">
            The Foundation Fund is a <span className="text-textPrimary font-medium">non-tax-deductible,
            community-owned UBI pot</span>. Anyone can join by contributing at least{' '}
            <span className="text-accent font-semibold">$1 per year</span>. All contributions
            are pooled together and split equally among every participant in the fund.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: '🤝', label: 'Community Owned', desc: 'Every member has equal stake' },
              { icon: '⚖️', label: 'Equal Split', desc: 'Pool divided evenly' },
              { icon: '🏆', label: 'Leaderboard', desc: 'Top contributors recognized' },
            ].map(item => (
              <div key={item.label} className="bg-surfaceHigh rounded-xl p-3 text-center">
                <span className="text-2xl block mb-1">{item.icon}</span>
                <p className="text-xs font-semibold text-textPrimary">{item.label}</p>
                <p className="text-sm text-textSecondary mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-textPrimary mb-4">
          What do you think?
        </h3>

        <div className="flex gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange({ opinion: 'terrible' })}
            className={`flex-1 py-4 rounded-xl font-semibold border-2 transition-all duration-200 ${
              foundationFund.opinion === 'terrible'
                ? 'border-danger bg-danger/10 text-danger'
                : 'border-border text-textSecondary hover:border-danger/50'
            }`}
          >
            😬 Terrible Idea
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange({ opinion: 'good' })}
            className={`flex-1 py-4 rounded-xl font-semibold border-2 transition-all duration-200 ${
              foundationFund.opinion === 'good'
                ? 'border-accent bg-accentDim/30 text-accent'
                : 'border-border text-textSecondary hover:border-accent/50'
            }`}
          >
            🙌 Good Idea, I'd Join
          </motion.button>
        </div>

        {foundationFund.opinion && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Any thoughts? <span className="text-textSecondary">(optional)</span>
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Share your feedback..."
              value={foundationFund.comment}
              onChange={e => onChange({ comment: e.target.value })}
            />
          </motion.div>
        )}

        <NavButtons
          onNext={onNext}
          onBack={onBack}
          nextDisabled={foundationFund.opinion === null}
          nextLabel="Continue"
        />
      </div>
    </StepWrapper>
  );
};
