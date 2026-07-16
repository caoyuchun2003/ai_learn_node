# GitHub Pages 前端 + 百度云后端（方案 A）

## 架构

```text
浏览器
  ├─ 静态前端 → GitHub Pages
  │              https://caoyuchun2003.github.io/ai_learn_node/
  │
  └─ JSON API → 百度云（Node + SQLite）
                 http://180.76.180.105/ai/api/
                 （或 HTTPS 代理 / 域名）
```

| 层 | 部署位置 |
|----|----------|
| React 前端 | GitHub Pages（本仓库 Actions） |
| Express + Prisma + SQLite | 百度云 Docker（Jenkins / deploy-docker.sh） |

---

## 一、GitHub Pages 配置

### 1. 开启 Pages

仓库 **Settings → Pages → Build and deployment → Source: GitHub Actions**

### 2. 配置 Secret

**Settings → Secrets → Actions** 新增：

| Secret | 示例 | 说明 |
|--------|------|------|
| `VITE_AI_API_BASE` | `https://你的HTTPS域名/ai/api` 或 CFC 代理 URL | **必须是 HTTPS**，否则 Pages 会拦截混合内容 |

> 若 API 仍是 `http://180.76.180.105/ai/api`，浏览器从 HTTPS Pages **无法直接调用**。可选：
> - 给百度云 API 配域名 + SSL
> - 用百度 CFC 做 HTTPS 反向代理（参考 learn 项目的 CFC 方案）

### 3. 推送 main 触发部署

```bash
git push origin main
```

访问：`https://caoyuchun2003.github.io/ai_learn_node/`

---

## 二、百度云后端（保持不变）

Jenkins 或手动执行 `scripts/deploy-docker.sh`，只部署 **backend 容器**（端口 13001，主 nginx 转发 `/ai/api/`）。

后端环境变量（docker-compose.gateway.yml）：

```env
CORS_ORIGINS=https://caoyuchun2003.github.io,http://180.76.180.105,http://localhost:3000
```

健康检查：

```bash
curl http://180.76.180.105/ai/api/health
```

---

## 三、本地开发

```bash
npm install && npm run install:all
cd backend && npm run setup:db   # 首次
npm run dev                      # 前端 :3000 + 后端 :3001
```

前端默认直连 `http://localhost:3001/api`，无需 nginx。

---

## 四、构建变量说明

| 变量 | Pages 构建 | 百度云 /ai/ 构建 |
|------|------------|------------------|
| `VITE_BASE` | `/ai_learn_node/` | `/ai/` |
| `VITE_ROUTER_BASE` | `/ai_learn_node` | `/ai` |
| `VITE_API_BASE` | Secret（HTTPS 外链） | 可不设（同源 `/ai/api`） |

---

## 五、迁移检查清单

- [ ] GitHub Secret `VITE_AI_API_BASE` 已设为 **HTTPS** API 根路径（含 `/ai/api`，无尾斜杠）
- [ ] 百度云 `CORS_ORIGINS` 含 `https://caoyuchun2003.github.io`
- [ ] `curl .../ai/api/health` 正常
- [ ] Pages Actions 绿，站点可打开课程列表
