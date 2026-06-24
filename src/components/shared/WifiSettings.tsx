import { useState, useCallback } from 'react';

type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

interface SpeedResults {
  ping: number;
  download: number;
  upload: number;
}

function getGaugeColor(ratio: number): string {
  if (ratio < 0.25) return '#ff9500';
  if (ratio < 0.5) return '#007aff';
  return '#34c759';
}

function SpeedGauge({ value, maxValue, label }: { value: number; maxValue: number; label: string }) {
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const sweepFraction = 0.75;
  const arcLength = circumference * sweepFraction;
  const ratio = Math.min(value / maxValue, 1);
  const offset = arcLength - ratio * arcLength;
  const color = getGaugeColor(ratio);

  return (
    <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
      <svg width="200" height="170" viewBox="0 0 200 180">
        <defs>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background arc */}
        <circle cx="100" cy="100" r={radius}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(135 100 100)" />
        {/* Active arc with glow */}
        <circle cx="100" cy="100" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(135 100 100)"
          filter={value > 0 ? 'url(#arcGlow)' : undefined}
          style={{ transition: 'stroke-dashoffset 0.4s ease-out, stroke 0.4s' }} />
        {/* Center text */}
        <text x="100" y="92" textAnchor="middle" fontSize="40" fontWeight="700"
          fill="#fff" fontFamily="SF Pro Display, -apple-system, sans-serif">
          {value > 0 ? value.toFixed(1) : '—'}
        </text>
        <text x="100" y="115" textAnchor="middle" fontSize="14" fontWeight="500" fill="rgba(255,255,255,0.45)"
          fontFamily="SF Pro Text, -apple-system, sans-serif">
          Mbps
        </text>
      </svg>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '-4px', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function ResultCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '14px 8px', borderRadius: '12px',
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{unit}</div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

const LOCATIONS = [
  { city: 'Riyadh', region: 'Saudi Arabia', flag: '🇸🇦' },
  { city: 'Short Hills', region: 'NJ', flag: '🇺🇸' },
  { city: 'Dhahran', region: 'Saudi Arabia', flag: '🇸🇦' },
  { city: 'Manhattan', region: 'NY', flag: '🇺🇸' },
  { city: 'San Francisco', region: 'CA', flag: '🇺🇸' },
];

export default function WifiSettings() {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [results, setResults] = useState<SpeedResults | null>(null);
  const [gaugeValue, setGaugeValue] = useState(0);
  const [gaugeLabel, setGaugeLabel] = useState('Ready to test');
  const [activeLocation, setActiveLocation] = useState(0);

  // Animate gauge smoothly toward target
  const animateGauge = useCallback((target: number, duration: number) => {
    const start = performance.now();
    const startVal = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setGaugeValue(startVal + (target - startVal) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const runSpeedTest = useCallback(async () => {
    setPhase("ping");
    setResults(null);
    setGaugeValue(0);
    setGaugeLabel("Loading static placeholder...");

    await new Promise(r => setTimeout(r, 180));
    setPhase("download");
    animateGauge(120, 450);

    await new Promise(r => setTimeout(r, 450));
    setPhase("upload");
    animateGauge(42, 450);

    await new Promise(r => setTimeout(r, 450));
    setPhase("complete");
    setGaugeValue(120);
    setGaugeLabel("Static placeholder");
    setResults({ ping: 18, download: 120, upload: 42 });
  }, [animateGauge]);


  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload';
  const maxGauge = results ? Math.max(results.download, results.upload, 100) : 200;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'transparent', fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      color: 'rgba(255,255,255,0.85)', overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#007aff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="16" viewBox="0 0 16 14" fill="none">
              <path d="M8 12.5a1 1 0 100-2 1 1 0 000 2z" fill="white" />
              <path d="M5.17 9.17a4 4 0 015.66 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M2.93 6.93a7 7 0 0110.14 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Wi-Fi</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              {LOCATIONS[activeLocation].flag} {LOCATIONS[activeLocation].city}, {LOCATIONS[activeLocation].region}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ width: '38px', height: '22px', borderRadius: '11px', background: '#007aff', position: 'relative' }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                position: 'absolute', top: '2px', right: '2px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>
        </div>

        {/* Known Networks */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Known Networks
          </div>
          {LOCATIONS.map((loc, i) => (
            <button
              key={i}
              onClick={() => setActiveLocation(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: activeLocation === i ? 'rgba(0,122,255,0.18)' : 'transparent',
                transition: 'background 0.15s',
                marginBottom: '2px',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{loc.flag}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{loc.city}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{loc.region}</div>
              </div>
              {activeLocation === i && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Gauge */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <SpeedGauge
          value={gaugeValue}
          maxValue={maxGauge}
          label={gaugeLabel}
        />

        {/* Results cards */}
        {results && (
          <div style={{
            display: 'flex', gap: '10px', width: '100%', maxWidth: '400px', marginTop: '8px',
            opacity: phase === 'complete' ? 1 : 0,
            transform: phase === 'complete' ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s, transform 0.4s',
          }}>
            <ResultCard icon={<DownArrow />} label="Download" value={results.download.toFixed(1)} unit="Mbps" />
            <ResultCard icon={<UpArrow />} label="Upload" value={results.upload.toFixed(1)} unit="Mbps" />
            <ResultCard icon={<PingIcon />} label="Ping" value={String(results.ping)} unit="ms" />
          </div>
        )}

        {/* Button */}
        <button
          onClick={runSpeedTest}
          disabled={isRunning}
          style={{
            marginTop: '24px', padding: '10px 32px', borderRadius: '10px', border: 'none',
            background: isRunning ? 'rgba(0,122,255,0.3)' : '#007aff',
            color: '#fff', fontSize: '15px', fontWeight: 600, cursor: isRunning ? 'default' : 'pointer',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            transition: 'background 0.2s',
            marginBottom: '16px',
          }}
        >
          {phase === 'idle' ? 'Run Speed Test' : phase === 'complete' ? 'Run Again' : 'Testing...'}
        </button>

        {/* Progress phases */}
        {isRunning && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
            <span style={{ color: (phase as string) === 'ping' ? '#007aff' : (phase as string) !== 'idle' ? '#34c759' : undefined }}>
              {(phase as string) === 'ping' ? '● Ping' : '✓ Ping'}
            </span>
            <span style={{ color: (phase as string) === 'download' ? '#007aff' : ((phase as string) === 'upload' || (phase as string) === 'complete') ? '#34c759' : undefined }}>
              {(phase as string) === 'download' ? '● Download' : ((phase as string) === 'upload' || (phase as string) === 'complete') ? '✓ Download' : '○ Download'}
            </span>
            <span style={{ color: (phase as string) === 'upload' ? '#007aff' : (phase as string) === 'complete' ? '#34c759' : undefined }}>
              {(phase as string) === 'upload' ? '● Upload' : (phase as string) === 'complete' ? '✓ Upload' : '○ Upload'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Small SVG icons for result cards
function DownArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v12m0 0l-5-5m5 5l5-5" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20h14" stroke="#007aff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UpArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 20V8m0 0l-5 5m5-5l5 5" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 4h14" stroke="#34c759" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill="#ff9500" />
      <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" stroke="#ff9500" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
