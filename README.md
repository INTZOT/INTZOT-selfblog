# INTZOT-selfblog

面向国内读者的中文个人博客：技术笔记与生活随笔并置。线上地址 https://intzot.asia

**动手之前先读 [docs/PLANNING.md](docs/PLANNING.md)。** 那份文档记录了 19 条决策和它们的理由——
上一轮返工三次的根本原因是「要一个什么样的博客」从来没有被写下来过，不要重蹈。

## 写一篇文章

一篇文章是一个目录，正文固定叫 index.md，配图放在同一个目录里（决策 §13.2）：

    content/articles/rust-bedrock-renderer/
      index.md          ← 正文与元数据
      cover.jpg         ← 封面，可选
      render-chart.png  ← 正文配图

**目录名就是链接**（决策 §13.1）：

    content/articles/<目录名>/   →   /articles/<目录名>/

> **发布之后不要改目录名。** 目录名就是链接，改名等于让所有已分享的地址失效。

**类型用标签表达，不再有单独的目录。** 技术笔记写「技术」标签，生活随笔写「随笔」标签。
想看某一类，点标签即可（/tags/技术/）。这样改类型不会动到链接。

frontmatter 的完整字段见 [docs/template.md](docs/template.md)。

## 本地开发

    pnpm install
    pnpm dev        # 开发服务器；搜索在开发模式下不可用（索引只存在于构建产物里）
    pnpm check      # 类型检查
    pnpm build      # 构建到 dist/，并生成搜索索引
    pnpm preview    # 预览构建产物

## 发布

    bash scripts/deploy.sh

构建 → rsync 到服务器 → 原子切换软链 → 保留 5 个版本。

**判断成功要看退出状态，不是看输出里有没有好看的字。** 这一点有真实教训，见 §12.7。

部署目标：/srv/intzot.asia/releases/<时间戳>/ + current 软链，由服务器上已有的一台 caddy
（属于另一个项目）提供服务。接入细节见 deploy/caddy.intzot.asia.conf 与 §14.7。

## 两个写作入口

本地编辑器和 GitHub 自带的网页编辑器（含 github.dev），两者操作的是同一个仓库——
所以「同一份内容」是天然成立的，不需要靠纪律维持（决策 §12.5）。

## 目录结构

    content/          作者日常只碰这里
      articles/       全部文章，一篇一个目录
      tags.json       标签清单，新增标签要先加到这里（决策 §13.4）
    docs/             需求与规划文档
    samples/          视觉样例，只用于当初确定方向，实现不沿用
    scripts/          构建与发布辅助
    src/              站点实现
      components/     组件
      layouts/        布局
      pages/          路由
      styles/         tokens.css 是设计令牌，规格见 §10.7
      utils/          文章查询与格式化
    public/           原样拷贝的静态文件
