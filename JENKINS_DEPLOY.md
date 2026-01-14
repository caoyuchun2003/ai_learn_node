# Jenkins 部署配置说明

本文档说明如何通过 Jenkins 将项目部署到远程服务器 `180.76.180.105` 的 `/opt/nginx/html/ai` 目录。

## 前置要求

### 1. Jenkins 服务器要求
- Jenkins 已安装并运行
- 安装了必要的插件：
  - Pipeline 插件
  - SSH Pipeline Steps 插件（可选，用于更好的 SSH 支持）
- Node.js 和 npm 已安装（用于构建）

### 2. 远程服务器要求
- 服务器 IP: `180.76.180.105`
- 部署目录: `/opt/nginx/html/ai`
- 需要安装：
  - Node.js (推荐 v18+)
  - npm
  - nginx
  - PM2（用于管理后端进程，可选）

### 3. SSH 配置
确保 Jenkins 服务器可以通过 SSH 无密码登录到远程服务器：

```bash
# 在 Jenkins 服务器上生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096

# 将公钥复制到远程服务器
ssh-copy-id root@180.76.180.105

# 测试连接
ssh root@180.76.180.105
```

或者在 Jenkins 中配置 SSH 凭据：
1. 进入 Jenkins → 系统管理 → 凭据管理
2. 添加 SSH 凭据
3. 在 Jenkinsfile 中使用 `SSH_CREDENTIALS` 环境变量

## Jenkins 配置步骤

### 1. 创建 Pipeline 任务

1. 在 Jenkins 中创建新任务
2. 选择 "流水线" (Pipeline) 类型
3. 在 "流水线" 配置中：
   - **定义**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: 你的 Git 仓库地址
   - **脚本路径**: Jenkinsfile

### 2. 配置环境变量（可选）

如果需要修改默认配置，可以在 Jenkinsfile 中修改 `environment` 部分：

```groovy
environment {
    DEPLOY_HOST = '180.76.180.105'
    DEPLOY_USER = 'root'  // 根据实际情况修改
    DEPLOY_PATH = '/opt/nginx/html/ai'
}
```

### 3. 配置 SSH 凭据（推荐）

如果使用 SSH 凭据而不是密钥文件：

1. 在 Jenkins 中添加 SSH 凭据（ID: `deploy-ssh-key`）
2. 修改 Jenkinsfile 中的部署步骤，使用 `withCredentials`：

```groovy
withCredentials([sshUserPrivateKey(credentialsId: 'deploy-ssh-key', keyFileVariable: 'SSH_KEY')]) {
    sh '''
        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} ...
    '''
}
```

## 部署流程

Jenkins 流水线将执行以下步骤：

1. **Checkout**: 检出代码
2. **Install Dependencies**: 安装所有依赖
3. **Build Frontend**: 构建前端（生成 `frontend/dist`）
4. **Build Backend**: 构建后端（生成 `backend/dist`）
5. **Prepare Deployment Package**: 打包部署文件
6. **Deploy to Remote Server**: 
   - 传输文件到远程服务器
   - 解压并部署到 `/opt/nginx/html/ai/current`
   - 备份旧版本
7. **Restart Services**: 重启后端服务和 nginx

## 远程服务器配置

### 1. 创建部署目录

```bash
sudo mkdir -p /opt/nginx/html/ai
sudo chown -R $USER:$USER /opt/nginx/html/ai
```

### 2. 配置 Nginx

将 `nginx/nginx.conf` 复制到系统 nginx 配置目录：

```bash
# Ubuntu/Debian
sudo cp /opt/nginx/html/ai/current/nginx/nginx.conf /etc/nginx/sites-available/ai-learning-platform
sudo ln -s /etc/nginx/sites-available/ai-learning-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**注意**: 需要修改 nginx.conf 中的前端文件路径：

```nginx
location / {
    root /opt/nginx/html/ai/current;  # 修改这里
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

### 3. 配置后端服务

#### 使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
cd /opt/nginx/html/ai/current/backend
pm2 start dist/index.js --name ai-learning-backend
pm2 save
pm2 startup  # 设置开机自启
```

#### 使用 systemd

创建 systemd 服务文件 `/etc/systemd/system/ai-learning-backend.service`:

```ini
[Unit]
Description=AI Learning Platform Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/nginx/html/ai/current/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

然后启用服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-learning-backend
sudo systemctl start ai-learning-backend
```

## 手动部署（测试）

如果需要手动测试部署流程：

```bash
# 1. 构建项目
npm install
npm run install:all
npm run build

# 2. 创建部署包
mkdir -p deploy-package
cp -r frontend/dist deploy-package/frontend-dist
cp -r backend/dist deploy-package/backend/dist
cp -r backend/prisma deploy-package/backend/prisma
cp backend/package.json deploy-package/backend/
cp nginx/nginx.conf deploy-package/nginx/
cp scripts/deploy.sh deploy-package/
tar -czf deploy-package.tar.gz deploy-package/

# 3. 传输到远程服务器
scp deploy-package.tar.gz root@180.76.180.105:/tmp/

# 4. 在远程服务器上执行
ssh root@180.76.180.105
cd /tmp
tar -xzf deploy-package.tar.gz
mkdir -p /opt/nginx/html/ai/current
cp -r deploy-package/frontend-dist/* /opt/nginx/html/ai/current/
cp -r deploy-package/backend /opt/nginx/html/ai/current/
bash deploy-package/deploy.sh /opt/nginx/html/ai/current
```

## 故障排查

### 1. SSH 连接失败

- 检查网络连接
- 确认 SSH 密钥配置正确
- 检查防火墙设置

### 2. 构建失败

- 检查 Node.js 版本
- 确认所有依赖已安装
- 查看 Jenkins 构建日志

### 3. 部署后服务无法访问

- 检查 nginx 配置是否正确
- 确认后端服务是否运行：`pm2 list` 或 `systemctl status ai-learning-backend`
- 检查端口是否被占用：`netstat -tulpn | grep 3001`
- 查看日志：`pm2 logs ai-learning-backend` 或 `journalctl -u ai-learning-backend`

### 4. 数据库问题

- 确认数据库文件权限
- 检查 Prisma 迁移是否成功
- 查看数据库文件：`ls -la /opt/nginx/html/ai/current/backend/prisma/`

## 安全建议

1. **不要使用 root 用户**: 建议创建专用部署用户
2. **使用 SSH 密钥**: 避免使用密码认证
3. **限制 SSH 访问**: 使用防火墙限制 SSH 访问来源
4. **定期备份**: 自动备份数据库和配置文件
5. **监控日志**: 设置日志监控和告警

## 更新部署

每次代码更新后，只需在 Jenkins 中触发构建即可。Jenkins 会自动：
- 构建最新代码
- 部署到远程服务器
- 备份旧版本
- 重启服务

## 回滚

如果需要回滚到之前的版本：

```bash
ssh root@180.76.180.105
cd /opt/nginx/html/ai
# 查看备份目录
ls -la backup-*
# 恢复备份
mv current current-failed
mv backup-YYYYMMDD-HHMMSS current
# 重启服务
pm2 restart ai-learning-backend
nginx -s reload
```
