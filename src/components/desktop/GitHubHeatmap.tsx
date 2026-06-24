export default function GitHubHeatmap() {
  const weeks = Array.from({ length: 26 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const seed = (week * 7 + day) % 11;
      if (seed === 0 || seed === 5) return 4;
      if (seed === 2 || seed === 8) return 2;
      if (seed === 3) return 1;
      return 0;
    })
  );
  const total = weeks.flat().reduce((sum, count) => sum + count, 0);

  const getColor = (count: number) => {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    if (count <= 1) return '#0e4429';
    if (count <= 3) return '#006d32';
    if (count <= 5) return '#26a641';
    return '#39d353';
  };

  if (!weeks.length) return null;
  const cellSize = 7;
  const gap = 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          GITHUB
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          STATIC
        </div>
      </div>
      <div style={{ overflowX: 'auto', overflowY: 'hidden', flex: 1, display: 'flex', alignItems: 'center' }}>
        <svg width={weeks.length * (cellSize + gap)} height={7 * (cellSize + gap)} style={{ display: 'block' }}>
          {weeks.map((week, wi) =>
            week.map((count, di) => (
              <rect
                key={`${wi}-${di}`}
                x={wi * (cellSize + gap)}
                y={di * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={1.5}
                fill={getColor(count)}
              />
            ))
          )}
        </svg>
      </div>
      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>
        <span style={{ color: '#fff' }}>{total} contributions</span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>Simulated activity (demo data)</span>
      </div>
    </div>
  );
}
