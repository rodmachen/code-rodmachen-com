'use client';

import dynamic from 'next/dynamic';

const ClassicyDesktopInner = dynamic(() => import('./ClassicyDesktopInner'), {
  ssr: false,
});

export default function ClassicyShell({ initialSlug }: { initialSlug: string }) {
  return <ClassicyDesktopInner initialSlug={initialSlug} />;
}
