# Jenkins Docker 构建配置说明

本文档说明如何在 Jenkins 中使用 Docker 容器执行构建和部署。

## Jenkins Docker 支持

Jenkins 支持在 Docker 容器中执行构建步骤，这提供了以下优势：

1. **环境隔离**: 每次构建都在干净的容器环境中执行
2. **版本一致性**: 使用固定版本的 Node.js，避免环境差异
3. **易于维护**: 不需要在 Jenkins 服务器上安装 Node.js
4. **可移植性**: 构建环境与代码一起定义

## 前置要求

### 1. 安装 Jenkins Docker 插件

在 Jenkins 中安装以下插件：
- **Docker Pipeline** (推荐)
- **Docker** (可选，用于 Docker 命令支持)

安装步骤：
1. 进入 Jenkins → 系统管理 → 插件管理
2. 搜索 "Docker Pipeline"
3. 安装并重启 Jenkins

### 2. 配置 Docker

确保 Jenkins 服务器可以访问 Docker：

```bash
# 检查 Docker 是否运行
docker ps

# 确保 Jenkins 用户有权限访问 Docker socket
# 方法1: 将 Jenkins 用户添加到 docker 组
sudo usermod -aG docker jenkins

# 方法2: 修改 Docker socket 权限（不推荐，安全风险）
sudo chmod 666 /var/run/docker.sock
```

### 3. 测试 Docker 访问

在 Jenkins 中创建一个测试 Pipeline：

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

## 两种 Jenkinsfile 配置

### 方式一：完全 Docker 化（推荐）

使用 `Jenkinsfile.docker`，所有构建步骤都在 Docker 容器中执行：

```groovy
stage('Build in Docker') {
    steps {
        script {
            def nodeImage = docker.image("node:18")
            nodeImage.inside('-v /var/run/docker.sock:/var/run/docker.sock') {
                sh '''
                    npm install
                    npm run build
                '''
            }
        }
    }
}
```

**优点**:
- 完全隔离的构建环境
- 不依赖 Jenkins 服务器的 Node.js 版本
- 每次构建都是干净的环境

**缺点**:
- 需要 Docker Pipeline 插件
- 首次构建需要下载 Docker 镜像

### 方式二：混合模式（当前 Jenkinsfile）

部分步骤在 Docker 中，部分在主机上：

```groovy
stage('Build in Docker') {
    steps {
        script {
            def nodeImage = docker.image("node:18")
            nodeImage.inside() {
                sh 'npm run build'
            }
        }
    }
}
```

## 使用 Docker 构建的 Jenkinsfile

项目提供了两个版本的 Jenkinsfile：

1. **Jenkinsfile** - 当前版本，支持 Docker 构建
2. **Jenkinsfile.docker** - 完全 Docker 化版本

### 切换到 Docker 版本

如果需要使用完全 Docker 化的版本：

```bash
# 备份当前版本
cp Jenkinsfile Jenkinsfile.original

# 使用 Docker 版本
cp Jenkinsfile.docker Jenkinsfile
```

或者在 Jenkins 中直接指定文件路径：
- Pipeline script from SCM
- Script Path: `Jenkinsfile.docker`

## Docker 构建配置说明

### 1. Node.js 版本

在 Jenkinsfile 中指定 Node.js 版本：

```groovy
environment {
    NODE_VERSION = '18'  // 或 '20', '18-alpine' 等
}
```

### 2. Docker Socket 挂载

如果需要构建 Docker 镜像，需要挂载 Docker socket：

```groovy
nodeImage.inside('-v /var/run/docker.sock:/var/run/docker.sock') {
    // 可以在这里执行 docker build 等命令
}
```

### 3. Volume 挂载

如果需要持久化构建产物，可以挂载卷：

```groovy
nodeImage.inside('-v /workspace:/workspace') {
    // 构建产物会保留在 /workspace
}
```

## 常见问题

### 1. Docker 命令未找到

**错误**: `docker: command not found`

**解决**: 
- 确保安装了 Docker Pipeline 插件
- 检查 Jenkins 用户是否有 Docker 访问权限

### 2. 权限 denied

**错误**: `permission denied while trying to connect to the Docker daemon socket`

**解决**:
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 3. 镜像拉取失败

**错误**: `Error pulling image`

**解决**:
- 检查网络连接
- 配置 Docker 镜像加速器
- 使用国内镜像源（如阿里云）

### 4. 构建产物丢失

**问题**: Docker 容器退出后，构建产物丢失

**解决**: 
- Jenkins 会自动将工作目录挂载到容器中
- 确保构建产物在 `$WORKSPACE` 目录下
- 使用 `docker.inside()` 会自动处理工作目录

## 性能优化

### 1. 使用 Docker 镜像缓存

Jenkins 会自动缓存 Docker 镜像，但可以手动拉取：

```groovy
stage('Pull Docker Image') {
    steps {
        script {
            docker.image('node:18').pull()
        }
    }
}
```

### 2. 使用 Alpine 镜像

使用更小的 Alpine 镜像可以加快拉取速度：

```groovy
def nodeImage = docker.image("node:18-alpine")
```

### 3. 并行构建

可以在不同的 Docker 容器中并行构建前端和后端：

```groovy
stage('Parallel Build') {
    parallel {
        stage('Build Frontend') {
            steps {
                script {
                    docker.image('node:18').inside() {
                        sh 'npm run build --workspace=frontend'
                    }
                }
            }
        }
        stage('Build Backend') {
            steps {
                script {
                    docker.image('node:18').inside() {
                        sh 'cd backend && npm run build'
                    }
                }
            }
        }
    }
}
```

## 最佳实践

1. **固定版本**: 使用具体的 Node.js 版本标签（如 `node:18`），避免使用 `latest`
2. **缓存依赖**: 使用 npm cache 或 Docker layer caching
3. **清理资源**: 在 `post` 阶段清理 Docker 资源
4. **错误处理**: 添加错误处理和日志记录
5. **安全扫描**: 定期扫描 Docker 镜像的安全漏洞

## 示例：完整的 Docker 构建 Pipeline

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        DOCKER_REGISTRY = 'your-registry.com'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                script {
                    def nodeImage = docker.image("node:${NODE_VERSION}")
                    nodeImage.inside() {
                        sh '''
                            npm ci
                            npm run build
                        '''
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    docker.image("node:${NODE_VERSION}").inside() {
                        sh 'npm test'
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("myapp:${env.BUILD_NUMBER}")
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker system prune -f'
        }
    }
}
```

## 总结

使用 Docker 构建的优势：
- ✅ 环境一致性
- ✅ 易于维护
- ✅ 可移植性
- ✅ 隔离性

当前项目已支持 Docker 构建，只需确保 Jenkins 安装了 Docker Pipeline 插件即可使用。
