import { useState, useRef, useEffect, useCallback } from 'react';
import type { ProjectDetail, DetailContent } from './DetailPanel';

interface ProjectsProps {
  onCardClick?: (detail: DetailContent) => void;
  windowMode?: boolean;
}

interface FileTab {
  projectIdx: number;
  fileName: string;  // "README.md", "requirements.txt", etc.
  content: string | null;
  loading: boolean;
}

// Vibrant tech tag color palette for VS Code style
const techColors: Record<string, { bg: string; text: string; border: string }> = {
  'Python':      { bg: 'rgba(78, 154, 66, 0.15)',  text: '#6ab04c', border: 'rgba(78, 154, 66, 0.3)' },
  'PyTorch':     { bg: 'rgba(238, 76, 44, 0.14)',  text: '#ee4c2c', border: 'rgba(238, 76, 44, 0.28)' },
  'Hugging Face': { bg: 'rgba(255, 213, 79, 0.14)', text: '#ffd54f', border: 'rgba(255, 213, 79, 0.28)' },
  'FastAPI':     { bg: 'rgba(0, 150, 136, 0.14)',   text: '#009688', border: 'rgba(0, 150, 136, 0.28)' },
  'TypeScript':  { bg: 'rgba(49, 120, 198, 0.15)',  text: '#4daafc', border: 'rgba(49, 120, 198, 0.3)' },
  'JavaScript':  { bg: 'rgba(247, 223, 30, 0.14)',  text: '#f0db4f', border: 'rgba(247, 223, 30, 0.28)' },
  'React':       { bg: 'rgba(97, 218, 251, 0.12)',  text: '#61dafb', border: 'rgba(97, 218, 251, 0.25)' },
  'Next.js':     { bg: 'rgba(255, 255, 255, 0.08)', text: '#e0e0e0', border: 'rgba(255, 255, 255, 0.18)' },
  'Node.js':     { bg: 'rgba(104, 159, 56, 0.14)',  text: '#8bc34a', border: 'rgba(104, 159, 56, 0.28)' },
  'AWS':         { bg: 'rgba(255, 153, 0, 0.14)',   text: '#ff9900', border: 'rgba(255, 153, 0, 0.28)' },
  'Docker':      { bg: 'rgba(36, 150, 237, 0.14)',  text: '#2496ed', border: 'rgba(36, 150, 237, 0.28)' },
  'PostgreSQL':  { bg: 'rgba(51, 103, 145, 0.15)',  text: '#6296b4', border: 'rgba(51, 103, 145, 0.3)' },
  'Redis':       { bg: 'rgba(220, 50, 47, 0.14)',   text: '#dc382f', border: 'rgba(220, 50, 47, 0.28)' },
  'GraphQL':     { bg: 'rgba(229, 53, 171, 0.14)',  text: '#e535ab', border: 'rgba(229, 53, 171, 0.28)' },
  'Terraform':   { bg: 'rgba(98, 75, 210, 0.14)',   text: '#7b61ff', border: 'rgba(98, 75, 210, 0.28)' },
  'Go':          { bg: 'rgba(0, 173, 216, 0.14)',   text: '#00add8', border: 'rgba(0, 173, 216, 0.28)' },
  'Rust':        { bg: 'rgba(222, 165, 132, 0.14)', text: '#dea584', border: 'rgba(222, 165, 132, 0.28)' },
  'SQL':         { bg: 'rgba(0, 114, 198, 0.14)',   text: '#4daafc', border: 'rgba(0, 114, 198, 0.28)' },
  'MongoDB':     { bg: 'rgba(77, 179, 61, 0.14)',   text: '#4db33d', border: 'rgba(77, 179, 61, 0.28)' },
  'Tailwind CSS': { bg: 'rgba(56, 189, 248, 0.12)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.25)' },
  'Swift':       { bg: 'rgba(240, 81, 56, 0.14)',   text: '#f05138', border: 'rgba(240, 81, 56, 0.28)' },
  'Kotlin':      { bg: 'rgba(127, 82, 255, 0.14)',  text: '#7f52ff', border: 'rgba(127, 82, 255, 0.28)' },
  'C++':         { bg: 'rgba(0, 89, 156, 0.15)',    text: '#659ad2', border: 'rgba(0, 89, 156, 0.3)' },
  'Figma':       { bg: 'rgba(162, 89, 255, 0.14)',  text: '#a259ff', border: 'rgba(162, 89, 255, 0.28)' },
  'Stripe':      { bg: 'rgba(99, 91, 255, 0.14)',   text: '#635bff', border: 'rgba(99, 91, 255, 0.28)' },
  'AI Placeholder':      { bg: 'rgba(116, 170, 156, 0.14)', text: '#74aa9c', border: 'rgba(116, 170, 156, 0.28)' },
  'Astro':       { bg: 'rgba(255, 93, 1, 0.14)',    text: '#ff5d01', border: 'rgba(255, 93, 1, 0.28)' },
  'Vercel':      { bg: 'rgba(255, 255, 255, 0.08)', text: '#e0e0e0', border: 'rgba(255, 255, 255, 0.18)' },
  'GitHub Actions': { bg: 'rgba(36, 150, 237, 0.14)', text: '#2496ed', border: 'rgba(36, 150, 237, 0.28)' },
  'Grafana':     { bg: 'rgba(240, 134, 31, 0.14)',  text: '#f0861f', border: 'rgba(240, 134, 31, 0.28)' },
  'Datadog':     { bg: 'rgba(99, 44, 166, 0.14)',   text: '#b17fd6', border: 'rgba(99, 44, 166, 0.28)' },
  'LaunchDarkly': { bg: 'rgba(60, 60, 60, 0.2)',    text: '#a0a0a0', border: 'rgba(160, 160, 160, 0.2)' },
  'Local Store':    { bg: 'rgba(62, 207, 142, 0.14)',  text: '#3ecf8e', border: 'rgba(62, 207, 142, 0.28)' },
  'Firebase':    { bg: 'rgba(255, 196, 0, 0.14)',   text: '#ffc400', border: 'rgba(255, 196, 0, 0.28)' },
  'Selenium':    { bg: 'rgba(67, 176, 42, 0.14)',   text: '#43b02a', border: 'rgba(67, 176, 42, 0.28)' },
  'NumPy':       { bg: 'rgba(77, 119, 207, 0.14)',  text: '#4d77cf', border: 'rgba(77, 119, 207, 0.28)' },
  'Pandas':      { bg: 'rgba(21, 2, 101, 0.2)',     text: '#a0a0e0', border: 'rgba(160, 160, 224, 0.25)' },
  'scikit-learn': { bg: 'rgba(249, 130, 57, 0.14)', text: '#f98239', border: 'rgba(249, 130, 57, 0.28)' },
};

