import React from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface ProgramComingleProps {
  onBack: () => void;
  onStayInformed?: () => void;
}

export const ProgramComingle: React.FC<ProgramComingleProps> = ({ onBack, onStayInformed }) => {
  return (
    <StepWrapper stepKey="program-comingle">
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm">
            ← Back
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔄</span>
            <h2 className="text-3xl font-bold text-textPrimary">Comingle</h2>
          </div>
          <p className="text-textSecondary text-base mb-6">
            An income-sharing community where members create a private UBI floor for each other.
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
            Comingle is in development. Sign up to be notified when it launches.
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
          <h3 className="text-lg font-bold text-textPrimary mb-3">What Is Comingle?</h3>
          <p className="text-textSecondary text-sm leading-relaxed mb-3">
            Comingle is an income-sharing community where members contribute <span className="font-semibold text-textPrimary">7% of their income</span> through a secure bank connection. The pool is redistributed weekly to all members, creating a roughly <span className="font-semibold text-accent">$50/week UBI floor</span> for everyone in the community.
          </p>
          <p className="text-textSecondary text-sm leading-relaxed">
            The more members who join, the larger and more stable the floor becomes. It's a private, voluntary Universal Basic Income built by the community, for the community.
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
              { icon: '🔗', title: 'Connect your bank', desc: 'Securely link your account. 7% of your income is automatically contributed each week.' },
              { icon: '🏦', title: 'Pool is redistributed', desc: 'Every week, the entire pool is split equally among all active members.' },
              { icon: '📈', title: 'Floor grows with membership', desc: 'As more people join, everyone\'s weekly payment increases.' },
              { icon: '🚪', title: 'Leave anytime', desc: 'Membership is voluntary. You can exit the community at any time.' },
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
