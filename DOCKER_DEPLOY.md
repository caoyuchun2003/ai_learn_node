# Docker 部署说明

本文档说明如何在已有 Docker nginx 运行的服务器上部署本项目，避免端口和资源冲突。

## 部署架构

- **前端 Nginx**: 运行在 `8080` 端口（避免与现有 nginx 的 80 端口冲突）
- **后端服务**: 运行在 `3001` 端口
- **部署路径**: `/opt/nginx/html/ai/current`
- **容器名称**: 
  - `ai-learning-nginx` (前端)
  - `ai-learning-backend` (后端)

## 避免冲突的设计

### 1. 端口隔离
- 现有 nginx: `80:80`, `443:443`
- 本项目 nginx: `8080:80`, `8443:443`
- 后端: `3001:3001`

### 2. 路径隔离
- 使用独立的部署路径: `/opt/nginx/html/ai/current`
- 独立的日志目录: `/opt/nginx/html/ai/current/docker/logs`
- 独立的配置文件: `/opt/nginx/html/ai/current/docker/`

### 3. 容器名称隔离
- 使用唯一的容器名称，避免与现有容器冲突

### 4. Docker 网络隔离
- 使用独立的 Docker 网络: `ai-learning-network`

## 文件结构

部署后的目录结构：

```
/opt/nginx/html/ai/current/
├── index.html              # 前端入口文件
├── assets/                 # 前端静态资源
├── backend/                # 后端文件
│   ├── dist/              # 后端构建产物
│   ├── prisma/            # 数据库文件
│   ├── Dockerfile         # 后端 Dockerfile
│   └── package.json
└── docker/                # Docker 配置
    ├── docker-compose.yml
    ├── nginx.conf.docker
    └── logs/               # Nginx 日志
```

## 部署步骤

### 1. 通过 Jenkins 自动部署

Jenkins 流水线会自动：
1. 构建前端和后端
2. 打包部署文件
3. 传输到远程服务器
4. 解压并部署
5. 启动 Docker 容器

### 2. 手动部署

如果需要手动部署：

```bash
# 1. 构建项目
npm install
npm run install:all
npm run build

# 2. 创建部署目录
ssh root@180.76.180.105 "mkdir -p /opt/nginx/html/ai/current"

# 3. 传输文件
scp -r frontend/dist/* root@180.76.180.105:/opt/nginx/html/ai/current/
scp -r backend/dist backend/prisma backend/package.json backend/Dockerfile root@180.76.180.105:/opt/nginx/html/ai/current/backend/
scp nginx/docker-compose.production.yml root@180.76.180.105:/opt/nginx/html/ai/current/docker/docker-compose.yml
scp nginx/nginx.conf.docker root@180.76.180.105:/opt/nginx/html/ai/current/docker/nginx.conf.docker

# 4. 在服务器上启动
ssh root@180.76.180.105 << 'ENDSSH'
    cd /opt/nginx/html/ai/current/docker
    docker-compose up -d --build
ENDSSH
```

## 访问地址

- **前端**: http://180.76.180.105:8080
- **后端 API**: http://180.76.180.105:3001
- **健康检查**: http://180.76.180.105:8080/health

## 常用命令

### 查看容器状态

```bash
cd /opt/nginx/html/ai/current/docker
docker-compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看 nginx 日志
docker-compose logs -f nginx

# 查看后端日志
docker-compose logs -f backend
```

### 重启服务

```bash
cd /opt/nginx/html/ai/current/docker
docker-compose restart
```

### 停止服务

```bash
cd /opt/nginx/html/ai/current/docker
docker-compose down
```

### 重新构建并启动

```bash
cd /opt/nginx/html/ai/current/docker
docker-compose up -d --build
```

## 故障排查

### 1. 端口冲突

如果 8080 端口被占用：

```bash
# 检查端口占用
netstat -tulpn | grep 8080
# 或
lsof -i :8080

# 修改 docker-compose.yml 中的端口映射
# 例如改为 8081:80
```

### 2. 容器无法启动

```bash
# 查看容器日志
docker-compose logs

# 检查容器状态
docker ps -a | grep ai-learning

# 检查 Docker 网络
docker network ls
```

### 3. 前端无法访问

```bash
# 检查 nginx 容器是否运行
docker ps | grep ai-learning-nginx

# 检查 nginx 配置
docker exec ai-learning-nginx nginx -t

# 查看 nginx 日志
docker-compose logs nginx
```

### 4. 后端 API 无法访问

```bash
# 检查后端容器是否运行
docker ps | grep ai-learning-backend

# 检查后端日志
docker-compose logs backend

# 测试后端连接
curl http://localhost:3001/api/health
```

### 5. 数据库问题

```bash
# 检查数据库文件权限
ls -la /opt/nginx/html/ai/current/backend/prisma/

# 进入后端容器执行迁移
docker exec -it ai-learning-backend sh
npx prisma migrate deploy
npx prisma generate
```

## 与现有 nginx 集成（可选）

如果希望通过现有 nginx（80 端口）访问本项目，可以在现有 nginx 配置中添加反向代理：

```nginx
# 添加到现有 nginx 配置
location /ai/ {
    proxy_pass http://localhost:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /ai/api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

然后访问：`http://180.76.180.105/ai/`

## 更新部署

每次代码更新后，Jenkins 会自动：
1. 构建新版本
2. 备份旧版本到 `/opt/nginx/html/ai/backup-YYYYMMDD-HHMMSS`
3. 部署新版本
4. 重启 Docker 容器

## 回滚

如果需要回滚到之前的版本：

```bash
ssh root@180.76.180.105 << 'ENDSSH'
    cd /opt/nginx/html/ai
    
    # 查看备份
    ls -la backup-*
    
    # 停止当前容器
    cd current/docker
    docker-compose down
    
    # 恢复备份
    cd /opt/nginx/html/ai
    mv current current-failed
    mv backup-YYYYMMDD-HHMMSS current
    
    # 重启服务
    cd current/docker
    docker-compose up -d
ENDSSH
```

## 安全建议

1. **不要使用 root 用户**: 建议创建专用部署用户
2. **限制端口访问**: 使用防火墙限制 8080 端口的访问来源
3. **定期备份**: 自动备份数据库和配置文件
4. **监控日志**: 设置日志监控和告警
5. **更新镜像**: 定期更新 nginx:alpine 和 node:18-alpine 镜像
