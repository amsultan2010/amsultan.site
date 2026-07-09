'use client';

import { useEffect } from 'react';
import { initVoltageMotion } from '@/lib/voltage-motion';

export function VoltageExperience({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // touch-ready is set by the beforeInteractive boot gate on phones
    if (!document.documentElement.classList.contains('touch-ready')) {
      document.documentElement.classList.add('is-scroll-blocked');
    }
    initVoltageMotion();
  }, []);

  return <>{children}</>;
}
