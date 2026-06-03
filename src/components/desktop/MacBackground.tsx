export default function MacBackground({ overlayOpacity = 0.1 }: { overlayOpacity?: number } = {}) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `url(/images/wallpaper/wallpaper.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlay to reduce distraction from terminal */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          background: `rgba(0, 0, 0, ${overlayOpacity})`,
          transition: 'background 0.4s ease',
        }}
      />
    </>
  );
}