// Rotating bright fallback palette for unknown techs
const fallbackColors = [
  { bg: 'rgba(255, 107, 107, 0.14)', text: '#ff6b6b', border: 'rgba(255, 107, 107, 0.28)' },
  { bg: 'rgba(78, 205, 196, 0.14)',  text: '#4ecdc4', border: 'rgba(78, 205, 196, 0.28)' },
  { bg: 'rgba(255, 230, 109, 0.14)', text: '#ffe66d', border: 'rgba(255, 230, 109, 0.28)' },
  { bg: 'rgba(168, 130, 255, 0.14)', text: '#a882ff', border: 'rgba(168, 130, 255, 0.28)' },
  { bg: 'rgba(255, 159, 67, 0.14)',  text: '#ff9f43', border: 'rgba(255, 159, 67, 0.28)' },
  { bg: 'rgba(0, 210, 211, 0.14)',   text: '#00d2d3', border: 'rgba(0, 210, 211, 0.28)' },
];

function getTechColor(tech: string): { bg: string; text: string; border: string } {
  // Direct match
  if (techColors[tech]) return techColors[tech];
  // Partial match (e.g. "AWS (S3, DynamoDB, Lambda, CloudWatch)" → "AWS")
  const key = Object.keys(techColors).find(k => tech.toLowerCase().includes(k.toLowerCase()));
  if (key) return techColors[key];
  // Fallback: deterministic color based on string hash
  let hash = 0;
  for (let i = 0; i < tech.length; i++) hash = ((hash << 5) - hash + tech.charCodeAt(i)) | 0;
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

const projects = [
  {
    id: 0,
    title: "the lab",
    description: "interactive playground — ascii instrument, chronograph, terminal easter egg.",
    gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
    coverImage: "/readme/portfolio-desktop.jpg",
    repoUrl: "/lab",
    language: "TypeScript",
    files: ["README.md", "projects.md", "startup.md", "robotics.md", "education.md", "links.md"],
      detail: {
        type: 'project' as const,
        id: 0,
        title: "the lab",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/readme/portfolio-desktop.jpg",
        liveUrl: "/lab",
        architecture: "expressive playground extracted from the old desktop shell — ascii instrument, chronograph, and a real tiny terminal.",
        technicalChallenges: [
          "webgl ascii instrument with reduced-motion fallback",
          "keeping personality without macos chrome",
          "static site with interactive toys"
        ],
        lessonsLearned: [
          "authorship beats assembly",
          "one signature moment lands harder than ten effects"
        ],
        techStack: ["Astro","React","Three.js"],
        repoUrl: "/lab",
        sections: [
          { title: "projects", content: "the lab, tutoringbyabdullah, downforce blog, and quant tools." },
          { title: "startup", content: "long-term direction: build useful vertical products from ais-r." },
          { title: "robotics", content: "automation, sensors, prototypes, and creative engineering experiments." },
          { title: "education", content: "tutoringbyabdullah plus school activity around teaching, clubs, and technical self-study." },
          { title: "links", content: "github, youtube music, gmail, linkedin, and the lab." }
        ]
      } satisfies ProjectDetail
  },
  {
    id: 1,
    title: "tutoringbyabdullah",
    description: "tutoring platform focused on teaching style, recommendations, and real understanding.",
    gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
    coverImage: "/images/projects/tutoringpreview.png",
    repoUrl: "https://tutoringbyabdullah.xyz",
    language: "Product",
    files: ["README.md", "education.md", "product.md", "links.md"],
      detail: {
        type: 'project' as const,
        id: 1,
        title: "tutoringbyabdullah",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/images/projects/tutoringpreview.png",
        liveUrl: "https://tutoringbyabdullah.xyz",
        architecture: "a tutoring platform focused on teaching style, recommendations, and helping students actually understand concepts instead of memorizing steps.",
        technicalChallenges: [
          "clear service flow",
          "education-focused copy",
          "fast static site delivery"
        ],
        lessonsLearned: [
          "education products need clarity first",
          "good tutoring starts with diagnosis"
        ],
        techStack: ["Education","Website","Product"],
        repoUrl: "https://tutoringbyabdullah.xyz",
        sections: [
          { title: "education", content: "designed around understanding concepts, not memorizing steps." },
          { title: "product", content: "a simple education product surface for tutoring, recommendations, and student intake." },
          { title: "links", content: "live site: tutoringbyabdullah.xyz." }
        ]
      } satisfies ProjectDetail
  },
  {
    id: 2,
    title: "the downforce blog",
    description: "automated f1 sports blog. race analysis, actual opinions, no corporate hedging.",
    gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
    coverImage: "/images/projects/downforceblog.png",
    repoUrl: "https://thedownforceblog.vercel.app",
    language: "Automation",
    files: ["README.md", "about.md", "links.md"],
      detail: {
        type: 'project' as const,
        id: 2,
        title: "the downforce blog",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/images/projects/downforceblog.png",
        liveUrl: "https://thedownforceblog.vercel.app",
        architecture: "online automated formula one sports blog with weekly articles. race analysis, driver standings, strategy breakdowns, and actual opinions. no corporate hedging.",
        technicalChallenges: [
          "automated article generation pipeline",
          "weekly publishing cadence",
          "f1 data sourcing and analysis"
        ],
        lessonsLearned: [
          "automation works best with strong editorial constraints",
          "sports blogs live or die by timing and tone"
        ],
        techStack: ["Automation","F1","Blog"],
        repoUrl: "https://thedownforceblog.vercel.app",
        sections: [
          { title: "about", content: "automated f1 blog covering race analysis, driver standings, and strategy calls every week." },
          { title: "links", content: "live site: thedownforceblog.vercel.app." }
        ]
      } satisfies ProjectDetail
  },
  {
    id: 3,
    title: "quantbacktesterpy",
    description: "single-stock sma crossover backtester w/ parameter heatmaps.",
    gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
    coverImage: "/images/projects/quantbacktesterpy.png",
    repoUrl: "https://github.com/amsultan2010",
    language: "Python",
    files: ["README.md", "technical.md", "proof.md"],
      detail: {
        type: 'project' as const,
        id: 2,
        title: "quantbacktesterpy",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/images/projects/quantbacktesterpy.png",
        architecture: "a single-stock sma crossover backtester w/ parameter heatmaps for testing trading strategies and visualizing behavior.",
        technicalChallenges: [
          "parameter sweeps",
          "return + drawdown plots",
          "strategy behavior visualization"
        ],
        lessonsLearned: [
          "visual checks catch fragile strategies",
          "backtests need assumptions in the open"
        ],
        techStack: ["Python","Pandas","Matplotlib"],
        liveUrl: "https://quantbacktesterpy.vercel.app",
        repoUrl: "https://github.com/amsultan2010",
        sections: [
          { title: "technical", content: "python backtest pipeline w/ sma crossover rules, parameter sweeps, and heatmap output." },
          { title: "proof", content: "quant tooling is useful proof of technical depth, not the whole identity." }
        ]
      } satisfies ProjectDetail
  },
  {
    id: 4,
    title: "quantportfoliopy",
    description: "multi-asset risk parity portfolio backtester.",
    gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
    coverImage: "/images/projects/quantportfoliopy.png",
    repoUrl: "https://github.com/amsultan2010",
    language: "Python",
    files: ["README.md", "technical.md", "proof.md"],
      detail: {
        type: 'project' as const,
        id: 4,
        title: "quantportfoliopy",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/images/projects/quantportfoliopy.png",
        architecture: "a multi-asset risk parity portfolio backtester focused on allocation, volatility, and portfolio construction.",
        technicalChallenges: [
          "risk contribution math",
          "portfolio rebalancing",
          "volatility-aware allocation"
        ],
        lessonsLearned: [
          "portfolio behavior matters more than one clean metric",
          "allocation logic needs readable outputs"
        ],
        techStack: ["Python","Finance","Research"],
        liveUrl: "https://quantportfoliopy.vercel.app",
        repoUrl: "https://github.com/amsultan2010",
        sections: [
          { title: "technical", content: "multi-asset backtester w/ risk parity allocation and portfolio-level outputs." },
          { title: "proof", content: "portfolio construction is mostly about disciplined assumptions." }
        ]
      } satisfies ProjectDetail
  },
  {
    id: 5,
    title: "quantoptionspy",
    description: "black-scholes + monte carlo options pricer w/ greeks.",
    gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
    coverImage: "/images/projects/quantoptionspy.png",
    repoUrl: "https://github.com/amsultan2010",
    language: "Python",
    files: ["README.md", "technical.md", "proof.md"],
      detail: {
        type: 'project' as const,
        id: 5,
        title: "quantoptionspy",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/images/projects/quantoptionspy.png",
        architecture: "a black-scholes + monte carlo options pricer w/ greeks and exotic derivative support.",
        technicalChallenges: [
          "pricing model comparison",
          "greeks calculation",
          "monte carlo simulation"
        ],
        lessonsLearned: [
          "pricing code needs traceable assumptions",
          "numerical methods are easier to trust when visualized"
        ],
        techStack: ["Python","Options","Monte Carlo"],
        liveUrl: "https://quantoptionspy.vercel.app",
        repoUrl: "https://github.com/amsultan2010",
        sections: [
          { title: "technical", content: "options pricing toolkit w/ black-scholes, monte carlo, greeks, and exotic payoff support." },
          { title: "proof", content: "model outputs are only useful when their assumptions are visible." }
        ]
      } satisfies ProjectDetail
  }
];
// File icon by extension/name
function getFileIcon(name: string): { icon: string; color: string } {
  if (name === 'README.md') return { icon: 'M', color: '#519aba' };
  if (name.endsWith('.md')) return { icon: 'M', color: '#519aba' };
  if (name.endsWith('.py')) return { icon: 'Py', color: '#3572A5' };
  if (name.endsWith('.js')) return { icon: 'JS', color: '#f1e05a' };
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return { icon: 'TS', color: '#3178c6' };
  if (name.endsWith('.json')) return { icon: '{ }', color: '#cbcb41' };
  if (name.endsWith('.txt')) return { icon: 'T', color: '#8a8a8a' };
  if (name.endsWith('.html')) return { icon: '<>', color: '#e34c26' };
  if (name.endsWith('/')) return { icon: '📁', color: '' };
  return { icon: '·', color: '#8a8a8a' };
}

// Check if a file name corresponds to a project section
function getSectionContent(projDetail: ProjectDetail, fileName: string): string | null {
  if (!projDetail.sections || fileName === 'README.md') return null;
  const sectionTitle = fileName.replace(/\.md$/, '').toLowerCase();
  const section = projDetail.sections.find(s => s.title.toLowerCase() === sectionTitle);
  return section ? section.content : null;
}

// Get the section title (original casing) from a file name
function getSectionTitle(projDetail: ProjectDetail, fileName: string): string | null {
  if (!projDetail.sections || fileName === 'README.md') return null;
  const sectionTitle = fileName.replace(/\.md$/, '').toLowerCase();
  const section = projDetail.sections.find(s => s.title.toLowerCase() === sectionTitle);
  return section ? section.title : null;
}

function getLocalFileContent(project: typeof projects[number], fileName: string): string {
  const sectionContent = getSectionContent(project.detail, fileName);
  if (sectionContent !== null) return sectionContent;

  return `# ${project.title}

${project.description}

## Status

active static portfolio entry.

## Stack

${project.detail.techStack.map(tech => `- ${tech}`).join('\n')}
`;
}

// Render markdown-like content with bold, paragraphs, and lists
function renderMarkdownContent(content: string) {
  const paragraphs = content.split('\n\n');
  return paragraphs.map((para, pi) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // Check if this is a list (lines starting with -)
    const lines = trimmed.split('\n');
    const isList = lines.every(l => l.trim().startsWith('- ') || l.trim() === '');
    if (isList) {
      return (
        <ul key={pi} style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
          {lines.filter(l => l.trim().startsWith('- ')).map((line, li) => (
            <li key={li} style={{ marginBottom: '4px' }}>{renderInlineMarkdown(line.trim().slice(2))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={pi} style={{ margin: '0 0 16px' }}>
        {renderInlineMarkdown(trimmed.replace(/\n/g, ' '))}
      </p>
    );
  });
}

// Render inline markdown (bold text with **)
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#e6e6e6', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function getLangColor(lang: string): string {
  if (lang === 'Python') return '#3572A5';
  if (lang === 'JavaScript') return '#f1e05a';
  if (lang === 'TypeScript') return '#3178c6';
  return '#8a8a8a';
}

const Projects = ({ onCardClick, windowMode }: ProjectsProps) => {
  const [selectedProject, setSelectedProject] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({ 0: true });
  const [fileTabs, setFileTabs] = useState<FileTab[]>([{ projectIdx: 0, fileName: 'README.md', content: null, loading: false }]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(120);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const [sidebarWidth] = useState(220);
  const editorRef = useRef<HTMLDivElement>(null);

  const activeTab = fileTabs[activeTabIdx] || fileTabs[0];

  // Open a file tab
  const openFile = useCallback((projIdx: number, fileName: string) => {
    // Check if tab already exists
    const existingIdx = fileTabs.findIndex(t => t.projectIdx === projIdx && t.fileName === fileName);
    if (existingIdx >= 0) {
      setActiveTabIdx(existingIdx);
      setSelectedProject(projIdx);
      return;
    }

    // Check if this is a section file (non-README .md file matching a section title)
    const sectionContent = getSectionContent(projects[projIdx].detail, fileName);
    if (sectionContent !== null) {
      const newTab: FileTab = { projectIdx: projIdx, fileName, content: sectionContent, loading: false };
      const newTabs = [...fileTabs, newTab];
      const newIdx = newTabs.length - 1;
      setFileTabs(newTabs);
      setActiveTabIdx(newIdx);
      setSelectedProject(projIdx);
      return;
    }

    // Create new tab with local static content
    const newTab: FileTab = { projectIdx: projIdx, fileName, content: getLocalFileContent(projects[projIdx], fileName), loading: false };
    const newTabs = [...fileTabs, newTab];
    const newIdx = newTabs.length - 1;
    setFileTabs(newTabs);
    setActiveTabIdx(newIdx);
    setSelectedProject(projIdx);
  }, [fileTabs]);

  // Select project (opens README tab)
  const selectProject = (idx: number) => {
    setSelectedProject(idx);
    // Check if a README tab for this project exists
    const readmeIdx = fileTabs.findIndex(t => t.projectIdx === idx && t.fileName === 'README.md');
    if (readmeIdx >= 0) {
      setActiveTabIdx(readmeIdx);
    } else {
      openFile(idx, 'README.md');
    }
  };

  const closeTab = (tabIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = fileTabs.filter((_, i) => i !== tabIdx);
    setFileTabs(newTabs);
    if (activeTabIdx === tabIdx) {
      const newActive = Math.min(tabIdx, newTabs.length - 1);
      setActiveTabIdx(Math.max(0, newActive));
      if (newTabs[newActive]) setSelectedProject(newTabs[newActive].projectIdx);
    } else if (activeTabIdx > tabIdx) {
      setActiveTabIdx(activeTabIdx - 1);
    }
  };

  const project = projects[selectedProject];
  const detail = project.detail;

  // Auto-fetch content for the active tab if it hasn't been loaded yet
  useEffect(() => {
    const tab = fileTabs[activeTabIdx];
    if (!tab || tab.content !== null || tab.loading) return;

    // Section files should already have content set — don't fetch from GitHub
    const sectionContent = getSectionContent(projects[tab.projectIdx].detail, tab.fileName);
    if (sectionContent !== null) {
      setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: sectionContent, loading: false } : t));
      return;
    }

    setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: getLocalFileContent(projects[tab.projectIdx], tab.fileName), loading: false } : t));
  }, [activeTabIdx, fileTabs.length]);

  // Scroll editor to top when switching tabs
  useEffect(() => {
    editorRef.current?.scrollTo(0, 0);
  }, [activeTabIdx]);

  return (
    <div className="vsc-root" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: "'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace",
      fontSize: '13px',
      color: '#cccccc',
      background: '#1e1e1e',
      overflow: 'hidden',
    }}>
      {/* Main area: activity bar + sidebar + editor */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Activity Bar ── */}
        <div style={{
          width: '48px',
          minWidth: '48px',
          background: '#333333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '4px',
          gap: '2px',
          borderRight: '1px solid #252526',
        }}>
          <ActivityIcon active label="Explorer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7V5a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="6" />
              <line x1="14.5" y1="14.5" x2="20" y2="20" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Source Control">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="18" cy="10" r="2.5" />
              <circle cx="6" cy="18" r="2.5" />
              <path d="M6 8.5v7M8.5 6h5.5a2 2 0 012 2v2" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Extensions">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
          </ActivityIcon>

          <div style={{ flex: 1 }} />

          <ActivityIcon label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </ActivityIcon>
        </div>

        {/* ── Explorer Sidebar ── */}
        <div style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          background: '#252526',
          borderRight: '1px solid #1e1e1e',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: '10px 16px 8px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#bbbbbb',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          }}>
            explorer
          </div>

          {/* File tree */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
            {projects.map((proj, idx) => {
              const isExpanded = expandedFolders[idx] || false;
              const folderSlug = proj.title.toUpperCase().replace(/\s+/g, '-');
              return (
                <div key={proj.id}>
                  {/* Folder row */}
                  <div
                    onClick={() => {
                      if (selectedProject === idx && expandedFolders[idx]) {
                        // Already selected + expanded: just collapse
                        setExpandedFolders(prev => ({ ...prev, [idx]: false }));
                      } else {
                        // Select + expand
                        setExpandedFolders(prev => ({ ...prev, [idx]: true }));
                        selectProject(idx);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px 3px 12px',
                      cursor: 'pointer',
                      background: selectedProject === idx ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: '#cccccc',
                      fontSize: '13px',
                      userSelect: 'none',
                    }}
                    className="vsc-tree-item"
                  >
                    <span style={{
                      fontSize: '10px',
                      width: '14px',
                      textAlign: 'center',
                      color: '#888',
                      transition: 'transform 0.15s',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>▶</span>
                    <span style={{ fontSize: '14px' }}>📁</span>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '12px',
                      letterSpacing: '0.04em',
                    }}>{folderSlug}</span>
                  </div>

                  {/* Files */}
                  {isExpanded && proj.files.map((file, fi) => {
                    const { icon, color } = getFileIcon(file);
                    const isDir = file.endsWith('/');
                    const isReadme = file === 'README.md';
                    const isActiveFile = activeTab?.projectIdx === idx && activeTab?.fileName === file;

                    const isSectionFile = file.endsWith('.md') && file !== 'README.md' && getSectionContent(proj.detail, file) !== null;

                    const handleFileClick = () => {
                      if (isDir) return;
                      if (isSectionFile) {
                        // Section .md files scroll to that section within the README view
                        // First, make sure the README tab is active for this project
                        const readmeIdx = fileTabs.findIndex(t => t.projectIdx === idx && t.fileName === 'README.md');
                        if (readmeIdx >= 0) {
                          setActiveTabIdx(readmeIdx);
                          setSelectedProject(idx);
                        } else {
                          openFile(idx, 'README.md');
                        }
                        // Scroll to the section heading after a short delay to allow tab switch
                        const sectionTitle = getSectionTitle(proj.detail, file);
                        if (sectionTitle) {
                          const sectionId = `section-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`;
                          setTimeout(() => {
                            const el = document.getElementById(sectionId);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 50);
                        }
                      } else if (isReadme) {
                        // README opens as a tab
                        openFile(idx, file);
                      } else {
                        // All other files open the GitHub repo directly
                        window.open(proj.repoUrl, '_blank');
                      }
                    };

                    return (
                      <div
                        key={fi}
                        onClick={handleFileClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px 2px 38px',
                          cursor: isDir ? 'default' : 'pointer',
                          color: isDir ? '#888' : '#cccccc',
                          fontSize: '13px',
                          userSelect: 'none',
                          background: isActiveFile ? 'rgba(255,255,255,0.08)' : 'transparent',
                        }}
                        className="vsc-tree-item"
                      >
                        {isDir ? (
                          <span style={{ fontSize: '10px', width: '14px', textAlign: 'center', color: '#666' }}>▶</span>
                        ) : (
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            width: '14px',
                            textAlign: 'center',
                            color: color,
                          }}>{icon}</span>
                        )}
                        <span>{file}</span>
                        {!isDir && !isReadme && !isSectionFile && (
                          <span style={{ fontSize: '10px', color: '#555', marginLeft: 'auto' }}>↗</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Editor + Terminal ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Tab bar */}
          <div className="vsc-tab-bar" style={{
            display: 'flex',
            alignItems: 'stretch',
            height: '35px',
            background: '#252526',
            borderBottom: '1px solid #1e1e1e',
            overflow: 'hidden',
          }}>
            {fileTabs.map((tab, tabIdx) => {
              const p = projects[tab.projectIdx];
              const isActive = tabIdx === activeTabIdx;
              const { icon, color } = getFileIcon(tab.fileName);
              return (
                <div
                  key={`${tab.projectIdx}-${tab.fileName}`}
                  onClick={() => { setActiveTabIdx(tabIdx); setSelectedProject(tab.projectIdx); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: isActive ? '#1e1e1e' : '#2d2d2d',
                    borderRight: '1px solid #1e1e1e',
                    position: 'relative',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                  }}
                  className={`vsc-tab ${isActive ? 'vsc-tab-active' : 'vsc-tab-inactive'}`}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color }}>{icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.fileName}</span>
                  <span style={{ fontSize: '10px', color: '#666', marginLeft: '2px' }}>— {p.title}</span>
                  <span
                    onClick={(e) => closeTab(tabIdx, e)}
                    style={{
                      marginLeft: '6px',
                      fontSize: '14px',
                      lineHeight: 1,
                      color: '#666',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '3px',
                    }}
                    className="vsc-tab-close"
                  >×</span>
                  {isActive && <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: '#007acc',
                  }} />}
                </div>
              );
            })}
            <div style={{ flex: 1, background: '#252526' }} />
          </div>

          {/* Breadcrumb */}
          <div style={{
            padding: '4px 16px',
            fontSize: '12px',
            color: '#888',
            background: '#1e1e1e',
            borderBottom: '1px solid #252526',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span>{project.title.toUpperCase().replace(/\s+/g, '-')}</span>
            <span style={{ color: '#555' }}>/</span>
            <span style={{ color: '#cccccc' }}>{activeTab?.fileName || 'README.md'}</span>
          </div>

          {/* Editor content */}
          <div
            ref={editorRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              background: '#1e1e1e',
              padding: '20px 32px 32px',
              minHeight: 0,
            }}
          >
            {/* README.md — always show the rich project view with demos & details */}
            {activeTab?.fileName === 'README.md' ? (
              <div className="vsc-readme">
                  <>
                    {detail.demoVideo && (
                      <div key={detail.demoVideo} style={{
                        width: '100%', borderRadius: '8px', overflow: 'hidden',
                        marginBottom: '24px', background: '#000', border: '1px solid #333',
                      }}>
                        <video autoPlay loop muted playsInline style={{ width: '100%', display: 'block', borderRadius: '8px' }}>
                          <source src={detail.demoVideo} type="video/mp4" />
                          <source src={detail.demoVideo} type="video/quicktime" />
                        </video>
                      </div>
                    )}
                    {!detail.demoVideo && detail.coverImage && (
                      <div style={{
                        width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden',
                        marginBottom: '24px', background: detail.gradient,
                      }}>
                        <img src={detail.coverImage} alt={detail.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                      </div>
                    )}
                    <h1 style={{
                      fontSize: '26px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px',
                      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      {detail.title}
                      {detail.repoUrl && (
                        <a href={detail.repoUrl} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: '13px', fontWeight: 400, color: '#4daafc', textDecoration: 'none', fontFamily: "'SF Mono', monospace" }}>
                          ↗ GitHub
                        </a>
                      )}
                    </h1>
                    <p style={{ color: '#c8c8c8', fontSize: '14px', lineHeight: 1.7, margin: '0 0 20px', fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                      {detail.techStack.map((tech, i) => {
                        const tc = getTechColor(tech);
                        return (
                          <span key={i} style={{
                            padding: '3px 10px', fontSize: '11px', fontWeight: 500, borderRadius: '4px',
                            background: tc.bg, color: tc.text,
                            border: `1px solid ${tc.border}`, fontFamily: "'SF Mono', monospace",
                          }}>{tech}</span>
                        );
                      })}
                    </div>
                    {detail.architecture && (
                      <>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: "-apple-system, sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#4daafc' }}>#</span> Architecture
                        </h2>
                        <p style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', fontFamily: "-apple-system, sans-serif" }}>
                          {detail.architecture}
                        </p>
                      </>
                    )}
                    {detail.technicalChallenges?.length > 0 && (
                      <>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: "-apple-system, sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#f1b73a' }}>#</span> Technical Challenges
                        </h2>
                        <ul style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', paddingLeft: '20px', fontFamily: "-apple-system, sans-serif" }}>
                          {detail.technicalChallenges.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                        </ul>
                      </>
                    )}
                    {detail.lessonsLearned?.length > 0 && (
                      <>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: "-apple-system, sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#4ec9b0' }}>#</span> Lessons Learned
                        </h2>
                        <ul style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', paddingLeft: '20px', fontFamily: "-apple-system, sans-serif" }}>
                          {detail.lessonsLearned.map((l, i) => <li key={i} style={{ marginBottom: '4px' }}>{l}</li>)}
                        </ul>
                      </>
                    )}
                    {/* Sections */}
                    {detail.sections?.map((section, si) => (
                      <div key={si} id={`section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: "-apple-system, sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: ['#4daafc', '#f1b73a', '#4ec9b0', '#c586c0', '#ce9178'][si % 5] }}>#</span> {section.title}
                        </h2>
                        <div style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', fontFamily: "-apple-system, sans-serif" }}>
                          {renderMarkdownContent(section.content)}
                        </div>
                      </div>
                    ))}
                  </>
              </div>
            ) : activeTab?.fileName?.endsWith('.md') && activeTab.fileName !== 'README.md' && getSectionContent(detail, activeTab.fileName) !== null ? (
              /* Section .md file — rich rendered view */
              <div className="vsc-readme">
                <h1 style={{
                  fontSize: '24px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 6px',
                  fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ color: '#4daafc' }}>#</span> {activeTab.fileName.replace(/\.md$/, '')}
                </h1>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 20px', fontFamily: "-apple-system, sans-serif" }}>
                  {detail.title} / {activeTab.fileName}
                </p>
                <div style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, fontFamily: "-apple-system, sans-serif" }}>
                  {renderMarkdownContent(activeTab.content || '')}
                </div>
              </div>
            ) : (
              /* Non-README file: show as code/text */
              <div>
                {activeTab?.loading ? (
                  <div style={{ color: '#666', fontSize: '13px', padding: '20px 0' }}>
                    Loading {activeTab.fileName}...
                  </div>
                ) : (
                  <pre style={{
                    color: '#d4d4d4',
                    fontSize: '13px',
                    lineHeight: 1.65,
                    fontFamily: "'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Menlo', monospace",
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                    padding: 0,
                  }}>
                    {activeTab?.content?.split('\n').map((line, i) => (
                      <div key={i} style={{ display: 'flex', minHeight: '20px' }}>
                        <span style={{
                          width: '48px',
                          minWidth: '48px',
                          textAlign: 'right',
                          paddingRight: '16px',
                          color: '#545454',
                          userSelect: 'none',
                          fontSize: '12px',
                        }}>{i + 1}</span>
                        <span style={{ flex: 1 }}>{colorizeCode(line, activeTab?.fileName || '')}</span>
                      </div>
                    ))}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* ── Terminal Panel (draggable) ── */}
          {terminalOpen && (
            <div style={{
              height: `${terminalHeight}px`,
              minHeight: '28px',
              maxHeight: '300px',
              borderTop: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              background: '#1e1e1e',
              transition: isDragging ? 'none' : 'height 0.15s ease',
            }}>
              {/* Drag handle */}
              <div
                style={{
                  height: '4px',
                  cursor: 'ns-resize',
                  background: isDragging ? 'rgba(0, 122, 204, 0.5)' : 'transparent',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                  dragStartY.current = e.clientY;
                  dragStartHeight.current = terminalHeight;
                  const onMove = (ev: MouseEvent) => {
                    const delta = dragStartY.current - ev.clientY;
                    const newH = Math.max(28, Math.min(300, dragStartHeight.current + delta));
                    if (newH <= 32) {
                      setTerminalOpen(false);
                      setIsDragging(false);
                      document.removeEventListener('mousemove', onMove);
                      document.removeEventListener('mouseup', onUp);
                      return;
                    }
                    setTerminalHeight(newH);
                  };
                  const onUp = () => {
                    setIsDragging(false);
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                  };
                  document.addEventListener('mousemove', onMove);
                  document.addEventListener('mouseup', onUp);
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0, 122, 204, 0.3)'; }}
                onMouseLeave={(e) => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              />
              {/* Terminal tabs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                height: '28px',
                minHeight: '28px',
                background: '#252526',
                borderBottom: '1px solid #333',
                gap: '16px',
              }}>
                <span style={{ fontSize: '11px', color: '#cccccc', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Terminal</span>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Problems</span>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Output</span>
                <div style={{ flex: 1 }} />
                <span
                  onClick={() => setTerminalOpen(false)}
                  style={{ color: '#666', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                  title="Close terminal"
                >×</span>
              </div>

              {/* Terminal content */}
              {terminalHeight > 40 && (
                <div style={{
                  flex: 1,
                  padding: '6px 14px',
                  fontSize: '12px',
                  lineHeight: 1.7,
                  overflowY: 'auto',
                  color: '#cccccc',
                }}>
                  <div>
                    <span style={{ color: '#4ec9b0' }}>abdullah@MacBookPro</span>
                    <span style={{ color: '#666' }}>:</span>
                    <span style={{ color: '#569cd6' }}>~/{project.title.toLowerCase().replace(/\s+/g, '-')}</span>
                    <span style={{ color: '#666' }}> $ </span>
                    <span style={{ color: '#cccccc' }}>git log --oneline -3</span>
                  </div>
                  <div style={{ color: '#ce9178' }}>
                    <span style={{ color: '#f1b73a' }}>a3f2e1d</span> feat: initial project setup
                  </div>
                  <div style={{ color: '#ce9178' }}>
                    <span style={{ color: '#f1b73a' }}>b7c4a2e</span> docs: add README
                  </div>
                  <div style={{ color: '#ce9178' }}>
                    <span style={{ color: '#f1b73a' }}>c8d5b3f</span> chore: configure build pipeline
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={{
        height: '22px',
        minHeight: '22px',
        background: '#007acc',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        gap: '14px',
        fontSize: '11.5px',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" opacity="0.9">
            <path d="M13.5 3.5L8 1 2.5 3.5v4c0 3.5 2.5 6.5 5.5 7.5 3-1 5.5-4 5.5-7.5v-4z" fillRule="evenodd" />
          </svg>
          main
        </span>
        <span>○ 0 △ 0</span>
        {!terminalOpen && (
          <span
            onClick={() => { setTerminalOpen(true); setTerminalHeight(120); }}
            style={{ cursor: 'pointer', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Open terminal"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Terminal
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span>Ln 1, Col 1</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getLangColor(project.language),
          }} />
          {project.language}
        </span>
      </div>

      <style>{`
        .vsc-root ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .vsc-root ::-webkit-scrollbar-track {
          background: transparent;
        }
        .vsc-root ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 0;
        }
        .vsc-root ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        .vsc-tree-item:hover {
          background: rgba(255,255,255,0.05) !important;
        }
        .vsc-tab-active {
          color: #ffffff;
          transition: color 0.15s ease;
        }
        .vsc-tab-inactive {
          color: #969696;
          transition: color 0.15s ease;
        }
        /* When hovering any tab, that tab glows white */
        .vsc-tab:hover {
          color: #ffffff !important;
        }
        /* When hovering over the tab bar, fade the active tab... */
        .vsc-tab-bar:hover .vsc-tab-active {
          color: #969696 !important;
        }
        /* ...unless the active tab itself is being hovered */
        .vsc-tab-bar:hover .vsc-tab-active:hover {
          color: #ffffff !important;
        }
        .vsc-tab:hover .vsc-tab-close {
          color: #ccc !important;
        }
        .vsc-tab-close:hover {
          background: rgba(255,255,255,0.1) !important;
          color: #fff !important;
        }
        .vsc-readme h2 {
          border-bottom: 1px solid #333;
          padding-bottom: 6px;
        }
      `}</style>
    </div>
  );
};

// ── Simple Markdown Renderer for README files ──

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';

  const renderInline = (text: string): React.ReactNode => {
    // Bold
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.*?)\*\*|`(.*?)`|\[(.*?)\]\((.*?)\)/g;
    let lastIdx = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
      if (match[1]) parts.push(<strong key={key++} style={{ color: '#e6e6e6', fontWeight: 600 }}>{match[1]}</strong>);
      if (match[2]) parts.push(<code key={key++} style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px', fontSize: '12px', color: '#ce9178' }}>{match[2]}</code>);
      if (match[3] && match[4]) parts.push(<a key={key++} href={match[4]} target="_blank" rel="noopener noreferrer" style={{ color: '#4daafc', textDecoration: 'none' }}>{match[3]}</a>);
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) parts.push(text.slice(lastIdx));
    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} style={{
            background: '#0d1117',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '12px 16px',
            margin: '8px 0 16px',
            fontSize: '12px',
            lineHeight: 1.6,
            overflowX: 'auto',
            color: '#d4d4d4',
          }}>
            {codeLines.join('\n')}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: '24px', fontWeight: 600, color: '#e6e6e6', margin: '24px 0 8px', fontFamily: "-apple-system, sans-serif", borderBottom: '1px solid #333', paddingBottom: '8px' }}>{renderInline(line.slice(2))}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: '20px', fontWeight: 600, color: '#e6e6e6', margin: '20px 0 8px', fontFamily: "-apple-system, sans-serif", borderBottom: '1px solid #333', paddingBottom: '6px' }}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: '16px', fontWeight: 600, color: '#e6e6e6', margin: '16px 0 6px', fontFamily: "-apple-system, sans-serif" }}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<div key={i} style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: 1.7, paddingLeft: '20px', margin: '2px 0', fontFamily: "-apple-system, sans-serif" }}>• {renderInline(line.slice(2))}</div>);
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s/)?.[1];
      elements.push(<div key={i} style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: 1.7, paddingLeft: '20px', margin: '2px 0', fontFamily: "-apple-system, sans-serif" }}>{num}. {renderInline(line.replace(/^\d+\.\s/, ''))}</div>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '8px' }} />);
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={i} style={{ borderLeft: '3px solid #4daafc', paddingLeft: '12px', margin: '8px 0', color: '#a0a0a0', fontStyle: 'italic', fontSize: '13px' }}>{renderInline(line.slice(2))}</blockquote>);
    } else if (line.startsWith('![')) {
      // Image — skip rendering inside markdown preview
      const alt = line.match(/!\[(.*?)\]/)?.[1] || 'image';
      elements.push(<div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid #333', margin: '8px 0', color: '#666', fontSize: '12px', textAlign: 'center' }}>📷 {alt}</div>);
    } else {
      elements.push(<p key={i} style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: 1.7, margin: '4px 0', fontFamily: "-apple-system, sans-serif" }}>{renderInline(line)}</p>);
    }
  }

  return <div className="vsc-readme">{elements}</div>;
}

// ── Simple syntax coloring for code files ──

function colorizeCode(line: string, fileName: string): React.ReactNode {
  // Python files
  if (fileName.endsWith('.py') || fileName.endsWith('.txt')) {
    return line
      .replace(/^(import |from |class |def |return |if |else|elif |for |while |try|except|with |as |in |not |and |or |raise |yield |async |await )/g, '___KW___$1')
      .split('___KW___')
      .map((part, i) => {
        if (/^(import |from |class |def |return |if |else|elif |for |while |try|except|with |as |in |not |and |or |raise |yield |async |await )/.test(part)) {
          return <span key={i} style={{ color: '#c586c0' }}>{part}</span>;
        }
        return part;
      });
  }
  // For other files just return plain text
  return line;
}

// ── Activity Bar Icon ──

function ActivityIcon({ children, active, label }: { children: React.ReactNode; active?: boolean; label: string }) {
  return (
    <div
      title={label}
      style={{
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: active ? '#ffffff' : '#858585',
        position: 'relative',
        transition: 'color 0.15s',
      }}
    >
      {children}
      {active && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '24px',
          background: '#ffffff',
          borderRadius: '0 1px 1px 0',
        }} />
      )}
    </div>
  );
}

export default Projects;
