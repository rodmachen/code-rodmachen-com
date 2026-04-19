'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppManagerDispatch } from 'classicy';
import { useCallback, useEffect, useState } from 'react';
import {
  focusAction,
  pathToSlug,
  reconcileOpenSlugs,
} from './blog-navigation';

export type BlogNavigation = {
  openSlugs: string[];
  openPost: (slug: string) => void;
  closePost: (slug: string) => void;
};

export function useBlogNavigation(): BlogNavigation {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppManagerDispatch();

  const desiredSlug = pathToSlug(pathname);
  const [openSlugs, setOpenSlugs] = useState<string[]>(() =>
    desiredSlug ? [desiredSlug] : [],
  );
  const [lastSeenSlug, setLastSeenSlug] = useState<string | null>(desiredSlug);

  // Adjust openSlugs during render when the URL changes (React's
  // "adjusting state while rendering" pattern). Avoids an extra effect
  // cycle and sidesteps react-hooks/set-state-in-effect.
  if (desiredSlug !== lastSeenSlug) {
    setLastSeenSlug(desiredSlug);
    setOpenSlugs((prev) => reconcileOpenSlugs(prev, desiredSlug));
  }

  // Open the app when visiting a post URL directly. Must run before
  // the focus effect so iP()'s focus-clear happens before we set focus.
  useEffect(() => {
    if (!desiredSlug) return;
    dispatch({
      type: 'ClassicyAppOpen',
      app: { id: 'blog', name: 'Blog', icon: '' },
    });
  }, [desiredSlug, dispatch]);

  // Focus dispatch is a genuine side effect — stays in useEffect.
  useEffect(() => {
    dispatch(focusAction(desiredSlug));
  }, [desiredSlug, dispatch]);

  const openPost = useCallback(
    (slug: string) => {
      router.push(`/posts/${slug}`);
    },
    [router],
  );

  const closePost = useCallback(
    (slug: string) => {
      setOpenSlugs((prev) => prev.filter((s) => s !== slug));
      if (slug === desiredSlug) {
        router.push('/');
      }
    },
    [router, desiredSlug],
  );

  return { openSlugs, openPost, closePost };
}
