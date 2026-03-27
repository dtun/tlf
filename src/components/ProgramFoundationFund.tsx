import React from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface ProgramFoundationFundProps {
  onBack: () => void;
  onStayInformed?: () => void;
}

export const ProgramFoundationFund: React.FC<ProgramFoundationFundProps> = ({ onBack, onStayInformed }) => {
  return (
    <StepWrapper stepKey="program-foundation-fund">
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm">
            ← Back
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏛️</span>
            <h2 className="text-3xl font-bold text-textPrimary">Foundation Fund</h2>
          </div>
          <p className="text-textSecondary text-base mb-6">
            A community-owned UBI pot where every contribution is split equally among all participants.
          </p>
        </motion.div>

        {/* Coming soon banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="rounded-2xl border-2 border-dashed border-accent/40 bg-accentDim/10 p-8 text-center mb-8"
        >
          <p className="text-4xl mb-3">🚧</p>
          <p className="text-xl font-bold text-textPrimary mb-2">Coming Soon</p>
          <p className="text-textSecondary text-sm mb-4">
            The Foundation Fund is in development. Sign up to be notified when it launches.
          </p>
          <button onClick={onStayInformed}
            className="text-sm font-semibold text-accent hover:text-accentHover transition-colors border border-accent/40 rounded-full px-4 py-1.5 hover:bg-accent/10">
            Stay Informed →
          </button>
        </motion.div>

        {/* What it is */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-textPrimary mb-3">What Is the Foundation Fund?</h3>
          <p className="text-textSecondary text-sm leading-relaxed mb-3">
            The Foundation Fund is a community-owned UBI pool. Anyone can join for as little as <span className="font-semibold text-accent">$1/year</span>. All contributions are pooled and split equally among all participants, creating a shared Universal Basic Income for everyone in the fund.
          </p>
          <p className="text-textSecondary text-sm leading-relaxed">
            A leaderboard will recognize top contributors. The more people who join and contribute, the larger the shared payment becomes for everyone.
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-textPrimary mb-4">How It Will Work</h3>
          <div className="space-y-3">
            {[
              { icon: '💵', title: 'Contribute any amount', desc: 'Join for as little as $1/year. Contribute as much as you want, every dollar goes into the shared pool.' },
              { icon: '➗', title: 'Equal split for all', desc: 'The entire pool is divided equally among every participant, regardless of how much they contributed.' },
              { icon: '🏆', title: 'Leaderboard recognition', desc: 'Top contributors are recognized publicly on a leaderboard (with your permission).' },
              { icon: '📊', title: 'Transparent reporting', desc: 'Full visibility into the pool size, number of participants, and per-person payment.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
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
        </motion.div>

        {/* Example */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
          className="card mb-8"
        >
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">Example</h3>
          <p className="text-textSecondary text-sm leading-relaxed">
            If 1,000 people each contribute $100/year, the pool is $100,000. Split equally, every participant receives <span className="font-semibold text-accent">$100/year</span>, meaning contributors effectively give for free while also receiving a UBI payment.
          </p>
        </motion.div>

        {/* Notify CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="space-y-3 mb-6"
        >
          <button onClick={onStayInformed} className="btn-primary w-full text-base py-4">
            Notify Me When It Launches →
          </button>
        </motion.div>

        <button onClick={onBack} className="btn-secondary w-full">← Back</button>
      </div>
    </StepWrapper>
  );
};
