'use client';

import { useEffect, useRef, useState } from 'react';

// Global tracker for animation timing
let globalAnimationStart: number | null = null;
let animatedDelays = new Set<number>();

export function useFadeInOnScroll(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;

    // On desktop, use simple time-based delay without intersection observer
    if (!isMobile) {
      // Initialize global start time on first element
      if (globalAnimationStart === null) {
        globalAnimationStart = Date.now();
      }

      // Calculate when this element should animate based on global start time
      const targetTime = globalAnimationStart + delay;
      const now = Date.now();
      const remainingDelay = Math.max(0, targetTime - now);

      const timer = setTimeout(() => {
        setIsVisible(true);
        animatedDelays.add(delay);
      }, remainingDelay);

      return () => clearTimeout(timer);
    }

    // On mobile, use intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;

            // Initialize global start time on first element
            if (globalAnimationStart === null) {
              globalAnimationStart = Date.now();
            }

            // Calculate when this element should animate based on global start time
            const targetTime = globalAnimationStart + delay;
            const now = Date.now();
            const remainingDelay = Math.max(0, targetTime - now);

            setTimeout(() => {
              setIsVisible(true);
              animatedDelays.add(delay);
            }, remainingDelay);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  return { elementRef, isVisible };
}
