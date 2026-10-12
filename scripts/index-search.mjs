#!/usr/bin/env node
/**
 * 给 Pagefind 包一层（§14.4 客户端搜索）。
 *
 * 原因：Pagefind 在「一个可索引页面都没有」时会以退出码 1 结束，它把这当成错误。
 * 但一个刚建好、还没有文章的博客是合法状态，不该让整个构建失败。
 *
 * 上一轮真实踩过这个坑：删空文章后 pnpm build 一直失败，部署脚本因为有 set -e
 * 直接中止，连续几次部署都没生效——而输出里看着像是成功的（§12.7 的由来）。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const DIST = 'dist';

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (name.endsWith('.html')) out.push(path);
  }
  return out;
}

if (!statSync(DIST, { throwIfNoEntry: false })) {
  console.error('[search] dist/ 不存在——构建没有产出任何东西。');
  process.exit(1);
}

const indexable = walk(DIST).filter((file) => readFileSync(file, 'utf8').includes('data-pagefind-body'));

if (indexable.length === 0) {
  console.log('[search] 没有可索引的页面（还没有文章），跳过 Pagefind。');
  process.exit(0);
}

console.log('[search] 索引 ' + indexable.length + ' 个页面…');
const result = spawnSync('node_modules/.bin/pagefind', ['--site', DIST], { stdio: 'inherit' });
process.exit(result.status ?? 1);
