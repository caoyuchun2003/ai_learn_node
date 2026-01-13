#!/bin/bash

# 数据库初始化脚本

echo "🚀 开始初始化数据库..."

# 进入backend目录
cd "$(dirname "$0")/.."

# 生成Prisma Client
echo "📦 生成Prisma Client..."
npm run prisma:generate

# 运行数据库迁移
echo "🗄️  创建数据库和表结构..."
npm run prisma:migrate -- --name init

# 填充初始数据
echo "🌱 填充初始课程数据..."
npm run prisma:seed

echo "✅ 数据库初始化完成！"
echo ""
echo "数据库文件位置: backend/prisma/dev.db"
echo "现在可以运行 'npm run dev' 启动服务器了"
