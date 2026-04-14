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
import BlogApp from './BlogApp';
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

  // Watch for Classicy's auto-created "Macintosh HD" drive icon and fix it up.
  // Classicy's internal Finder component dispatches ClassicyDesktopIconAdd for
  // every virtual drive on mount (useEffect), so the timing vs. our own useEffect
  // is non-deterministic. This reactive selector re-fires whenever the icon
  // appears, regardless of which effect wins the race.
  const needsHardDriveFix = useAppManager((state: any) =>
    state.System.Manager.Desktop.icons.some(
      (i: any) => i.kind === 'drive' && i.appName === 'Macintosh HD' && i.label !== 'Hard Drive'
    )
  );

  useEffect(() => {
    if (!needsHardDriveFix) return;
    // Match the same rightX used for Trash. Hard Drive sits at the top of the
    // icon column; 40px from top clears the 22px menu bar with comfortable padding.
    const rightX = typeof window !== 'undefined' ? window.innerWidth - 100 : 900;
    const state = useAppManager.getState();
    useAppManager.setState({
      System: {
        ...state.System,
        Manager: {
          ...state.System.Manager,
          Desktop: {
            ...state.System.Manager.Desktop,
            icons: state.System.Manager.Desktop.icons.map((i: any) =>
              i.kind === 'drive' && i.appName === 'Macintosh HD'
                ? { ...i, label: 'Hard Drive', location: [rightX, 40] as [number, number] }
                : i
            ),
          },
        },
      },
    });
  }, [needsHardDriveFix]);

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
                type: 'ClassicyWindowOpen',
                app: { id: 'blog' },
                window: { id: 'blog.listings' },
              });
              dispatch({
                type: 'ClassicyWindowFocus',
                app: { id: 'blog' },
                window: { id: 'blog.listings' },
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
            id: 'blog.help.about',
            title: 'About',
            onClickFunc: () => {
              dispatch({
                type: 'ClassicyAppOpen',
                app: {
                  id: ABOUT_APP_ID,
                  name: 'About',
                  icon: '',
                },
              });
              dispatch({
                type: 'ClassicyAppFocus',
                app: { id: ABOUT_APP_ID },
              });
            },
          },
          {
            id: 'blog.help.contact',
            title: 'Contact',
            onClickFunc: () => {
              dispatch({
                type: 'ClassicyAppOpen',
                app: {
                  id: CONTACT_APP_ID,
                  name: 'Contact',
                  icon: '',
                },
              });
              dispatch({
                type: 'ClassicyAppFocus',
                app: { id: CONTACT_APP_ID },
              });
            },
          },
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

    // Icon column: inset from right edge far enough that the icon + label
    // have breathing room. Icons are 48px wide; 100px gives ~52px clearance.
    const rightX = typeof window !== 'undefined' ? window.innerWidth - 100 : 900;

    const hasTrashIcon = deduped.some((i: any) => i.appId === 'trash');
    const newIcons = hasTrashIcon
      ? deduped
      : [
          ...deduped,
          // Trash icon in bottom-right corner. Icon+label is ~68px tall;
          // 120px from bottom gives ~52px clearance below the label.
          {
            appId: 'trash',
            appName: 'Trash',
            icon: ClassicyIcons.system.desktop.trashFull,
            kind: 'icon',
            label: 'Trash',
            location: [
              rightX,
              typeof window !== 'undefined' ? window.innerHeight - 120 : 700,
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
        <BlogApp initialSlug={initialSlug} />
        <AboutThisSiteWindow />
        <AboutWindow />
        <ContactWindow />
        <TrashWindow />
      </ClassicyDesktop>
    </ClassicyAppManagerProvider>
  );
}

