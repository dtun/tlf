import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepWrapper } from './StepWrapper';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  onBack: () => void;
}

async function adminFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts?.headers as Record<string, string> ?? {}),
  };
  const res = await fetch(`/api${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

type Tab = 'stats' | 'subscribers' | 'email' | 'search' | 'volunteers';

const StatCard: React.FC<{ label: string; value: string | number; sub?: string }> = ({ label, value, sub }) => (
  <div className="bg-surface rounded-xl p-4 border border-border">
    <div className="text-2xl font-bold text-accent">{value}</div>
    <div className="text-textMuted text-xs mt-1">{label}</div>
    {sub && <div className="text-textMuted text-xs mt-0.5 opacity-70">{sub}</div>}
  </div>
);

const StatsTab: React.FC = () => {
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [subCount, setSubCount] = useState<number | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([
      adminFetch<Record<string, number>>('/admin/stats'),
      adminFetch<unknown[]>('/admin/subscribers'),
    ]).then(([stats, subs]) => { setData(stats); setSubCount(subs.length); })
      .catch(() => setErr('Failed to load stats. Admin access required.'));
  }, []);
  if (err) return <div className="text-red-400 text-sm p-4 bg-red-900/20 rounded-xl">{err}</div>;
  if (!data) return <div className="text-textMuted text-sm text-center py-8">Loading…</div>;
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Total Users" value={data.totalUsers ?? 0} />
      <StatCard label="Verified Users" value={data.verifiedUsers ?? 0} />
      <StatCard label="Newsletter Subscribers" value={subCount ?? ''} />
      <StatCard label="Pledge Items" value={data.totalPledgeItems ?? 0} />
      <StatCard label="Est. Annual Pledged" value={fmt(data.estimatedAnnualValue ?? 0)} sub="income + wealth pledges" />
      <StatCard label="AZ Tax Credit" value={data.azTaxCreditCommitments ?? 0} sub="committed" />
    </div>
  );
};

interface Subscriber { id: string; email: string; first_name: string; source: string; created_at: string }

const SubscribersTab: React.FC = () => {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => { adminFetch<Subscriber[]>('/admin/subscribers').then(setRows).finally(() => setLoading(false)); }, []);
  const filtered = rows.filter(r => !search || r.email.includes(search.toLowerCase()) || (r.first_name ?? '').toLowerCase().includes(search.toLowerCase()));
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-textMuted text-xs">{rows.length} subscribers</p>
        <a href="/api/admin/export/users.csv" className="text-xs text-accent hover:text-accentHover">Export CSV →</a>
      </div>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="input-field mb-3 text-sm" />
      {loading ? <div className="text-textMuted text-sm text-center py-8">Loading…</div> : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map(r => (
            <div key={r.id} className="bg-surface rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-textPrimary text-sm font-medium truncate">{r.email}</div>
                {r.first_name && <div className="text-textMuted text-xs">{r.first_name}</div>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-textMuted text-xs">{fmtDate(r.created_at)}</div>
                <div className="text-textMuted text-xs capitalize">{r.source}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-textMuted text-sm text-center py-6">No results.</div>}
        </div>
      )}
    </div>
  );
};

const TEMPLATE_BLOCKS = [
  { id: 'intro', label: 'Intro', html: '<p>Hello,</p>\n<p>We have exciting news about our Universal Basic Income programs in Arizona.</p>' },
  { id: 'stat', label: 'Stats', html: '<div class="stat-row">\n  <div class="stat-box"><div class="num">100%</div><div class="lbl">of 2024 pilot participants regained housing</div></div>\n  <div class="stat-box"><div class="num">$20M</div><div class="lbl">could cut AZ homelessness in half</div></div>\n</div>' },
  { id: 'cta', label: 'CTA Button', html: '<div class="cta"><a href="https://app.thelogicalfoundation.org">Make Your Pledge →</a></div>' },
  { id: 'divider', label: 'Divider', html: '<hr class="divider" />' },
  { id: 'heading', label: 'Heading', html: '<h2>Program Update</h2>' },
  { id: 'quote', label: 'Quote', html: '<blockquote style="border-left:3px solid #4ade80;padding-left:16px;margin:16px 0;color:#8b949e;font-style:italic;">"Your quote here."</blockquote>' },
];

interface EmailHistory { id: string; subject: string; recipient_count: number; created_at: string }

const EmailTab: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('<p>Hello,</p>\n<p></p>');
  const [recipientType, setRecipientType] = useState<'subscribers' | 'users' | 'all'>('subscribers');
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ count: number } | null>(null);
  const [sendErr, setSendErr] = useState('');
  const [history, setHistory] = useState<EmailHistory[]>([]);
  const [historyTab, setHistoryTab] = useState(false);
  useEffect(() => { adminFetch<EmailHistory[]>('/admin/email/history').then(setHistory).catch(() => {}); }, [sent]);
  const insertBlock = (html: string) => setBodyHtml(prev => prev + '\n' + html);
  const handleSend = async () => {
    if (!subject.trim() || !bodyHtml.trim()) { setSendErr('Subject and body are required.'); return; }
    if (!window.confirm(`Send to all ${recipientType}? This cannot be undone.`)) return;
    setSending(true); setSendErr('');
    try {
      const data = await adminFetch<{ sent: boolean; recipientCount: number }>('/admin/email/send', {
        method: 'POST', body: JSON.stringify({ subject, bodyHtml, recipientType }),
      });
      setSent({ count: data.recipientCount });
      setSubject(''); setBodyHtml('<p>Hello,</p>\n<p></p>');
    } catch { setSendErr('Send failed. Check SMTP configuration.'); }
    finally { setSending(false); }
  };
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[{ id: false, label: 'Compose' }, { id: true, label: `History (${history.length})` }].map(t => (
          <button key={String(t.id)} onClick={() => setHistoryTab(t.id as boolean)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${historyTab === t.id ? 'bg-accent text-white' : 'bg-surface text-textSecondary border border-border hover:text-textPrimary'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {historyTab ? (
        <div className="space-y-2">
          {history.map(h => (
            <div key={h.id} className="bg-surface rounded-xl p-3">
              <div className="text-textPrimary text-sm font-medium">{h.subject}</div>
              <div className="flex gap-3 mt-1 text-xs text-textMuted"><span>{h.recipient_count} recipients</span><span>{fmtDate(h.created_at)}</span></div>
            </div>
          ))}
          {history.length === 0 && <div className="text-textMuted text-sm text-center py-6">No emails sent yet.</div>}
        </div>
      ) : (
        <div className="space-y-4">
          {sent && <div className="bg-green-900/30 border border-green-700 rounded-xl p-3 text-green-300 text-sm">✅ Sent to {sent.count} recipients.</div>}
          <div>
            <label className="block text-xs font-medium text-textMuted mb-2">Send to</label>
            <div className="flex gap-2 flex-wrap">
              {(['subscribers', 'users', 'all'] as const).map(t => (
                <button key={t} onClick={() => setRecipientType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${recipientType === t ? 'bg-accent text-white' : 'bg-surface text-textSecondary border border-border hover:text-textPrimary'}`}>
                  {t === 'subscribers' ? 'Newsletter list' : t === 'users' ? 'Verified users' : 'Everyone'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-textMuted mb-1">Subject line</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your subject here…" className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-textMuted mb-2">Insert block</label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_BLOCKS.map(b => (
                <button key={b.id} onClick={() => insertBlock(b.html)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-surfaceHigh text-textSecondary hover:text-textPrimary border border-border transition-colors">
                  + {b.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-textMuted">Email body (HTML)</label>
              <button onClick={() => setPreview(v => !v)} className="text-xs text-accent hover:text-accentHover">{preview ? 'Edit' : 'Preview'}</button>
            </div>
            {preview
              ? <div className="bg-white rounded-xl p-4 min-h-[200px] text-sm text-gray-800 overflow-auto border border-border" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              : <textarea value={bodyHtml} onChange={e => setBodyHtml(e.target.value)} rows={10} className="input-field text-xs font-mono resize-y w-full" />
            }
          </div>
          {sendErr && <p className="text-danger text-sm">{sendErr}</p>}
          <button onClick={handleSend} disabled={sending || !subject.trim() || !bodyHtml.trim()} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {sending ? 'Sending…' : 'Send Email →'}
          </button>
          <p className="text-xs text-textMuted text-center">Sent from info@thelogicalfoundation.org via your configured SMTP server.</p>
        </div>
      )}
    </div>
  );
};

