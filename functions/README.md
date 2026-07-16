# AI Learn · 百度 CFC HTTPS 代理

把 GitHub Pages（HTTPS）的请求转到百度云 BCC 上的 HTTP API，避免混合内容，也无需给 `api.yuchuntest.com` 备案。

```text
浏览器 (https://ai.yuchuntest.com)
    │  HTTPS
    ▼
CFC  https://xxxx.cfc-execute.bj.baidubce.com/ai/api/...
    │  HTTP（服务端）
    ▼
BCC  http://180.76.180.105/ai/api/...
```

## 部署

```bash
# 一次性：bsam + 百度云 AK/SK（IAM，不是千帆）
pip3 install --user bce-sam-cli 'werkzeug<3'
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
bsam config --ak '百度云AK' --sk '百度云SK' --region bj

cd functions
chmod +x scripts/*.sh
./scripts/deploy.sh
```

## 接到 GitHub Pages

1. CFC 控制台复制 HTTP 触发器根地址  
2. 写入 Secret 并重新部署前端：

```bash
./scripts/set-github-secret.sh 'https://xxxx.cfc-execute.bj.baidubce.com'
gh workflow run 'Deploy frontend to GitHub Pages' --repo caoyuchun2003/ai_learn_node
```

Secret 最终值形如：`https://xxxx.cfc-execute.bj.baidubce.com/ai/api`

## 探活

```bash
export CFC='https://xxxx.cfc-execute.bj.baidubce.com'
curl -s "$CFC/"
curl -s "$CFC/ai/api/health"
curl -s "$CFC/ai/api/courses" | head -c 200
```

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `UPSTREAM_BASE` | `http://180.76.180.105` | 后端机器 |
| `CORS_ORIGINS` | `ai.yuchuntest.com` 等 | 允许的前端 Origin |

## 安全提示

- CFC 出口能访问 `180.76.180.105:80`（安全组放行）
- 可选：nginx 只允许 CFC 出口 IP，或加共享 Header
