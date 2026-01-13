# 前端调试指南

## 问题：前端页面无内容展示

### 检查步骤

1. **检查浏览器控制台**
   - 打开开发者工具 (F12)
   - 查看 Console 标签页是否有错误信息
   - 查看 Network 标签页，检查 API 请求是否成功

2. **检查后端是否运行**
   ```bash
   curl http://localhost:3001/api/health
   ```
   应该返回：`{"status":"ok","message":"AI Learning Platform API"}`

3. **检查 API 连接**
   ```bash
   curl http://localhost:3001/api/courses
   ```
   应该返回课程列表的 JSON 数据

4. **检查前端是否运行**
   - 访问 http://localhost:3000
   - 应该能看到页面内容

### 常见问题

#### 1. API 请求失败
- **症状**：控制台显示网络错误或 CORS 错误
- **解决**：确保后端在 3001 端口运行，且 CORS 已配置

#### 2. 数据加载失败
- **症状**：页面显示"加载中..."但一直不结束
- **解决**：检查浏览器控制台的错误信息，查看 API 响应

#### 3. 样式未加载
- **症状**：页面有内容但样式错乱
- **解决**：确保 Tailwind CSS 已正确配置和编译

#### 4. 路由问题
- **症状**：页面空白或 404
- **解决**：检查 URL 路径是否正确，确保使用 React Router

### 调试工具

已添加的调试功能：
- API 请求/响应日志（在浏览器控制台）
- 错误边界组件（捕获 React 错误）
- 详细的错误提示

### 手动测试 API

```bash
# 测试健康检查
curl http://localhost:3001/api/health

# 测试获取课程
curl http://localhost:3001/api/courses

# 测试获取特定课程
curl http://localhost:3001/api/courses/{courseId}
```

### 如果仍然无法解决

1. 清除浏览器缓存
2. 重启开发服务器
3. 检查 Node.js 版本（需要 16+）
4. 查看完整的错误堆栈信息
