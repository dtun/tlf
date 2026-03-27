import React from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface ProgramUBIPledgeProps {
  onBack: () => void;
  onGetStarted: () => void;
  onNavigate?: (page: number) => void;
}


export const ProgramUBIPledge: React.FC<ProgramUBIPledgeProps> = ({ onBack, onGetStarted, onNavigate }) => {
  return (
    <StepWrapper stepKey="program-ubi">
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm">
            ← Back
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🤝</span>
            <h2 className="text-3xl font-bold text-textPrimary">UBI Giving Pledge</h2>
          </div>
          <p className="text-textSecondary text-base mb-6">
            Commit a portion of your income, wealth, or assets to ending poverty, on your terms.
          </p>
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="card border-accent/30 bg-accentDim/10 mb-6"
        >
          <p className="text-textPrimary text-sm leading-relaxed mb-4">
            The UBI Giving Pledge is a commitment, virtual or real, to contribute toward ending poverty through Universal Basic Income. We distribute pledged funds evenly across your chosen geographic area, combining every pledge into a collective force for change.
          </p>
          <p className="text-textSecondary text-sm leading-relaxed">
            Even if you can't give today, your pledge accumulates as a virtual commitment and counts toward our collective goals. When you're ready, your pledge converts to real impact.
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
          <h3 className="text-lg font-bold text-textPrimary mb-4">How It Works</h3>
        </motion.div>
        <div className="space-y-3 mb-8">
          {[
            { icon: '🌍', title: 'Choose your impact zone', desc: 'Direct your pledge to Arizona, the United States, Earth, or a custom region. We start in Arizona and expand as we grow.' },
            { icon: '🎁', title: 'Choose your pledge type', desc: 'Income-based (% of annual income), wealth-based (% of net worth), vehicle donation, real estate, crypto, or any other gift.' },
            { icon: '📊', title: 'See your commitment', desc: 'Your estimated annual contribution is calculated automatically. You can add multiple pledge types.' },
            { icon: '💸', title: 'Money goes directly to people', desc: 'Funds are distributed as unconditional cash to individuals in your chosen area. No strings attached, recipients decide how to use it.' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-surfaceHigh"
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-textPrimary mb-1">{item.title}</p>
                <p className="text-sm text-textSecondary leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Impact stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="card mb-8"
        >
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-4">Why UBI Works</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: '300+', label: 'rigorous studies showing positive outcomes' },
              { stat: '100%', label: 'of 2024 pilot participants regained housing' },
              { stat: '$20M', label: 'could cut Arizona homelessness in half' },
              { stat: '$0', label: 'overhead on AZ tax credit donations' },
            ].map(item => (
              <div key={item.stat} className="text-center p-3 rounded-xl bg-surfaceHigh">
                <p className="text-2xl font-bold text-accent mb-1">{item.stat}</p>
                <p className="text-sm text-textSecondary leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        {onNavigate && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.3 }}
            className="card border-border/50 text-center mb-8">
            <p className="text-sm text-textSecondary mb-2">Have questions about the pledge?</p>
            <button onClick={() => onNavigate(106)}
              className="text-sm font-semibold text-accent hover:text-accentHover transition-colors">
              View full FAQ →
            </button>
          </motion.div>
        )}

        {/* UBI Network */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.3 }}
          className="card border-accent/20 mb-8"
        >
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">The UBI Network</h3>
          <p className="text-sm text-textSecondary leading-relaxed mb-3">
            Every pledger joins the UBI Network, a growing community of individuals and organizations committed to ending poverty through unconditional cash. Your pledge, combined with others, creates a collective funding stream that grows predictably over time.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { stat: 'Virtual', label: 'pledges count toward collective goals' },
              { stat: 'Real', label: 'donations go directly to recipients' },
              { stat: 'Permanent', label: 'endowments fund UBI forever' },
            ].map(item => (
              <div key={item.stat} className="p-2 rounded-lg bg-surfaceHigh">
                <p className="text-sm font-bold text-accent mb-1">{item.stat}</p>
                <p className="text-sm text-textSecondary leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.3 }}
          className="space-y-3 mb-6"
        >
          <button onClick={onGetStarted} className="btn-primary w-full text-base py-4">
            Make Your Pledge →
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
