# Docker 镜像加速器配置

## 问题
无法从 Docker Hub 拉取镜像，出现网络超时错误。

## 解决方案

### 方法一：配置 Docker Desktop 镜像加速器（macOS）

1. 打开 Docker Desktop
2. 点击设置（Settings/Preferences）
3. 选择 Docker Engine
4. 添加以下配置：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

5. 点击 Apply & Restart

### 方法二：使用代理（如果有）

如果有代理，可以在 Docker Desktop 中配置代理：
- Settings → Resources → Proxies
- 配置 HTTP/HTTPS 代理

### 方法三：等待网络恢复

如果网络暂时有问题，可以稍后重试。

## 验证配置

配置完成后，测试拉取镜像：

```bash
docker pull node:18-alpine
```

## 临时解决方案

如果急需启动服务，可以先启动 nginx（已有镜像）：

```bash
cd nginx
docker compose up nginx -d
```

等网络恢复后再启动后端。
