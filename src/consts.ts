/** 站点级常量。改这里会影响全站。 */

export const SITE = {
  title: 'INTZOT',
  tagline: '写代码，也写生活。',
  description: '技术笔记与生活随笔。',
  url: 'https://intzot.asia',
  author: 'intzot',
  email: 'intzot@intzot.asia',
  github: 'https://github.com/INTZOT',
  /** 站点起始年月，关于页用（§10.7 页面清单） */
  since: '2026 年 9 月',
} as const;

/** 导航。顺序即显示顺序（§10.7 页面清单）。 */
export const NAV = [
  { href: '/posts/', label: 'posts' },
  { href: '/notes/', label: 'notes' },
  { href: '/archive/', label: 'archive' },
  { href: '/tags/', label: 'tags' },
  { href: '/about/', label: 'about' },
] as const;

/** 类型 → 链接前缀与显示名（§13.1） */
export const KINDS = {
  posts: { label: '技术', prefix: '/posts/' },
  notes: { label: '随笔', prefix: '/notes/' },
} as const;

export type Kind = keyof typeof KINDS;

/** §13.5：首页与列表页每页 20 篇；归档、标签、搜索不分页 */
export const PAGE_SIZE = 20;
