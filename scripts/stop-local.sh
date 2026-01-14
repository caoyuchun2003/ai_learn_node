#!/bin/bash

# 停止本地 Docker 服务

cd "$(dirname "$0")/../nginx"

# 检查 docker-compose 命令
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo "错误: 未找到 docker-compose 或 docker compose 命令"
    exit 1
fi

echo "停止 Docker 容器..."
$COMPOSE_CMD down

echo "服务已停止"
