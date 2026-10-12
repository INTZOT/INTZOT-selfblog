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

/**
 * 导航。顺序即显示顺序。
 *
 * §13.1（2026-10-12 修订）：原来的 posts / notes / archive 三项统一成「文章」。
 * 类型（技术 / 随笔）降为普通标签，不再占导航层级。
 */
export const NAV = [
  { href: '/articles/', label: '文章' },
  { href: '/archive/', label: '归档' },
  { href: '/tags/', label: '标签' },
  { href: '/search/', label: '搜索' },
  { href: '/about/', label: '关于' },
] as const;

/** 全部文章的统一链接前缀（§13.1） */
export const ARTICLE_PREFIX = '/articles/';

/** §13.5：列表页每页 20 篇；归档、标签、搜索不分页 */
export const PAGE_SIZE = 20;

/** 表达「类型」的保留标签。它们和普通标签同级，只是语义上表示内容体裁。 */
export const KIND_TAGS = ['技术', '随笔'] as const;
