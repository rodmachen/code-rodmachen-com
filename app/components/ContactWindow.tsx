'use client';

import { ClassicyApp, ClassicyWindow, ClassicyIcons } from 'classicy';

export const CONTACT_APP_ID = 'contact';
export const CONTACT_WINDOW_ID = 'contact.main';

export default function ContactWindow() {
  return (
    <ClassicyApp
      id={CONTACT_APP_ID}
      name="Contact"
      icon={ClassicyIcons.system.files.fileText}
      defaultWindow={CONTACT_WINDOW_ID}
    >
      <ClassicyWindow
        id={CONTACT_WINDOW_ID}
        appId={CONTACT_APP_ID}
        title="Contact"
        initialSize={[400, 300]}
        initialPosition={[250, 150]}
        resizable={false}
        zoomable={true}
        collapsable={true}
        defaultWindow
      >
        <div data-testid="contact-window" style={{ padding: '1rem', fontFamily: 'Geneva, "Lucida Grande", Verdana, sans-serif' }}>
          Reach me on GitHub: github.com/rodmachen
        </div>
      </ClassicyWindow>
    </ClassicyApp>
  );
}
