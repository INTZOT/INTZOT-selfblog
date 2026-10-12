import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
// z 要从 zod 直接导入：从 astro:content 导入它是废弃用法
import { z } from 'zod';
import tagList from '../content/tags.json';

/**
 * §13.2：每篇文章是一个目录，正文固定叫 index.md，配图放在同一目录里。
 *
 *   content/articles/rust-bedrock-renderer/index.md  →  /articles/rust-bedrock-renderer/
 *
 * §13.1（2026-10-12 修订）：链接前缀统一为 /articles/，
 * **类型（技术 / 随笔）不再决定链接**，它就是一个普通标签。
 */
const articleSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string().min(1, '标题不能为空'),

    /** 默认取发布时刻，补写旧文时可改（§13.6） */
    date: z.coerce.date(),

    /** 留空时从正文首段截取（§12.3） */
    description: z.string().optional(),

    /** §13.4：标签必须来自 content/tags.json，防止 rust / Rust 分裂成两个 */
    tags: z
      .array(z.string())
      .default([])
      .refine((list) => list.every((tag) => (tagList as string[]).includes(tag)), {
        message:
          '标签必须是 content/tags.json 里已有的。新增标签请先把它加进那个文件（§13.4）',
      }),

    /** §10.7：封面可选。有就用，没有就不放——不为凑图而放图 */
    cover: image().optional(),

    series: z.string().optional(),

    /** §13.3：草稿不生成页面，也不出现在任何列表、归档、标签、订阅里 */
    draft: z.boolean().default(false),
  });

const articles = defineCollection({
  loader: glob({
    base: './content/articles',
    pattern: '*/index.md',
    // <slug>/index.md → <slug>，文章的 id 就是它的链接末段
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: articleSchema,
});

/**
 * 单页内容。目前只有「关于」——它的正文是可编辑的 Markdown，
 * 读者看到的那些文字不该埋在模板里。
 */
const pages = defineCollection({
  loader: glob({ base: './content', pattern: '*.md' }),
  schema: z.object({
    title: z.string().default('关于'),
  }),
});

export const collections = { articles, pages };
