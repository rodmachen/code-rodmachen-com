'use client';

import { useEffect } from 'react';
import { ClassicyApp, ClassicyWindow, ClassicyIcons, useAppManager, useAppManagerDispatch } from 'classicy';

export const TRASH_APP_ID = 'trash';
export const TRASH_WINDOW_ID = 'trash.main';

export default function TrashWindow() {
  const dispatch = useAppManagerDispatch();
  const isOpen = useAppManager(
    (state) => state.System.Manager.Applications.apps?.[TRASH_APP_ID]?.open ?? false,
  );

  // Classicy's built-in desktop icon handler fires ClassicyAppOpen but doesn't
  // guarantee focus when another window is already on top. Re-dispatch focus
  // whenever the trash app transitions to open.
  useEffect(() => {
    if (!isOpen) return;
    dispatch({
      type: 'ClassicyWindowFocus',
      app: { id: TRASH_APP_ID },
      window: { id: TRASH_WINDOW_ID },
    });
  }, [isOpen, dispatch]);

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
              src="/assets/img/tu-logo.jpg"
              alt="University of Texas Longhorns"
              width={96}
              height={96}
              style={{ imageRendering: 'auto' }}
            />
          </a>
          <span style={{ fontSize: '11px' }}>University of Texas</span>
        </div>
      </ClassicyWindow>
    </ClassicyApp>
  );
}
