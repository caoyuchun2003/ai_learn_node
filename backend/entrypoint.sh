#!/bin/sh
set -e

echo "🚀 启动后端服务..."

# 生成 Prisma Client（确保最新）
echo "📦 生成 Prisma Client..."
npx prisma generate

# 检查数据库是否存在
if [ ! -f "prisma/dev.db" ]; then
    echo "📦 数据库不存在，执行初始化..."
    echo "🔄 执行数据库迁移..."
    npx prisma migrate deploy
    
    echo "🌱 填充初始数据..."
    npx tsx prisma/seed.ts || echo "⚠️  Seed 执行失败或已存在数据"
else
    echo "🔄 数据库已存在，执行迁移..."
    npx prisma migrate deploy
fi

# 启动应用
echo "✅ 数据库就绪，启动应用..."
exec node dist/index.js
