pipeline {
    agent any
    
    environment {
        // 远程服务器配置
        DEPLOY_HOST = '180.76.180.105'
        DEPLOY_USER = 'root'  // 根据实际情况修改用户名
        DEPLOY_PATH = '/opt/nginx/html/ai'
        // 如果需要 SSH 密钥，可以在 Jenkins 中配置 SSH credentials
        // SSH_CREDENTIALS = credentials('deploy-ssh-key')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '检出代码...'
                checkout scm
            }
        }
        
        stage('Build in Docker') {
            steps {
                script {
                    // 在 Node.js Docker 容器中执行构建
                    // 需要 Jenkins 安装 Docker Pipeline 插件
                    def nodeImage = docker.image("node:18")
                    nodeImage.inside('-v /var/run/docker.sock:/var/run/docker.sock') {
                        sh '''
                            echo "在 Docker 容器中构建..."
                            echo "Node 版本:"
                            node --version
                            echo "NPM 版本:"
                            npm --version
                            
                            # 安装依赖
                            echo "安装依赖..."
                            npm install
                            npm run install:all
                            
                            # 构建前端
                            echo "构建前端..."
                            npm run build --workspace=frontend
                            
                            # 构建后端
                            echo "构建后端..."
                            cd backend
                            npm run build
                            npm run prisma:generate
                            cd ..
                        '''
                    }
                }
            }
        }
        
        stage('Prepare Deployment Package') {
            steps {
                echo '准备部署包...'
                sh '''
                    # 创建临时部署目录
                    mkdir -p deploy-package
                    
                    # 复制前端构建产物
                    cp -r frontend/dist deploy-package/frontend-dist
                    
                    # 复制后端构建产物和必要文件
                    mkdir -p deploy-package/backend
                    cp -r backend/dist deploy-package/backend/dist
                    cp -r backend/prisma deploy-package/backend/prisma
                    cp backend/package.json deploy-package/backend/
                    cp backend/package-lock.json deploy-package/backend/ 2>/dev/null || true
                    
                    # 复制 Docker 相关文件
                    mkdir -p deploy-package/docker
                    cp nginx/docker-compose.production.yml deploy-package/docker/docker-compose.yml
                    cp nginx/nginx.conf.docker deploy-package/docker/nginx.conf.docker
                    if [ -f backend/Dockerfile ]; then
                        cp backend/Dockerfile deploy-package/backend/
                    fi
                    
                    # 复制部署脚本
                    cp scripts/deploy-docker.sh deploy-package/
                    chmod +x deploy-package/deploy-docker.sh
                    
                    # 创建部署包
                    tar -czf deploy-package.tar.gz deploy-package/
                '''
            }
        }
        
        stage('Deploy to Remote Server') {
            steps {
                echo '部署到远程服务器...'
                script {
                    // 使用 SSH 传输文件并执行部署
                    sh '''
                        # 传输部署包到远程服务器
                        scp -o StrictHostKeyChecking=no deploy-package.tar.gz ${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/
                        
                        # 在远程服务器上执行部署
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << 'ENDSSH'
                            # 创建部署目录
                            mkdir -p /opt/nginx/html/ai
            
                            # 解压部署包
                            cd /tmp
                            tar -xzf deploy-package.tar.gz
            
                            # 备份旧版本（如果存在）
                            if [ -d /opt/nginx/html/ai/current ]; then
                                mv /opt/nginx/html/ai/current /opt/nginx/html/ai/backup-$(date +%Y%m%d-%H%M%S)
                            fi
            
                            # 创建新版本目录
                            mkdir -p /opt/nginx/html/ai/current
            
                            # 复制前端文件
                            cp -r deploy-package/frontend-dist/* /opt/nginx/html/ai/current/
            
                            # 复制后端文件
                            mkdir -p /opt/nginx/html/ai/current/backend
                            cp -r deploy-package/backend/* /opt/nginx/html/ai/current/backend/
                            
                            # 复制 Docker 配置文件
                            mkdir -p /opt/nginx/html/ai/current/docker
                            cp deploy-package/docker/docker-compose.yml /opt/nginx/html/ai/current/docker/
                            cp deploy-package/docker/nginx.conf.docker /opt/nginx/html/ai/current/docker/
                            
                            # 创建 nginx logs 目录
                            mkdir -p /opt/nginx/html/ai/current/docker/logs
            
                            # 执行 Docker 部署脚本
                            if [ -f deploy-package/deploy-docker.sh ]; then
                                chmod +x deploy-package/deploy-docker.sh
                                bash deploy-package/deploy-docker.sh /opt/nginx/html/ai/current
                            fi
            
                            # 清理临时文件
                            rm -rf /tmp/deploy-package /tmp/deploy-package.tar.gz
            
                            echo "部署完成！"
                        ENDSSH
                    '''
                }
            }
        }
        
        stage('Restart Services') {
            steps {
                echo '重启 Docker 服务...'
                sh '''
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << 'ENDSSH'
                        # 使用 Docker Compose 重启服务
                        cd /opt/nginx/html/ai/current/docker
                        
                        # 检查 docker-compose 命令（支持新版本的 docker compose）
                        if command -v docker-compose &> /dev/null; then
                            COMPOSE_CMD="docker-compose"
                        else
                            COMPOSE_CMD="docker compose"
                        fi
                        
                        # 停止旧容器
                        $COMPOSE_CMD down || true
                        
                        # 重新构建并启动
                        $COMPOSE_CMD up -d --build
                        
                        # 等待服务启动
                        sleep 5
                        
                        # 检查服务状态
                        $COMPOSE_CMD ps
                        
                        echo "Docker 服务已重启"
                        echo "前端访问: http://180.76.180.105:8080"
                        echo "后端 API: http://180.76.180.105:3001"
                    ENDSSH
                '''
            }
        }
    }
    
    post {
        success {
            echo '部署成功！'
        }
        failure {
            echo '部署失败！'
        }
        always {
            // 清理本地临时文件
            sh 'rm -rf deploy-package deploy-package.tar.gz'
        }
    }
}
