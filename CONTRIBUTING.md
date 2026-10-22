# 贡献指南 · Contributing to AlgoFlow

感谢您关注并愿意参与 **衍序 · AlgoFlow**（面向排序算法教学的 RAG 增强型交互式系统）的开源共建！  
无论是修复缺陷、改进算法动画、优化 AI 智能导师提示词，还是完善系统文档，我们都热烈欢迎您的贡献。

---

## 🛠️ 本地开发环境要求

* **Java**: JDK 21 (推荐 Eclipse Temurin 或 GraalVM)
* **Node.js**: v20+ / v24 (LTS)
* **包管理器**: `pnpm` (推荐) 或 `npm`
* **构建工具**: Maven 3.9+
* **容器环境**: Docker & Docker Compose

---

## 🚀 本地开发与联调启动

### 1. 启动基础设施
在项目根目录下配置环境变量并启动中间件集群：
```bash
cp .env.example .env
docker compose -f docker-compose-env.yml up -d
```
> 包括 MySQL 8.0、Redis 7.0、Nacos 3.1.1、RabbitMQ 3.12、Elasticsearch 8.19。

### 2. 后端微服务启动
```bash
cd backend

# 构建后端模块
mvn clean test-compile
mvn -B package -DskipTests

# 依次启动核心服务：
# 1. algorithm-gateway (8080)
# 2. algorithm-user-service (8081)
# 3. algorithm-ai-service (8088) 等业务微服务
```

### 3. 统一交互前端启动
```bash
cd frontend

# 安装依赖
pnpm install # 或 npm install

# 启动开发服务器
npm run dev
# 浏览器访问 http://localhost:3000
```

---

## 📐 开发准则与规范

### 1. 架构边界约定
* **统一前端**：前台算法沉浸学习、可视化步进演示、AI 对话以及**系统运营管理后台（Admin）**均在 `frontend/` 中统一实现，严禁创建独立 admin 工程。
* **微服务后端**：高并发控制、分布式缓存、消息队列与 RAG 向量管道均在 `backend/` 下管理，严格通过网关鉴权通信。
* **单一知识库**：排序算法教学文档集中在 `docs/algorithms/`，全局设计规范位于 `docs/DESIGN.md`。

### 2. 前端规范
* **动效与交互**：排序算法需提供离散、高帧率的状态演进步骤（比较、交换、就位、回溯），严格遵循 Apple 极简与清晰的设计语言（主色 `#0066cc`）。
* **代码质检**：在提交 PR 前确保以下命令通过：
  ```bash
  cd frontend
  npm run typecheck    # TypeScript 类型校验
  npm run lint         # ESLint 检查
  npm test             # 单元测试 (17 项核心算法与交互测试)
  npm run build        # 生产构建
  ```

### 3. 后端规范
* **返回规范**：所有对外 Controller 统一返回 `Result<T>`；
* **测试与契约**：变更涉及 RAG 知识检索、分块隔离、会话范围过滤时，必须补充对应的单元测试；
* **构建验证**：
  ```bash
  cd backend
  mvn clean test-compile
  ```

---

## 🌿 Git 分支与提交规范

1. **分支命名**：
   - 特性分支：`feature/xxx`
   - 缺陷修复：`fix/xxx`
   - 文档补充：`docs/xxx`
   - 重构优化：`refactor/xxx`
2. **Commit Message (遵循 Conventional Commits)**：
   ```text
   feat: 支持希尔排序步进可视化与增量序列切换
   fix: 修复 RAG 会话隔离中检索上下文溢出问题
   docs: 补充快速排序三路切分教学卡片
   refactor: 优化统一后台用户角色鉴权中间件
   ```
3. **安全红线**：
   - 严禁提交真实密钥、生产密码、`.env` 或包含私密信息的配置文件。

---

## 🤝 行为准则 (Code of Conduct)
参与社区交流时，请保持友善、包容与尊重。详见 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)。
