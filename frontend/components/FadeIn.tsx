'use client';

import { ReactNode } from 'react';
import { useFadeInOnScroll } from '@/hooks/useFadeInOnScroll';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FadeIn({ children, delay = 0, className, style }: FadeInProps) {
  const { elementRef, isVisible } = useFadeInOnScroll(delay);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 600ms ease-out, transform 600ms ease-out',
      }}
    >
      {children}
    </div>
  );
}
