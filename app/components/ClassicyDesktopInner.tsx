'use client';

if (typeof window !== 'undefined') {
  localStorage.removeItem('classicyDesktopState');
}

import {
  ClassicyAppManagerProvider,
  ClassicyDesktop,
  ClassicyIcons,
  // @ts-ignore - runtime export not in classicy's d.ts
  useAppManager,
  // @ts-ignore - runtime export not in classicy's d.ts
  useAppManagerDispatch,
  // @ts-ignore - runtime export not in classicy's d.ts
  useSoundDispatch,
} from 'classicy';
import { useEffect, useMemo } from 'react';
import AboutThisSiteWindow, {
  ABOUT_THIS_SITE_APP_ID,
} from './AboutThisSiteWindow';
import PostListingsWindow, {
  POST_LISTINGS_APP_ID,
} from './PostListingsWindow';
import PostReaderWindow from './PostReaderWindow';
import AboutWindow, { ABOUT_APP_ID } from './AboutWindow';
import ContactWindow, { CONTACT_APP_ID } from './ContactWindow';
import TrashWindow from './TrashWindow';

type ClassicyMenuItem = {
  id: string;
  title?: string;
  disabled?: boolean;
  onClickFunc?: () => void;
  menuChildren?: ClassicyMenuItem[];
};

function DesktopInit() {
  const dispatch = useAppManagerDispatch();
  const soundDispatch = useSoundDispatch();

  // Build the persistent menu bar items
  const blogMenu = useMemo<ClassicyMenuItem[]>(
    () => [
      {
        id: 'blog.file',
        title: 'File',
        menuChildren: [
          {
            id: 'blog.file.open',
            title: 'Open\u2026',
            onClickFunc: () => {
              dispatch({
                type: 'ClassicyAppOpen',
                app: {
                  id: POST_LISTINGS_APP_ID,
                  name: 'Posts',
                  icon: '',
                },
              });
              dispatch({
                type: 'ClassicyAppFocus',
                app: { id: POST_LISTINGS_APP_ID },
              });
            },
          },
        ],
      },
      {
        id: 'blog.edit',
        title: 'Edit',
        menuChildren: [
          {
            id: 'blog.edit.posts',
            title: 'Edit Posts',
            disabled: true,
          },
        ],
      },
      {
        id: 'blog.view',
        title: 'View',
        menuChildren: [
          {
            id: 'blog.view.normal',
            title: 'Normal',
            disabled: true,
            onClickFunc: () => {
              document.documentElement.dataset.blogZoom = 'normal';
            },
          },
          {
            id: 'blog.view.full',
            title: 'Full Width',
            disabled: true,
            onClickFunc: () => {
              document.documentElement.dataset.blogZoom = 'full';
            },
          },
        ],
      },
      {
        id: 'blog.help',
        title: 'Help',
        menuChildren: [
          {
            id: 'blog.help.help-me',
            title: 'Help me\u2026',
            onClickFunc: () => {
              window.open('https://www.google.com', '_blank');
            },
          },
        ],
      },
    ],
    [dispatch],
  );

  // Disable all sounds
  useEffect(() => {
    soundDispatch({
      type: 'ClassicySoundDisable',
      disabled: ['*'],
    });
  }, [soundDispatch]);

  // Set up desktop icons, system menu, and date/time format
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

    // 11.a: Deduplicate icons by appId before adding custom ones
    const seenIds = new Set<string>();
    const deduped = currentIcons.filter((i: any) => {
      if (seenIds.has(i.appId)) return false;
      seenIds.add(i.appId);
      return true;
    });

    // 11.c: Position icons on the right side, below where Hard Drive sits
    const rightX = typeof window !== 'undefined' ? window.innerWidth - 80 : 900;

    const hasAboutIcon = deduped.some((i: any) => i.appId === ABOUT_APP_ID);
    const newIcons = hasAboutIcon
      ? deduped
      : [
          ...deduped,
          {
            appId: ABOUT_APP_ID,
            appName: 'About',
            icon: ClassicyIcons.system.files.fileText, // 11.5
            kind: 'document',
            label: 'About',
            location: [rightX, 64] as [number, number],
          },
          {
            appId: CONTACT_APP_ID,
            appName: 'Contact',
            icon: ClassicyIcons.system.files.fileText, // 11.5
            kind: 'document',
            label: 'Contact',
            location: [rightX, 128] as [number, number],
          },
          // 11.d: Trash icon in bottom-right corner
          {
            appId: 'trash',
            appName: 'Trash',
            icon: ClassicyIcons.system.desktop.trashFull, // 11.5
            kind: 'icon',
            label: 'Trash',
            location: [
              rightX,
              typeof window !== 'undefined' ? window.innerHeight - 80 : 700,
            ] as [number, number],
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
            appMenu: blogMenu, // Set initial menu
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
  }, [dispatch, blogMenu]);

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
        <TrashWindow />
      </ClassicyDesktop>
    </ClassicyAppManagerProvider>
  );
}

