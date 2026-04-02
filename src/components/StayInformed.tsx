import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';
import { subscribe as subscribeApi } from '../lib/api';

interface StayInformedProps {
  onBack: () => void;
}

const SOCIALS = [
  { label: 'X / Twitter', handle: '@Foundation_TLF', href: 'https://twitter.com/Foundation_TLF', icon: '𝕏' },
  { label: 'Instagram', handle: '@foundation_tlf', href: 'https://www.instagram.com/foundation_tlf/', icon: '📸' },
  { label: 'LinkedIn', handle: 'The Logical Foundation', href: 'https://www.linkedin.com/company/foundation-tlf/', icon: '💼' },
  { label: 'TikTok', handle: '@foundation_tlf', href: 'https://www.tiktok.com/@foundation_tlf', icon: '🎵' },
  { label: 'YouTube', handle: '@Foundation_TLF', href: 'https://www.youtube.com/@Foundation_TLF', icon: '▶️' },
  { label: 'Facebook', handle: 'The Logical Foundation', href: 'https://www.facebook.com/thelogicalfoundation', icon: '👥' },
];

type FormState = 'idle' | 'loading' | 'success' | 'error' | 'existing';

export const StayInformed: React.FC<StayInformedProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setFormState('loading');
    setErrorMsg('');
    try {
      await subscribeApi.add(email.trim(), firstName.trim() || undefined);
      setFormState('success');
    } catch {
      setErrorMsg('Network error, please try again.');
      setFormState('error');
    }
  };

  return (
    <StepWrapper stepKey="stay-informed">
      <div className="px-4 py-2">
        <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm mb-6 block">← Back</button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-3xl font-bold text-textPrimary mb-1">Stay Informed</h2>
          <p className="text-textSecondary text-base mb-6">
            Program updates, research, and event invites, a few times a month.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.35 }}
          className="card mb-8">

          {formState === 'success' && (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-textPrimary font-semibold mb-1">You're on the list!</p>
              <p className="text-textSecondary text-sm">We'll be in touch soon.</p>
            </div>
          )}

          {formState === 'existing' && (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-textPrimary font-semibold mb-1">Already subscribed</p>
              <p className="text-textSecondary text-sm">You're already on our list, we'll keep you posted.</p>
            </div>
          )}

          {(formState === 'idle' || formState === 'loading' || formState === 'error') && (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  First Name <span className="text-textMuted">(optional)</span>
                </label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="Your first name" className="input-field" disabled={formState === 'loading'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input-field" required disabled={formState === 'loading'} />
              </div>
              {formState === 'error' && <p className="text-danger text-sm">{errorMsg}</p>}
              <button type="submit" disabled={formState === 'loading' || !email.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {formState === 'loading' ? 'Subscribing…' : 'Subscribe →'}
              </button>
              <p className="text-sm text-textSecondary text-center">No spam. Unsubscribe anytime by replying to any email.</p>
            </form>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.35 }}>
          <h3 className="text-lg font-bold text-textPrimary mb-4">Follow Us</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {SOCIALS.map((s, i) => (
              <motion.a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + i * 0.05, duration: 0.3 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface hover:border-accent/40 hover:bg-surfaceHigh transition-all group">
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-textPrimary group-hover:text-accent transition-colors truncate">{s.label}</p>
                  <p className="text-xs text-textMuted truncate">{s.handle}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        <button onClick={onBack} className="btn-secondary w-full">← Back</button>
      </div>
    </StepWrapper>
  );
};
