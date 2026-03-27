import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface FAQPageProps {
  onBack: () => void;
  onNavigate?: (page: number) => void;
}

interface FaqEntry {
  q: string;
  a: React.ReactNode;
}

interface FaqSection {
  id: string;
  icon: string;
  title: string;
  items: FaqEntry[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'general',
    icon: '🌱',
    title: 'General',
    items: [
      {
        q: 'What is The Logical Foundation?',
        a: 'The Logical Foundation is a 501(c)(3) nonprofit that delivers Universal Basic Income directly to people experiencing homelessness and poverty in Arizona. We distribute unconditional cash — no paperwork, no restrictions — and measure the outcomes rigorously so we can prove what works and scale it.',
      },
      {
        q: 'How does TLF decide who receives funds?',
        a: 'We do our best to distribute funds as broadly as possible across your chosen geographic area, with a special focus on reaching homeless residents. Our goal is saturation — splitting donations as evenly as possible among all residents in a target area, prioritizing those experiencing homelessness. IRS rules for 501(c)(3) organizations prohibit directing gifts to specific named individuals, which also allows us to conduct rigorous, unbiased research.',
      },
      {
        q: 'Why unconditional cash?',
        a: 'Over 300 rigorous studies show that people in poverty spend cash wisely — on food, housing, healthcare, and education. Unconditional cash respects recipients\' dignity, eliminates bureaucratic overhead, and produces better outcomes than in-kind aid. Our 2024 pilot: 100% of participants regained stable housing.',
      },
      {
        q: 'Is TLF a legitimate nonprofit?',
        a: 'Yes. The Logical Foundation is a registered 501(c)(3) nonprofit organization. EIN# 88-3607946. All donations are tax-deductible to the extent permitted by law.',
      },
      {
        q: 'Where does TLF operate?',
        a: 'We are headquartered in Phoenix, Arizona and currently run programs in Arizona. We are building toward national and eventually global distribution as we grow. Donors can designate Arizona, the United States, Earth (global), or a custom region — Arizona-based distribution is active today.',
      },
    ],
  },
  {
    id: 'donating',
    icon: '💚',
    title: 'Donating',
    items: [
      {
        q: 'Is my donation tax-deductible?',
        a: 'Yes. The Logical Foundation is a registered 501(c)(3) nonprofit (EIN# 88-3607946). All donations are tax-deductible to the extent permitted by law. You will receive a receipt for your records.',
      },
      {
        q: 'How is my donation used?',
        a: 'The vast majority of donations go directly to program participants as unconditional cash. A small portion covers operational costs (payment processing, research, administration). We publish annual reports with full financial transparency.',
      },
      {
        q: 'Can I set up a recurring donation?',
        a: 'Yes — GiveButter supports monthly, quarterly, and annual recurring donations. You can cancel or modify at any time.',
      },
      {
        q: 'Can I make a major gift ($10,000+)?',
        a: (
          <>
            For major gifts, planned giving, or stock/crypto donations, please contact us directly at{' '}
            <a href="mailto:info@thelogicalfoundation.org" className="text-accent hover:text-accentHover">
              info@thelogicalfoundation.org
            </a>
            . We can arrange wire transfers, stock transfers, and other arrangements.
          </>
        ),
      },
      {
        q: 'Does my employer match donations?',
        a: 'Many employers match charitable donations. Check with your HR department or use a service like Double the Donation to see if your employer participates. Use our EIN# 88-3607946 when submitting a match request.',
      },
      {
        q: 'Why can\'t I choose a specific person to receive my donation?',
        a: 'IRS rules for 501(c)(3) organizations prohibit donors from directing gifts to specific named individuals — doing so would constitute a personal gift and jeopardize our tax-exempt status. Instead, we distribute funds as broadly as possible across your chosen area, with a priority program for homeless residents. This approach also enables rigorous, unbiased research.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'Credit/debit card, PayPal, Venmo, Zelle, ACH/bank transfer, wire transfer, stocks, and crypto. For stocks and wire transfers, contact us directly.',
      },
      {
        q: 'Why does GiveButter ask for a tip?',
        a: 'GiveButter is the platform we use to process donations. They ask donors to leave a tip to support their platform. Please set the tip to $0 so your full gift reaches TLF — we want every dollar to go to our programs.',
      },
    ],
  },
  {
    id: 'pledge',
    icon: '🤝',
    title: 'UBI Giving Pledge',
    items: [
      {
        q: 'What is the UBI Giving Pledge?',
        a: 'The UBI Giving Pledge is a commitment — virtual or real — to contribute a portion of your income, wealth, or assets toward ending poverty. Virtual pledges count toward our collective goals and help us demonstrate the scale of public support for UBI. Real pledges are fulfilled through direct donations.',
      },
      {
        q: 'Is the pledge legally binding?',
        a: 'No. The pledge is a statement of intent. We use it to measure collective commitment and build momentum. You decide when and how to convert it to a real contribution.',
      },
      {
        q: 'Where can I direct my pledge?',
        a: 'Currently Arizona, the United States, Earth (global), or a custom region. We are headquartered in Phoenix and can distribute anywhere in Arizona today. National and global distribution expands with our scale.',
      },
      {
        q: 'Can I make a permanent program?',
        a: 'Yes, through a UBI endowment. A permanent program requires a gift of 25× the annual program cost. Our current minimum program budget is $90,000, so the smallest permanent program requires a $2.25M gift. Contact us to discuss endowment options.',
      },
      {
        q: 'What pledge types are available?',
        a: 'Income-based (a percentage of annual income), wealth-based (a percentage of net worth), vehicle donation, real estate donation, crypto donation, or a custom/other gift. You can add multiple pledge types.',
      },
    ],
  },
  {
    id: 'aztax',
    icon: '🌵',
    title: 'Arizona Tax Credit',
    items: [
      {
        q: 'What is the Arizona QCO Tax Credit?',
        a: 'Arizona\'s Qualifying Charitable Organization (QCO) tax credit lets you donate to TLF and receive a dollar-for-dollar credit against your Arizona state income tax owed — not just a deduction. You effectively give at no net cost to yourself.',
      },
      {
        q: 'How much can I claim?',
        a: 'Up to $495 for single filers and heads of household, or up to $987 for married filing jointly (2025 limits). Next year\'s limits increase to $506 (single) and $1,009 (married).',
      },
      {
        q: 'When is the deadline?',
        a: 'You can claim contributions made through April 15, 2026 on your 2025 Arizona tax return. This means you have until Tax Day to make a contribution that counts for the prior year.',
      },
      {
        q: 'How do I claim it?',
        a: 'Use Arizona Form 321 and enter TLF\'s QCO code: 22852. Your tax software or preparer can walk you through it. Keep your donation receipt.',
      },
      {
        q: 'Can I claim both the federal deduction and the AZ credit?',
        a: 'Yes. The AZ QCO credit is separate from the federal charitable deduction. You can claim both, though you may need to reduce your federal deduction by the amount of the state credit received.',
      },
      {
        q: 'What if I don\'t owe Arizona taxes?',
        a: 'The credit is non-refundable, meaning it can reduce your AZ tax liability to zero but won\'t generate a refund. However, unused credit can be carried forward for up to five years.',
      },
    ],
  },
  {
    id: 'programs',
    icon: '🔄',
    title: 'Comingle & Foundation Fund',
    items: [
      {
        q: 'What is Comingle?',
        a: 'Comingle is an income-sharing community where members contribute 7% of their income through a secure bank connection. The pool is redistributed weekly to all members, creating a roughly $50/week UBI floor for everyone in the community. Comingle is currently in development.',
      },
      {
        q: 'What is the Foundation Fund?',
        a: 'The Foundation Fund is a community-owned UBI pool. Anyone can join for as little as $1/year. All contributions are pooled and split as evenly as possible among all participants, creating a shared Universal Basic Income for everyone in the fund. The Foundation Fund is currently in development.',
      },
      {
        q: 'When will Comingle and the Foundation Fund launch?',
        a: 'Both programs are in active development. Sign up for Stay Informed to be notified when they launch.',
      },
    ],
  },
  {
    id: 'privacy',
    icon: '🔒',
    title: 'Privacy & Account',
    items: [
      {
        q: 'What information do you collect?',
        a: 'We collect your name, email, phone number, and address (optional). We use this to send you receipts, program updates, and tax documentation. We never sell your data. See our Privacy Policy for full details.',
      },
      {
        q: 'Can I make my profile public?',
        a: 'Yes. You can opt in to make your pledge public, which helps inspire others to join. Your profile will show your name and pledge summary — never your contact details or financial specifics.',
      },
      {
        q: 'How do I delete my account?',
        a: (
          <>
            Email us at{' '}
            <a href="mailto:info@thelogicalfoundation.org" className="text-accent hover:text-accentHover">
              info@thelogicalfoundation.org
            </a>{' '}
            and we will delete your account and all associated data within 30 days.
          </>
        ),
      },
    ],
  },
];

