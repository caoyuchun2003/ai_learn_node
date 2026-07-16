pipeline {
    agent any

    environment {
        DEPLOY_HOST = '180.76.180.105'
        DEPLOY_USER = 'root'
        APP_DIR = '/opt/apps/ai-learning'
        STATIC_DIR = '/opt/nginx/html/ai'
        NODE_IMAGE = 'docker.io/library/node:20-alpine'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh '''
                    docker run --rm \
                        -v "$PWD:/app" -w /app \
                        ${NODE_IMAGE} sh -c "
                            set -e
                            npm install
                            npm run install:all
                            cd backend
                            npm run prisma:generate
                            npm run build
                        "
                '''
            }
        }

        stage('Prepare Deployment Package') {
            steps {
                sh '''
                    rm -rf deploy-package deploy-package.tar.gz
                    mkdir -p deploy-package/backend deploy-package/docker

                    cp -r backend/dist deploy-package/backend/ 2>/dev/null || true
                    cp -r backend/prisma deploy-package/backend/ 2>/dev/null || true
                    cp backend/package.json deploy-package/backend/ 2>/dev/null || true
                    cp backend/Dockerfile deploy-package/backend/ 2>/dev/null || true
                    cp backend/entrypoint.sh deploy-package/backend/ 2>/dev/null || true
                    cp backend/package-lock.json deploy-package/backend/ 2>/dev/null || true
                    chmod +x deploy-package/backend/entrypoint.sh 2>/dev/null || true

                    if [ -d shared ]; then
                        cp -r shared deploy-package/
                    fi

                    cp nginx/docker-compose.gateway.yml deploy-package/docker/docker-compose.yml
                    cp scripts/deploy-docker.sh deploy-package/
                    chmod +x deploy-package/deploy-docker.sh

                    tar -czf deploy-package.tar.gz deploy-package/
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    scp -o StrictHostKeyChecking=no deploy-package.tar.gz ${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/

                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} bash << 'ENDSSH'
                        set -e
                        cd /tmp && tar -xzf deploy-package.tar.gz

                        mkdir -p /opt/apps/ai-learning/backend /opt/apps/ai-learning/docker
                        rm -rf /opt/apps/ai-learning/backend/*
                        cp -r deploy-package/backend/* /opt/apps/ai-learning/backend/
                        if [ -d deploy-package/shared ]; then
                            cp -r deploy-package/shared /opt/apps/ai-learning/
                        fi
                        cp deploy-package/docker/docker-compose.yml /opt/apps/ai-learning/docker/
                        cp deploy-package/deploy-docker.sh /opt/apps/ai-learning/
                        chmod +x /opt/apps/ai-learning/deploy-docker.sh

                        bash /opt/apps/ai-learning/deploy-docker.sh /opt/apps/ai-learning
                        docker exec nginx nginx -s reload || true

                        rm -rf /tmp/deploy-package /tmp/deploy-package.tar.gz
ENDSSH
                '''
            }
        }
    }

    post {
        success {
            echo '========================================'
            echo '✅ AI 学习系统后端部署成功'
            echo '前端: GitHub Pages → https://caoyuchun2003.github.io/ai_learn_node/'
            echo 'API:  http://180.76.180.105/ai/api/'
            echo '详见 DEPLOY_PAGES.md'
            echo '========================================'
        }
        failure {
            echo '❌ 部署失败'
        }
        always {
            sh 'rm -rf deploy-package deploy-package.tar.gz'
        }
    }
}
