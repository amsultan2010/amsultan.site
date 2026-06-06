import AmbientCanvas from './AmbientCanvas';
import GradientOrbs from './GradientOrbs';
import FilmGrain from './FilmGrain';
import MatrixRain from './MatrixRain';

interface Props {
  dark?: boolean;
  showMatrix?: boolean;
}

/** Shared ambient visual stack for portfolio pages */
export default function VisualLayer({ dark = false, showMatrix = true }: Props) {
  return (
    <>
      <GradientOrbs dark={dark} zIndex={0} />
      {showMatrix && <MatrixRain dark={dark} zIndex={0} opacity={dark ? 0.05 : 0.035} />}
      <AmbientCanvas dark={dark} zIndex={1} />
      <FilmGrain opacity={dark ? 0.05 : 0.035} />
      <div
        aria-hidden="true"
        className="scan-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${dark ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.015)'} 2px,
            ${dark ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.015)'} 4px
          )`,
        }}
      />
    </>
  );
}
