'use client';

import type { ReactNode } from 'react';

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  speed?: 'slow' | 'normal';
};

export function Marquee({ children, className = '', speed = 'normal' }: MarqueeProps) {
  const duration = speed === 'slow' ? '48s' : '32s';

  return (
    <div className={`marquee-root overflow-hidden ${className}`}>
      <div
        className="marquee-track"
        style={{ '--marquee-duration': duration } as React.CSSProperties}
      >
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
