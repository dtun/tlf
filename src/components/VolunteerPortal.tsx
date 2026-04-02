import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepWrapper } from './StepWrapper';
import { MISSIONS, CATEGORY_CONFIG, TIER_CONFIG, type Mission } from '../data/missions';
import { volunteers as volunteersApi, type LeaderboardEntry } from '../lib/api';

interface VolunteerPortalProps {
  onBack: () => void;
}

const SKILLS_OPTIONS = [
  'Fundraising', 'Social Media', 'Event Planning', 'Grant Writing',
  'Research', 'Graphic Design', 'Video Production', 'Public Speaking',
  'Donor Relations', 'Community Organizing', 'Legal', 'Finance',
];

interface VolunteerProfile {
  id: string; name: string; email: string; points: number; tier: string;
  activities: { activity: string; points: number; created_at: string }[];
}

type View = 'landing' | 'signup' | 'lookup' | 'dashboard' | 'mission' | 'leaderboard';

// ── Tier progress bar ─────────────────────────────────────────────────────────
const TierBar: React.FC<{ points: number; tier: string }> = ({ points, tier }) => {
  const tierInfo = TIER_CONFIG.find(t => t.tier === tier) ?? TIER_CONFIG[0];
  const nextTier = TIER_CONFIG[TIER_CONFIG.findIndex(t => t.tier === tier) + 1];
  const pct = nextTier ? Math.min(100, ((points - tierInfo.min) / (nextTier.min - tierInfo.min)) * 100) : 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-bold capitalize ${tierInfo.color}`}>{tierInfo.label}</span>
        {nextTier && <span className="text-xs text-textMuted">{(nextTier.min - points).toLocaleString()} pts to {nextTier.label}</span>}
        {!nextTier && <span className="text-xs text-yellow-400">Max tier!</span>}
      </div>
      <div className="h-2 bg-surfaceHigh rounded-full overflow-hidden">
        <motion.div className="h-full bg-accent rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
      <div className="flex justify-between text-xs text-textMuted mt-1">
        <span>{points.toLocaleString()} pts</span>
        {nextTier && <span>{nextTier.min.toLocaleString()} pts</span>}
      </div>
    </div>
  );
};

// ── Mission card ──────────────────────────────────────────────────────────────
const MissionCard: React.FC<{
  mission: Mission;
  completed: boolean;
  onSelect: () => void;
}> = ({ mission, completed, onSelect }) => {
  const cat = CATEGORY_CONFIG[mission.category];
  const diff = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' }[mission.difficulty];
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        completed
          ? 'bg-green-900/20 border-green-700/40 opacity-70'
          : `${cat.bg} ${cat.border} hover:border-opacity-70`
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{completed ? '✅' : cat.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-textPrimary">{mission.title}</span>
            {completed && <span className="text-xs text-green-400 font-medium">Done</span>}
          </div>
          <p className="text-xs text-textSecondary leading-snug mb-2">{mission.description}</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-accent font-bold">+{mission.points} pts</span>
            <span className={`font-medium capitalize ${diff}`}>{mission.difficulty}</span>
            <span className="text-textMuted">{mission.timeEstimate}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

// ── Mission detail view ───────────────────────────────────────────────────────
const MissionDetail: React.FC<{
  mission: Mission;
  completed: boolean;
  onBack: () => void;
  onMarkDone: (mission: Mission) => void;
}> = ({ mission, completed, onBack, onMarkDone }) => {
  const cat = CATEGORY_CONFIG[mission.category];
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const allChecked = mission.steps.every(s => checked[s.step]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
      <button onClick={onBack} className="text-textMuted hover:text-textPrimary text-sm mb-4 block">← Back to missions</button>

      <div className={`rounded-xl p-4 border mb-6 ${cat.bg} ${cat.border}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{cat.icon}</span>
          <span className={`text-xs font-semibold uppercase tracking-wider ${cat.color}`}>{cat.label}</span>
        </div>
        <h3 className="text-xl font-bold text-textPrimary mb-1">{mission.title}</h3>
        <p className="text-textSecondary text-sm mb-3">{mission.description}</p>
        <div className="flex gap-4 text-sm">
          <span className="text-accent font-bold">+{mission.points} pts</span>
          <span className="text-textMuted">{mission.timeEstimate}</span>
        </div>
      </div>

      {completed ? (
        <div className="card border-green-700/40 bg-green-900/20 text-center py-6 mb-6">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-green-400 font-semibold">Mission complete!</p>
          <p className="text-textMuted text-xs mt-1">Points will be confirmed by TLF staff.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-textPrimary mb-3">Step-by-step instructions</h4>
            <div className="space-y-2">
              {mission.steps.map(s => (
                <button
                  key={s.step}
                  onClick={() => setChecked(prev => ({ ...prev, [s.step]: !prev[s.step] }))}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                    checked[s.step]
                      ? 'bg-green-900/20 border-green-700/40'
                      : 'bg-surface border-border hover:border-accent/40'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors ${
                    checked[s.step] ? 'bg-accent border-accent' : 'border-border'
                  }`}>
                    {checked[s.step] && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-textMuted mr-2">Step {s.step}</span>
                    <span className="text-sm text-textSecondary">{s.instruction}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`card border-dashed mb-6 transition-colors ${allChecked ? 'border-accent/60' : 'border-border'}`}>
            <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">When you're done</p>
            <p className="text-xs text-textSecondary leading-relaxed">{mission.evidencePrompt}</p>
            <p className="text-xs text-textMuted mt-2 italic">Example: {mission.exampleEvidence}</p>
          </div>

          <button
            onClick={() => allChecked && onMarkDone(mission)}
            disabled={!allChecked}
            className={`btn-primary w-full py-4 text-base transition-opacity ${allChecked ? '' : 'opacity-40 cursor-not-allowed'}`}
          >
            {allChecked ? 'Mark as Complete →' : `Check off all ${mission.steps.length} steps to complete`}
          </button>
          {!allChecked && (
            <p className="text-xs text-textMuted text-center mt-2">
              {Object.values(checked).filter(Boolean).length} of {mission.steps.length} steps checked
            </p>
          )}
        </>
      )}
    </motion.div>
  );
};

// ── Main portal ───────────────────────────────────────────────────────────────
export const VolunteerPortal: React.FC<VolunteerPortalProps> = ({ onBack }) => {
  const [view, setView] = useState<View>('landing');
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState('');

  // Lookup
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupErr, setLookupErr] = useState('');

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  useEffect(() => {
    if (view !== 'leaderboard') return;
    setLbLoading(true);
    volunteersApi.leaderboard()
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]))
      .finally(() => setLbLoading(false));
  }, [view]);

  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const loadProfile = async (emailAddr: string) => {
    const data = await volunteersApi.me(emailAddr) as VolunteerProfile;
    setProfile(data);
    setView('dashboard');
    setSubmitting(false);
    setLookupLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true); setSubmitErr('');
    try {
      await volunteersApi.apply({ name, email, phone, skills });
      await loadProfile(email);
    } catch { setSubmitErr('Network error. Please try again.'); setSubmitting(false); }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupLoading(true); setLookupErr('');
    try { await loadProfile(lookupEmail); }
    catch { setLookupErr('No volunteer found with that email.'); setLookupLoading(false); }
  };

  const handleMarkDone = (mission: Mission) => {
    setCompletedIds(prev => new Set([...prev, mission.id]));
    setActiveMission(null);
    // Optimistically add points to profile display
    if (profile) {
      const newPoints = profile.points + mission.points;
      const tier = newPoints >= 5000 ? 'legend' : newPoints >= 2000 ? 'champion' : newPoints >= 750 ? 'grower' : newPoints >= 200 ? 'sprout' : 'seed';
      setProfile({ ...profile, points: newPoints, tier });
    }
  };

  const filteredMissions = activeCategory === 'all'
    ? MISSIONS
    : MISSIONS.filter(m => m.category === activeCategory);

  const tierInfo = TIER_CONFIG.find(t => t.tier === (profile?.tier ?? 'seed')) ?? TIER_CONFIG[0];

  return (
    <StepWrapper stepKey="volunteer-portal">
      <div className="px-4 py-2">
        <button
          onClick={activeMission ? () => setActiveMission(null) : view === 'landing' ? onBack : () => setView('landing')}
          className="text-textMuted hover:text-textPrimary transition-colors text-sm mb-6 block"
        >
          {activeMission ? '← Back to missions' : view === 'landing' ? '← Back' : '← Back'}
        </button>

        <AnimatePresence mode="wait">

          {/* ── Landing ── */}
          {view === 'landing' && !activeMission && (
            <motion.div key="landing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-bold text-textPrimary mb-1">Volunteer Portal</h2>
              <p className="text-textSecondary text-sm mb-6">
                Pick a mission, follow the steps, and earn points as you help grow the UBI movement.
              </p>

              {/* Tier ladder */}
              <div className="card mb-6">
                <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-3">Tier Ladder</h3>
                <div className="space-y-2">
                  {TIER_CONFIG.map((t, i) => (
                    <div key={t.tier} className={`flex items-center gap-3 p-2.5 rounded-xl ${t.bg} border border-border`}>
                      <span className={`text-sm font-bold w-5 text-center ${t.color}`}>{i + 1}</span>
                      <div className="flex-1">
                        <span className={`text-sm font-bold ${t.color}`}>{t.label}</span>
                        <span className="text-textMuted text-xs ml-2">{t.desc}</span>
                      </div>
                      <span className="text-xs text-textMuted">
                        {t.min === 0 ? '0' : t.min.toLocaleString()}{t.max ? `-${t.max.toLocaleString()}` : '+'} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <button onClick={() => setView('signup')} className="btn-primary w-full py-4 text-base">
                  Join as a Volunteer →
                </button>
                <button onClick={() => setView('lookup')} className="btn-secondary w-full">
                  I'm already a volunteer
                </button>
                <button onClick={() => setView('leaderboard')}
                  className="w-full py-2.5 text-sm text-textMuted hover:text-textPrimary transition-colors border border-border rounded-xl hover:border-accent/40">
                  🏆 View Leaderboard
                </button>
              </div>

              {/* Preview missions */}
              <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">Available Missions</h3>
              <div className="space-y-2">
                {MISSIONS.slice(0, 4).map(m => {
                  const cat = CATEGORY_CONFIG[m.category];
                  return (
                    <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border ${cat.bg} ${cat.border}`}>
                      <span className="text-lg">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-textPrimary truncate">{m.title}</p>
                        <p className="text-xs text-textMuted">{m.timeEstimate}</p>
                      </div>
                      <span className="text-accent font-bold text-sm">+{m.points}</span>
                    </div>
                  );
                })}
                <p className="text-xs text-textMuted text-center pt-1">+{MISSIONS.length - 4} more missions after you join</p>
              </div>
            </motion.div>
          )}

          {/* ── Sign up ── */}
          {view === 'signup' && !activeMission && (
            <motion.div key="signup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="text-2xl font-bold text-textPrimary mb-1">Join as a Volunteer</h2>
              <p className="text-textSecondary text-sm mb-6">Start earning points and tracking your impact.</p>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Name <span className="text-danger">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your full name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Email <span className="text-danger">*</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Phone <span className="text-textMuted">(optional)</span></label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="(555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Skills <span className="text-textMuted">(optional)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_OPTIONS.map(s => (
                      <button type="button" key={s} onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${skills.includes(s) ? 'bg-accent text-white border-accent' : 'bg-surface text-textSecondary border-border hover:border-accent/40'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {submitErr && <p className="text-danger text-sm">{submitErr}</p>}
                <button type="submit" disabled={submitting || !name || !email} className="btn-primary w-full disabled:opacity-50">
                  {submitting ? 'Joining...' : 'Join the Movement →'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Lookup ── */}
          {view === 'lookup' && !activeMission && (
            <motion.div key="lookup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="text-2xl font-bold text-textPrimary mb-1">Welcome Back</h2>
              <p className="text-textSecondary text-sm mb-6">Enter your email to access your dashboard.</p>
              <form onSubmit={handleLookup} className="space-y-4">
                <input type="email" value={lookupEmail} onChange={e => setLookupEmail(e.target.value)}
                  className="input-field" placeholder="you@example.com" required />
                {lookupErr && <p className="text-danger text-sm">{lookupErr}</p>}
                <button type="submit" disabled={lookupLoading || !lookupEmail} className="btn-primary w-full disabled:opacity-50">
                  {lookupLoading ? 'Looking up...' : 'View My Dashboard →'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Dashboard ── */}
          {view === 'dashboard' && profile && !activeMission && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${tierInfo.bg} border border-border flex-shrink-0`}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-textPrimary">{profile.name}</h2>
                  <p className="text-textMuted text-xs">{profile.email}</p>
                </div>
              </div>

              {/* Points + tier */}
              <div className="card mb-6">
                <TierBar points={profile.points} tier={profile.tier} />
              </div>

              {/* Completed count */}
              {completedIds.size > 0 && (
                <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-3 mb-4 text-center">
                  <p className="text-green-400 text-sm font-semibold">
                    {completedIds.size} mission{completedIds.size > 1 ? 's' : ''} completed this session
                  </p>
                  <p className="text-textMuted text-xs mt-0.5">Points are confirmed by TLF staff, usually within 48 hrs.</p>
                </div>
              )}

              {/* Category filter */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
                <button onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${activeCategory === 'all' ? 'bg-accent text-white' : 'bg-surface text-textSecondary border border-border hover:text-textPrimary'}`}>
                  All
                </button>
                {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
                  <button key={key} onClick={() => setActiveCategory(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${activeCategory === key ? 'bg-accent text-white' : `${cat.bg} ${cat.color} border ${cat.border} hover:opacity-80`}`}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              {/* Mission list */}
              <div className="space-y-2 mb-6">
                {filteredMissions.map(m => (
                  <MissionCard
                    key={m.id}
                    mission={m}
                    completed={completedIds.has(m.id)}
                    onSelect={() => setActiveMission(m)}
                  />
                ))}
              </div>

              {/* Activity log */}
              {profile.activities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-3">Activity Log</h3>
                  <div className="space-y-2">
                    {profile.activities.map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                        <div>
                          <p className="text-textPrimary text-sm">{a.activity}</p>
                          <p className="text-textMuted text-xs">{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <span className="text-accent font-bold text-sm">+{a.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setView('leaderboard')}
                className="w-full py-2.5 text-sm text-textMuted hover:text-textPrimary transition-colors border border-border rounded-xl hover:border-accent/40 mb-4">
                🏆 View Leaderboard
              </button>
            </motion.div>
          )}

          {/* ── Mission detail ── */}
          {activeMission && (
            <MissionDetail
              key={activeMission.id}
              mission={activeMission}
              completed={completedIds.has(activeMission.id)}
              onBack={() => setActiveMission(null)}
              onMarkDone={handleMarkDone}
            />
          )}

          {/* ── Leaderboard ── */}
          {view === 'leaderboard' && !activeMission && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="text-2xl font-bold text-textPrimary mb-1">Volunteer Leaderboard</h2>
              <p className="text-textSecondary text-sm mb-6">Top contributors by points earned.</p>

              {lbLoading ? (
                <div className="text-center py-12 text-textMuted text-sm">Loading…</div>
              ) : leaderboard.length === 0 ? (
                <div className="card text-center py-10">
                  <p className="text-4xl mb-3">🌱</p>
                  <p className="text-textSecondary text-sm">No points earned yet — be the first!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => {
                    const tierInfo = TIER_CONFIG.find(t => t.tier === entry.tier) ?? TIER_CONFIG[0];
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                    return (
                      <motion.div
                        key={`${entry.name}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${i < 3 ? tierInfo.bg : 'bg-surface'} border-border`}
                      >
                        <span className="w-7 text-center text-sm font-bold text-textMuted flex-shrink-0">
                          {medal ?? `#${i + 1}`}
                        </span>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${tierInfo.bg} border border-border`}>
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-textPrimary truncate">{entry.name}</p>
                          <p className={`text-xs font-medium capitalize ${tierInfo.color}`}>{tierInfo.label}</p>
                        </div>
                        <span className="text-accent font-bold text-sm flex-shrink-0">
                          {entry.points.toLocaleString()} pts
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <button onClick={() => setView('landing')} className="btn-secondary w-full mt-6">
                ← Back
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </StepWrapper>
  );
};