const FaqItem: React.FC<{ entry: FaqEntry; index: number }> = ({ entry, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="border-b border-border last:border-0"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left py-4 flex items-start justify-between gap-3 group"
      >
        <span className="text-sm font-medium text-textPrimary group-hover:text-accent transition-colors leading-snug">
          {entry.q}
        </span>
        <span className={`text-textMuted transition-transform flex-shrink-0 mt-0.5 text-xs ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm text-textSecondary leading-relaxed">
              {entry.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FAQPage: React.FC<FAQPageProps> = ({ onBack, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<string>('general');

  return (
    <StepWrapper stepKey="faq">
      <div className="px-4 py-2">
        <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm mb-6 block">
          ← Back
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">❓</span>
            <h2 className="text-3xl font-bold text-textPrimary">FAQ</h2>
          </div>
          <p className="text-textSecondary text-sm mb-6">
            Answers to common questions about our programs, donations, and how we work.
          </p>
        </motion.div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {FAQ_SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                activeSection === section.id
                  ? 'bg-accent text-white'
                  : 'bg-surface text-textSecondary border border-border hover:text-textPrimary hover:border-accent/40'
              }`}
            >
              <span>{section.icon}</span>
              {section.title}
            </button>
          ))}
        </div>

        {/* Active section */}
        {FAQ_SECTIONS.map(section => (
          activeSection === section.id && (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="card">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <span className="text-xl">{section.icon}</span>
                  <h3 className="text-base font-bold text-textPrimary">{section.title}</h3>
                </div>
                {section.items.map((entry, i) => (
                  <FaqItem key={i} entry={entry} index={i} />
                ))}
              </div>
            </motion.div>
          )
        ))}

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="card border-accent/20 text-center mt-6 mb-6"
        >
          <p className="text-sm font-semibold text-textPrimary mb-1">Still have questions?</p>
          <p className="text-sm text-textSecondary mb-3">
            Reach out and we'll get back to you within 24 hours.
          </p>
          <a
            href="mailto:info@thelogicalfoundation.org"
            className="text-accent hover:text-accentHover text-sm font-medium transition-colors"
          >
            info@thelogicalfoundation.org
          </a>
          {onNavigate && (
            <div className="mt-3">
              <button
                onClick={() => onNavigate(101)}
                className="text-sm text-textMuted hover:text-accent transition-colors"
              >
                Or sign up for updates →
              </button>
            </div>
          )}
        </motion.div>

        <button onClick={onBack} className="btn-secondary w-full">← Back</button>
      </div>
    </StepWrapper>
  );
};
