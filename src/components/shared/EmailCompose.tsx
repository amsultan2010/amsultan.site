import { useState, useRef } from 'react';

interface EmailComposeProps {
  windowMode?: boolean;
}

const EmailCompose = ({ windowMode }: EmailComposeProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSending(true);

    // Build mailto link with form fields
    const subjectLine = subject.trim() || `Message from ${name.trim()}`;
    const body = `From: ${name.trim()} (${email.trim()})\n\n${message.trim()}`;
    const mailtoUrl = `mailto:abdullahmsultan1@gmail.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;

    // Open mail client
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 800);
  };

  const canSend = name.trim() && email.trim() && message.trim();

  if (sent) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'rgba(15, 15, 20, 0.72)',
        borderRadius: '0 0 12px 12px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(52, 199, 89, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'sentPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '16px',
          fontWeight: 600,
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          margin: 0,
        }}>
          Your mail client should open now
        </p>
        <p style={{
          color: 'rgba(255, 255, 255, 0.45)',
          fontSize: '13px',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          margin: 0,
        }}>
          Hit send in your mail app to deliver the message
        </p>
        <button
          onClick={() => {
            setSent(false);
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
          }}
          style={{
            marginTop: '8px',
            padding: '8px 20px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '13px',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Compose another
        </button>

        <style>{`
          @keyframes sentPop {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(15, 15, 20, 0.72)',
      borderRadius: '0 0 12px 12px',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
        gap: '12px',
        flexShrink: 0,
      }}>
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend || sending}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 16px',
            borderRadius: '8px',
            border: 'none',
            background: canSend ? 'rgba(0, 122, 255, 0.9)' : 'rgba(0, 122, 255, 0.3)',
            color: canSend ? '#fff' : 'rgba(255,255,255,0.4)',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            cursor: canSend ? 'pointer' : 'default',
            transition: 'all 0.2s',
            opacity: sending ? 0.6 : 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
          {sending ? 'Opening...' : 'Send'}
        </button>

        <div style={{ flex: 1 }} />

        <span style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.3)',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        }}>
          to: abdullahmsultan1@gmail.com
        </span>
      </div>

      {/* Form fields */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* To field (read-only) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)',
          gap: '10px',
        }}>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.35)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            width: '56px',
            flexShrink: 0,
          }}>To:</span>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            background: 'rgba(0, 122, 255, 0.15)',
            padding: '3px 10px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 122, 255, 0.25)',
          }}>
            Abdullah Sultan
          </span>
        </div>

        {/* From name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)',
          gap: '10px',
        }}>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.35)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            width: '56px',
            flexShrink: 0,
          }}>Name:</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              padding: '10px 0',
            }}
          />
        </div>

        {/* From email */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)',
          gap: '10px',
        }}>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.35)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            width: '56px',
            flexShrink: 0,
          }}>Email:</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              padding: '10px 0',
            }}
          />
        </div>

        {/* Subject */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)',
          gap: '10px',
        }}>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.35)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            width: '56px',
            flexShrink: 0,
          }}>Subject:</span>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="What's this about?"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              padding: '10px 0',
            }}
          />
        </div>
      </div>

      {/* Message body */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <textarea
          ref={messageRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Write your message..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '14px',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            lineHeight: 1.6,
            padding: '16px',
            resize: 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Bottom bar */}
      <div style={{
        padding: '8px 16px',
        borderTop: '0.5px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.25)',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        }}>
          {message.length > 0 ? `${message.length} characters` : 'Compose your message above'}
        </span>
      </div>

      <style>{`
        input::placeholder, textarea::placeholder {
          color: rgba(255, 255, 255, 0.25) !important;
        }
      `}</style>
    </div>
  );
};

export default EmailCompose;
