'use client';

import { ClassicyApp, ClassicyWindow, ClassicyIcons } from 'classicy';

export const TRASH_APP_ID = 'trash';
export const TRASH_WINDOW_ID = 'trash.main';

export default function TrashWindow() {
  return (
    <ClassicyApp
      id={TRASH_APP_ID}
      name="Trash"
      icon={ClassicyIcons.system.desktop.trashEmpty}
      defaultWindow={TRASH_WINDOW_ID}
    >
      <ClassicyWindow
        id={TRASH_WINDOW_ID}
        appId={TRASH_APP_ID}
        title="Trash"
        initialSize={[300, 200]}
        initialPosition={[500, 300]}
        resizable={true}
        zoomable={true}
        collapsable={true}
        defaultWindow
      >
        <div
          data-testid="trash-window"
          style={{
            padding: '1rem',
            fontFamily: 'Geneva, "Lucida Grande", Verdana, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '0.5rem',
          }}
        >
          <a href="https://www.utexas.edu/" target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Texas_Longhorns_logo.svg/200px-Texas_Longhorns_logo.svg.png"
              alt="University of Texas Longhorns"
              width={80}
              height={80}
              style={{ imageRendering: 'pixelated' }}
            />
          </a>
          <span style={{ fontSize: '11px' }}>University of Texas</span>
        </div>
      </ClassicyWindow>
    </ClassicyApp>
  );
}
