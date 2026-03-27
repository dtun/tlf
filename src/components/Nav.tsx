import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { auth as authApi } from '../lib/api';

export interface NavProps {
  activated?: boolean;
  currentStep?: number;
  userRole?: 'user' | 'admin';
  onNavigate: (page: number) => void;
  onSignOut?: () => void;
  onGetStarted?: () => void;
}

interface DropdownItem {
  label: string;
  page: number;
  badge?: string;
  badgePage?: number; // navigate here when badge is clicked
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: DropdownItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'programs',
    label: 'Programs',
    icon: '🤝',
    items: [
      { label: 'UBI Giving Pledge', page: 91 },
      { label: 'AZ Tax Credit', page: 92 },
      { label: 'Comingle', page: 93, badge: 'Soon', badgePage: 101 },
      { label: 'Foundation Fund', page: 94, badge: 'Soon', badgePage: 101 },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    icon: '🔬',
    items: [
      { label: 'Research', page: 95 },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    icon: '🙌',
    items: [
      { label: 'FAQ', page: 106 },
      { label: 'Get Involved', page: 100 },
      { label: 'Volunteer Portal', page: 104 },
      { label: 'Stay Informed', page: 101 },
    ],
  },
  {
    id: 'about',
    label: 'About',
    icon: 'ℹ️',
    items: [
      { label: 'About Us', page: 90 },
      { label: 'Board of Directors', page: 99 },
      { label: 'Financials', page: 105 },
      { label: 'Privacy Policy', page: 102 },
    ],
  },
];

// ── Desktop dropdown ──────────────────────────────────────────────────────────
const DesktopDropdown: React.FC<{
  group: NavGroup;
  onNavigate: (page: number) => void;
}> = ({ group, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          open ? 'text-accent bg-surfaceHigh' : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceHigh'
        }`}
      >
        {group.label}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 w-52 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden py-1"
          >
            {group.items.map(item => (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-textSecondary hover:bg-surfaceHigh hover:text-textPrimary transition-colors flex items-center justify-between"
              >
                {item.label}
                {item.badge && (
                  item.badgePage ? (
                    <span
                      role="button"
                      onClick={e => { e.stopPropagation(); onNavigate(item.badgePage!); setOpen(false); }}
                      className="text-xs text-accent border border-accent/40 rounded-full px-1.5 py-0.5 hover:bg-accent/10 transition-colors"
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <span className="text-xs text-textMuted border border-border rounded-full px-1.5 py-0.5">{item.badge}</span>
                  )
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Mobile bottom tab bar — 4 tabs + hamburger ───────────────────────────────
const MobileNav: React.FC<{
  onNavigate: (page: number) => void;
  onGetStarted?: () => void;
  activated?: boolean;
  userRole?: 'user' | 'admin';
  onSignOut?: () => void;
}> = ({ onNavigate, onGetStarted, activated, userRole, onSignOut }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60" onClick={close} />
        )}
      </AnimatePresence>

      {/* Hamburger drawer — slides up from bottom */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-16 left-0 right-0 z-40 bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[75vh] overflow-y-auto"
          >
            {/* Account row at top of drawer */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              {activated ? (
                <>
                  <button onClick={() => { close(); onNavigate(userRole === 'admin' ? 103 : 7); }}
                    className="flex items-center gap-2 text-textSecondary hover:text-accent transition-colors">
                    <span>{userRole === 'admin' ? '⚙️' : '👤'}</span>
                    <span className="text-sm font-medium">{userRole === 'admin' ? 'Admin Panel' : 'My Dashboard'}</span>
                  </button>
                  <button onClick={() => { close(); authApi.logout(); onSignOut?.(); }}
                    className="text-sm text-textMuted hover:text-danger transition-colors px-3 py-1.5 rounded-lg hover:bg-surfaceHigh">
                    Sign Out
                  </button>
                </>
              ) : (
                <button onClick={() => { close(); onGetStarted?.(); }}
                  className="flex items-center gap-2 text-accent hover:text-accentHover transition-colors">
                  <span>✨</span>
                  <span className="text-sm font-medium">Join / Sign In</span>
                </button>
              )}
            </div>

            {/* All nav items grouped */}
            {NAV_GROUPS.map(group => (
              <div key={group.id}>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">
                    {group.icon} {group.label}
                  </span>
                </div>
                {group.items.map(item => (
                  <button key={item.page} onClick={() => { close(); onNavigate(item.page); }}
                    className="w-full text-left px-6 py-3 text-sm text-textSecondary hover:bg-surfaceHigh hover:text-textPrimary transition-colors flex items-center justify-between">
                    {item.label}
                    {item.badge && (
                      item.badgePage ? (
                        <span
                          role="button"
                          onClick={e => { e.stopPropagation(); close(); onNavigate(item.badgePage!); }}
                          className="text-xs text-accent border border-accent/40 rounded-full px-2 py-0.5 hover:bg-accent/10 transition-colors"
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <span className="text-xs text-textMuted border border-border rounded-full px-2 py-0.5">{item.badge}</span>
                      )
                    )}
                  </button>
                ))}
              </div>
            ))}
            <div className="h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom tab bar — exactly 4 tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex items-stretch h-16">
        {/* Home */}
        <button onClick={() => { close(); onNavigate(1); }}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-textMuted hover:text-textPrimary transition-colors">
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Programs */}
        <button onClick={() => { close(); onNavigate(91); }}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-textMuted hover:text-textPrimary transition-colors">
          <span className="text-lg">🌱</span>
          <span className="text-[10px] font-medium">Programs</span>
        </button>

        {/* Donate */}
        <button onClick={() => { close(); onNavigate(97); }}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-accent hover:text-accentHover transition-colors">
          <span className="text-lg">💚</span>
          <span className="text-[10px] font-semibold">Donate</span>
        </button>

        {/* Hamburger */}
        <button onClick={() => setMenuOpen(v => !v)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${menuOpen ? 'text-accent' : 'text-textMuted hover:text-textPrimary'}`}>
          <span className="text-lg">{menuOpen ? '✕' : '☰'}</span>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </>
  );
};

