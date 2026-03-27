import React from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-base font-bold text-textPrimary mb-2">{title}</h3>
    <div className="text-sm text-textSecondary leading-relaxed space-y-2">{children}</div>
  </div>
);

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <StepWrapper stepKey="privacy">
      <div className="px-4 py-2">
        <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm mb-6 block">← Back</button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-3xl font-bold text-textPrimary mb-1">Privacy Policy</h2>
          <p className="text-textMuted text-xs mb-6">Last updated: January 2025</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>

          <Section title="1. Who We Are">
            <p>The Logical Foundation is a 501(c)(3) nonprofit organization (EIN# 88-3607946) headquartered in Arizona. Our mission is to distribute prosperity through Universal Basic Income.</p>
            <p>Contact: <a href="mailto:info@thelogicalfoundation.org" className="text-accent hover:text-accentHover">info@thelogicalfoundation.org</a></p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-textPrimary">Account information:</strong> Name, email address, phone number, and mailing address when you create an account or make a pledge.</p>
            <p><strong className="text-textPrimary">Pledge information:</strong> Your pledge type, estimated income or wealth figures, and geographic preferences. This information is used solely to calculate and track your commitment.</p>
            <p><strong className="text-textPrimary">Usage data:</strong> Standard web analytics including pages visited, time on site, and device type. We use this to improve the app.</p>
            <p><strong className="text-textPrimary">Communications:</strong> If you contact us or sign up for our newsletter, we retain your email and message content.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Manage your account and pledge commitments</li>
              <li>Send program updates and newsletters (with your consent)</li>
              <li>Conduct research on the impact of Universal Basic Income programs</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Improve our services and user experience</li>
            </ul>
            <p>We do not sell, rent, or trade your personal information to third parties.</p>
          </Section>

          <Section title="4. Data Sharing">
            <p>We may share your information with:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-textPrimary">Service providers:</strong> Payment processors (GiveButter), email services (Mailchimp), and hosting providers who process data on our behalf under strict confidentiality agreements.</li>
              <li><strong className="text-textPrimary">Legal requirements:</strong> When required by law, court order, or government authority.</li>
              <li><strong className="text-textPrimary">Research partners:</strong> Anonymized, aggregated data only, never personally identifiable information.</li>
            </ul>
          </Section>

          <Section title="5. Data Security">
            <p>We use industry-standard security measures including:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Encrypted passwords (bcrypt)</li>
              <li>HTTPS/TLS for all data transmission</li>
              <li>JWT-based authentication with expiration</li>
              <li>Rate limiting on authentication endpoints</li>
            </ul>
            <p>No system is 100% secure. If you believe your account has been compromised, contact us immediately.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-textPrimary">Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-textPrimary">Correction:</strong> Update or correct inaccurate information through your account dashboard.</li>
              <li><strong className="text-textPrimary">Deletion:</strong> Request deletion of your account and associated data.</li>
              <li><strong className="text-textPrimary">Opt-out:</strong> Unsubscribe from marketing emails at any time using the link in any email.</li>
            </ul>
            <p>To exercise these rights, email <a href="mailto:info@thelogicalfoundation.org" className="text-accent hover:text-accentHover">info@thelogicalfoundation.org</a>.</p>
          </Section>

          <Section title="7. Cookies">
            <p>We use minimal cookies, primarily for authentication (JWT stored in localStorage) and basic analytics. We do not use advertising or tracking cookies.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this policy periodically. We will notify registered users of material changes by email. Continued use of the app after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="10. Contact">
            <p>Questions about this policy? Contact us at:</p>
            <p>The Logical Foundation<br />
            <a href="mailto:info@thelogicalfoundation.org" className="text-accent hover:text-accentHover">info@thelogicalfoundation.org</a></p>
          </Section>

        </motion.div>

        <button onClick={onBack} className="btn-secondary w-full mt-4">← Back</button>
      </div>
    </StepWrapper>
  );
};
