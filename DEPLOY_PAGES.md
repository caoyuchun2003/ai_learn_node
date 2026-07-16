# GitHub Pages 前端 + 百度云后端（方案 A）+ CFC HTTPS 代理

## 架构

```text
浏览器
  ├─ 静态前端 → GitHub Pages
  │              https://ai.yuchuntest.com/
  │
  └─ JSON API → 百度 CFC（HTTPS，免备案）
                 https://xxxx.cfc-execute.bj.baidubce.com/ai/api/
                      │
                      └─ HTTP → http://180.76.180.105/ai/api/
```

| 层 | 部署位置 |
|----|----------|
| React 前端 | GitHub Pages |
| HTTPS 入口 | 百度 CFC（`functions/`） |
| Express + SQLite | 百度云 Docker |

详见：[functions/README.md](./functions/README.md)

---

## 一、部署 CFC 代理（必须先做）

```bash
cd functions
chmod +x scripts/*.sh
./scripts/deploy.sh
```

控制台复制 HTTP 触发器根地址后：

```bash
./scripts/set-github-secret.sh 'https://xxxx.cfc-execute.bj.baidubce.com'
gh workflow run 'Deploy frontend to GitHub Pages' --repo caoyuchun2003/ai_learn_node
```

### GitHub Secret

| Secret | 值 |
|--------|-----|
| `VITE_AI_API_BASE` | `https://xxxx.cfc-execute.bj.baidubce.com/ai/api`（无尾斜杠） |

探活：

```bash
curl -s 'https://xxxx.cfc-execute.bj.baidubce.com/ai/api/health'
```

---

## 二、GitHub Pages

仓库 **Settings → Pages → Source: GitHub Actions**

访问：`https://ai.yuchuntest.com/`

---

## 三、百度云后端

Jenkins / `scripts/deploy-docker.sh` 只部署 backend。

```env
CORS_ORIGINS=...,https://ai.yuchuntest.com,...
```

```bash
curl http://180.76.180.105/ai/api/health
```

---

## 四、本地开发

```bash
npm install && npm run install:all
cd backend && npm run setup:db
npm run dev
```

前端默认 `http://localhost:3001/api`。

---

## 五、构建变量

| 变量 | `ai.yuchuntest.com` | 百度云同机 /ai/ |
|------|---------------------|-----------------|
| `VITE_BASE` | `/` | `/ai/` |
| `VITE_ROUTER_BASE` | `/` | `/ai` |
| `VITE_API_BASE` | CFC HTTPS `/ai/api` | 可不设 |

---

## 六、检查清单

- [ ] CFC 已部署，`/ai/api/health` 返回 ok
- [ ] Secret `VITE_AI_API_BASE` 已设
- [ ] Pages Actions 成功
- [ ] 打开 https://ai.yuchuntest.com 能加载课程
- [ ] BCC 安全组允许 CFC 访问 80
