import { getCollection, type CollectionEntry } from 'astro:content';
import { ARTICLE_PREFIX } from '../consts';

export type Article = CollectionEntry<'articles'>;

/** 文章的 id 就是目录名，也就是链接末段（§13.1） */
export function slugOf(article: Article): string {
  return article.id;
}

/** §13.1：统一为 /articles/<slug>/ */
export function urlOf(article: Article): string {
  return ARTICLE_PREFIX + encodeURI(article.id) + '/';
}

/** 按日期倒序。同日则按目录名排，保证顺序稳定 */
export function sortByDate(list: Article[]): Article[] {
  return [...list].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id),
  );
}

/** §13.3：草稿不进任何列表、归档、标签、订阅 */
export async function getPublished(): Promise<Article[]> {
  return sortByDate(await getCollection('articles', ({ data }) => !data.draft));
}

/** 阅读时长：中文按 350 字/分，拉丁按 200 词/分 */
export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const cjk = (body.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (body.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 200));
}

function firstParagraph(body: string | undefined): string {
  if (!body) return '';
  const skip = ['#', '>', '```', '|', '-', '*', '!', '<'];
  const line = body
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !skip.some((s) => l.startsWith(s)));
  if (!line) return '';
  return line
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim();
}

/** §12.3：摘要留空时从正文首段截取 */
export function excerptOf(article: Article, limit = 80): string {
  const text = article.data.description ?? firstParagraph(article.body);
  return text.length > limit ? text.slice(0, limit) + '…' : text;
}

/** 日期格式：2026-10-12 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

/** 归档里用的短日期：10-12 */
export function formatShortDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return m + '-' + d;
}

/** 标签链接 */
export function tagUrl(tag: string): string {
  return '/tags/' + encodeURIComponent(tag) + '/';
}

/** 全部标签及使用次数，按频次降序（§10.7 标签总览） */
export function countTags(list: Article[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const article of list) {
    for (const tag of article.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/**
 * §13.5 的分页链接规则。
 * base 是第 1 页的地址：'/' 或 '/articles/'；第 2 页起变成 <base>page/N/。
 * 用固定的 page 段而不是 /articles/2/，避免和文章目录名撞车。
 */
export function pageUrl(base: string, page: number): string {
  return page <= 1 ? base : base + 'page/' + page + '/';
}

/** 文章页的系列上下文；不属于任何系列或系列只有一篇时返回 null */
export function seriesNav(all: Article[], article: Article) {
  const name = article.data.series;
  if (!name) return null;

  const inSeries = all
    .filter((a) => a.data.series === name)
    .sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf() || a.id.localeCompare(b.id));
  if (inSeries.length < 2) return null;

  const index = inSeries.findIndex((a) => a.id === article.id);
  if (index === -1) return null;

  const prev = index > 0 ? inSeries[index - 1] : null;
  const next = index < inSeries.length - 1 ? inSeries[index + 1] : null;

  return {
    name,
    index: index + 1,
    total: inSeries.length,
    prev: prev ? { url: urlOf(prev), title: prev.data.title } : null,
    next: next ? { url: urlOf(next), title: next.data.title } : null,
  };
}
