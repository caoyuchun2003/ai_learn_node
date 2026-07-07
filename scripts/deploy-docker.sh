#!/bin/bash

# 统一网关部署脚本 - 仅启动后端，前端由主 Nginx /ai/ 托管
# 用法: ./deploy-docker.sh [部署目录]

set -e

DEPLOY_DIR=${1:-/opt/apps/ai-learning}
DOCKER_DIR="$DEPLOY_DIR/docker"

echo "开始后端容器部署: $DEPLOY_DIR"

if [ ! -d "$DEPLOY_DIR/backend" ]; then
    echo "错误: 后端目录不存在: $DEPLOY_DIR/backend"
    exit 1
fi

CONTAINER_CMD=""
COMPOSE_CMD=""

if command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    if command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
    elif podman compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="podman compose"
    else
        echo "错误: podman-compose 未安装"
        exit 1
    fi
elif command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        echo "错误: docker-compose 未安装"
        exit 1
    fi
else
    echo "错误: 未找到 Podman 或 Docker"
    exit 1
fi

# 清理旧版独立 nginx 容器（8080 端口方案）
if $CONTAINER_CMD ps -a --format '{{.Names}}' | grep -qx 'ai-learning-nginx'; then
    echo "停止并移除旧版 ai-learning-nginx 容器..."
    $CONTAINER_CMD rm -f ai-learning-nginx || true
fi

mkdir -p "$DOCKER_DIR"
COMPOSE_FILE="$DOCKER_DIR/docker-compose.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "错误: 未找到 $COMPOSE_FILE"
    exit 1
fi

cd "$DOCKER_DIR" || exit 1
echo "使用 Compose: $COMPOSE_FILE"
$COMPOSE_CMD down || true
$COMPOSE_CMD up -d --build

echo "等待后端启动..."
sleep 5
$COMPOSE_CMD ps

if curl -sf "http://127.0.0.1:13001/api/health" >/dev/null; then
    echo "✅ 后端健康检查通过"
else
    echo "❌ 后端健康检查失败"
    $CONTAINER_CMD logs ai-learning-backend --tail 50 || true
    exit 1
fi

echo "=========================================="
echo "AI 学习系统部署完成（统一网关模式）"
echo "前端: http://180.76.180.105/ai/"
echo "API:  http://180.76.180.105/ai/api/"
echo "=========================================="
