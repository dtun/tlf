import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth as authApi, profile as profileApi, pledge as pledgeApi, ApiError } from '../lib/api';
import { StepWrapper } from '../components/StepWrapper';
import { AppState, defaultPledgeItem } from '../types';

interface StepLoginProps {
  onLoggedIn: (patch: Partial<AppState>) => void;
  onBack: () => void;
}

type Mode = 'login' | 'forgot-email' | 'forgot-code' | 'forgot-newpass' | 'forgot-done';

export const StepLogin: React.FC<StepLoginProps> = ({ onLoggedIn, onBack }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const clearError = () => setError('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); clearError();
    try {
      await authApi.login(email, password);
      const [meData, profileData, pledgeData] = await Promise.all([
        authApi.me().catch(() => null),
        profileApi.get().catch(() => null),
        pledgeApi.get().catch(() => null),
      ]);
      const patch: Partial<AppState> = {
        activated: true,
        userRole: meData?.role === 'admin' ? 'admin' : 'user',
        volunteerStatus: meData?.volunteerStatus ?? null,
      };
      if (profileData) {
        patch.userInfo = {
          firstName: profileData.firstName ?? '',
          lastName: profileData.lastName ?? '',
          email,
          phone: '',
          addressType: (profileData.addressType as AppState['userInfo']['addressType']) ?? '',
          street: profileData.street ?? '',
          city: profileData.city ?? '',
          stateRegion: profileData.stateRegion ?? '',
          postalCode: profileData.postalCode ?? '',
          country: profileData.country ?? '',
          homelessDescription: profileData.homelessDescription ?? '',
          giverType: (profileData.giverType as AppState['userInfo']['giverType']) ?? '',
        };
      }
      if (pledgeData) {
        const items = (pledgeData as { pledges?: unknown[] }).pledges ?? [];
        patch.ubiPledge = {
          impactZone: (pledgeData.impactZone as AppState['ubiPledge']['impactZone']) ?? '',
          customImpactZone: pledgeData.customImpactZone ?? '',
          homelessnessPriority: pledgeData.homelessnessPriority ?? null,
          pledges: items.map((item: unknown) => {
            const p = item as Record<string, unknown>;
            return {
              ...defaultPledgeItem(),
              pledgeType: (p.pledge_type ?? p.pledgeType ?? '') as AppState['ubiPledge']['pledges'][0]['pledgeType'],
              cadence: (p.cadence ?? '') as AppState['ubiPledge']['pledges'][0]['cadence'],
              estimatedIncome: String(p.estimated_income ?? p.estimatedIncome ?? ''),
              incomePercent: String(p.income_percent ?? p.incomePercent ?? '1'),
              estimatedNetWorth: String(p.estimated_net_worth ?? p.estimatedNetWorth ?? ''),
              wealthPercent: String(p.wealth_percent ?? p.wealthPercent ?? '1'),
              vehicleYear: String(p.vehicle_year ?? p.vehicleYear ?? ''),
              vehicleMake: String(p.vehicle_make ?? p.vehicleMake ?? ''),
              vehicleModel: String(p.vehicle_model ?? p.vehicleModel ?? ''),
              vehicleMileage: String(p.vehicle_mileage ?? p.vehicleMileage ?? ''),
              vehicleCondition: String(p.vehicle_condition ?? p.vehicleCondition ?? ''),
              propertyAddress: String(p.property_address ?? p.propertyAddress ?? ''),
              propertyType: String(p.property_type ?? p.propertyType ?? ''),
              estimatedPropertyValue: String(p.estimated_property_value ?? p.estimatedPropertyValue ?? ''),
              otherDescription: String(p.other_description ?? p.otherDescription ?? ''),
            };
          }),
        };
      }
      onLoggedIn(patch);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? 'Incorrect email or password.' : 'Could not sign in. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSendReset = async () => {
    if (!resetEmail) { setError('Please enter your email.'); return; }
    setLoading(true); clearError();
    try {
      await authApi.forgotPassword(resetEmail);
      setMode('forgot-code');
    } catch { setError('Could not send reset code. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleVerifyCode = () => {
    if (resetCode.length !== 6) { setError('Enter the 6-digit code.'); return; }
    clearError(); setMode('forgot-newpass');
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(newPassword)) { setError('Password must contain an uppercase letter.'); return; }
    if (!/[0-9]/.test(newPassword)) { setError('Password must contain a number.'); return; }
    setLoading(true); clearError();
    try {
      await authApi.resetPassword(resetEmail, resetCode, newPassword);
      setMode('forgot-done');
    } catch { setError('Reset failed. The code may have expired, try again.'); setMode('forgot-email'); }
    finally { setLoading(false); }
  };

  return (
    <StepWrapper stepKey="login">
      <div className="px-4 py-2">
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold text-textPrimary mb-1">Welcome Back</h2>
              <p className="text-textSecondary text-sm mb-6">Sign in to view or edit your pledge.</p>
              <div className="space-y-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Email <span className="text-danger">*</span></label>
                  <input type="email" className="input-field" placeholder="you@example.com" value={email}
                    onChange={e => { setEmail(e.target.value); clearError(); }} autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Password <span className="text-danger">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} className="input-field pr-12"
                      placeholder="Your password" value={password}
                      onChange={e => { setPassword(e.target.value); clearError(); }}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary text-xs">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right mb-4">
                <button onClick={() => { setResetEmail(email); setMode('forgot-email'); clearError(); }}
                  className="text-xs text-textMuted hover:text-accent transition-colors">Forgot password?</button>
              </div>
              {error && <p className="text-danger text-sm mb-4 text-center">{error}</p>}
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={onBack} disabled={loading} className="btn-secondary flex-none w-24">← Back</motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogin} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Signing in…' : 'Sign In →'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {mode === 'forgot-email' && (
            <motion.div key="forgot-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold text-textPrimary mb-1">Reset Password</h2>
              <p className="text-textSecondary text-sm mb-6">Enter your email and we'll send a 6-digit reset code.</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-textSecondary mb-1">Email <span className="text-danger">*</span></label>
                <input type="email" className="input-field" placeholder="you@example.com" value={resetEmail}
                  onChange={e => { setResetEmail(e.target.value); clearError(); }} autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSendReset()} />
              </div>
              {error && <p className="text-danger text-sm mb-4 text-center">{error}</p>}
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMode('login')} disabled={loading} className="btn-secondary flex-none w-24">← Back</motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSendReset} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Sending…' : 'Send Code →'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {mode === 'forgot-code' && (
            <motion.div key="forgot-code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold text-textPrimary mb-1">Enter Code</h2>
              <p className="text-textSecondary text-sm mb-6">Check your email for a 6-digit code. It expires in 15 minutes.</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-textSecondary mb-1">6-digit code <span className="text-danger">*</span></label>
                <input type="text" inputMode="numeric" maxLength={6} className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000" value={resetCode}
                  onChange={e => { setResetCode(e.target.value.replace(/\D/g, '')); clearError(); }} autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleVerifyCode()} />
              </div>
              {error && <p className="text-danger text-sm mb-4 text-center">{error}</p>}
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMode('forgot-email')} className="btn-secondary flex-none w-24">← Back</motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerifyCode} className="btn-primary flex-1">Continue →</motion.button>
              </div>
              <p className="text-center mt-3">
                <button onClick={() => { setResetCode(''); handleSendReset(); }} className="text-xs text-textMuted hover:text-accent transition-colors">Resend code</button>
              </p>
            </motion.div>
          )}

          {mode === 'forgot-newpass' && (
            <motion.div key="forgot-newpass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold text-textPrimary mb-1">New Password</h2>
              <p className="text-textSecondary text-sm mb-6">Choose a new password for your account.</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-textSecondary mb-1">New password <span className="text-danger">*</span></label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} className="input-field pr-12"
                    placeholder="Min 8 chars, 1 uppercase, 1 number" value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); clearError(); }} autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()} />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary text-xs">
                    {showNew ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {error && <p className="text-danger text-sm mb-4 text-center">{error}</p>}
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMode('forgot-code')} disabled={loading} className="btn-secondary flex-none w-24">← Back</motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleResetPassword} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Saving…' : 'Set Password →'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {mode === 'forgot-done' && (
            <motion.div key="forgot-done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center py-6">
              <p className="text-4xl mb-4">✅</p>
              <h2 className="text-2xl font-bold text-textPrimary mb-2">Password Reset</h2>
              <p className="text-textSecondary text-sm mb-6">Your password has been updated. Sign in with your new password.</p>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setPassword(''); setMode('login'); }} className="btn-primary w-full">Sign In →</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StepWrapper>
  );
};
