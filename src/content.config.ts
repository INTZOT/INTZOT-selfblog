import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
// z 要从 zod 直接导入：从 astro:content 导入它是废弃用法
import { z } from 'zod';
import tagList from '../content/tags.json';

/**
 * §13.2：每篇文章是一个目录，正文固定叫 index.md，配图放在同一目录里。
 *
 * 目录名决定链接与类型（§13.1）：
 *   content/posts/rust-bedrock-renderer/index.md  →  /posts/rust-bedrock-renderer/
 *   content/notes/2026-10-06/index.md             →  /notes/2026-10-06/
 *
 * 因此 frontmatter 里**没有 kind 字段**——类型由目录推导，
 * 符合 §12.3「能推导的不问」。少一个字段就少一处填错的机会。
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
    base: './content',
    // tags.json 不在匹配范围内
    pattern: '*/**/index.md',
    // content/posts/foo/index.md → posts/foo
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: articleSchema,
});

export const collections = { articles };
