export default function MacBackground({ overlayOpacity = 0.1 }: { overlayOpacity?: number } = {}) {
  return (
    <>
      {/* Wallpaper */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none',
          backgroundImage: `url(/images/wallpaper/wallpaper.jpg)`,
          backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlay */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none',
          background: `rgba(0, 0, 0, ${overlayOpacity})`,
          transition: 'background 0.4s ease',
        }}
      />
      {/* Vignette — darkens edges for depth */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)',
        }}
      />
      {/* Subtle grain / noise texture */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none', opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />
    </>
  );
}
