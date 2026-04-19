import type { Metadata } from 'next';
import 'classicy/dist/classicy.css';
import './globals.css';
import './components/blog-window.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://code.rodmachen.com'),
  title: {
    template: '%s | code',
    default: 'code – Rod Machen',
  },
  description: 'Tech and code writing by Rod Machen.',
  openGraph: {
    siteName: 'code – Rod Machen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
