import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { ThemeProvider, useTheme, themeColors } from '../portfolio/PageShell';
import { SiteHeader, SiteFooter } from '../portfolio/SiteChrome';
import AbdullahAsciiLogo from '../desktop/AbdullahAsciiLogo';
import '../../styles/global.css';

const AsciiDesk = lazy(() => import('../effects/AsciiDesk'));

/* ── Chronograph (extracted DNA from AbdullahOS) ── */
function Chronograph({ size = 200 }: { size?: number }) {
  const { dark } = useTheme();
  const t = themeColors(dark);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const hAngle = hours * 30 + minutes * 0.5;
  const mAngle = minutes * 6;
  const sAngle = seconds * 6;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Chronograph">
      <circle cx={cx} cy={cy} r={r} fill={t.cardBg} stroke={t.border} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r * 0.92} fill="none" stroke={t.accent} strokeWidth={1} opacity={0.5} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = ((i * 30) - 90) * (Math.PI / 180);
        const x1 = cx + Math.cos(a) * r * 0.78;
        const y1 = cy + Math.sin(a) * r * 0.78;
        const x2 = cx + Math.cos(a) * r * 0.88;
        const y2 = cy + Math.sin(a) * r * 0.88;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={t.textMuted} strokeWidth={2} />;
      })}
      <line
        x1={cx} y1={cy}
        x2={cx + Math.sin((hAngle * Math.PI) / 180) * r * 0.45}
        y2={cy - Math.cos((hAngle * Math.PI) / 180) * r * 0.45}
        stroke={t.textStrong} strokeWidth={3} strokeLinecap="round"
      />
      <line
        x1={cx} y1={cy}
        x2={cx + Math.sin((mAngle * Math.PI) / 180) * r * 0.65}
        y2={cy - Math.cos((mAngle * Math.PI) / 180) * r * 0.65}
        stroke={t.textStrong} strokeWidth={2} strokeLinecap="round"
      />
      <line
        x1={cx} y1={cy}
        x2={cx + Math.sin((sAngle * Math.PI) / 180) * r * 0.72}
        y2={cy - Math.cos((sAngle * Math.PI) / 180) * r * 0.72}
        stroke={t.accent} strokeWidth={1.5} strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={4} fill={t.accent} />
    </svg>
  );
}

/* ── Minimal terminal easter egg ── */
const COMMANDS: Record<string, string | (() => string)> = {
  help: 'commands: about, projects, lab, whoami, clear, coffee, ls',
  about: 'student builder in riyadh. shipping tutoring, f1 media, agent tools.',
  projects: 'tutoringbyabdullah · downforce blog · quant suite → /projects',
  lab: 'you are here. ascii instrument · chronograph · this terminal.',
  whoami: 'abdullah sultan',
  ls: 'ascii-desk  chronograph  terminal  resume.docx',
  coffee: 'mailto:abdullahmsultan1@gmail.com — say hi.',
  pwd: '/lab',
  echo: 'signal received.',
};

function LabTerminal() {
  const { dark } = useTheme();
  const t = themeColors(dark);
  const [lines, setLines] = useState<string[]>([
    'abdullah@lab ~ zsh',
    'type help to explore.',
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === 'clear') {
      setLines([]);
      return;
    }
    const entry = COMMANDS[cmd.split(' ')[0]];
    const out = typeof entry === 'function' ? entry() : entry ?? `command not found: ${cmd}`;
    setLines((prev) => [...prev, `> ${raw}`, out]);
  };

  return (
    <div
      role="region"
      aria-label="Lab terminal"
      onClick={() => inputRef.current?.focus()}
      style={{
        background: t.cardBg,
        border: `1px solid ${t.border}`,
        padding: 16,
        minHeight: 240,
        fontFamily: 'var(--td-font-mono)',
        fontSize: 13,
        color: t.text,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'text',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto', maxHeight: 280 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: 4, color: line.startsWith('>') ? t.phosphor : t.text }}>
            {line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
          setInput('');
        }}
        style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: `1px solid ${t.border}`, paddingTop: 12 }}
      >
        <span style={{ color: t.accent }}>›</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Terminal input"
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: t.textStrong,
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
        />
      </form>
    </div>
  );
}

function LabInner() {
  const { dark } = useTheme();
  const t = themeColors(dark);
  const toys = useMemo(
    () => [
      { id: 'ascii', title: 'ASCII instrument', blurb: 'Orbit the desk dial — scroll on the homepage drives it too.' },
      { id: 'chrono', title: 'Chronograph', blurb: 'Live local time. DNA from the old OS terminal hero.' },
      { id: 'term', title: 'Terminal', blurb: 'Tiny CLI easter egg. try help, coffee, projects.' },
    ],
    [],
  );

  useEffect(() => {
    document.documentElement.style.backgroundColor = t.bg;
    document.body.style.backgroundColor = t.bg;
  }, [t.bg]);

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'var(--td-font-body)' }}>
      <SiteHeader />
      <main style={{ padding: '48px var(--td-gutter) 80px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <p className="td-mono" style={{ margin: 0, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.accent }}>
              playground
            </p>
            <h1 className="td-display" style={{ margin: '10px 0 0', fontSize: 'clamp(40px, 8vw, 72px)', color: t.textStrong, textTransform: 'lowercase' }}>
              the lab
            </h1>
            <p style={{ margin: '14px 0 0', maxWidth: 440, color: t.text, lineHeight: 1.55 }}>
              expressive toys without the macOS clone. drag, type, watch the dial.
            </p>
          </div>
          <AbdullahAsciiLogo width={160} height={48} color={t.textStrong} opacity={0.85} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginTop: 48,
          }}
        >
          <section style={{ gridColumn: '1 / -1' }}>
            <h2 className="td-mono" style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 12px' }}>
              {toys[0].title}
            </h2>
            <p style={{ margin: '0 0 16px', color: t.text, fontSize: 14 }}>{toys[0].blurb}</p>
            <div style={{ height: 360, border: `1px solid ${t.border}`, background: t.cardBg }}>
              <Suspense fallback={<div style={{ height: '100%' }} />}>
                <AsciiDesk height="100%" scrollProgress={0.2} />
              </Suspense>
            </div>
          </section>

          <section>
            <h2 className="td-mono" style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 12px' }}>
              {toys[1].title}
            </h2>
            <p style={{ margin: '0 0 16px', color: t.text, fontSize: 14 }}>{toys[1].blurb}</p>
            <div
              style={{
                border: `1px solid ${t.border}`,
                background: t.cardBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 32,
                minHeight: 280,
              }}
            >
              <Chronograph size={220} />
            </div>
          </section>

          <section>
            <h2 className="td-mono" style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 12px' }}>
              {toys[2].title}
            </h2>
            <p style={{ margin: '0 0 16px', color: t.text, fontSize: 14 }}>{toys[2].blurb}</p>
            <LabTerminal />
          </section>
        </div>

        <p className="td-mono" style={{ marginTop: 40, fontSize: 12, color: t.textMuted }}>
          looking for the old desktop? it retired. this is the replacement.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function LabApp() {
  return (
    <ThemeProvider>
      <LabInner />
    </ThemeProvider>
  );
}