const SEARCH_EXAMPLES = [
  'Who has pledged more than 1% of their income?',
  'Subscribers from the last 30 days',
  'Volunteers with the most points',
  'Users from Arizona',
  'Wealth-based pledgers',
];

const SearchTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; recordCount: number } | null>(null);
  const [err, setErr] = useState('');
  const handleSearch = async (q?: string) => {
    const sq = q ?? query;
    if (!sq.trim()) return;
    setLoading(true); setErr(''); setResult(null);
    try {
      const data = await adminFetch<{ answer: string; recordCount: number }>('/admin/search', { method: 'POST', body: JSON.stringify({ query: sq }) });
      setResult(data);
    } catch { setErr('Search failed. Ensure OPENAI_API_KEY is set in backend .env'); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-textMuted mb-2">Describe the population you want to find</label>
        <div className="flex gap-2">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. people who pledged income in Arizona…" className="input-field text-sm flex-1" />
          <button onClick={() => handleSearch()} disabled={loading || !query.trim()} className="btn-primary px-4 disabled:opacity-50 flex-shrink-0">
            {loading ? '…' : 'Ask'}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {SEARCH_EXAMPLES.map(ex => (
          <button key={ex} onClick={() => { setQuery(ex); handleSearch(ex); }}
            className="text-xs px-2.5 py-1 rounded-lg bg-surfaceHigh text-textSecondary hover:text-accent border border-border transition-colors text-left">
            {ex}
          </button>
        ))}
      </div>
      {err && <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-xl">{err}</div>}
      {loading && <div className="text-center py-8 text-textMuted text-sm">Analyzing database…</div>}
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">AI Analysis</span>
            <span className="text-xs text-textMuted">{result.recordCount} records scanned</span>
          </div>
          <div className="text-sm text-textSecondary leading-relaxed whitespace-pre-wrap">{result.answer}</div>
        </motion.div>
      )}
    </div>
  );
};

