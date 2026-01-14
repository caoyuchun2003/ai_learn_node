#!/bin/bash

# 部署脚本 - 在远程服务器上执行
# 用法: ./deploy.sh <部署目录>

set -e

DEPLOY_DIR=${1:-/opt/nginx/html/ai/current}
BACKEND_DIR="$DEPLOY_DIR/backend"

echo "开始部署到: $DEPLOY_DIR"

# 检查部署目录是否存在
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "错误: 部署目录不存在: $DEPLOY_DIR"
    exit 1
fi

# 进入后端目录
cd "$BACKEND_DIR" || exit 1

# 安装后端依赖（仅生产依赖）
if [ -f "package.json" ]; then
    echo "安装后端依赖..."
    npm ci --production || npm install --production
fi

# 初始化数据库（如果需要）
if [ -d "prisma" ]; then
    echo "初始化数据库..."
    # 检查数据库文件是否存在
    if [ ! -f "prisma/dev.db" ]; then
        echo "数据库不存在，执行迁移..."
        npx prisma migrate deploy || npx prisma migrate dev
        npx prisma generate
        # 如果有 seed 文件，执行 seed
        if [ -f "prisma/seed.ts" ]; then
            npx tsx prisma/seed.ts || echo "Seed 执行失败或已存在数据"
        fi
    else
        echo "数据库已存在，执行迁移..."
        npx prisma migrate deploy || npx prisma migrate dev
        npx prisma generate
    fi
fi

# 设置文件权限
echo "设置文件权限..."
chmod +x dist/index.js 2>/dev/null || true

echo "部署脚本执行完成！"
echo "部署目录: $DEPLOY_DIR"
echo "前端文件: $DEPLOY_DIR"
echo "后端文件: $BACKEND_DIR"
