import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { auth as authApi } from '../lib/api';

interface HeaderProps {
  activated?: boolean;
  onSignOut?: () => void;
  onNavigate?: (page: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ activated, onSignOut, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    authApi.logout();
    onSignOut?.();
  };

  const nav = (page: number) => {
    setMenuOpen(false);
    onNavigate?.(page);
  };

  return (
    <header className="w-full flex flex-col items-center pt-8 pb-4 px-4 relative">
      <Logo size="lg" />
      <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-textPrimary tracking-tight">
        The Logical Foundation
      </h1>
      <p className="mt-1 text-textSecondary text-xs sm:text-sm text-center">
        Distribute Prosperity with Universal Basic Income.
      </p>

      {/* Nav row */}
      <div className="flex items-center gap-1 mt-3 flex-wrap justify-center">
        {/* Programs dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="text-xs text-textMuted hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-surfaceHigh"
          >
            Programs {menuOpen ? '▲' : '▼'}
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-1 w-52 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <button onClick={() => nav(91)} className="w-full text-left px-4 py-3 text-sm text-textSecondary hover:bg-surfaceHigh hover:text-textPrimary transition-colors flex items-center gap-2">
                  <span>🤝</span> UBI Giving Pledge
                </button>
                <button onClick={() => nav(92)} className="w-full text-left px-4 py-3 text-sm text-textSecondary hover:bg-surfaceHigh hover:text-textPrimary transition-colors flex items-center gap-2">
                  <span>🌵</span> AZ Tax Credit
                </button>
                <button onClick={() => nav(93)} className="w-full text-left px-4 py-3 text-sm text-textSecondary hover:bg-surfaceHigh hover:text-textPrimary transition-colors flex items-center gap-2">
                  <span>🔄</span> Comingle <span className="ml-auto text-xs text-textMuted">Soon</span>
                </button>
                <button onClick={() => nav(94)} className="w-full text-left px-4 py-3 text-sm text-textSecondary hover:bg-surfaceHigh hover:text-textPrimary transition-colors flex items-center gap-2">
                  <span>🏛️</span> Foundation Fund <span className="ml-auto text-xs text-textMuted">Soon</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-border text-xs">|</span>

        <button onClick={() => nav(90)} className="text-xs text-textMuted hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-surfaceHigh">
          About Us
        </button>

        <button onClick={() => nav(99)} className="text-xs text-textMuted hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-surfaceHigh">
          Board of Directors
        </button>

        {activated && onSignOut && (
          <>
            <span className="text-border text-xs">|</span>
            <button onClick={handleSignOut} className="text-xs text-textMuted hover:text-danger transition-colors px-2 py-1 rounded-lg hover:bg-surfaceHigh">
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Close menu on outside click */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
};
