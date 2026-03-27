import React from 'react';

interface InfoBoxProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning';
}

export const InfoBox: React.FC<InfoBoxProps> = ({ children, variant = 'info' }) => {
  const styles = {
    info: 'bg-blue-950/40 border-blue-700/40 text-blue-200',
    success: 'bg-accentDim/40 border-accent/40 text-green-200',
    warning: 'bg-yellow-950/40 border-yellow-700/40 text-yellow-200',
  };

  return (
    <div className={`rounded-xl border p-4 text-sm leading-relaxed ${styles[variant]}`}>
      {children}
    </div>
  );
};
