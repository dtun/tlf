import React from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface AboutUsProps {
  onBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; delay?: number }> = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="mb-8"
  >
    <h3 className="text-lg font-bold text-textPrimary mb-3">{title}</h3>
    <div className="text-textSecondary text-sm leading-relaxed space-y-3">{children}</div>
  </motion.div>
);



export const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  return (
    <StepWrapper stepKey="about">
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm">
            ← Back
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-3xl font-bold text-textPrimary mb-1">About Us</h2>
          <p className="text-accent font-semibold text-base mb-6">
            Distribute Prosperity with Universal Basic Income.
          </p>
        </motion.div>

        {/* Report links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="card border-accent/30 bg-accentDim/10 mb-8 flex flex-col gap-2"
        >
          <a
            href="https://thelogicalfoundation.org/wp-content/uploads/2025/06/2024-Annual-Report-The-Logical-Foundation.pdf"
            target="_blank" rel="noopener noreferrer"
            className="text-accent hover:text-accentHover text-sm font-semibold transition-colors"
          >
            2024 Annual & Maximum Impact Program Report →
          </a>
          <a
            href="https://thelogicalfoundation.org/wp-content/uploads/2025/06/Master-Plan-The-Logical-Foundation.pdf"
            target="_blank" rel="noopener noreferrer"
            className="text-accent hover:text-accentHover text-sm font-semibold transition-colors"
          >
            Our Master Plan: UBI and the Future of Humanity →
          </a>
        </motion.div>

        <Section title="Our Strategy" delay={0.15}>
          <p>
            We believe the most effective path to Universal Basic Income (UBI) is to build a self-sustaining ecosystem, not to wait for government action. Our strategy has three pillars:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li><strong className="text-textPrimary">Demonstrate impact.</strong> Run rigorous UBI pilots in Arizona, publish results, and prove the model works at scale.</li>
            <li><strong className="text-textPrimary">Build the network.</strong> Recruit pledgers, donors, and advocates who commit a portion of their income or wealth to UBI, creating a growing, predictable funding base.</li>
            <li><strong className="text-textPrimary">Expand the system.</strong> Use Arizona as a proving ground, then replicate nationally and globally. Our Comingle and Foundation Fund programs create permanent endowments that fund UBI in perpetuity.</li>
          </ol>
          <p>
            The full roadmap is in our <a href="https://thelogicalfoundation.org/wp-content/uploads/2025/06/Master-Plan-The-Logical-Foundation.pdf" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accentHover">Master Plan</a>.
          </p>
        </Section>

        <Section title="Our Story" delay={0.2}>
          <p>
            Imagine a world where everyone has the freedom and dignity to pursue their dreams, free from the fear of poverty. That's the world we want to create at The Logical Foundation.
          </p>
          <p>
            We are a team of passionate and visionary individuals who believe in the power of Universal Basic Income (UBI) to transform lives. UBI is a simple idea: give people cash, no strings attached, and let them decide how to use it. It's a disruptive technology for helping people, as evidenced by over three hundred rigorous studies that show its positive impacts on nutrition, education, income, health, and many other outcomes.
          </p>
          <p>
            We started The Logical Foundation in 2022 after our founder, Michael Simm, realized that the unparalleled power of Universal Basic Income could change the world. He sought advice from nonprofit and business professionals such as Stuart Turgel, Rodney Houston, Carol Farabee, and Andrew Simm, and from passionate community members with lived experience like Gareth Gilsdorf. Together, they designed a system to unleash the disruptive potential of UBI across the nonprofit sector without relying on unpredictable government action.
          </p>
          <p>
            We launched the most cost-effective anti-poverty program ever run in Arizona in 2024, providing Universal Basic Income to homeless Arizonans who used it to get off the streets. We are expanding our program for bigger effects and better scalability.
          </p>
        </Section>

        {/* Footer */}
        <div className="card text-center mb-6">
          <p className="text-textSecondary text-sm mb-1">The Logical Foundation is a 501(c)(3) nonprofit organization</p>
          <p className="text-textMuted text-xs mb-3">EIN# 88-3607946</p>
          <a href="mailto:info@thelogicalfoundation.org" className="text-accent hover:text-accentHover text-sm transition-colors">
            info@thelogicalfoundation.org
          </a>
        </div>

        <button onClick={onBack} className="btn-secondary w-full">← Back</button>
      </div>
    </StepWrapper>
  );
};
