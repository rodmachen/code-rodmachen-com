'use client';

import {
  ClassicyAppManagerProvider,
  ClassicyDesktop,
  // @ts-ignore - runtime export not in classicy's d.ts
  useAppManager,
  // @ts-ignore - runtime export not in classicy's d.ts
  useAppManagerDispatch,
  // @ts-ignore - runtime export not in classicy's d.ts
  useSoundDispatch,
} from 'classicy';
import { useEffect } from 'react';
import AboutThisSiteWindow, {
  ABOUT_THIS_SITE_APP_ID,
} from './AboutThisSiteWindow';
import PostListingsWindow from './PostListingsWindow';
import PostReaderWindow from './PostReaderWindow';
import AboutWindow, { ABOUT_APP_ID } from './AboutWindow';
import ContactWindow, { CONTACT_APP_ID } from './ContactWindow';

function DesktopInit() {
  const dispatch = useAppManagerDispatch();
  const soundDispatch = useSoundDispatch();

  useEffect(() => {
    soundDispatch({
      type: 'ClassicySoundDisable',
      disabled: ['*'],
    });
  }, [soundDispatch]);

  useEffect(() => {
    const openAbout = () => {
      dispatch({
        type: 'ClassicyAppOpen',
        app: {
          id: ABOUT_THIS_SITE_APP_ID,
          name: 'About This Site',
          icon: '',
        },
      });
    };

    const state = useAppManager.getState();
    const currentIcons = state.System.Manager.Desktop.icons || [];
    const hasCustomIcons = currentIcons.some((i: any) => i.appId === ABOUT_APP_ID);
    const newIcons = hasCustomIcons
      ? currentIcons
      : [
          ...currentIcons,
          {
            appId: ABOUT_APP_ID,
            appName: 'About',
            icon: 'document',
            kind: 'document',
            label: 'About',
          },
          {
            appId: CONTACT_APP_ID,
            appName: 'Contact',
            icon: 'document',
            kind: 'document',
            label: 'Contact',
          },
        ];

    useAppManager.setState({
      System: {
        ...state.System,
        Manager: {
          ...state.System.Manager,
          DateAndTime: {
            ...state.System.Manager.DateAndTime,
            displaySeconds: false,
            displayDay: false,
            displayLongDay: false,
            displayPeriod: true,
            militaryTime: false,
            flashSeparators: false,
          },
          Desktop: {
            ...state.System.Manager.Desktop,
            icons: newIcons,
            systemMenu: [
              {
                id: 'about-this-site',
                title: 'About This Site',
                onClickFunc: openAbout,
              },
            ],
          },
        },
      },
    });
  }, [dispatch]);

  useEffect(() => {
    type DesktopIcon = {
      appId: string;
      appName: string;
      icon: string;
      kind: string;
      label?: string;
    };
    const isMacHD = (icon: DesktopIcon) =>
      icon.appName === 'Macintosh HD' || icon.label === 'Macintosh HD';

    const renameIcon = () => {
      const current = useAppManager.getState();
      const icons = current.System.Manager.Desktop.icons as DesktopIcon[];
      if (!icons.some(isMacHD)) return false;
      useAppManager.setState({
        System: {
          ...current.System,
          Manager: {
            ...current.System.Manager,
            Desktop: {
              ...current.System.Manager.Desktop,
              icons: icons.map((icon) =>
                isMacHD(icon) ? { ...icon, label: 'Hard Drive' } : icon,
              ),
            },
          },
        },
      });
      return true;
    };

    if (renameIcon()) return;
    const unsubscribe = useAppManager.subscribe(() => {
      if (renameIcon()) unsubscribe();
    });
    return unsubscribe;
  }, []);

  return null;
}

export default function ClassicyDesktopInner({
  initialSlug,
}: {
  initialSlug: string;
}) {
  return (
    <ClassicyAppManagerProvider appName="code.rodmachen.com">
      <ClassicyDesktop>
        <DesktopInit />
        <PostReaderWindow initialSlug={initialSlug} />
        <PostListingsWindow />
        <AboutThisSiteWindow />
        <AboutWindow />
        <ContactWindow />
      </ClassicyDesktop>
    </ClassicyAppManagerProvider>
  );
}
