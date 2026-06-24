// Shared tag color map for consistent styling across Blog, CaseStudies, and ContentViewer

export interface TagColor {
  bg: string;
  text: string;
  border: string;
}

const tagColorMap: Record<string, TagColor> = {
  'Learning': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  'AI': { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA', border: 'rgba(139, 92, 246, 0.3)' },
  'Systems': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
  'Career': { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' },
  'Finance': { bg: 'rgba(234, 179, 8, 0.15)', text: '#FDE047', border: 'rgba(234, 179, 8, 0.3)' },
  'Python': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  'Markets': { bg: 'rgba(20, 184, 166, 0.15)', text: '#2DD4BF', border: 'rgba(20, 184, 166, 0.3)' },
  'Enterprise': { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  'Behavioral Economics': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'Research': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
  'Psychology': { bg: 'rgba(236, 72, 153, 0.15)', text: '#F472B6', border: 'rgba(236, 72, 153, 0.3)' },
  'SaaS': { bg: 'rgba(6, 182, 212, 0.15)', text: '#22D3EE', border: 'rgba(6, 182, 212, 0.3)' },
  'Architecture': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
  'Microservices': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.3)' },
  'Cloud': { bg: 'rgba(14, 165, 233, 0.15)', text: '#38BDF8', border: 'rgba(14, 165, 233, 0.3)' },
  'Scale': { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' },
  'Organization': { bg: 'rgba(236, 72, 153, 0.15)', text: '#F472B6', border: 'rgba(236, 72, 153, 0.3)' },
  'Agile': { bg: 'rgba(132, 204, 22, 0.15)', text: '#A3E635', border: 'rgba(132, 204, 22, 0.3)' },
  'Culture': { bg: 'rgba(244, 63, 94, 0.15)', text: '#FB7185', border: 'rgba(244, 63, 94, 0.3)' },
  'Distributed Systems': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
  'Agents': { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA', border: 'rgba(139, 92, 246, 0.3)' },
  'Personal': { bg: 'rgba(244, 63, 94, 0.15)', text: '#FB7185', border: 'rgba(244, 63, 94, 0.3)' },
  'Productivity': { bg: 'rgba(132, 204, 22, 0.15)', text: '#A3E635', border: 'rgba(132, 204, 22, 0.3)' },
  'Startups': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'Exploration': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'Curiosity': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'YC': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'Product Development': { bg: 'rgba(236, 72, 153, 0.15)', text: '#F472B6', border: 'rgba(236, 72, 153, 0.3)' },
  // Experience skills
  'System Design': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
  'Observability': { bg: 'rgba(14, 165, 233, 0.15)', text: '#38BDF8', border: 'rgba(14, 165, 233, 0.3)' },
  'Event-Driven Architecture': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.3)' },
  'Technical Writing': { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' },
  'On-Call Practices': { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  'CI/CD Design': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
  'Feature Flags': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'Release Engineering': { bg: 'rgba(20, 184, 166, 0.15)', text: '#2DD4BF', border: 'rgba(20, 184, 166, 0.3)' },
  'Data Contracts': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  'Enterprise Workflows': { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  // Experience tech stack
  'AWS (S3, DynamoDB, Lambda, CloudWatch)': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'Terraform': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
  'GitHub Actions': { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA', border: 'rgba(139, 92, 246, 0.3)' },
  'Datadog': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.3)' },
  'SQL': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  'Grafana': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'Docker': { bg: 'rgba(14, 165, 233, 0.15)', text: '#38BDF8', border: 'rgba(14, 165, 233, 0.3)' },
  'LaunchDarkly': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
  // Growth Team
  'Growth Engineering': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
  'Experimentation': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'Product Analytics': { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' },
  'TypeScript': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  'React': { bg: 'rgba(6, 182, 212, 0.15)', text: '#22D3EE', border: 'rgba(6, 182, 212, 0.3)' },
  'FastAPI': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
  // Project tech stack
  'PyTorch': { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  'Hugging Face': { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' },
  'NumPy': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  'Pandas': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.3)' },
  'WebSocket': { bg: 'rgba(20, 184, 166, 0.15)', text: '#2DD4BF', border: 'rgba(20, 184, 166, 0.3)' },
  'SQLAlchemy': { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  'SQLite': { bg: 'rgba(14, 165, 233, 0.15)', text: '#38BDF8', border: 'rgba(14, 165, 233, 0.3)' },
  'RapidAPI': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
  'HTML/CSS/JS': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'GPT-4 API': { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA', border: 'rgba(139, 92, 246, 0.3)' },
  'TF-IDF': { bg: 'rgba(132, 204, 22, 0.15)', text: '#A3E635', border: 'rgba(132, 204, 22, 0.3)' },
  'BM25': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
  'Vite': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.3)' },
  'JavaScript': { bg: 'rgba(234, 179, 8, 0.15)', text: '#FDE047', border: 'rgba(234, 179, 8, 0.3)' },
  'Wikipedia API': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  'CSS Animations': { bg: 'rgba(244, 63, 94, 0.15)', text: '#FB7185', border: 'rgba(244, 63, 94, 0.3)' },
};

const defaultColor: TagColor = {
  bg: 'rgba(255, 255, 255, 0.06)',
  text: 'rgba(255, 255, 255, 0.6)',
  border: 'rgba(255, 255, 255, 0.15)'
};

export function getTagColor(tag: string): TagColor {
  return tagColorMap[tag] || defaultColor;
}

// Brand colors for case study companies
export const companyBrands: Record<string, { color: string; bgColor: string }> = {
  'Netflix': { color: '#E50914', bgColor: 'rgba(229, 9, 20, 0.12)' },
  'Uber': { color: '#FFFFFF', bgColor: 'rgba(255, 255, 255, 0.08)' },
  'YouTube Music': { color: '#1DB954', bgColor: 'rgba(29, 185, 84, 0.12)' },
  'NDX': { color: '#4FC3F7', bgColor: 'rgba(79, 195, 247, 0.12)' },
  'IKIGAI': { color: '#FB923C', bgColor: 'rgba(251, 146, 60, 0.12)' },
  'SAP': { color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.12)' },
  'DEEP FOCUS': { color: '#c084fc', bgColor: 'rgba(192, 132, 252, 0.12)' },
};
