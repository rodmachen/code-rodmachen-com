'use client';

import { ClassicyApp, ClassicyWindow } from 'classicy';

export const CONTACT_APP_ID = 'contact';
export const CONTACT_WINDOW_ID = 'contact.main';

export default function ContactWindow() {
  return (
    <ClassicyApp
      id={CONTACT_APP_ID}
      name="Contact"
      icon=""
      noDesktopIcon
      defaultWindow={CONTACT_WINDOW_ID}
    >
      <ClassicyWindow
        id={CONTACT_WINDOW_ID}
        appId={CONTACT_APP_ID}
        title="Contact"
        initialSize={[400, 300]}
        initialPosition={[250, 150]}
        resizable={false}
        zoomable={false}
        collapsable={false}
        defaultWindow
      >
        <div data-testid="contact-window" style={{ padding: '1rem' }}>
          Reach me on GitHub: github.com/rodmachen
        </div>
      </ClassicyWindow>
    </ClassicyApp>
  );
}
