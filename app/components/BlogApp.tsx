'use client';

import {
  ClassicyApp,
  ClassicyIcons,
  ClassicyWindow,
  useAppManagerDispatch,
  useAppManager,
} from 'classicy';
import { useEffect, useMemo, useRef, useState } from 'react';
import PostBody from './PostBody';
import { applySort, formatDate, sortedPosts, type SortDir, type SortKey } from '../lib/posts';
import { buildBlogMenu } from '../lib/menus';

function ListingsWindow({ onOpenPost }: { onOpenPost: (slug: string) => void }) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(
    () => applySort(sortedPosts, sortKey, sortDir),
    [sortKey, sortDir],
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return (
      <span className="postListingsSortIndicator">
        {sortDir === 'asc' ? '\u25B2' : '\u25BC'}
      </span>
    );
  };

  return (
    <ClassicyWindow
      id="blog.listings"
      appId="blog"
      title="Posts"
      icon={ClassicyIcons.system.drives.disk}
      initialSize={[1000, typeof window !== 'undefined' ? window.innerHeight - 22 : 720]}
      initialPosition={[0, 22]}
      resizable={false}
      zoomable={true}
      collapsable={true}
      defaultWindow
    >
      <div className="postListingsContainer" data-testid="post-listings-window">
        <div className="postListingsScrollArea">
          <table className="postListingsTable">
            <thead>
              <tr>
                <th
                  className="postListingsHeaderName postListingsHeaderSortable"
                  onClick={() => handleSort('name')}
                >
                  Title{sortIndicator('name')}
                </th>
                <th className="postListingsHeaderSubtitle">Subtitle</th>
                <th
                  className="postListingsHeaderDate postListingsHeaderSortable"
                  onClick={() => handleSort('date')}
                >
                  Date{sortIndicator('date')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((post) => (
                <tr
                  key={post.slug}
                  className="postListingsRow"
                  data-testid={`post-listing-${post.slug}`}
                  onClick={() => onOpenPost(post.slug)}
                >
                  <td className="postListingsCellName">
                    <span className="postListingsCellNameContent">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ClassicyIcons.system.files.document}
                        alt=""
                        className="postListingsCellNameIcon"
                      />
                      {post.title}
                    </span>
                  </td>
                  <td className="postListingsCellSubtitle">{post.subTitle || ''}</td>
                  <td className="postListingsCellDate">{formatDate(post.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="postListingsStatusBar">
          {sortedPosts.length} item{sortedPosts.length !== 1 ? 's' : ''}
        </div>
      </div>
    </ClassicyWindow>
  );
}

type ZoomMode = 'normal' | 'full';

function ReaderWindow({
  slug,
  onClose,
  openIndex,
}: {
  slug: string;
  onClose: () => void;
  openIndex: number;
}) {
  const dispatch = useAppManagerDispatch();
  const [zoom, setZoom] = useState<ZoomMode>('normal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    dispatch({
      type: 'ClassicyWindowFocus',
      app: { id: 'blog' },
      window: { id: `blog.reader.${slug}` },
    });
  }, [dispatch, slug, mounted]);

  useEffect(() => {
    document.documentElement.dataset.blogZoom = zoom;
    return () => {
      delete document.documentElement.dataset.blogZoom;
    };
  }, [zoom]);

  const selected = sortedPosts.find((p) => p.slug === slug);

  const appMenu = useMemo(
    () => buildBlogMenu({ dispatch, setZoom, disableViewItems: false }),
    [dispatch, setZoom],
  );

  return (
    <ClassicyWindow
      id={`blog.reader.${slug}`}
      appId="blog"
      title={selected ? selected.title : 'Blog'}
      initialSize={[1000, typeof window !== 'undefined' ? window.innerHeight - 22 : 720]}
      initialPosition={[20 + openIndex * 20, 22]}
      resizable={false}
      zoomable={true}
      collapsable={true}
      defaultWindow={false}
      onCloseFunc={onClose}
      appMenu={appMenu}
    >
      <div
        className="blogReadingPane"
        data-testid={`blog-window-${slug}`}
        data-zoom={zoom}
      >
        {selected ? (
          <article>
            <header className="blogPostHeader">
              <h1 className="blogPostTitle">{selected.title}</h1>
              {selected.subTitle ? (
                <p className="blogPostSubtitle">{selected.subTitle}</p>
              ) : null}
              <p className="blogPostDate">{formatDate(selected.date)}</p>
            </header>
            <PostBody html={selected.body} />
          </article>
        ) : (
          <p>Post not found.</p>
        )}
      </div>
    </ClassicyWindow>
  );
}

export default function BlogApp({ initialSlug }: { initialSlug: string }) {
  const dispatch = useAppManagerDispatch();
  const focusedWindowId = useAppManager((state) => {
    const windows = state.System.Manager.Applications.apps['blog']?.windows || [];
    const focusedWindow = windows.find((w) => w.focused);
    return focusedWindow?.id;
  });
  const [openSlugs, setOpenSlugs] = useState<string[]>([]);
  const openSlugsRef = useRef<string[]>([]);

  useEffect(() => {
    openSlugsRef.current = openSlugs;
  }, [openSlugs]);

  useEffect(() => {
    dispatch({
      type: 'ClassicyAppOpen',
      app: { id: 'blog', name: 'Blog', icon: '' },
    });
  }, [dispatch]);

  useEffect(() => {
    if (focusedWindowId === 'blog.listings') {
      // Use pushState (not replaceState) so we create a proper history entry
      // when the user focuses listings from a post URL. Skip if already at /.
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
    } else if (typeof focusedWindowId === 'string' && focusedWindowId.startsWith('blog.reader.')) {
      const slug = focusedWindowId.replace('blog.reader.', '');
      const newPath = `/posts/${slug}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    }
  }, [focusedWindowId]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
        dispatch({
          type: 'ClassicyWindowFocus',
          app: { id: 'blog' },
          window: { id: 'blog.listings' },
        });
      } else if (path.startsWith('/posts/')) {
        const slug = path.replace('/posts/', '');
        if (openSlugsRef.current.includes(slug)) {
          dispatch({
            type: 'ClassicyWindowFocus',
            app: { id: 'blog' },
            window: { id: `blog.reader.${slug}` },
          });
        } else {
          setOpenSlugs((prev) => [...prev, slug]);
          // ReaderWindow will self-focus via its mounted effect
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dispatch]);

  useEffect(() => {
    if (initialSlug && openSlugs.length === 0) {
      setOpenSlugs([initialSlug]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenPost = (slug: string) => {
    if (openSlugs.includes(slug)) {
      dispatch({
        type: 'ClassicyWindowFocus',
        app: { id: 'blog' },
        window: { id: `blog.reader.${slug}` },
      });
    } else {
      setOpenSlugs((prev) => [...prev, slug]);
    }
  };

  const handleClosePost = (slug: string) => {
    setOpenSlugs((prev) => prev.filter((s) => s !== slug));
  };

  return (
    <ClassicyApp
      id="blog"
      name="Blog"
      icon=""
      noDesktopIcon
      defaultWindow="blog.listings"
    >
      <ListingsWindow onOpenPost={handleOpenPost} />
      {openSlugs.map((slug, index) => (
        <ReaderWindow
          key={slug}
          slug={slug}
          openIndex={index}
          onClose={() => handleClosePost(slug)}
        />
      ))}
    </ClassicyApp>
  );
}
