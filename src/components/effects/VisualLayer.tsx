import { useEffect, useState } from 'react';
import GradientOrbs from './GradientOrbs';
import FilmGrain from './FilmGrain';
import MatrixRain from './MatrixRain';

interface Props {
  dark?: boolean;
  showMatrix?: boolean;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

/** Shared ambient visual stack — lighter in light mode, respects reduced motion */
export default function VisualLayer({ dark = false, showMatrix = true }: Props) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return null;
  }

  return (
    <>
      {dark ? (
        <>
          {showMatrix && <MatrixRain dark={dark} zIndex={0} opacity={0.045} />}
          <FilmGrain opacity={0.04} />
        </>
      ) : (
        <GradientOrbs dark={dark} zIndex={0} />
      )}
    </>
  );
}
