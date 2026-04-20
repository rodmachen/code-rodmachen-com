import { type ClassicyMenuItem } from 'classicy';
import { ABOUT_APP_ID } from '../components/AboutWindow';
import { CONTACT_APP_ID } from '../components/ContactWindow';
import { TOPICS_APP_ID } from '../components/TopicsWindow';

export type { ClassicyMenuItem };

type BuildBlogMenuDeps = {
  dispatch: (action: Record<string, unknown> & { type: string }) => void;
  setZoom?: (mode: 'normal' | 'full') => void;
  disableViewItems: boolean;
};

export function buildBlogMenu({
  dispatch,
  setZoom,
  disableViewItems,
}: BuildBlogMenuDeps): ClassicyMenuItem[] {
  return [
    {
      id: 'blog.file',
      title: 'File',
      menuChildren: [
        {
          id: 'blog.file.open',
          title: 'Open Posts',
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
        {
          id: 'blog.file.open-topics',
          title: 'Open Topics',
          onClickFunc: () => {
            dispatch({
              type: 'ClassicyAppOpen',
              app: { id: TOPICS_APP_ID, name: 'Topics', icon: '' },
            });
            dispatch({
              type: 'ClassicyAppFocus',
              app: { id: TOPICS_APP_ID },
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
          disabled: disableViewItems,
          onClickFunc: () => {
            if (setZoom) {
              setZoom('normal');
            } else {
              document.documentElement.dataset.blogZoom = 'normal';
            }
          },
        },
        {
          id: 'blog.view.full',
          title: 'Full Width',
          disabled: disableViewItems,
          onClickFunc: () => {
            if (setZoom) {
              setZoom('full');
            } else {
              document.documentElement.dataset.blogZoom = 'full';
            }
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
              app: { id: ABOUT_APP_ID, name: 'About', icon: '' },
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
              app: { id: CONTACT_APP_ID, name: 'Contact', icon: '' },
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
  ];
}
