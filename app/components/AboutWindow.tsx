'use client';

import { ClassicyApp, ClassicyWindow, ClassicyIcons } from 'classicy';

export const ABOUT_APP_ID = 'siteAbout';
export const ABOUT_WINDOW_ID = 'siteAbout.main';

export default function AboutWindow() {
  return (
    <ClassicyApp
      id={ABOUT_APP_ID}
      name="About"
      icon={ClassicyIcons.system.files.fileText}
      defaultWindow={ABOUT_WINDOW_ID}
    >
      <ClassicyWindow
        id={ABOUT_WINDOW_ID}
        appId={ABOUT_APP_ID}
        title="About"
        initialSize={[500, 400]}
        initialPosition={[200, 120]}
        resizable={false}
        zoomable={true}
        collapsable={true}
        defaultWindow
      >
        <div data-testid="about-window" style={{ padding: '1rem', fontFamily: 'Geneva, "Lucida Grande", Verdana, sans-serif' }}>
          Code is a coding-focused blog by Rod Machen, built on Next.js + Classicy + Velite. The retro Mac OS 8 look is deliberate.
        </div>
      </ClassicyWindow>
    </ClassicyApp>
  );
}
