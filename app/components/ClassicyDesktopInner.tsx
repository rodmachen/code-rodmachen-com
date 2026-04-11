'use client';

import {
  ClassicyApp,
  ClassicyAppManagerProvider,
  ClassicyDesktop,
  ClassicyDesktopMenuBar,
  ClassicyWindow,
} from 'classicy';

export default function ClassicyDesktopInner() {
  return (
    <ClassicyAppManagerProvider appName="code.rodmachen.com">
      <ClassicyDesktop>
        <ClassicyDesktopMenuBar />
        <ClassicyApp
          id="blog"
          name="Blog"
          icon=""
          noDesktopIcon
          defaultWindow="blog.main"
        >
          <ClassicyWindow
            id="blog.main"
            appId="blog"
            title="Blog"
            initialSize={[600, 400]}
            initialPosition={[120, 80]}
            defaultWindow
          />
        </ClassicyApp>
      </ClassicyDesktop>
    </ClassicyAppManagerProvider>
  );
}
