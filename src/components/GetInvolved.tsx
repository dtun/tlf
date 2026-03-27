import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';
// Contact form submits to serverless function

interface GetInvolvedProps {
  onBack: () => void;
}

export const GetInvolved: React.FC<GetInvolvedProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!name || !email || !message) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/contact/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <StepWrapper stepKey="get-involved">
      <div className="px-4 py-2">
        <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm mb-6 block">← Back</button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">✨</span>
            <h2 className="text-3xl font-bold text-textPrimary">Get Involved</h2>
          </div>
          <p className="text-textSecondary text-base mb-6">
            Join the movement to end poverty through Universal Basic Income.
          </p>
        </motion.div>

        {/* Ways to help */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} className="mb-8">
          <h3 className="text-lg font-bold text-textPrimary mb-4">Ways to Help</h3>
          <div className="space-y-3">
            {[
              { icon: '📣', title: 'Spread the Word', desc: 'Share our mission on social media. Tag us @Foundation_TLF and help us reach more people.' },
              { icon: '💰', title: 'Fundraise', desc: 'Host a fundraiser, birthday campaign, or workplace giving drive. Donations are distributed directly to local residents as unconditional cash.' },
              { icon: '🎉', title: 'Host an Event', desc: 'Organize a community event to raise awareness and funds for Universal Basic Income in Arizona.' },
              { icon: '🤝', title: 'Make Connections', desc: 'Know a major donor, foundation, or corporate partner? Introductions are invaluable.' },
              { icon: '📢', title: 'Advocate', desc: 'Contact your elected officials. Support UBI legislation at the local, state, and federal level.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.3 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-surfaceHigh">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-textPrimary mb-1">{item.title}</p>
                  <p className="text-sm text-textSecondary leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Careers / Volunteer roles */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }} className="mb-8">
          <h3 className="text-lg font-bold text-textPrimary mb-2">Open Volunteer Roles</h3>
          <p className="text-textSecondary text-sm mb-4 leading-relaxed">
            We are a volunteer-driven organization. Strong volunteers may be offered paid positions as we grow.
          </p>
          <div className="space-y-3">
            {[
              { role: 'Major Gift Officer', desc: 'Cultivate relationships with high-net-worth donors and foundations. Experience in nonprofit fundraising preferred.' },
              { role: 'Grant Writer', desc: 'Research and write grant applications to foundations and government agencies. Strong writing skills required.' },
              { role: 'Event Organizer', desc: 'Plan and execute fundraising and awareness events in the Phoenix/Tucson area.' },
              { role: 'Social Media Manager', desc: 'Create content and manage our presence on Instagram, TikTok, LinkedIn, and X.' },
              { role: 'Research Assistant', desc: 'Help compile and summarize academic research on Universal Basic Income and homelessness.' },
            ].map((item, i) => (
              <motion.div key={item.role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.3 }}
                className="card">
                <p className="text-sm font-semibold text-textPrimary mb-1">{item.role}</p>
                <p className="text-sm text-textSecondary leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Volunteer form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.3 }} className="mb-8">
          <h3 className="text-lg font-bold text-textPrimary mb-4">Volunteer Sign-Up</h3>

          {status === 'success' ? (
            <div className="card text-center py-8">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-textPrimary font-semibold mb-1">Thank you!</p>
              <p className="text-textSecondary text-sm">We'll be in touch soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Name <span className="text-danger">*</span></label>
                <input type="text" className="input-field" placeholder="Your name" value={name}
                  onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Email <span className="text-danger">*</span></label>
                <input type="email" className="input-field" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">How would you like to help? <span className="text-danger">*</span></label>
                <textarea className="input-field min-h-[100px] resize-none" placeholder="Tell us about your skills, interests, and availability..."
                  value={message} onChange={e => setMessage(e.target.value)} />
              </div>
              {status === 'error' && <p className="text-danger text-sm text-center">Something went wrong. Please try again or email us directly.</p>}
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                disabled={!name || !email || !message || status === 'loading'}
                className="btn-primary w-full">
                {status === 'loading' ? 'Submitting…' : 'Submit →'}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Social links */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.3 }} className="card mb-6 text-center">
          <p className="text-sm font-semibold text-textPrimary mb-3">Follow & Share</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'X / Twitter', href: 'https://twitter.com/Foundation_TLF' },
              { label: 'Instagram', href: 'https://www.instagram.com/foundation_tlf/' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/company/foundation-tlf/' },
              { label: 'TikTok', href: 'https://www.tiktok.com/@foundation_tlf' },
              { label: 'YouTube', href: 'https://www.youtube.com/@Foundation_TLF' },
            ].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                className="text-xs text-accent hover:text-accentHover border border-accent/30 rounded-full px-3 py-1.5 transition-colors">
                {s.label}
              </a>
            ))}
          </div>
        </motion.div>

        <button onClick={onBack} className="btn-secondary w-full">← Back</button>
      </div>
    </StepWrapper>
  );
};
