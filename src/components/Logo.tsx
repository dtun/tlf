import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const dims = { sm: 40, md: 64, lg: 96 };
  const d = dims[size];

  return (
    <img
      src="/tlf-logo-300.png"
      width={d}
      height={d}
      alt="The Logical Foundation logo"
      className={`rounded-full ${className}`}
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
};
