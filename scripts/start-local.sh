#!/bin/bash

# 本地 Docker 启动脚本

set -e

echo "=== 检查 Docker ==="
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker daemon 未运行"
    echo "请先启动 Docker Desktop 或 Docker daemon"
    exit 1
fi

echo "Docker 运行正常"
echo ""

# 进入项目根目录
cd "$(dirname "$0")/.."

echo "=== 检查并构建项目 ==="

# 检查前端是否已构建
if [ ! -d "frontend/dist" ] || [ -z "$(ls -A frontend/dist 2>/dev/null)" ]; then
    echo "前端未构建，开始构建..."
    npm install
    npm run install:all
    npm run build --workspace=frontend
else
    echo "前端已构建，跳过..."
fi

# 检查后端是否已构建
if [ ! -d "backend/dist" ] || [ -z "$(ls -A backend/dist 2>/dev/null)" ]; then
    echo "后端未构建，开始构建..."
    cd backend
    npm install
    npm run build
    npm run prisma:generate
    cd ..
else
    echo "后端已构建，跳过..."
fi

echo ""
echo "=== 启动 Docker 容器 ==="
cd nginx

# 检查 docker-compose 命令（支持新版本的 docker compose）
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo "错误: 未找到 docker-compose 或 docker compose 命令"
    exit 1
fi

# 停止旧容器（如果存在）
echo "停止旧容器..."
$COMPOSE_CMD down 2>/dev/null || true

# 创建必要的目录
mkdir -p logs

# 启动容器
echo "启动容器..."
$COMPOSE_CMD up -d --build

echo ""
echo "=== 等待服务启动 ==="
sleep 5

# 检查容器状态
echo "容器状态:"
$COMPOSE_CMD ps

echo ""
echo "=== 服务信息 ==="
echo "前端: http://localhost"
echo "后端 API: http://localhost:3001"
echo ""
echo "查看日志:"
echo "  $COMPOSE_CMD logs -f"
echo ""
echo "停止服务:"
echo "  $COMPOSE_CMD down"
