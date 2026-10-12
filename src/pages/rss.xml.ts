import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../consts';
import { excerptOf, getPublished, urlOf } from '../utils/articles';

export async function GET(context: APIContext) {
  const articles = await getPublished();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.date,
      description: excerptOf(article, 200),
      link: urlOf(article),
    })),
    customData: '<language>zh-cn</language>',
  });
}
