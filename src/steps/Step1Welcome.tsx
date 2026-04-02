import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Logo } from '../components/Logo';

interface Step1Props {
  onAnswer: (yes: boolean) => void;
  onReturningUser: () => void;
  onBoardOfDirectors: () => void;
  onNavigate?: (page: number) => void;
}

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter: React.FC<{ to: number; prefix?: string; suffix?: string; duration?: number }> = ({
  to, prefix = '', suffix = '', duration = 1.8,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (ref.current) ref.current.textContent = prefix + Math.round(eased * to).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, prefix, suffix, duration]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
};

// ── Fade-in on scroll ─────────────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Animated wave bars ────────────────────────────────────────────────────────
const WaveBars: React.FC = () => {
  const bars = [0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.8, 0.6, 1, 0.5, 0.7];
  return (
    <div className="flex items-end gap-[3px] h-8 justify-center">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-accent/60"
          style={{ height: `${h * 100}%` }}
          animate={{ scaleY: [1, h * 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

// ── Program card ──────────────────────────────────────────────────────────────
const ProgramCard: React.FC<{
  icon: string;
  title: string;
  desc: string;
  badge?: string;
  onClick: () => void;
  onBadgeClick?: () => void;
  delay?: number;
}> = ({ icon, title, desc, badge, onClick, onBadgeClick, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    >
      <button
        onClick={onClick}
        className="w-full text-left p-5 rounded-2xl border border-border bg-surface hover:border-accent/50 hover:bg-surfaceHigh transition-all duration-200 group"
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{icon}</span>
          {badge && (
            onBadgeClick ? (
              <span
                role="button"
                onClick={e => { e.stopPropagation(); onBadgeClick(); }}
                className="text-xs font-medium text-accent border border-accent/40 rounded-full px-2 py-0.5 hover:bg-accent/10 transition-colors cursor-pointer"
              >
                {badge} →
              </span>
            ) : (
              <span className="text-xs font-medium text-textMuted border border-border rounded-full px-2 py-0.5">
                {badge}
              </span>
            )
          )}
        </div>
        <p className="font-semibold text-textPrimary text-base mb-1 group-hover:text-accent transition-colors">
          {title}
        </p>
        <p className="text-textSecondary text-sm leading-relaxed">{desc}</p>
      </button>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const Step1Welcome: React.FC<Step1Props> = ({ onAnswer, onReturningUser, onNavigate }) => {
  return (
    <div className="w-full">

      {/* ── HERO ── */}
      <section className="flex flex-col items-center text-center px-5 pt-10 pb-12">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
        >
          <Logo size="lg" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="mt-5 text-4xl sm:text-5xl font-bold text-textPrimary leading-tight tracking-tight"
        >
          Distribute Prosperity<br />
          <span className="text-accent">with Universal Basic Income.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="mt-4 mb-6"
        >
          <WaveBars />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
        >
          <button onClick={() => onAnswer(true)} className="btn-primary flex-1 text-base py-4">
            Get Involved →
          </button>
          <button onClick={() => onNavigate?.(97)}
            className="btn-secondary flex-1 text-base py-4 text-center"
          >
            Donate
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          onClick={onReturningUser}
          className="mt-4 text-sm text-textMuted hover:text-accent transition-colors"
        >
          Already have an account? Sign in →
        </motion.button>
      </section>

      {/* ── IMPACT STATS ── */}
      <FadeIn className="px-5 mb-12">
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 300, suffix: '+', label: 'studies proving UBI works' },
            { value: 100, suffix: '%', label: 'of 2024 pilot participants regained housing' },
            { value: 20, prefix: '$', suffix: 'M', label: 'could cut AZ homelessness in half' },
            { value: 6, suffix: '', label: 'homeless Arizonans housed in our first pilot' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="bg-surface border border-border rounded-2xl p-4 text-center"
            >
              <p className="text-3xl font-bold text-accent">
                <Counter to={stat.value} prefix={stat.prefix ?? ''} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-textSecondary mt-1 leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </FadeIn>

      {/* ── TESTIMONIAL ── */}
      <FadeIn className="px-5 mb-12">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-textPrimary text-base leading-relaxed mb-4 italic">
            "The cash was helpful, but the hope I was given changed my life."
          </p>
          <p className="text-accent text-sm font-semibold">Daniel Martin</p>
          <p className="text-textMuted text-xs">2024 Program Recipient</p>
        </div>
      </FadeIn>

      {/* ── HOW IT WORKS ── */}
      <FadeIn className="px-5 mb-12">
        <h2 className="text-2xl font-bold text-textPrimary mb-2">How It Works</h2>
        <p className="text-textSecondary text-sm mb-6 leading-relaxed">
          We take money from people who want to help and give it directly, as unconditional cash, to people who need it most.
        </p>
        <div className="space-y-3">
          {[
            { n: '1', title: 'You pledge or donate', desc: 'Commit a portion of your income, wealth, or assets, or give directly through our AZ tax credit program.' },
            { n: '2', title: 'We pool the funds', desc: 'All contributions are combined and distributed evenly across your chosen geographic area.' },
            { n: '3', title: 'People receive cash', desc: 'Recipients get unconditional money, no paperwork, no restrictions. They decide how to use it.' },
            { n: '4', title: 'We measure the impact', desc: 'Rigorous research tracks outcomes so we can prove what works and scale it.' },
          ].map((step, i) => (
            <FadeIn key={step.n} delay={i * 0.08}>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-surfaceHigh">
                <span className="w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {step.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-textPrimary mb-0.5">{step.title}</p>
                  <p className="text-sm text-textSecondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      {/* ── PROGRAMS ── */}
      <FadeIn className="px-5 mb-12">
        <h2 className="text-2xl font-bold text-textPrimary mb-2">Our Programs</h2>
        <p className="text-textSecondary text-sm mb-6">Multiple ways to participate, choose what fits you.</p>
        <div className="grid grid-cols-1 gap-3">
          <ProgramCard icon="🤝" title="UBI Giving Pledge"
            desc="Commit a percentage of your income or wealth to ending poverty. Virtual or real, every pledge counts."
            onClick={() => onNavigate?.(91)} delay={0} />
          <ProgramCard icon="🌵" title="Arizona Tax Credit"
            desc="Donate up to $495 to TLF at no cost to you. Arizona's QCO credit gives it back dollar-for-dollar."
            onClick={() => onNavigate?.(92)} delay={0.07} />
          <ProgramCard icon="🔄" title="Comingle"
            desc="An income-sharing community where members contribute 7% of income and receive a weekly UBI floor."
            badge="Coming Soon" onClick={() => onNavigate?.(93)} onBadgeClick={() => onNavigate?.(101)} delay={0.14} />
          <ProgramCard icon="🏛️" title="Foundation Fund"
            desc="A community UBI pool, contribute any amount, split equally among all participants."
            badge="Coming Soon" onClick={() => onNavigate?.(94)} onBadgeClick={() => onNavigate?.(101)} delay={0.21} />
        </div>
      </FadeIn>

      {/* ── WHY UBI ── */}
      <FadeIn className="px-5 mb-12">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-textPrimary mb-3">Why Universal Basic Income?</h2>
          <p className="text-textSecondary text-sm leading-relaxed mb-4 italic">
            "The big reason poor people are poor is because they don't have enough money, and it shouldn't come as a huge surprise that giving them money is a great way to reduce that problem."
          </p>
          <p className="text-accent text-sm font-semibold mb-4">- Charles Kenny, Economist</p>
          <div className="space-y-2 text-sm text-textSecondary">
            <p>✓ Over 300 rigorous studies show positive outcomes</p>
            <p>✓ Improves nutrition, education, health, and income</p>
            <p>✓ More cost-effective than traditional aid programs</p>
            <p>✓ Treats recipients with dignity, no strings attached</p>
          </div>
        </div>
      </FadeIn>

      {/* ── BOTTOM CTA ── */}
      <FadeIn className="px-5 mb-12">
        <div className="rounded-2xl bg-accentDim/20 border border-accent/30 p-6 text-center">
          <h2 className="text-2xl font-bold text-textPrimary mb-2">Ready to make an impact?</h2>
          <p className="text-textSecondary text-sm mb-6 leading-relaxed">
            Join people committed to ending homelessness and poverty through Universal Basic Income.
          </p>
          <button onClick={() => onAnswer(true)} className="btn-primary w-full text-base py-4 mb-3">
            Get Involved →
          </button>
          <button onClick={() => onNavigate?.(97)} className="btn-secondary w-full text-center block">
            Donate Now
          </button>
        </div>
      </FadeIn>

      {/* ── FOOTER ── */}
      <FadeIn className="px-5 pb-6">
        <div className="border-t border-border pt-6 text-center space-y-3">
          <p className="text-xs text-textMuted">501(c)(3) nonprofit · EIN# 88-3607946</p>
          <div className="flex justify-center gap-4">
            {[
              { href: 'https://twitter.com/Foundation_TLF', label: 'X' },
              { href: 'https://www.instagram.com/foundation_tlf/', label: 'Instagram' },
              { href: 'https://www.linkedin.com/company/foundation-tlf/', label: 'LinkedIn' },
              { href: 'https://www.youtube.com/@Foundation_TLF', label: 'YouTube' },
            ].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                className="text-xs text-textMuted hover:text-accent transition-colors">
                {s.label}
              </a>
            ))}
          </div>
          <a href="mailto:info@thelogicalfoundation.org" className="block text-xs text-textMuted hover:text-accent transition-colors">
            info@thelogicalfoundation.org
          </a>
          <div className="flex justify-center gap-4 pt-1">
            <button onClick={() => onNavigate?.(106)}
              className="text-xs text-textMuted hover:text-accent transition-colors">
              FAQ
            </button>
            <button onClick={() => onNavigate?.(102)}
              className="text-xs text-textMuted hover:text-accent transition-colors">
              Privacy Policy
            </button>
          </div>
        </div>
      </FadeIn>

    </div>
  );
};
