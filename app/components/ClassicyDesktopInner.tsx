'use client';

if (typeof window !== 'undefined') {
  localStorage.removeItem('classicyDesktopState');
}

import {
  ClassicyAppManagerProvider,
  ClassicyDesktop,
  ClassicyIcons,
  useAppManager,
  useAppManagerDispatch,
  useSoundDispatch,
} from 'classicy';
import { useEffect, useMemo } from 'react';
import AboutThisSiteWindow, {
  ABOUT_THIS_SITE_APP_ID,
} from './AboutThisSiteWindow';
import BlogApp from './BlogApp';
import AboutWindow from './AboutWindow';
import ContactWindow from './ContactWindow';
import { buildBlogMenu } from '../lib/menus';
import TrashWindow from './TrashWindow';

function DesktopInit() {
  const dispatch = useAppManagerDispatch();
  const soundDispatch = useSoundDispatch();

  // Set Hard Drive icon via public dispatch. ClassicyDesktopIconAdd is a no-op
  // if an icon with the same appId already exists, so this wins either race:
  // — we run before Finder: Add "Hard Drive" first, Finder's "Macintosh HD"
  //   add is blocked (same appId).
  // — Finder runs before us: Remove "Macintosh HD", then Add "Hard Drive".
  // Idempotent: re-running removes nothing (no "Macintosh HD" present) and
  // the Add is a no-op (appId already occupied by "Hard Drive").
  useEffect(() => {
    const rightX = typeof window !== 'undefined' ? window.innerWidth - 100 : 900;
    dispatch({
      type: 'ClassicyDesktopIconRemove',
      app: { id: 'Finder.app', name: 'Macintosh HD' },
    });
    dispatch({
      type: 'ClassicyDesktopIconAdd',
      app: {
        id: 'Finder.app',
        name: 'Hard Drive',
        icon: ClassicyIcons.system.drives.disk,
      },
      label: 'Hard Drive',
      location: [rightX, 40] as [number, number],
      kind: 'drive',
    });
  }, [dispatch]);

  // Trash icon: ClassicyDesktopIconAdd is a no-op if appId already present — idempotent.
  // Icon column: 100px from right gives ~52px clearance for the 48px icon.
  useEffect(() => {
    const rightX = typeof window !== 'undefined' ? window.innerWidth - 100 : 900;
    dispatch({
      type: 'ClassicyDesktopIconAdd',
      app: { id: 'trash', name: 'Trash', icon: ClassicyIcons.system.desktop.trashFull },
      label: 'Trash',
      // Trash icon in bottom-right corner. Icon+label is ~68px tall;
      // 120px from bottom gives ~52px clearance below the label.
      location: [rightX, typeof window !== 'undefined' ? window.innerHeight - 120 : 700] as [number, number],
      kind: 'icon',
    });
  }, [dispatch]);

  // DateAndTime config: no public dispatch exists for this — Classicy gap.
  useEffect(() => {
    useAppManager.setState((state) => ({
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
        },
      },
    }));
  }, []);

  // System menu: no public dispatch exists for this — Classicy gap.
  useEffect(() => {
    const openAbout = () => {
      dispatch({
        type: 'ClassicyAppOpen',
        app: { id: ABOUT_THIS_SITE_APP_ID, name: 'About This Site', icon: '' },
      });
    };
    useAppManager.setState((state) => ({
      System: {
        ...state.System,
        Manager: {
          ...state.System.Manager,
          Desktop: {
            ...state.System.Manager.Desktop,
            systemMenu: [{ id: 'about-this-site', title: 'About This Site', onClickFunc: openAbout }],
          },
        },
      },
    }));
  }, [dispatch]);

  // Build the persistent menu bar items (View items disabled — no Reader window focused at desktop level)
  const blogMenu = useMemo(
    () => buildBlogMenu({ dispatch, disableViewItems: true }),
    [dispatch],
  );

  // App menu (initial menu bar state): no public dispatch exists for this — Classicy gap.
  useEffect(() => {
    useAppManager.setState((state) => ({
      System: {
        ...state.System,
        Manager: {
          ...state.System.Manager,
          Desktop: {
            ...state.System.Manager.Desktop,
            appMenu: blogMenu,
          },
        },
      },
    }));
  }, [blogMenu]);

  // Disable all sounds
  useEffect(() => {
    soundDispatch({
      type: 'ClassicySoundDisable',
      disabled: ['*'],
    });
  }, [soundDispatch]);

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

