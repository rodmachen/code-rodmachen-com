import type { Metadata } from 'next';
import 'classicy/dist/classicy.css';

export const metadata: Metadata = {
  title: 'code.rodmachen.com',
  description: 'Tech and code writing by Rod Machen.',
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
