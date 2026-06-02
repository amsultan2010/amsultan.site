import { useEffect, useRef, useState } from 'react';
import { FaRegFolderClosed } from 'react-icons/fa6';

export default function MacTerminal() {
  const welcomeMessage = `Abdullah Sultan — student builder

LinkedIn: music.youtube.com
GitHub: github.com/amsultan2010
Email: abdullahmsultan1@gmail.com
Location: Riyadh, Saudi Arabia


I build systems that think, design that feels, and code that connects ideas to impact.




`;

  const [lines, setLines] = useState<string[]>(() => {
    const initial = welcomeMessage.split('\n');
    return initial;
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // keep scrolled to bottom when new lines added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLines((prev) => [...prev, `> ${trimmed}`]);
    setInput('');

    const lower = trimmed.toLowerCase();
    const response =
      lower === 'help'
        ? 'Static commands: help, about, projects, contact'
        : lower === 'about'
          ? 'Abdullah Sultan — student builder interested in startups, vertical ai, robotics, education, and automation.'
          : lower === 'projects'
            ? 'projects: abdullahOS, tutoringbyabdullah, quantbacktesterpy, quantportfoliopy, quantoptionspy.'
            : lower === 'contact'
              ? 'Email: abdullahmsultan1@gmail.com'
              : 'static abdullahOS terminal. type help for commands.';
    setLines((prev) => [...prev, response]);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className='glass w-[800px] h-[500px] rounded-lg overflow-hidden shadow-lg mx-4 sm:mx-0'>
      <div className='h-6 flex items-center space-x-2 px-4 border-b border-white/10'>
        <div className='w-3 h-3 rounded-full bg-red-500'></div>
        <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
        <div className='w-3 h-3 rounded-full bg-green-500'></div>
        <span className='text-sm text-gray-200 flex-grow text-center font-semibold flex items-center justify-center gap-2'>
          <FaRegFolderClosed size={14} className='text-gray-200' />
          github.com/amsultan2010 — zsh
        </span>
      </div>
      <div className='p-6 text-gray-100 font-mono text-base h-[calc(500px-1.5rem)] flex flex-col'>
        <div className='flex-1 overflow-y-auto' ref={scrollRef}>
          <div className='space-y-1'>
            {lines.map((l, i) => {
              // First line is the name/title - make it bold and larger
              if (i === 0) {
                return (
                  <div key={i} className='text-white font-bold text-xl mb-3'>
                    {l}
                  </div>
                );
              }
              // Second line is empty
              if (i === 1 && l === '') {
                return <div key={i} className='h-2' />;
              }
              // Lines starting with > are user input
              if (l.startsWith('>')) {
                return (
                  <div key={i} className='text-green-400 font-semibold'>
                    {l}
                  </div>
                );
              }
              // Info lines with colored labels (syntax highlighting)
              if (l.startsWith('LinkedIn:')) {
                return (
                  <div key={i} className='text-gray-100'>
                    <span style={{ color: '#c084fc' }}>LinkedIn:</span> {l.substring(9)}
                  </div>
                );
              }
              if (l.startsWith('Location:')) {
                return (
                  <div key={i} className='text-gray-100'>
                    <span style={{ color: '#ff79c6' }}>Location:</span> {l.substring(9)}
                  </div>
                );
              }
              if (l.startsWith('Email:')) {
                return (
                  <div key={i} className='text-gray-100'>
                    <span style={{ color: '#f1fa8c' }}>Email:</span> {l.substring(6)}
                  </div>
                );
              }
              if (l.startsWith('GitHub:')) {
                return (
                  <div key={i} className='text-gray-100'>
                    <span style={{ color: '#8be9fd' }}>GitHub:</span> {l.substring(7)}
                  </div>
                );
              }
              // Blurb line - positioned with spacing
              if (l.includes('I build systems')) {
                return (
                  <div key={i} className='text-gray-100 mt-8'>
                    {l}
                  </div>
                );
              }
              // Regular lines
              return (
                <div key={i} className='text-gray-100'>
                  {l}
                </div>
              );
            })}
          </div>
        </div>

        <div className='mt-4 pt-4 border-t border-white/10'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2'>
            <span className='whitespace-nowrap text-green-400 font-semibold'>abdullah.tech root %</span>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={false}
              className='w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400'
              placeholder='Type a command and press Enter'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
