import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState, PledgeItem } from '../types';
import { StepWrapper } from '../components/StepWrapper';

interface Step7Props {
  state: AppState;
  onActivate: () => void;
  onSetPublic: (val: boolean) => void;
  onEdit: (step: number, subStep?: number) => void;
  onReset: () => void;
  onNavigate?: (page: number) => void;
}

// ─── Review Section ──────────────────────────────────────────────────────────

const ReviewRow: React.FC<{
  label: string;
  value: string;
  onEdit: () => void;
}> = ({ label, value, onEdit }) => (
  <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-xs text-textSecondary uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-textPrimary text-sm font-medium truncate">{value || ''}</p>
    </div>
    <button
      onClick={onEdit}
      className="ml-3 text-xs text-accent hover:text-accentHover font-medium shrink-0 mt-1"
    >
      Edit
    </button>
  </div>
);

// ─── GiveButter Widget ────────────────────────────────────────────────────────

const GiveButterWidget: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    const widget = document.createElement('givebutter-widget');
    widget.setAttribute('id', campaignId);
    el.appendChild(widget);
  }, [campaignId]);
  return <div ref={ref} className="min-h-[420px] w-full" />;
};

const GiveButterSection: React.FC = () => {
  const [showWidget, setShowWidget] = useState(false);

  return (
    <div className="card mt-4">
      <h3 className="text-lg font-semibold text-textPrimary mb-2">Make Your Contribution</h3>
      <div className="flex items-start gap-3 bg-yellow-900/30 border border-yellow-600/50 rounded-xl px-4 py-3">
        <span className="text-yellow-400 text-lg flex-shrink-0 mt-0.5">⚠️</span>
        <p className="text-sm font-medium text-yellow-200 leading-snug">
          When prompted, set the GiveButter tip to <strong>$0</strong> so your full gift reaches TLF.
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowWidget(v => !v)}
        className="btn-primary w-full mt-4"
      >
        {showWidget ? 'Hide Donation Widget' : '💚 Make Your Contribution Now'}
      </motion.button>
      {showWidget && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-4">
          <GiveButterWidget campaignId="gKDOwp" />
        </motion.div>
      )}
    </div>
  );
};

// ─── AI Chat ─────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const AI_RESPONSES: Record<string, string> = {
  default:
    "Thanks for reaching out! I'm here to help with questions about The Logical Foundation, our programs, and how your giving makes an impact. What would you like to know?",
  tax:
    "The Arizona QCO Tax Credit (Form 321, Code 22852) lets you give up to $495 (single) or $987 (married filing jointly) and receive a dollar-for-dollar credit against your AZ state tax owed. You can claim 2025 contributions until April 2026.",
  ubi:
    "Universal Basic Income (UBI) is a regular cash payment to all citizens regardless of employment status. Our programs work toward building the infrastructure for UBI in Arizona through charitable giving, income-sharing, and community funds.",
  pledge:
    "Your UBI Giving Pledge is a commitment, virtual or real, to contribute toward ending poverty. Even if you can't give now, your pledge accumulates as a virtual commitment and counts toward our collective goals.",
  fund:
    "The Foundation Fund is a community-owned UBI pot. Anyone can join for as little as $1/year. All contributions are pooled and split equally among all participants. A leaderboard will recognize top contributors.",
  comingle:
    "Comingle is an income-sharing community where members contribute 7% of income through a secure bank connection. The pool is redistributed weekly to all members, creating a ~$50/week UBI floor.",
  donate:
    "You can donate directly through our GiveButter widget on this page. Please remember to set the tip to $0 before completing your donation. Every dollar goes toward our UBI programs.",
  contact:
    "For direct support, you can escalate to our Board of Directors. Click the 'Escalate to Human' button below and we'll connect you with a board member within 24 hours.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('tax') || lower.includes('credit') || lower.includes('arizona') || lower.includes('qco'))
    return AI_RESPONSES.tax;
  if (lower.includes('ubi') || lower.includes('universal basic income'))
    return AI_RESPONSES.ubi;
  if (lower.includes('pledge') || lower.includes('commit'))
    return AI_RESPONSES.pledge;
  if (lower.includes('foundation fund') || lower.includes('fund'))
    return AI_RESPONSES.fund;
  if (lower.includes('comingle') || lower.includes('income sharing'))
    return AI_RESPONSES.comingle;
  if (lower.includes('donat') || lower.includes('give') || lower.includes('contribut'))
    return AI_RESPONSES.donate;
  if (lower.includes('contact') || lower.includes('human') || lower.includes('person') || lower.includes('help'))
    return AI_RESPONSES.contact;
  return AI_RESPONSES.default;
}

