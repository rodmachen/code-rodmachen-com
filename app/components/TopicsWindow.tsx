'use client';

import { ClassicyApp, ClassicyWindow, ClassicyIcons } from 'classicy';
import { useRouter } from 'next/navigation';
import { getAllTags } from '../lib/posts';

export const TOPICS_APP_ID = 'topics';
export const TOPICS_WINDOW_ID = 'topics.main';

export default function TopicsWindow() {
  const router = useRouter();
  const tags = getAllTags();

  return (
    <ClassicyApp
      id={TOPICS_APP_ID}
      name="Topics"
      icon={ClassicyIcons.system.files.fileText}
      noDesktopIcon
      defaultWindow={TOPICS_WINDOW_ID}
    >
      <ClassicyWindow
        id={TOPICS_WINDOW_ID}
        appId={TOPICS_APP_ID}
        title="Topics"
        initialSize={[360, 320]}
        initialPosition={[240, 140]}
        resizable={false}
        zoomable={true}
        collapsable={true}
        defaultWindow
      >
        <div className="topicsWindowContent" data-testid="topics-window">
          {tags.length === 0 ? (
            <p className="topicsWindowEmpty">No topics yet.</p>
          ) : (
            <ul className="topicsWindowList">
              {tags.map(({ tag, count }) => (
                <li key={tag} className="topicsWindowItem">
                  <a
                    href={`/topics/${tag}/`}
                    data-testid={`topics-window-tag-${tag}`}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/topics/${tag}/`);
                    }}
                  >
                    {tag}
                    <span className="topicsWindowCount">({count})</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ClassicyWindow>
    </ClassicyApp>
  );
}
