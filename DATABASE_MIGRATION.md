# 数据库迁移和更新流程

## 概述

本项目已实现自动化的数据库迁移和初始化流程。每次容器启动时，会自动检查数据库状态并执行必要的迁移操作。

## 更新流程

### 场景一：只更新代码（无数据库变更）

```
1. 修改代码
2. Git 提交: git commit -m "feat: 更新功能"
3. Git 推送: git push origin main
4. Jenkins 自动触发构建
5. 部署到服务器
6. 容器重启，应用新代码
```

**数据库**: 无需操作，数据库文件保持不变

### 场景二：更新代码 + 数据库结构变更

```
1. 修改代码和 schema.prisma
2. 创建迁移: cd backend && npm run prisma:migrate -- --name migration_name
3. Git 提交（包含迁移文件）: git commit -m "feat: 添加新功能 + 数据库迁移"
4. Git 推送: git push origin main
5. Jenkins 自动触发构建
6. 部署到服务器（包含迁移文件）
7. 容器启动时自动执行迁移
```

## 数据库迁移机制

### 容器启动流程

当后端容器启动时，`entrypoint.sh` 脚本会自动执行以下步骤：

1. **生成 Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **检查数据库状态**
   - 如果数据库不存在 → 执行初始化
     - 执行 `prisma migrate deploy`（应用所有迁移）
     - 执行 `prisma seed`（填充初始数据）
   - 如果数据库已存在 → 只执行迁移
     - 执行 `prisma migrate deploy`（应用新的迁移）

3. **启动应用**
   ```bash
   node dist/index.js
   ```

### 迁移文件管理

- **迁移文件位置**: `backend/prisma/migrations/`
- **必须提交到 Git**: 所有迁移文件都需要版本控制
- **自动应用**: 容器启动时自动应用所有未应用的迁移

### 开发环境 vs 生产环境

| 环境 | 命令 | 说明 |
|------|------|------|
| 开发 | `npm run prisma:migrate` | 创建新迁移文件并应用 |
| 生产 | `prisma migrate deploy` | 只应用已有迁移，不创建新迁移 |

## 文件结构

```
backend/
├── Dockerfile              # Docker 镜像构建配置
├── entrypoint.sh          # 容器启动脚本（自动迁移）
├── prisma/
│   ├── schema.prisma      # 数据库模型定义
│   ├── seed.ts            # 初始数据填充脚本
│   └── migrations/        # 迁移文件目录
│       ├── 20260110052756_init/
│       │   └── migration.sql
│       └── migration_lock.toml
└── ...
```

## 部署配置

### Dockerfile 关键配置

```dockerfile
# 安装 tsx（用于执行 seed.ts）
RUN npm install -g tsx

# 复制 entrypoint 脚本
COPY backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# 使用 entrypoint 启动
CMD ["/app/entrypoint.sh"]
```

### Docker Compose 配置

```yaml
backend:
  build:
    context: /opt/nginx/html/ai/current  # 包含 shared 目录
    dockerfile: backend/Dockerfile
  volumes:
    - /opt/nginx/html/ai/current/backend/prisma:/app/prisma  # 数据库持久化
```

## 常见操作

### 创建新的数据库迁移

```bash
# 1. 修改 schema.prisma
vim backend/prisma/schema.prisma

# 2. 创建迁移
cd backend
npm run prisma:migrate -- --name add_new_field

# 3. 提交到 Git
git add backend/prisma/migrations/
git commit -m "feat: 添加新字段"
git push
```

### 手动执行迁移（如果需要）

```bash
# 在容器内执行
docker exec -it ai-learning-backend sh
npx prisma migrate deploy
```

### 查看迁移状态

```bash
# 查看数据库中的迁移记录
docker exec -it ai-learning-backend sh
npx prisma migrate status
```

### 回滚迁移（谨慎操作）

Prisma 不直接支持回滚，需要：
1. 创建新的迁移来撤销更改
2. 或手动修改数据库

## 注意事项

1. **迁移文件必须提交到 Git**
   - 所有迁移文件都需要版本控制
   - 确保团队成员都能访问相同的迁移历史

2. **不要在生产环境使用 `prisma migrate dev`**
   - 这会创建新的迁移文件
   - 生产环境应使用 `prisma migrate deploy`

3. **数据库文件持久化**
   - 数据库文件通过 Docker volume 挂载
   - 位置: `/opt/nginx/html/ai/current/backend/prisma/dev.db`
   - 容器重启不会丢失数据

4. **首次部署**
   - 容器启动时会自动创建数据库
   - 自动应用所有迁移
   - 自动填充初始数据（seed）

5. **后续更新**
   - 容器启动时自动检查并应用新迁移
   - 不会重复执行已应用的迁移
   - 不会重复执行 seed（seed 脚本会清理现有数据）

## 故障排查

### 迁移失败

```bash
# 查看容器日志
docker logs ai-learning-backend

# 进入容器检查
docker exec -it ai-learning-backend sh
npx prisma migrate status
```

### 数据库锁定

SQLite 数据库可能被锁定，检查是否有其他进程在使用数据库。

### Seed 执行失败

Seed 脚本失败不会阻止容器启动，但会输出警告信息。检查日志确认原因。

## 总结

✅ **自动化**: 容器启动时自动执行迁移  
✅ **安全**: 迁移文件版本控制  
✅ **持久化**: 数据库文件持久化存储  
✅ **灵活**: 支持开发和生产环境的不同流程  

每次代码更新时，只需：
1. 创建迁移（如需要）
2. 提交到 Git
3. Jenkins 自动部署
4. 容器启动时自动应用迁移

无需手动干预！
