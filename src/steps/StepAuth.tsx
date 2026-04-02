import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthState } from '../types';
import { StepWrapper } from '../components/StepWrapper';
import { InfoBox } from '../components/InfoBox';
import { auth as authApi, ApiError } from '../lib/api';

interface StepAuthProps {
  auth: AuthState;
  email: string;
  phone: string;
  onChange: (patch: Partial<AuthState>) => void;
  onVerified: () => void;
  onBack: () => void;
}

type AuthPhase = 'password' | 'method' | 'verify';

export const StepAuth: React.FC<StepAuthProps> = ({
  auth,
  email,
  phone,
  onChange,
  onVerified,
  onBack,
}) => {
  const [phase, setPhase] = useState<AuthPhase>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // ── Phase 1: Password ──────────────────────────────────────────────────────

  const validatePassword = (): boolean => {
    const e: Record<string, string> = {};
    if (auth.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(auth.password)) e.password = 'Include at least one uppercase letter';
    else if (!/[0-9]/.test(auth.password)) e.password = 'Include at least one number';
    if (auth.password !== auth.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePasswordNext = async () => {
    if (!validatePassword()) return;
    setLoading(true);
    try {
      // Register the user, creates the account and returns a JWT
      await authApi.register(email, phone, auth.password);
      setErrors({});
      setPhase('method');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Account exists, try logging in instead
        try {
          await authApi.login(email, auth.password);
          setErrors({});
          setPhase('method');
        } catch {
          setErrors({ password: 'An account with this email exists. Check your password.' });
        }
      } else {
        setErrors({ password: 'Could not create account. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 2: Send code ─────────────────────────────────────────────────────

  const handleSendCode = async () => {
    if (!auth.verifyMethod) return;
    setLoading(true);
    try {
      await authApi.sendCode(auth.verifyMethod);
      const dest = auth.verifyMethod === 'email' ? email : phone;
      setSentTo(dest);
      setCodeSent(true);
      setPhase('verify');
    } catch {
      setErrors({ method: 'Failed to send code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 3: Verify code ───────────────────────────────────────────────────

  const handleVerify = async () => {
    if (auth.codeEntered.length !== 6) return;
    setLoading(true);
    try {
      await authApi.verifyCode(auth.codeEntered);
      onChange({ verified: true });
      onVerified();
    } catch {
      setErrors({ code: 'Incorrect or expired code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!auth.verifyMethod) return;
    setLoading(true);
    try {
      await authApi.sendCode(auth.verifyMethod);
      onChange({ codeEntered: '' });
      setErrors({});
    } catch {
      setErrors({ code: 'Failed to resend. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) =>
    a + '*'.repeat(Math.max(0, b.length)) + c
  );
  const maskedPhone = phone.replace(/(\d{3})(\d+)(\d{2})/, (_, a, b, c) =>
    a + '*'.repeat(Math.max(0, b.length)) + c
  );

  return (
    <StepWrapper stepKey={`auth-${phase}`}>
      <div className="px-4 py-2">

        {/* ── Phase 1: Create Password ── */}
        {phase === 'password' && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Create a Password</h2>
            <p className="text-textSecondary text-sm mb-6">
              You'll use this to access your profile later.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Password <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    value={auth.password}
                    onChange={e => onChange({ password: e.target.value })}
                    autoFocus
                  />
                  <button type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary text-xs">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
                {auth.password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[
                      auth.password.length >= 8,
                      /[A-Z]/.test(auth.password),
                      /[0-9]/.test(auth.password),
                      /[^A-Za-z0-9]/.test(auth.password),
                    ].map((met, i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all ${met ? 'bg-accent' : 'bg-border'}`} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Re-enter your password"
                    value={auth.confirmPassword}
                    onChange={e => onChange({ confirmPassword: e.target.value })}
                  />
                  <button type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary text-xs">
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>
                )}
                {auth.confirmPassword.length > 0 && auth.password === auth.confirmPassword && (
                  <p className="text-accent text-xs mt-1">✓ Passwords match</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
                className="btn-secondary flex-none w-24" disabled={loading}>
                ← Back
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handlePasswordNext}
                disabled={loading}
                className="btn-primary flex-1">
                {loading ? 'Creating account…' : 'Next →'}
              </motion.button>
            </div>
          </div>
        )}

        {/* ── Phase 2: Choose verification method ── */}
        {phase === 'method' && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Verify Your Identity</h2>
            <p className="text-textSecondary text-sm mb-6">
              We'll send a 6-digit code to confirm it's you.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { value: 'email' as const, icon: '📧', label: 'Email', masked: maskedEmail },
                { value: 'text' as const, icon: '💬', label: 'Text Message', masked: maskedPhone },
              ].map(opt => (
                <motion.div key={opt.value} whileTap={{ scale: 0.99 }}
                  onClick={() => onChange({ verifyMethod: opt.value })}
                  className={`radio-option ${auth.verifyMethod === opt.value ? 'selected' : ''}`}>
                  <span className="text-xl">{opt.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-textPrimary">{opt.label}</p>
                    <p className="text-xs text-textMuted">{opt.masked}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    auth.verifyMethod === opt.value ? 'border-accent bg-accent' : 'border-border'
                  }`}>
                    {auth.verifyMethod === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </motion.div>
              ))}
            </div>
            {errors.method && <p className="text-danger text-xs mb-3">{errors.method}</p>}
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPhase('password')}
                className="btn-secondary flex-none w-24" disabled={loading}>
                ← Back
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={handleSendCode}
                disabled={!auth.verifyMethod || loading}
                className="btn-primary flex-1">
                {loading ? 'Sending…' : 'Send Code →'}
              </motion.button>
            </div>
          </div>
        )}

        {/* ── Phase 3: Enter code ── */}
        {phase === 'verify' && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Enter Your Code</h2>
            <p className="text-textSecondary text-sm mb-2">We sent a 6-digit code to:</p>
            <p className="text-accent font-semibold text-sm mb-6">{sentTo}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-textSecondary mb-1">
                Verification Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                placeholder="000000"
                value={auth.codeEntered}
                onChange={e => {
                  onChange({ codeEntered: e.target.value.replace(/\D/g, '') });
                  setErrors({});
                }}
                autoFocus
              />
              {errors.code && <p className="text-danger text-xs mt-2 text-center">{errors.code}</p>}
            </div>

            <AnimatePresence>
              {codeSent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                  <InfoBox variant="info">
                    Code sent to your {auth.verifyMethod === 'email' ? 'email inbox' : 'phone via SMS'}.
                  </InfoBox>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={auth.codeEntered.length !== 6 || loading}
              className="btn-primary w-full mb-3">
              {loading ? 'Verifying…' : 'Verify & Activate Profile →'}
            </motion.button>

            <div className="flex justify-between text-xs text-textMuted">
              <button onClick={() => setPhase('method')}
                className="hover:text-textPrimary transition-colors">
                ← Change method
              </button>
              <button onClick={handleResend} disabled={loading}
                className="hover:text-accent transition-colors">
                Resend code
              </button>
            </div>
          </div>
        )}

      </div>
    </StepWrapper>
  );
};
