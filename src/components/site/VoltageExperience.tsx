'use client';

import { useEffect } from 'react';
import { initVoltageMotion } from '@/lib/voltage-motion';

export function VoltageExperience({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initVoltageMotion();
  }, []);

  return <>{children}</>;
}
