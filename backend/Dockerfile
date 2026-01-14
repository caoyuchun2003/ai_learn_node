FROM node:18-alpine

# 安装 OpenSSL（Prisma 需要）
# Alpine 3.19+ 使用 openssl3，旧版本使用 openssl1.1-compat
RUN apk add --no-cache openssl libc6-compat || \
    apk add --no-cache openssl1.1-compat || \
    apk add --no-cache openssl

WORKDIR /app

# 先复制 shared 包（workspace 依赖）
COPY shared ./shared

# 复制 backend 的 package 文件
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# 安装依赖（shared 包直接使用源码，不需要安装）
# 修改 package.json 中的 shared 依赖为 file:./shared
RUN sed -i 's|"@ai-learning/shared": "\*"|"@ai-learning/shared": "file:./shared"|' package.json && \
    npm install --production

# 复制构建产物
COPY backend/dist ./dist

# 生成 Prisma Client
RUN npx prisma generate

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "dist/index.js"]
