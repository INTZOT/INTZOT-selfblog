import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://intzot.asia',

  // §13.1：链接永不改变。/posts/<slug>/ 是唯一规范形式，
  // 不带尾斜杠的访问由服务器 301 过来，不让同一个页面有两个地址。
  trailingSlash: 'always',
  build: { format: 'directory' },

  integrations: [sitemap()],

  markdown: {
    // §4.3 把数学公式列为「可能需要」。接上它的代价只有约 6KB gzip 的 CSS，
    // 而 KaTeX 的字体只在实际出现公式时才被下载。
    //
    // 写法注意：Astro 7 起默认处理器是 Sätteri，插件要交给 unified 处理器。
    // 直接写 markdown.remarkPlugins 还能跑，但会报废弃警告。
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { throwOnError: false, strict: false, output: 'html' }]],
    }),

    // 深浅两套代码配色，跟随系统（§10.7）
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
