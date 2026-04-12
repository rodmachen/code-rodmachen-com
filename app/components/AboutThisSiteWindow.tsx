'use client';

import { ClassicyApp, ClassicyWindow } from 'classicy';

export const ABOUT_THIS_SITE_APP_ID = 'aboutThisSite';
export const ABOUT_THIS_SITE_WINDOW_ID = 'aboutThisSite.main';

export default function AboutThisSiteWindow() {
  return (
    <ClassicyApp
      id={ABOUT_THIS_SITE_APP_ID}
      name="About This Site"
      icon=""
      noDesktopIcon
      defaultWindow={ABOUT_THIS_SITE_WINDOW_ID}
    >
      <ClassicyWindow
        id={ABOUT_THIS_SITE_WINDOW_ID}
        appId={ABOUT_THIS_SITE_APP_ID}
        title="About This Site"
        initialSize={[360, 280]}
        initialPosition={[200, 120]}
        resizable={false}
        zoomable={false}
        collapsable={false}
        defaultWindow
      >
        <div
          className="aboutThisSiteContent"
          data-testid="about-this-site-window"
        >
          <h2>code.rodmachen.com</h2>
          <p>Tech and code writing by Rod Machen.</p>
          <p>Built with:</p>
          <ul>
            <li>Next.js 16</li>
            <li>Classicy</li>
            <li>Velite</li>
            <li>Shiki</li>
            <li>Playwright</li>
          </ul>
          <p>Deployed on Vercel.</p>
          <p>
            <a
              href="https://github.com/rodmachen/code-rodmachen-com"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub repo
            </a>
          </p>
        </div>
      </ClassicyWindow>
    </ClassicyApp>
  );
}
