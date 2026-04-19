import { describe, it, expect } from 'vitest';
import remarkCloudinaryImages from '../../app/plugins/remark-cloudinary-images';

const CLOUD_URL =
  'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg';

function makeImageTree(url: string, title?: string, alt?: string) {
  return {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            url,
            title: title ?? null,
            alt: alt ?? '',
          },
        ],
      },
    ],
  };
}

function getHtml(tree: ReturnType<typeof makeImageTree>): string {
  return (tree.children[0] as any).children[0].value as string;
}

describe('remarkCloudinaryImages', () => {
  describe('size presets', () => {
    it('small → 300px / 600px srcset', () => {
      const tree = makeImageTree(CLOUD_URL, 'size:small');
      remarkCloudinaryImages()(tree as any);
      const html = getHtml(tree);
      expect(html).toContain('class="img-small"');
      expect(html).toContain('w_300,f_auto,q_auto');
      expect(html).toContain('w_600,f_auto,q_auto');
      expect(html).toContain('srcset=');
    });

    it('medium → 600px / 1200px srcset', () => {
      const tree = makeImageTree(CLOUD_URL, 'size:medium');
      remarkCloudinaryImages()(tree as any);
      const html = getHtml(tree);
      expect(html).toContain('class="img-medium"');
      expect(html).toContain('w_600,f_auto,q_auto');
      expect(html).toContain('w_1200,f_auto,q_auto');
      expect(html).toContain('srcset=');
    });

    it('large → 800px / 1600px srcset', () => {
      const tree = makeImageTree(CLOUD_URL, 'size:large');
      remarkCloudinaryImages()(tree as any);
      const html = getHtml(tree);
      expect(html).toContain('class="img-large"');
      expect(html).toContain('w_800,f_auto,q_auto');
      expect(html).toContain('w_1600,f_auto,q_auto');
      expect(html).toContain('srcset=');
    });

    it('full → 1100px / 2200px srcset', () => {
      const tree = makeImageTree(CLOUD_URL, 'size:full');
      remarkCloudinaryImages()(tree as any);
      const html = getHtml(tree);
      expect(html).toContain('class="img-full"');
      expect(html).toContain('w_1100,f_auto,q_auto');
      expect(html).toContain('w_2200,f_auto,q_auto');
      expect(html).toContain('srcset=');
    });
  });

  it('defaults to large when no size: directive on a Cloudinary URL', () => {
    const tree = makeImageTree(CLOUD_URL);
    remarkCloudinaryImages()(tree as any);
    const html = getHtml(tree);
    expect(html).toContain('class="img-large"');
    expect(html).toContain('w_800,f_auto,q_auto');
  });

  it('leaves non-Cloudinary images without size: directive unchanged', () => {
    const tree = makeImageTree('https://example.com/photo.jpg');
    remarkCloudinaryImages()(tree as any);
    const node = (tree.children[0] as any).children[0];
    expect(node.type).toBe('image');
  });

  it('includes figcaption when caption text follows the size directive', () => {
    const tree = makeImageTree(CLOUD_URL, 'size:medium A nice caption');
    remarkCloudinaryImages()(tree as any);
    const html = getHtml(tree);
    expect(html).toContain('<figcaption>A nice caption</figcaption>');
  });

  it('omits figcaption when no caption follows the size directive', () => {
    const tree = makeImageTree(CLOUD_URL, 'size:medium');
    remarkCloudinaryImages()(tree as any);
    const html = getHtml(tree);
    expect(html).not.toContain('<figcaption>');
  });

  it('includes alt text in the img element', () => {
    const tree = makeImageTree(CLOUD_URL, 'size:small', 'Descriptive text');
    remarkCloudinaryImages()(tree as any);
    const html = getHtml(tree);
    expect(html).toContain('alt="Descriptive text"');
  });

  it('includes loading=lazy on the img element', () => {
    const tree = makeImageTree(CLOUD_URL, 'size:medium');
    remarkCloudinaryImages()(tree as any);
    const html = getHtml(tree);
    expect(html).toContain('loading="lazy"');
  });
});
