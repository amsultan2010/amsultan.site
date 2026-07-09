const talkTop = ['l', 'e', 't', "'", 's'];
const talkBot = ['t', 'a', 'l', 'k'];

export function Contact() {
  return (
    <section id="contact" className="s-contact" aria-label="contact">
      <div className="s-contact__inner js-contact-inner">
        <div className="s-contact__hover js-contact-hover">
          <a href="mailto:abdullahmsultan1@gmail.com" className="s-contact__go js-contact-go vf-display">
            <span className="s-contact__go-label js-contact-go-label">go</span>
          </a>

          <div className="s-contact__reveal-panel js-contact-panel" aria-hidden="true">
            <div className="s-contact__cta-line s-contact__cta-line--top">
              {talkTop.map((ch) => (
                <span className="s-contact__cta-char" key={`top-${ch}`}>
                  <span className="s-contact__cta-slice">{ch}</span>
                  <span className="s-contact__cta-slice" aria-hidden="true">
                    {ch}
                  </span>
                </span>
              ))}
            </div>
            <div className="s-contact__cta-line s-contact__cta-line--bot">
              {talkBot.map((ch) => (
                <span className="s-contact__cta-char" key={`bot-${ch}`}>
                  <span className="s-contact__cta-slice">{ch}</span>
                  <span className="s-contact__cta-slice" aria-hidden="true">
                    {ch}
                  </span>
                </span>
              ))}
            </div>
            <p className="s-contact__panel-email vf-mono">abdullahmsultan1@gmail.com</p>
            <div className="s-contact__stars" aria-hidden="true">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
          </div>
        </div>

        <h2 className="s-contact__title vf-display">want to talk?</h2>
        <p className="s-contact__email vf-mono">
          <a href="mailto:abdullahmsultan1@gmail.com">abdullahmsultan1@gmail.com</a>
        </p>
        <p className="s-contact__sub vf-serif">email me. coffee chats welcome.</p>
        <div className="s-contact__links vf-mono">
          <a href="https://github.com/amsultan2010" target="_blank" rel="noopener noreferrer" className="js-scramble">
            github
          </a>
          <a
            href="https://www.linkedin.com/in/abdullah-sultan-4a264939a/"
            target="_blank"
            rel="noopener noreferrer"
            className="js-scramble"
          >
            linkedin
          </a>
          <a href="/resume.docx" className="js-scramble">
            resume
          </a>
        </div>
      </div>
    </section>
  );
}
