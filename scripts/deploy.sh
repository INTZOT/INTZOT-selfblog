#!/usr/bin/env bash
#
# 本地构建 → rsync 到服务器 → 原子切换 current 软链。
#
# 设计要点（来自 docs/PLANNING.md）：
#   §14.3  推送即发布：产物是纯静态文件，服务器只负责发文件
#   §12.7  失败必须可见：每一步都显式检查退出码。
#          上一轮真实翻过车——构建失败但输出里打印了「Complete」，
#          连续几次部署没生效而无人察觉。这里绝不依赖输出文本判断成败。
#   §13.1  链接永不改变：按时间戳分目录 + 软链切换，回滚是一次软链操作
#
set -euo pipefail

# 这台机器专用，不做参数化——多一层可配置就多一层出错的地方
REMOTE=intzot@intzot.asia
APP_DIR=/srv/intzot.asia
KEEP=5
SSH_KEY=$HOME/.ssh/id_ed25519_intzot

say() { printf '\033[1m==>\033[0m %s\n' "$*"; }
die() { printf '\033[31m错误：\033[0m %s\n' "$*" >&2; exit 1; }

# 远端命令一律用 heredoc 传，不要用双引号字符串——
# 用双引号包住整段远端脚本时，脚本内部的双引号会把外层字符串提前闭合，
# 报出与实际问题完全无关的语法错误（这个坑踩过一次）。
remote() {
  ssh -i "$SSH_KEY" -o BatchMode=yes "$REMOTE" bash -s
}

cd "$(dirname "$0")/.."

# ---------- 1. 构建 ----------
say "构建"
if ! pnpm build; then
  die "构建失败（退出码非零）。注意：输出里出现「Complete」不代表成功。"
fi

[ -f dist/index.html ] || die "dist/index.html 不存在——构建没有产出任何东西。"
say "构建产物：$(find dist -type f | wc -l) 个文件，$(du -sh dist | cut -f1)"

# ---------- 2. 上传 ----------
STAMP=$(date +%Y%m%d-%H%M%S)
TARGET=$APP_DIR/releases/$STAMP

say "上传到 $REMOTE:$TARGET"
remote <<MARK
set -e
mkdir -p '$TARGET'
MARK

# --delete 让每次发布都是干净的产物，不残留上次的文件
# --chmod 保证容器内的进程能读（上一轮踩过 600 权限导致 403）
rsync -az --delete \
  --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
  -e "ssh -i $SSH_KEY -o BatchMode=yes" \
  dist/ "$REMOTE:$TARGET/"

# ---------- 3. 原子切换 ----------
say "切换 current 软链"
remote <<MARK
set -e
cd '$APP_DIR'
ln -sfn 'releases/$STAMP' current.new
mv -Tf current.new current
printf '  current -> %s\n' "\$(readlink current)"
MARK

# ---------- 4. 清理旧版本 ----------
say "保留最近 $KEEP 个版本"
remote <<MARK
cd '$APP_DIR/releases'
ls -1dt */ 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  printf '  删除 %s\n' "\$old"
  rm -rf -- "\$old"
done
exit 0
MARK

# ---------- 5. 复验 ----------
say "复验"
remote <<MARK
set -e
cd '$APP_DIR'
[ -f current/index.html ] || { echo '  ✗ current/index.html 不存在'; exit 1; }
printf '  ✓ 当前版本：%s\n' "\$(readlink current)"
printf '  ✓ 文件数：%s\n' "\$(find -L current -type f | wc -l)"
printf '  ✓ 保留版本数：%s\n' "\$(ls -1d releases/*/ | wc -l)"
MARK

say "完成 → https://intzot.asia"
