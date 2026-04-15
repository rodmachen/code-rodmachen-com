'use client';

import {
  ClassicyApp,
  ClassicyIcons,
  ClassicyWindow,
  useAppManagerDispatch,
} from 'classicy';
import { useEffect, useMemo, useState } from 'react';
import PostBody from './PostBody';
import { applySort, formatDate, sortedPosts, type SortDir, type SortKey } from '../lib/posts';
import { buildBlogMenu } from '../lib/menus';
import { useBlogNavigation } from '../lib/use-blog-navigation';

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

export default function BlogApp() {
  const dispatch = useAppManagerDispatch();

  // Register ClassicyAppOpen BEFORE useBlogNavigation so this effect
  // fires first in the mount commit. Order matters because
  // ClassicyAppOpen → iP() calls pi() which clears all window focus
  // and then re-focuses the "last window in the store array" — which
  // on remount after SPA navigation can be a reader from a prior
  // session that's no longer rendered. The hook's focus dispatch
  // needs to run AFTER iP so it's the last writer and wins.
  useEffect(() => {
    dispatch({
      type: 'ClassicyAppOpen',
      app: { id: 'blog', name: 'Blog', icon: '' },
    });
  }, [dispatch]);

  const { openSlugs, openPost, closePost } = useBlogNavigation();

  return (
    <ClassicyApp
      id="blog"
      name="Blog"
      icon=""
      noDesktopIcon
      defaultWindow="blog.listings"
    >
      <ListingsWindow onOpenPost={openPost} />
      {openSlugs.map((slug, index) => (
        <ReaderWindow
          key={slug}
          slug={slug}
          openIndex={index}
          onClose={() => closePost(slug)}
        />
      ))}
    </ClassicyApp>
  );
}
