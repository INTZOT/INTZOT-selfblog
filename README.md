# INTZOT-selfblog

面向国内读者的中文个人博客：技术笔记与生活随笔并置。

**动手之前先读 [docs/PLANNING.md](docs/PLANNING.md)。** 那份文档记录了 18 条决策和它们的理由——
上一轮返工三次的根本原因是「要一个什么样的博客」从来没有被写下来过，不要重蹈。

## 写一篇文章

一篇文章是一个目录，正文固定叫 index.md，配图放在同一个目录里（决策 §13.2）：

    content/posts/rust-bedrock-renderer/
      index.md          ← 正文与元数据
      cover.jpg         ← 封面，可选
      render-chart.png  ← 正文配图

    content/notes/2026-10-06/
      index.md

**目录名就是链接，类型由目录推导**（决策 §13.1）：

| 放在哪 | 链接 | 类型 |
|---|---|---|
| content/posts/<目录名>/ | /posts/<目录名>/ | 技术 |
| content/notes/<目录名>/ | /notes/<目录名>/ | 随笔 |

frontmatter 里**没有 kind 字段**——类型由目录决定，少一个填错的机会。

> **发布之后不要改目录名，也不要换目录。** 目录名就是链接，改了等于让所有已分享的地址失效。

frontmatter 的完整字段见 [docs/template.md](docs/template.md)。

## 本地开发

    pnpm install
    pnpm dev        # 开发服务器；注意搜索在开发模式下不可用（索引只存在于构建产物里）
    pnpm check      # 类型检查
    pnpm build      # 构建到 dist/，并生成搜索索引
    pnpm preview    # 预览构建产物

## 两个写作入口

本地编辑器和 GitHub 自带的网页编辑器（含 github.dev），两者操作的是同一个仓库——
所以「同一份内容」是天然成立的，不需要靠纪律维持（决策 §12.5）。

## 目录结构

    content/          文章与标签清单，作者日常只碰这里
      posts/          技术
      notes/          随笔
      tags.json       标签清单，新增标签要先加到这里（决策 §13.4）
    docs/             需求与规划文档
    samples/          视觉样例，只用于当初确定方向，实现不沿用
    scripts/          构建辅助
    src/              站点实现
      components/     组件
      layouts/        布局
      pages/          路由
      styles/         tokens.css 是设计令牌，规格见 §10.7
      utils/          文章查询与格式化
    public/           原样拷贝的静态文件

## 部署

推送即发布（决策 §14.3）。生成与部署由 CI 完成，产物是纯静态文件。

**判断成功要看退出状态，不是看输出里有没有好看的字。** 这一点有真实教训，见 §12.7。
