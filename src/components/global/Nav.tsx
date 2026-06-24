import { useState, useRef, useEffect, type ReactNode } from 'react';
import AbdullahAsciiLogo from '../desktop/AbdullahAsciiLogo';

interface NavProps {
  currentPath: string;
}

interface MenuBlockProps {
  trigger: string | ReactNode;
  triggerHref: string;
  items: Array<{
    label: string;
    href: string;
    sublabel?: string;
    divider?: boolean;
  }>;
  isOpen: boolean;
  onToggle: () => void;
}

function MenuBlock({ trigger, triggerHref, items, isOpen, onToggle }: MenuBlockProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if ((isOpen || isHovered) && menuRef.current) {
      const firstItem = menuRef.current.querySelector('a') as HTMLElement;
      firstItem?.focus();
    }
  }, [isOpen, isHovered]);

  useEffect(() => {
    if ((isOpen || isHovered) && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom,
        left: rect.left
      });
    }
  }, [isOpen, isHovered]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen && !isHovered) return;

    const menuItems = menuRef.current?.querySelectorAll('a') as NodeListOf<HTMLElement>;
    const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        menuItems[nextIndex]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        menuItems[prevIndex]?.focus();
        break;
      case 'Escape':
        event.preventDefault();
        onToggle();
        setIsHovered(false);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        (document.activeElement as HTMLElement)?.click();
        break;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const shouldShowMenu = isOpen || isHovered;

  return (
    <div 
      className="relative flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        ref={triggerRef}
        href={triggerHref}
        className="text-white hover:text-white/80 transition-colors text-sm font-normal px-0 whitespace-nowrap"
        onKeyDown={handleKeyDown}
        aria-expanded={shouldShowMenu}
        aria-haspopup="true"
      >
        {trigger}
      </a>
      
      {shouldShowMenu && (
        <>
          {/* Mobile: Fixed positioning */}
          <div
            ref={menuRef}
            className="md:hidden fixed backdrop-blur-xl bg-slate-900/50 border border-white/10 shadow-2xl min-w-48 z-[100]"
            style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
            onKeyDown={handleKeyDown}
            role="menu"
          >
            {items.map((item, index) => (
              <div key={index}>
                {item.divider && <div className="border-t border-white/10 my-1" />}
                <a
                  href={item.href}
                  className="block px-4 py-2 text-sm text-white hover:bg-slate-700/50 transition-colors focus:bg-slate-700/50 focus:outline-none"
                  role="menuitem"
                  tabIndex={-1}
                >
                  <div className="flex flex-col">
                    <span className="font-normal">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-xs text-white/90 mt-0.5">{item.sublabel}</span>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
          {/* Desktop: Absolute positioning */}
          <div
            className="hidden md:block absolute top-full left-0 mt-0 backdrop-blur-xl bg-slate-900/50 border border-white/10 shadow-2xl min-w-48 z-[100]"
            onKeyDown={handleKeyDown}
            role="menu"
          >
            {items.map((item, index) => (
              <div key={index}>
                {item.divider && <div className="border-t border-white/10 my-1" />}
                <a
                  href={item.href}
                  className="block px-4 py-2 text-sm text-white hover:bg-slate-700/50 transition-colors focus:bg-slate-700/50 focus:outline-none"
                  role="menuitem"
                  tabIndex={-1}
                >
                  <div className="flex flex-col">
                    <span className="font-normal">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-xs text-white/90 mt-0.5">{item.sublabel}</span>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Nav({ currentPath }: NavProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleMenuToggle = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Menu block configurations
  const educationItems = [
    { label: 'american international school in riyadh', href: '/portfolio', sublabel: '2025-present' },
    { label: 'the pingry school', href: '/portfolio', sublabel: '2021-2025' },
  ];

  const projectItems = [
    { label: 'abdullahOS', href: '/desktop', sublabel: 'featured project' },
    { label: 'tutoringbyabdullah', href: 'https://tutoringbyabdullah.xyz', sublabel: 'education product' },
    { label: 'quantbacktesterpy', href: '/projects', sublabel: 'python backtester' },
    { label: 'all projects', href: '/projects', sublabel: 'view all projects', divider: true },
  ];

  return (
    <nav 
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 h-6 backdrop-blur-xl bg-slate-900/50 border-b border-white/5"
    >
      <div className="flex items-center h-full px-4 space-x-6 overflow-x-auto md:overflow-x-visible scrollbar-hide">
        {/* Logo + Name Block */}
        <a 
          href="/" 
          className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors text-sm font-semibold flex-shrink-0"
        >
          <div className="h-6 w-6">
            <AbdullahAsciiLogo width={24} height={24} color="#fff" opacity={0.95} />
          </div>
          <span className="whitespace-nowrap hidden md:inline">abdullah sultan</span>
          <span className="whitespace-nowrap md:hidden">abdullah</span>
        </a>

        {/* Education Block */}
        <MenuBlock
          trigger="education"
          triggerHref="/portfolio"
          items={educationItems}
          isOpen={openMenu === 'education'}
          onToggle={() => handleMenuToggle('education')}
        />

        {/* Projects Block */}
        <MenuBlock
          trigger="Projects"
          triggerHref="/projects"
          items={projectItems}
          isOpen={openMenu === 'projects'}
          onToggle={() => handleMenuToggle('projects')}
        />

        {/* Simple Link Blocks */}
        <a href="/contact" className="text-white hover:text-white/80 transition-colors text-sm font-normal whitespace-nowrap flex-shrink-0">
          Contact
        </a>
        
        <a 
          href="/resume.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-white/80 transition-colors text-sm font-normal whitespace-nowrap flex-shrink-0"
        >
          Résumé
        </a>
      </div>
    </nav>
  );
}
