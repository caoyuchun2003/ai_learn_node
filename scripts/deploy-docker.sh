#!/bin/bash

# Docker 部署脚本 - 在远程服务器上执行
# 用法: ./deploy-docker.sh <部署目录>

set -e

DEPLOY_DIR=${1:-/opt/nginx/html/ai/current}
DOCKER_DIR="$DEPLOY_DIR/docker"

echo "开始 Docker 部署到: $DEPLOY_DIR"

# 检查部署目录是否存在
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "错误: 部署目录不存在: $DEPLOY_DIR"
    exit 1
fi

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "错误: docker-compose 未安装"
    exit 1
fi

# 检查 docker-compose 命令（支持新版本的 docker compose）
COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

# 进入 Docker 目录
if [ ! -d "$DOCKER_DIR" ]; then
    echo "错误: Docker 配置目录不存在: $DOCKER_DIR"
    exit 1
fi

cd "$DOCKER_DIR" || exit 1

# 停止旧容器（如果存在）
echo "停止旧容器..."
$COMPOSE_CMD down || true

# 构建并启动服务
echo "构建并启动 Docker 服务..."
$COMPOSE_CMD up -d --build

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 检查服务状态
echo "检查服务状态..."
$COMPOSE_CMD ps

# 检查容器健康状态
echo "检查容器健康状态..."
if docker ps | grep -q ai-learning-nginx; then
    echo "✅ Nginx 容器运行中"
else
    echo "❌ Nginx 容器未运行"
    exit 1
fi

if docker ps | grep -q ai-learning-backend; then
    echo "✅ Backend 容器运行中"
else
    echo "❌ Backend 容器未运行"
    exit 1
fi

echo ""
echo "=========================================="
echo "Docker 部署完成！"
echo "=========================================="
echo "前端访问: http://180.76.180.105:8080"
echo "后端 API: http://180.76.180.105:3001"
echo "健康检查: http://180.76.180.105:8080/health"
echo "=========================================="
