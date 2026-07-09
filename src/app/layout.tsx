import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://abdullahmsultan.me'),
  title: {
    default: 'abdullah sultan · student builder',
    template: '%s | abdullah sultan',
  },
  description: 'student builder in riyadh. tutoring, f1 media, and quant tools.',
  authors: [{ name: 'Abdullah Sultan' }],
  openGraph: {
    url: 'https://abdullahmsultan.me',
    title: 'abdullah sultan · student builder',
    description: 'student builder in riyadh. tutoring, f1 media, and quant tools.',
    siteName: 'abdullah sultan',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'abdullah sultan portfolio' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.jpg'],
  },
  icons: {
    icon: '/icons/abdullah-favicon.png',
    apple: '/icons/abdullah-apple-touch.png',
  },
  other: {
    'theme-color': '#ff4d1a',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Unbounded:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