interface VolunteerRow { id: string; name: string; email: string; phone: string; skills: string[]; points: number; tier: string; created_at: string }
const TIER_COLORS: Record<string, string> = { seed: 'text-textMuted', sprout: 'text-green-400', grower: 'text-blue-400', champion: 'text-purple-400', legend: 'text-yellow-400' };

const VolunteersTab: React.FC = () => {
  const [rows, setRows] = useState<VolunteerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VolunteerRow | null>(null);
  const [awardActivity, setAwardActivity] = useState('');
  const [awardPoints, setAwardPoints] = useState('');
  const [awarding, setAwarding] = useState(false);
  const [awardMsg, setAwardMsg] = useState('');
  const load = useCallback(() => { setLoading(true); adminFetch<VolunteerRow[]>('/volunteers/admin/list').then(setRows).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);
  const handleAward = async () => {
    if (!selected || !awardActivity || !awardPoints) return;
    setAwarding(true); setAwardMsg('');
    try {
      const data = await adminFetch<{ points: number; tier: string }>('/volunteers/admin/award', {
        method: 'POST', body: JSON.stringify({ volunteerId: selected.id, activity: awardActivity, points: parseInt(awardPoints) }),
      });
      setAwardMsg(`Awarded! New total: ${data.points} pts (${data.tier})`);
      setAwardActivity(''); setAwardPoints(''); load();
    } catch { setAwardMsg('Failed to award points.'); }
    finally { setAwarding(false); }
  };
  if (loading) return <div className="text-textMuted text-sm text-center py-8">Loading…</div>;
  return (
    <div>
      <p className="text-textMuted text-xs mb-3">{rows.length} volunteers</p>
      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 mb-4">
        {rows.map(v => (
          <button key={v.id} onClick={() => { setSelected(v); setAwardMsg(''); }}
            className={`w-full text-left bg-surface rounded-xl p-3 border transition-colors ${selected?.id === v.id ? 'border-accent' : 'border-border hover:border-accent/40'}`}>
            <div className="flex items-center justify-between">
              <div><div className="text-textPrimary text-sm font-medium">{v.name}</div><div className="text-textMuted text-xs">{v.email}</div></div>
              <div className="text-right"><div className="text-accent text-sm font-bold">{v.points} pts</div><div className={`text-xs font-semibold capitalize ${TIER_COLORS[v.tier] ?? 'text-textMuted'}`}>{v.tier}</div></div>
            </div>
            {v.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">{v.skills.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-surfaceHigh text-textMuted">{s}</span>)}</div>
            )}
          </button>
        ))}
        {rows.length === 0 && <div className="text-textMuted text-sm text-center py-6">No volunteers yet.</div>}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card border-accent/30">
            <p className="text-sm font-semibold text-textPrimary mb-3">Award points to {selected.name}</p>
            <div className="space-y-3">
              <input type="text" value={awardActivity} onChange={e => setAwardActivity(e.target.value)} placeholder="Activity (e.g. 'Raised $500 at event')" className="input-field text-sm" />
              <input type="number" value={awardPoints} onChange={e => setAwardPoints(e.target.value)} placeholder="Points to award" className="input-field text-sm" min="1" />
              {awardMsg && <p className="text-sm text-textSecondary">{awardMsg}</p>}
              <button onClick={handleAward} disabled={awarding || !awardActivity || !awardPoints} className="btn-primary w-full text-sm disabled:opacity-50">
                {awarding ? 'Awarding…' : 'Award Points →'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('stats');
  const TABS: { id: Tab; label: string }[] = [
    { id: 'stats', label: 'Stats' }, { id: 'subscribers', label: 'Subscribers' },
    { id: 'email', label: 'Email' }, { id: 'search', label: 'AI Search' }, { id: 'volunteers', label: 'Volunteers' },
  ];
  return (
    <StepWrapper stepKey="admin">
      <div className="px-4 py-2">
        <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm mb-4 block">← Back</button>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-2xl font-bold text-textPrimary mb-1">Admin Panel</h2>
          <p className="text-textMuted text-xs mb-4">Restricted access</p>
        </motion.div>
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${tab === t.id ? 'bg-accent text-white' : 'bg-surface text-textSecondary border border-border hover:text-textPrimary'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === 'stats' && <StatsTab />}
            {tab === 'subscribers' && <SubscribersTab />}
            {tab === 'email' && <EmailTab />}
            {tab === 'search' && <SearchTab />}
            {tab === 'volunteers' && <VolunteersTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </StepWrapper>
  );
};