const AIChatSection: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: AI_RESPONSES.default },
  ]);
  const [input, setInput] = useState('');
  const [escalated, setEscalated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    const aiMsg: ChatMessage = { role: 'assistant', text: getAIResponse(trimmed) };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  const handleEscalate = () => {
    setEscalated(true);
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: "I've flagged your conversation for our Board of Directors. A board member will reach out to you at the email you provided within 24 hours. Thank you for your patience.",
      },
    ]);
  };

  return (
    <div className="mt-4">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-surfaceHigh hover:border-accent/40 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accentDim flex items-center justify-center">
            <span className="text-accent text-sm font-bold">AI</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-textPrimary">AI Customer Support</p>
            <p className="text-xs text-textSecondary">Ask anything about our programs</p>
          </div>
        </div>
        <span className="text-textMuted">{open ? '▲' : '▼'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border border-border border-t-0 rounded-b-xl bg-surface">
              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-accent text-white rounded-br-sm'
                          : 'bg-surfaceHigh text-textPrimary rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1 py-2 text-sm"
                    placeholder="Ask about tax credits, UBI, pledges..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                  />
                  <button onClick={send} className="btn-primary px-4 py-2 text-sm">
                    Send
                  </button>
                </div>
                {!escalated && (
                  <button
                    onClick={handleEscalate}
                    className="mt-2 text-xs text-textMuted hover:text-warning transition-colors w-full text-center"
                  >
                    Escalate to Human / Board of Directors →
                  </button>
                )}
                {escalated && (
                  <p className="mt-2 text-xs text-warning text-center">
                    ✓ Escalated to Board of Directors
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Social Share Card ────────────────────────────────────────────────────────

const ShareCard: React.FC<{
  firstName: string;
  lastName: string;
  pledgeSummary: string;
}> = ({ firstName, lastName, pledgeSummary }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200, H = 630;
    canvas.width = W;
    canvas.height = H;

    // Background gradient — dark green
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0a1a0f');
    bg.addColorStop(1, '#0d2318');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(74,222,128,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Accent glow circle top-right
    const glow = ctx.createRadialGradient(W - 100, 80, 0, W - 100, 80, 320);
    glow.addColorStop(0, 'rgba(74,222,128,0.12)');
    glow.addColorStop(1, 'rgba(74,222,128,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = 'rgba(74,222,128,0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    // TLF wordmark
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('THE LOGICAL FOUNDATION', 72, 100);

    // Tagline
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Distribute Prosperity with Universal Basic Income', 72, 136);

    // Divider
    ctx.strokeStyle = 'rgba(74,222,128,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(72, 164); ctx.lineTo(W - 72, 164); ctx.stroke();

    // Main headline
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    const name = `${firstName} ${lastName}`.trim() || 'A Supporter';
    ctx.fillText(name, 72, 280);

    // Sub-headline
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('just made a UBI Giving Pledge', 72, 340);

    // Pledge detail
    if (pledgeSummary) {
      ctx.font = '26px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      const maxW = W - 144;
      const words = pledgeSummary.split(' ');
      let line = '';
      let y = 400;
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, 72, y);
          line = word;
          y += 36;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, 72, y);
    }

    // CTA pill
    const pillX = 72, pillY = H - 120, pillW = 420, pillH = 56;
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 28);
    ctx.fill();
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0a1a0f';
    ctx.fillText('Join at thelogicalfoundation.org', pillX + 24, pillY + 37);

    // EIN badge
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('501(c)(3) Nonprofit · EIN# 88-3607946', 72, H - 40);
  }, [firstName, lastName, pledgeSummary]);

  useEffect(() => { draw(); }, [draw]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    const link = document.createElement('a');
    link.download = 'tlf-pledge-share.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setTimeout(() => setDownloading(false), 1000);
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async blob => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, 'image/png');
    } catch {
      // Clipboard API not available — fall back to download
      handleDownload();
    }
  };

  return (
    <div>
      {/* Preview — scaled down to fit mobile */}
      <div className="rounded-xl overflow-hidden border border-border mb-3 bg-surface">
        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
          style={{ aspectRatio: '1200/630' }}
        />
      </div>
      <div className="flex gap-2">
        <button onClick={handleDownload} disabled={downloading}
          className="flex-1 btn-secondary text-sm py-2.5 disabled:opacity-50">
          {downloading ? 'Saving…' : '⬇ Download Image'}
        </button>
        <button onClick={handleCopy}
          className="flex-1 btn-primary text-sm py-2.5">
          {copied ? '✓ Copied!' : '📋 Copy Image'}
        </button>
      </div>
      <p className="text-xs text-textMuted text-center mt-2">
        Share on Instagram, Twitter/X, LinkedIn, or anywhere else
      </p>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  seed: 'text-textMuted', sprout: 'text-green-400', grower: 'text-blue-400',
  champion: 'text-purple-400', legend: 'text-yellow-400',
};

const NOTIFICATIONS = [
  { id: 1, icon: '📊', title: '2024 Annual Report available', body: 'Read our impact report and see how your pledge is making a difference.', page: 105, date: 'Jun 2025' },
  { id: 2, icon: '🌵', title: 'AZ Tax Credit deadline approaching', body: 'You can claim 2025 contributions until April 2026. Make your donation now.', page: 92, date: 'Ongoing' },
  { id: 3, icon: '🤝', title: 'Comingle launching soon', body: 'Our income-sharing community is in development. Sign up to be notified.', page: 101, date: 'Coming Soon' },
];

const Dashboard: React.FC<{
  state: AppState;
  onEdit: (step: number, subStep?: number) => void;
  onSetPublic: (val: boolean) => void;
  onReset: () => void;
  onNavigate?: (page: number) => void;
}> = ({ state, onEdit, onSetPublic, onReset, onNavigate }) => {
  const { userInfo, azTaxCredit, ubiPledge, foundationFund, comingle } = state;

  const pledgeSummary = ubiPledge.pledges.length
    ? ubiPledge.pledges.map((p: PledgeItem) => {
        switch (p.pledgeType) {
          case 'income_based': return `${p.incomePercent || '?'}% of income`;
          case 'wealth_based': return `${p.wealthPercent || '?'}% of net worth`;
          case 'vehicle': return [p.vehicleYear, p.vehicleMake, p.vehicleModel].filter(Boolean).join(' ') || 'Vehicle';
          case 'real_estate': return p.propertyAddress || 'Real estate';
          case 'crypto': return 'Crypto donation';
          case 'other': return p.otherDescription || 'Other gift';
          default: return 'Pledge';
        }
      }).join(' + ')
    : '';

  const shareText = `I just joined The Logical Foundation's mission to Distribute Abundance! 🌿 Universal Basic Income Solutions for Arizona. Join me: https://thelogicalfoundation.org`;

  return (
    <div className="px-4 py-2">
      {/* Success Banner */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        className="text-center mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-accentDim flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-textPrimary">Profile Activated</h2>
        <p className="text-accent font-semibold mt-1">Welcome to The Logical Foundation</p>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4">
        <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Updates</h3>
        <div className="space-y-2">
          {NOTIFICATIONS.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.06 }}>
              <button onClick={() => onNavigate?.(n.page)}
                className="w-full flex items-start gap-3 p-3 rounded-xl bg-surface border border-border hover:border-accent/40 transition-colors group text-left">
                <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-textPrimary group-hover:text-accent transition-colors">{n.title}</p>
                  <p className="text-xs text-textSecondary mt-0.5 leading-snug">{n.body}</p>
                </div>
                <span className="text-xs text-textMuted flex-shrink-0">{n.date}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Volunteer status / apply */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card mb-4">
        {state.volunteerStatus ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-textPrimary">Volunteer Status</h3>
              <span className={`text-xs font-bold capitalize ${TIER_COLORS[state.volunteerStatus.tier] ?? 'text-textMuted'}`}>
                {state.volunteerStatus.tier}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-surfaceHigh rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, (state.volunteerStatus.points / 5000) * 100)}%` }} />
              </div>
              <span className="text-accent font-bold text-sm">{state.volunteerStatus.points.toLocaleString()} pts</span>
            </div>
            <button onClick={() => onNavigate?.(104)} className="btn-secondary w-full mt-3 text-sm">
              View Volunteer Dashboard →
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-textPrimary mb-1">Volunteer with Us</h3>
            <p className="text-textSecondary text-xs mb-3 leading-relaxed">
              Earn points, climb tiers, and track your impact as you help grow the UBI movement.
            </p>
            <button onClick={() => onNavigate?.(104)} className="btn-primary w-full text-sm">
              Apply to Volunteer →
            </button>
          </div>
        )}
      </motion.div>

      {/* Make Public */}
      <div className="card mb-4">
        <h3 className="text-base font-semibold text-textPrimary mb-2">Make Your Profile Public?</h3>
        <p className="text-textSecondary text-sm mb-3">
          Share your commitment and inspire others to join.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onSetPublic(true)}
            className={`flex-1 py-3 rounded-xl font-semibold border-2 text-sm transition-all ${
              state.isPublic === true
                ? 'border-accent bg-accentDim/30 text-accent'
                : 'border-border text-textSecondary hover:border-accent/40'
            }`}
          >
            Yes, Make Public
          </button>
          <button
            onClick={() => onSetPublic(false)}
            className={`flex-1 py-3 rounded-xl font-semibold border-2 text-sm transition-all ${
              state.isPublic === false
                ? 'border-textSecondary bg-surfaceHigh text-textPrimary'
                : 'border-border text-textSecondary hover:border-textSecondary/40'
            }`}
          >
            Keep Private
          </button>
        </div>

        {state.isPublic === true && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-3"
          >
            <div className="bg-surfaceHigh rounded-xl p-3">
              <p className="text-xs text-textSecondary mb-1">Your shareable link</p>
              <p className="text-accent text-sm font-mono break-all">
                https://thelogicalfoundation.org/profile/{userInfo.firstName.toLowerCase()}-{userInfo.lastName.toLowerCase()}
              </p>
            </div>
            <div className="bg-surfaceHigh rounded-xl p-3">
              <p className="text-xs font-semibold text-textSecondary mb-3">Share card</p>
              <ShareCard
                firstName={userInfo.firstName}
                lastName={userInfo.lastName}
                pledgeSummary={pledgeSummary}
              />
            </div>
            <div className="bg-surfaceHigh rounded-xl p-3">
              <p className="text-xs text-textSecondary mb-2">Or copy text</p>
              <p className="text-textSecondary text-sm leading-relaxed">{shareText}</p>
              <button
                onClick={() => navigator.clipboard?.writeText(shareText)}
                className="mt-2 text-xs text-accent hover:text-accentHover font-medium"
              >
                Copy to clipboard
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="space-y-3 mb-4">
        {/* Personal Info */}
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">
              Personal Info
            </h3>
            <button onClick={() => onEdit(2, 1)} className="text-xs text-accent hover:text-accentHover">
              Edit
            </button>
          </div>
          <ReviewRow label="Name" value={`${userInfo.firstName} ${userInfo.lastName}`} onEdit={() => onEdit(2, 1)} />
          <ReviewRow label="Email" value={userInfo.email} onEdit={() => onEdit(2, 2)} />
          <ReviewRow
            label="Address"
            value={
              userInfo.addressType === 'full'
                ? [userInfo.street, userInfo.city, userInfo.stateRegion, userInfo.postalCode, userInfo.country].filter(Boolean).join(', ')
                : userInfo.addressType === 'homeless'
                ? `Homeless: ${userInfo.homelessDescription}`
                : 'Prefer not to share'
            }
            onEdit={() => onEdit(2, 3)}
          />
          <ReviewRow
            label="Giver Type"
            value={
              { individual: 'Individual', company: 'Company', foundation: 'Foundation', government: 'Government Entity', '': '' }[userInfo.giverType]
            }
            onEdit={() => onEdit(2, 4)}
          />
        </div>

        {/* AZ Tax Credit */}
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">
              AZ Tax Credit
            </h3>
            <button onClick={() => onEdit(4)} className="text-xs text-accent hover:text-accentHover">
              Edit
            </button>
          </div>
          <ReviewRow
            label="Files AZ Tax"
            value={azTaxCredit.filesAZTax === null ? '' : azTaxCredit.filesAZTax ? 'Yes' : 'No'}
            onEdit={() => onEdit(4)}
          />
          {azTaxCredit.filesAZTax && (
            <>
              <ReviewRow
                label="Will Use Credit"
                value={azTaxCredit.willUseCredit === null ? '' : azTaxCredit.willUseCredit ? 'Yes' : 'No'}
                onEdit={() => onEdit(4)}
              />
              {azTaxCredit.willUseCredit && (
                <ReviewRow
                  label="Carry-Forward Reminders"
                  value={azTaxCredit.wantsCarryForward === null ? '' : azTaxCredit.wantsCarryForward ? 'Yes' : 'No'}
                  onEdit={() => onEdit(4)}
                />
              )}
            </>
          )}
        </div>

        {/* UBI Pledge */}
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">
              UBI Pledge
            </h3>
            <button onClick={() => onEdit(3)} className="text-xs text-accent hover:text-accentHover">
              Edit
            </button>
          </div>
          <ReviewRow
            label="Impact Zone"
            value={ubiPledge.impactZone === 'arizona' ? 'Arizona Statewide' : ubiPledge.impactZone === 'america' ? 'United States' : ubiPledge.impactZone === 'earth' ? 'Earth (Global)' : ubiPledge.customImpactZone || ''}
            onEdit={() => onEdit(3)}
          />
          <ReviewRow label="Pledges" value={pledgeSummary} onEdit={() => onEdit(3)} />
          <ReviewRow
            label="Homelessness Priority"
            value={ubiPledge.homelessnessPriority === null ? '' : ubiPledge.homelessnessPriority ? 'Yes' : 'No'}
            onEdit={() => onEdit(3)}
          />
        </div>

        {/* Foundation Fund & Comingle */}
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">
              Community Programs
            </h3>
          </div>
          <ReviewRow
            label="Foundation Fund"
            value={foundationFund.opinion === 'good' ? "Good idea, I'd join" : foundationFund.opinion === 'terrible' ? 'Terrible idea' : ''}
            onEdit={() => onEdit(5)}
          />
          <ReviewRow
            label="Comingle"
            value={comingle.opinion === 'good' ? "Good idea, I'd join" : comingle.opinion === 'terrible' ? 'Terrible idea' : ''}
            onEdit={() => onEdit(6)}
          />
        </div>

        {/* Commitment Summary */}
        {ubiPledge.pledges.length > 0 && (
          <div className="card border-accent/30 bg-accentDim/10">
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Your Impact Summary
            </h3>
            {ubiPledge.pledges.map((p: PledgeItem) => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <p className="text-sm text-textPrimary">{pledgeSummary}</p>
                <p className="text-xs text-textSecondary capitalize ml-2">{p.cadence}</p>
              </div>
            ))}
            <div className="bg-surface rounded-xl p-3 text-center mt-3">
              <p className="text-2xl font-bold text-textPrimary">
                {ubiPledge.impactZone === 'arizona' ? 'Arizona Statewide' : ubiPledge.impactZone === 'america' ? 'United States' : ubiPledge.impactZone === 'earth' ? 'Earth (Global)' : ubiPledge.customImpactZone}
              </p>
              <p className="text-xs text-textSecondary mt-1">Impact Zone</p>
            </div>
            {azTaxCredit.willUseCredit && (
              <div className="mt-3 bg-surface rounded-xl p-3 text-center">
                <p className="text-sm font-semibold text-accent">
                  AZ Tax Credit Active, up to $987 back
                </p>
                <p className="text-xs text-textSecondary mt-0.5">
                  Next due date: April 15, 2026 (for 2025 contributions)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* GiveButter */}
      <GiveButterSection />

      {/* AI Chat */}
      <AIChatSection />

      {/* Reset */}
      <div className="mt-6 pt-4 border-t border-border text-center">
        <button
          onClick={onReset}
          className="text-xs text-textMuted hover:text-danger transition-colors"
        >
          Reset all data and start over
        </button>
      </div>
    </div>
  );
};

// ─── Pre-activation Review ────────────────────────────────────────────────────

const PreActivationReview: React.FC<{
  state: AppState;
  onActivate: () => void;
  onEdit: (step: number, subStep?: number) => void;
}> = ({ state, onActivate, onEdit }) => {
  const { userInfo, azTaxCredit, ubiPledge } = state;

  const pledgeSummaryShort = ubiPledge.pledges.length
    ? ubiPledge.pledges.map((p: PledgeItem) => {
        switch (p.pledgeType) {
          case 'income_based': return `${p.incomePercent || '?'}% income`;
          case 'wealth_based': return `${p.wealthPercent || '?'}% wealth`;
          case 'vehicle': return [p.vehicleYear, p.vehicleMake, p.vehicleModel].filter(Boolean).join(' ') || 'Vehicle';
          case 'real_estate': return 'Real estate';
          case 'crypto': return 'Crypto';
          default: return 'Gift';
        }
      }).join(' + ')
    : '';

  return (
    <div className="px-4 py-2">
      <h2 className="text-2xl font-bold text-textPrimary mb-1">Review & Activate</h2>
      <p className="text-textSecondary text-sm mb-6">
        Everything look right? You can edit any section before activating.
      </p>

      <div className="space-y-3 mb-6">
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">Personal</h3>
            <button onClick={() => onEdit(2, 1)} className="text-xs text-accent">Edit</button>
          </div>
          <ReviewRow label="Name" value={`${userInfo.firstName} ${userInfo.lastName}`} onEdit={() => onEdit(2, 1)} />
          <ReviewRow label="Email" value={userInfo.email} onEdit={() => onEdit(2, 2)} />
          <ReviewRow
            label="Giver Type"
            value={{ individual: 'Individual', company: 'Company', foundation: 'Foundation', government: 'Government Entity', '': '' }[userInfo.giverType]}
            onEdit={() => onEdit(2, 4)}
          />
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">AZ Tax Credit</h3>
            <button onClick={() => onEdit(4)} className="text-xs text-accent">Edit</button>
          </div>
          <ReviewRow
            label="Status"
            value={
              azTaxCredit.filesAZTax
                ? azTaxCredit.willUseCredit
                  ? 'Using QCO Credit ✓'
                  : 'AZ taxpayer, not using credit'
                : 'Not an AZ taxpayer'
            }
            onEdit={() => onEdit(4)}
          />
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">UBI Pledge</h3>
            <button onClick={() => onEdit(3)} className="text-xs text-accent">Edit</button>
          </div>
          <ReviewRow label="Pledges" value={pledgeSummaryShort} onEdit={() => onEdit(3)} />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onActivate}
        className="w-full py-5 rounded-2xl bg-accent hover:bg-accentHover text-white font-bold text-xl transition-all duration-200 shadow-lg shadow-accent/20"
      >
        🌿 Activate My Profile
      </motion.button>
      <p className="text-center text-xs text-textSecondary mt-3">
        By activating, you agree to our mission of distributing abundance.
      </p>
    </div>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────

export const Step7Review: React.FC<Step7Props> = ({
  state,
  onActivate,
  onSetPublic,
  onEdit,
  onReset,
  onNavigate,
}) => {
  return (
    <StepWrapper stepKey={`step7-${state.activated}`}>
      {state.activated ? (
        <Dashboard
          state={state}
          onEdit={onEdit}
          onSetPublic={onSetPublic}
          onReset={onReset}
          onNavigate={onNavigate}
        />
      ) : (
        <PreActivationReview
          state={state}
          onActivate={onActivate}
          onEdit={onEdit}
        />
      )}
    </StepWrapper>
  );
};
