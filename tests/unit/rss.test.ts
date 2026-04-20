import { describe, test, expect } from 'vitest'
import { buildRssXml, escapeXml } from '../../app/rss.xml/route'

const samplePosts = [
  { title: 'Hello World', subTitle: 'A greeting', date: '2024-01-15', slug: 'hello-world' },
  { title: 'Second Post', subTitle: undefined, date: '2024-03-20', slug: 'second-post' },
]

describe('escapeXml', () => {
  test('escapes ampersands', () => {
    expect(escapeXml('Foo & Bar')).toBe('Foo &amp; Bar')
  })

  test('escapes angle brackets', () => {
    expect(escapeXml('<tag>')).toBe('&lt;tag&gt;')
  })

  test('escapes quotes', () => {
    expect(escapeXml('"hello"')).toBe('&quot;hello&quot;')
  })

  test('leaves plain strings unchanged', () => {
    expect(escapeXml('plain text')).toBe('plain text')
  })
})

describe('buildRssXml', () => {
  test('produces valid RSS envelope', () => {
    const xml = buildRssXml(samplePosts)
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<rss version="2.0">')
    expect(xml).toContain('</rss>')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('</channel>')
  })

  test('includes channel title', () => {
    const xml = buildRssXml(samplePosts)
    expect(xml).toContain('<title>code – Rod Machen</title>')
  })

  test('includes post titles', () => {
    const xml = buildRssXml(samplePosts)
    expect(xml).toContain('<title>Hello World</title>')
    expect(xml).toContain('<title>Second Post</title>')
  })

  test('includes post links with trailing slash', () => {
    const xml = buildRssXml(samplePosts)
    expect(xml).toContain('<link>https://code.rodmachen.com/posts/hello-world/</link>')
  })

  test('includes subTitle as description when present', () => {
    const xml = buildRssXml(samplePosts)
    expect(xml).toContain('<description>A greeting</description>')
  })

  test('uses empty description when subTitle is absent', () => {
    const xml = buildRssXml([samplePosts[1]])
    expect(xml).toContain('<description></description>')
  })

  test('escapes ampersands in title', () => {
    const posts = [{ title: 'Foo & Bar', subTitle: undefined, date: '2024-01-01', slug: 'foo-bar' }]
    const xml = buildRssXml(posts)
    expect(xml).toContain('<title>Foo &amp; Bar</title>')
    expect(xml).not.toContain('<title>Foo & Bar</title>')
  })

  test('produces well-formed XML for empty post list', () => {
    const xml = buildRssXml([])
    expect(xml).toContain('<rss version="2.0">')
    expect(xml).toContain('<title>code – Rod Machen</title>')
    expect(xml).not.toContain('<item>')
  })
})
