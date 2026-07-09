export function SiteHeader() {
  return (
    <header className="site-head">
      <a href="/#top" className="site-head__brand vf-mono js-magnetic">
        abdullah sultan
      </a>
      <nav className="site-head__nav vf-mono" aria-label="primary">
        <a href="/#about" data-section="about" className="js-nav-link js-scramble">
          about
        </a>
        <a href="/#work" data-section="work" className="js-nav-link js-scramble">
          work
        </a>
        <a href="/#proof" data-section="proof" className="js-nav-link js-scramble">
          proof
        </a>
        <a href="/#contact" data-section="contact" className="js-nav-link js-scramble">
          contact
        </a>
      </nav>
      <button type="button" className="site-head__contrast js-contrast vf-mono" aria-label="toggle contrast">
        contrast
      </button>
    </header>
  );
}
