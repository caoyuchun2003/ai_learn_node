# Jenkins Docker Pipeline 插件安装指南

## 安装步骤

### 1. 进入 Jenkins 插件管理

1. 登录 Jenkins
2. 点击 **系统管理** (Manage Jenkins)
3. 点击 **插件管理** (Manage Plugins)

### 2. 安装 Docker Pipeline 插件

#### 方式一：通过界面安装（推荐）

1. 在插件管理页面，点击 **可选插件** (Available)
2. 在搜索框输入 `Docker Pipeline`
3. 找到 **Docker Pipeline** 插件
4. 勾选插件
5. 点击 **直接安装** (Install without restart) 或 **下载待重启后安装** (Download now and install after restart)
6. 等待安装完成
7. 如果提示重启，点击 **重启 Jenkins** (Restart Jenkins)

#### 方式二：通过命令行安装

```bash
# 在 Jenkins 服务器上执行
jenkins-plugin-cli install docker-workflow
```

### 3. 验证安装

安装完成后，可以通过以下方式验证：

#### 方式一：在 Jenkins 中测试

创建一个测试 Pipeline：

```groovy
pipeline {
    agent any
    stages {
        stage('Test Docker') {
            steps {
                script {
                    def nodeImage = docker.image("node:18")
                    nodeImage.inside() {
                        sh 'node --version'
                    }
                }
            }
        }
    }
}
```

如果能够成功执行，说明插件安装成功。

#### 方式二：检查插件列表

1. 进入 **系统管理** → **插件管理** → **已安装**
2. 搜索 `Docker Pipeline`
3. 确认插件已安装并启用

## 配置 Docker 访问权限

### 1. 确保 Docker 服务运行

```bash
# 检查 Docker 状态
sudo systemctl status docker

# 如果未运行，启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 配置 Jenkins 用户权限

```bash
# 将 Jenkins 用户添加到 docker 组
sudo usermod -aG docker jenkins

# 重启 Jenkins
sudo systemctl restart jenkins
```

### 3. 验证 Docker 访问

```bash
# 切换到 Jenkins 用户测试
sudo -u jenkins docker ps

# 如果成功，说明权限配置正确
```

## 常见问题

### 1. 插件安装失败

**问题**: 插件下载失败或安装超时

**解决**:
- 检查网络连接
- 更换 Jenkins 更新中心镜像源
- 手动下载插件并上传安装

### 2. Docker 命令权限被拒绝

**错误**: `permission denied while trying to connect to the Docker daemon socket`

**解决**:
```bash
# 将 Jenkins 用户添加到 docker 组
sudo usermod -aG docker jenkins

# 重启 Jenkins
sudo systemctl restart jenkins
```

### 3. Docker 镜像拉取失败

**错误**: `Error pulling image`

**解决**:
- 检查网络连接
- 配置 Docker 镜像加速器（如阿里云、腾讯云）
- 手动拉取镜像：`docker pull node:18`

### 4. 插件已安装但 docker 对象不可用

**问题**: 安装插件后仍然报错 `No such property: docker`

**解决**:
1. 确认插件已启用（插件管理 → 已安装 → 检查状态）
2. 重启 Jenkins
3. 检查 Jenkins 日志：`/var/log/jenkins/jenkins.log`

## 安装后的效果

安装 Docker Pipeline 插件后：

1. ✅ **可以使用 `docker.image()` 方法**
   ```groovy
   def nodeImage = docker.image("node:18")
   ```

2. ✅ **可以在容器中执行构建**
   ```groovy
   nodeImage.inside() {
       sh 'npm install'
   }
   ```

3. ✅ **可以构建 Docker 镜像**
   ```groovy
   docker.build("myapp:${env.BUILD_NUMBER}")
   ```

4. ✅ **可以推送镜像到仓库**
   ```groovy
   docker.image("myapp:${env.BUILD_NUMBER}").push()
   ```

## 当前 Jenkinsfile 说明

当前 Jenkinsfile 已经配置了 Docker 构建：

```groovy
stage('Build') {
    steps {
        script {
            try {
                def nodeImage = docker.image("node:18")
                nodeImage.inside() {
                    // 构建步骤
                }
            } catch (Exception e) {
                // 回退到主机构建
            }
        }
    }
}
```

**特点**:
- 优先使用 Docker 构建（环境隔离）
- 如果 Docker 插件不可用，自动回退到主机构建
- 确保在任何情况下都能正常构建

## 推荐配置

安装插件后，建议：

1. **固定 Node.js 版本**: 使用 `node:18` 而不是 `node:latest`
2. **使用 Alpine 镜像**: 更小的镜像体积，如 `node:18-alpine`
3. **缓存依赖**: 使用 Docker layer caching 加速构建
4. **定期更新镜像**: 定期拉取最新的基础镜像

## 测试构建

安装插件后，可以运行一次构建测试：

1. 在 Jenkins 中触发构建
2. 查看构建日志，应该看到：
   ```
   使用 Docker 容器构建...
   在 Docker 容器中构建...
   ```
3. 如果看到这些日志，说明 Docker 构建正常工作

## 总结

安装 **Docker Pipeline** 插件后，Jenkinsfile 中的 Docker 构建功能就可以正常使用了。插件提供了：
- Docker 镜像管理
- 容器内执行命令
- Docker 镜像构建和推送
- 完整的 Docker 集成

安装完成后，重新运行构建即可！
