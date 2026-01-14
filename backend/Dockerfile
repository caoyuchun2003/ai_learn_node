FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖（包括生产依赖）
RUN npm ci --production

# 复制构建产物
COPY dist ./dist

# 生成 Prisma Client
RUN npx prisma generate

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "dist/index.js"]