// ── Main Nav component ────────────────────────────────────────────────────────
export const Nav: React.FC<NavProps> = ({ activated, userRole, onNavigate, onSignOut, onGetStarted }) => {
  const handleSignOut = () => {
    authApi.logout();
    onSignOut?.();
  };

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex w-full items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        {/* Logo + wordmark */}
        <button onClick={() => onNavigate(1)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo size="sm" />
          <div className="text-left">
            <p className="text-sm font-bold text-textPrimary leading-tight">The Logical Foundation</p>
            <p className="text-xs text-textMuted leading-tight">Distribute Prosperity with Universal Basic Income.</p>
          </div>
        </button>

        {/* Nav groups */}
        <div className="flex items-center gap-1">
          {NAV_GROUPS.map(group => (
            <DesktopDropdown key={group.id} group={group} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {activated ? (
            <>
              <button
                onClick={() => onNavigate(userRole === 'admin' ? 103 : 7)}
                className="text-sm text-textSecondary hover:text-textPrimary transition-colors px-3 py-2 rounded-lg hover:bg-surfaceHigh"
              >
                {userRole === 'admin' ? 'Admin Panel' : 'My Dashboard'}
              </button>
              <button onClick={handleSignOut} className="text-sm text-textMuted hover:text-danger transition-colors px-3 py-2 rounded-lg hover:bg-surfaceHigh">
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => onNavigate(0)} className="text-sm text-textSecondary hover:text-textPrimary transition-colors px-3 py-2 rounded-lg hover:bg-surfaceHigh">
              Sign In
            </button>
          )}
          <button
            onClick={() => onNavigate(97)}
            className="btn-primary text-sm px-4 py-2"
          >
            Donate
          </button>
        </div>
      </header>

      {/* Mobile top bar (logo only) */}
      <header className="md:hidden flex w-full items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <button onClick={() => onNavigate(1)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size="sm" />
          <p className="text-sm font-bold text-textPrimary">The Logical Foundation</p>
        </button>
        <button
          onClick={() => onNavigate(97)}
          className="text-xs font-semibold text-accent border border-accent/40 rounded-lg px-3 py-1.5 hover:bg-accentDim/20 transition-colors"
        >
          Donate
        </button>
      </header>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden">
        <MobileNav
          onNavigate={onNavigate}
          onGetStarted={onGetStarted}
          activated={activated}
          userRole={userRole}
          onSignOut={onSignOut}
        />
      </div>
    </>
  );
};
