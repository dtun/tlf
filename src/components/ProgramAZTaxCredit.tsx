import React from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface ProgramAZTaxCreditProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export const ProgramAZTaxCredit: React.FC<ProgramAZTaxCreditProps> = ({ onBack, onGetStarted }) => {
  return (
    <StepWrapper stepKey="program-az">
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm">
            ← Back
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🌵</span>
            <h2 className="text-3xl font-bold text-textPrimary">Arizona Tax Credit</h2>
          </div>
          <p className="text-textSecondary text-base mb-6">
            Donate up to $495 to The Logical Foundation at no cost to yourself.
          </p>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="card border-accent/30 bg-accentDim/10 mb-6"
        >
          <p className="text-textPrimary text-sm leading-relaxed mb-3">
            If you're an Arizona resident, you can support The Logical Foundation through the <span className="font-semibold text-accent">Arizona Charitable Tax Credit</span>, a unique opportunity to give without spending anything extra.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-surface border border-border">
              <p className="text-2xl font-bold text-accent">$495</p>
              <p className="text-xs text-textSecondary mt-1">Single / Head of Household</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-surface border border-border">
              <p className="text-2xl font-bold text-accent">$987</p>
              <p className="text-xs text-textSecondary mt-1">Married Filing Jointly</p>
            </div>
          </div>
          <p className="text-sm text-textSecondary mt-3 text-center">
            Next year's limits: $506 (single) / $1,009 (married)
          </p>
        </motion.div>

        {/* Dollar-for-dollar explanation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-textPrimary mb-3">Dollar-for-Dollar Credit</h3>
          <p className="text-textSecondary text-sm leading-relaxed mb-3">
            These amounts are eligible for a <span className="font-semibold text-textPrimary">dollar-for-dollar tax credit</span>, not just a deduction, but a full reduction of what you owe Arizona. That means your donation effectively costs you nothing.
          </p>
          <p className="text-textSecondary text-sm leading-relaxed">
            The credit is only applicable against taxes you owe. If your deductions bring your taxes below the credit amount, the remaining credit carries forward for up to 5 years via{' '}
            <a href="https://azdor.gov/forms/tax-credits-forms/nonrefundable-individual-tax-credits-and-recapture"
              target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accentHover">
              Form 301
            </a>.
          </p>
        </motion.div>

        {/* How to claim */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-textPrimary mb-4">How to Claim It</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Donate to The Logical Foundation (QCO Code: 22852)' },
              { step: '2', text: 'When filing your AZ state taxes, complete Form 321' },
              { step: '3', text: 'Enter our QCO Code 22852 on Line 1, Part (a)' },
              { step: '4', text: 'Receive a dollar-for-dollar credit against your AZ tax owed' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.07, duration: 0.3 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-surfaceHigh"
              >
                <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </span>
                <p className="text-sm text-textSecondary leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key dates */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="card mb-6"
        >
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">Key Dates</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-textSecondary">2025 credit deadline</span>
              <span className="text-textPrimary font-semibold">April 15, 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textSecondary">Form</span>
              <span className="text-textPrimary font-semibold">Form 321</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textSecondary">QCO Code</span>
              <span className="text-accent font-bold">22852</span>
            </div>
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
          className="card mb-8"
        >
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">Resources</h3>
          <div className="space-y-2">
            <a href="https://azdor.gov/tax-credits/credits-contributions-qcos-and-qfcos"
              target="_blank" rel="noopener noreferrer"
              className="block text-sm text-accent hover:text-accentHover transition-colors">
              Arizona's official tax credit page →
            </a>
            <a href="https://azdor.gov/forms/tax-credits-forms/credit-contributions-qualifying-charitable-organizations"
              target="_blank" rel="noopener noreferrer"
              className="block text-sm text-accent hover:text-accentHover transition-colors">
              Form 321 →
            </a>
            <a href="https://www.lss-sw.org/tax-credit"
              target="_blank" rel="noopener noreferrer"
              className="block text-sm text-accent hover:text-accentHover transition-colors">
              Simple guide to Arizona tax credits →
            </a>
          </div>
        </motion.div>

        {/* Coming soon: AI tax service */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="rounded-xl border border-border bg-surfaceHigh p-4 mb-8"
        >
          <p className="text-sm text-textSecondary leading-relaxed">
            <span className="font-semibold text-textPrimary">Coming next year:</span> AI-powered free tax service to help you file and claim your QCO credit automatically.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.3 }}
          className="space-y-3 mb-6"
        >
          <button onClick={onGetStarted} className="btn-primary w-full text-base py-4">
            Commit to Using the Credit →
          </button>
          <a
            href="https://thelogicalfoundation.org/donate/"
            target="_blank" rel="noopener noreferrer"
            className="btn-secondary w-full text-center block"
          >
            Donate Now
          </a>
        </motion.div>

        <button onClick={onBack} className="btn-secondary w-full">← Back</button>
      </div>
    </StepWrapper>
  );
};
