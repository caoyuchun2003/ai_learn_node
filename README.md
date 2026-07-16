# AI学习平台

面向开发者的AI知识学习平台，提供结构化的课程内容和智能学习路径推荐。

## 功能特性

- 📚 **结构化课程**：精心设计的课程体系，涵盖机器学习、深度学习、NLP、LLM、AI工具等
- 🎯 **个性化路径**：基于兴趣和水平智能推荐学习路径
- 📊 **进度跟踪**：实时记录学习进度
- 💻 **现代化UI**：使用React + Tailwind CSS构建美观界面
- 📝 **Markdown支持**：课程内容支持Markdown格式，代码高亮

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- React Markdown

### 后端
- Node.js + Express + TypeScript
- Prisma ORM
- SQLite数据库

## 快速开始

### 1. 安装依赖

```bash
npm install
npm run install:all
```

### 2. 初始化数据库

**方式一：使用自动化脚本（推荐）**

```bash
cd backend
npm run setup:db
```

**方式二：手动执行**

```bash
cd backend
npm run prisma:generate    # 生成Prisma Client
npm run prisma:migrate     # 创建数据库和表结构
npm run prisma:seed        # 填充初始课程数据
```

数据库文件将创建在 `backend/prisma/dev.db`

### 3. 启动开发服务器

在项目根目录运行：

```bash
npm run dev
```

这将同时启动：
- 前端开发服务器：http://localhost:3000
- 后端API服务器：http://localhost:3001

### 单独启动

```bash
# 启动前端
npm run dev:frontend

# 启动后端
npm run dev:backend
```

## 项目结构

```
ai-learning-platform/
├── frontend/          # React前端应用
│   ├── src/
│   │   ├── components/  # 可复用组件
│   │   ├── pages/      # 页面组件
│   │   ├── services/   # API服务
│   │   └── ...
│   └── package.json
├── backend/           # Express后端
│   ├── src/
│   │   ├── routes/     # API路由
│   │   ├── controllers/# 控制器
│   │   ├── services/   # 业务逻辑
│   │   └── ...
│   ├── prisma/        # 数据库Schema和Seed
│   └── package.json
├── shared/            # 共享TypeScript类型
└── package.json       # 根package.json
```

## API端点

### 课程相关
- `GET /api/courses` - 获取课程列表
- `GET /api/courses/:id` - 获取课程详情
- `GET /api/courses/:id/chapters` - 获取章节列表
- `GET /api/chapters/:id` - 获取章节内容

### 学习路径相关
- `GET /api/paths` - 获取所有学习路径
- `POST /api/paths/generate` - 生成个性化路径
- `GET /api/paths/:id` - 获取路径详情

### 进度相关
- `GET /api/progress` - 获取用户进度
- `POST /api/progress` - 更新学习进度

## 课程分类

- **机器学习基础** (ML_BASICS)
- **深度学习** (DEEP_LEARNING)
- **自然语言处理** (NLP)
- **大语言模型** (LLM)
- **AI工具** (AI_TOOLS)

## 开发说明

### 数据库迁移

```bash
cd backend
npm run prisma:migrate
```

### 重新生成Prisma Client

```bash
cd backend
npm run prisma:generate
```

### 重新初始化数据

```bash
cd backend
npm run prisma:seed
```

## 构建生产版本

```bash
# 前端（GitHub Pages）
npm run build --workspace=frontend

# 后端（百度云 Docker）
npm run build --workspace=backend
```

### 部署方式

| 组件 | 部署目标 | 文档 |
|------|----------|------|
| 前端 | GitHub Pages | [DEPLOY_PAGES.md](./DEPLOY_PAGES.md) |
| 后端 API | 百度云 Docker | [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md) |

## 许可证

MIT
