'use client';

import {
  ClassicyAppManagerProvider,
  ClassicyDesktop,
  ClassicyDesktopMenuBar,
} from 'classicy';
import BlogWindow from './BlogWindow';

export default function ClassicyDesktopInner({
  initialSlug,
}: {
  initialSlug: string;
}) {
  return (
    <ClassicyAppManagerProvider appName="code.rodmachen.com">
      <ClassicyDesktop>
        <ClassicyDesktopMenuBar />
        <BlogWindow initialSlug={initialSlug} />
      </ClassicyDesktop>
    </ClassicyAppManagerProvider>
  );
}
