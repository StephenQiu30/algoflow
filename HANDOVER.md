# 衍序 · AlgoFlow 项目接力与研发交接文档 (HANDOVER.md)

> **文档定位**：面向开发者与 AI Agent 的研发交接单（Context Handover）。在会话切换、人员轮换或阶段任务接力时，通过本文档快速对齐系统当前状态、正在进行中的任务细节与下一步行动指引。  
> **最后交接时间**：2026-10-22  
> **交接状态**：🟢 系统健康 / 可正常编译运行 / 核心测试全绿

---

## 🎯 1. 当前系统状态快照 (System Status Snapshot)

| 检查项 | 当前状态 | 验证依据 / 结果 |
| :--- | :---: | :--- |
| **Git 分支与状态** | `main` 分支 / 工作区整洁 | `git status` 干净，代码已与规范全面对齐 |
| **后端工程 (Java 21)** | 🟢 全部编译通过 | 30 个子模块 `mvn test-compile -DskipTests` 全量 SUCCESS (耗时 ~2.0s) |
| **前端工程 (Next.js 15)**| 🟢 编译与测试全绿 | `npm run typecheck` 0 错误；`npm test` 17 项核心算法与 SSE 单测 100% 通过 |
| **文档中心体系 (docs/)** | 🟢 全链路闭环 | 已重构 `requirement` → `design` → `prd` → `plan` → `algorithms` 体系 |
| **核心中间件依赖** | 准备就绪 | `docker-compose-env.yml` 支持一键拉起 MySQL 8.0, Redis 7.0, Nacos, ES 9.3, RabbitMQ |

---

## 🧭 2. 关键代码入口与核心文件导航

### 2.1 前端核心交互入口 (`frontend/`)
* **算法工作台主页面**：[`frontend/src/app/sorting/[algo]/page.tsx`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/frontend/src/app/sorting/[algo]/page.tsx)
* **算法核心演练组件**：[`frontend/src/components/sorting/SortingVisualizer.tsx`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/frontend/src/components/sorting/SortingVisualizer.tsx)
* **演练控制器面板**：[`frontend/src/components/sorting/ControlPanel.tsx`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/frontend/src/components/sorting/ControlPanel.tsx)
* **RAG 智能导师前端侧栏**：[`frontend/src/components/sorting/RAGChatPanel.tsx`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/frontend/src/components/sorting/RAGChatPanel.tsx)
* **19 种排序算法计算引擎**：[`frontend/src/lib/algorithms/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/frontend/src/lib/algorithms/)
* **全局状态机管理 (Zustand)**：[`frontend/src/store/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/frontend/src/store/)
* **Apple 极简风格原子组件**：[`frontend/src/components/ui/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/frontend/src/components/ui/)

### 2.2 后端微服务集群入口 (`backend/`)
* **统一路由与鉴权网关**：[`backend/algorithm-gateway/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/backend/algorithm-gateway/)
* **RAG 向量问答与知识库服务**：[`backend/algorithm-service/algorithm-ai-service/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/backend/algorithm-service/algorithm-ai-service/)
* **用户账户与权限服务**：[`backend/algorithm-service/algorithm-user-service/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/backend/algorithm-service/algorithm-user-service/)
* **社区讨论与题解博客服务**：[`backend/algorithm-service/algorithm-post-service/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/backend/algorithm-service/algorithm-post-service/)
* **Elasticsearch 检索服务**：[`backend/algorithm-service/algorithm-search-service/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/backend/algorithm-service/algorithm-search-service/)
* **RPC 契约与传输 DTO 声明**：[`backend/algorithm-api/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/backend/algorithm-api/)
* **通用组件与基础设施 Starter**：[`backend/algorithm-common/`](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/backend/algorithm-common/)

---

## ⚡ 3. 正在推进中的工作 (In-flight Work & Context)

接手者请重点关注以下正在进行的模块上下文：

1. **TSK-201: 演练工作台步骤快照与 RAG 导师实时联动**
   - **现状**：用户在演练工作台单步步进时，`useSortingVisualizer` 会产生瞬时快照（`comparing`, `swapping`, `activeLine`）。目前前端 `RAGChatPanel.tsx` 已经具备感知能力；
   - **待办细节**：需要进一步完善当用户在复杂算法（如快速排序的双指针收缩）中提问时，将当前指针的语义信息（`low`, `high`, `pivot`）完整注入 Prompt 的流程，杜绝大模型在特定分区状态下的误判。

2. **TSK-202: 知识库切片引用卡片跳转与联动**
   - **现状**：SSE 会下发 `event: source`，返回切片来源（如 `06-快速排序.md`）；
   - **待办细节**：前端卡片点击后，需要支持在当前页面平滑呼出文档预览 Drawer 或平滑锚点跳转，避免打开空白页打断学习心流。

---

## 🛠️ 4. 本地环境启动与验证指令速查

接手开发时，请依序执行以下命令验证环境：

### 4.1 基础中间件启动
```bash
# 启动 MySQL, Redis, RabbitMQ, Nacos, ES
docker-compose -f docker-compose-env.yml up -d
```

### 4.2 前端校验与启动
```bash
cd frontend

# 1. 类型校验 (必须 0 错误)
npm run typecheck

# 2. 核心算法与流式解析单测 (17 项必须全绿)
npm test

# 3. 启动开发服务器 (http://localhost:3000)
npm run dev
```

### 4.3 后端构建与语法检查
```bash
cd backend

# 快速编译全部 30 个微服务子模块
mvn clean test-compile -DskipTests
```

---

## ⚠️ 5. 核心架构红线与避坑指南 (Gotchas & Rules)

1. **严禁创建独立的 Admin 项目**：
   - 所有的后台管理页面统一内嵌在 `frontend/src/app/admin/` 路由下；
2. **前后端接口分层与契约守则**：
   - 后端服务间相互调用**严禁**直接注入其他微服务的 service 实现类，**必须**通过 `algorithm-api/*` 声明的 OpenFeign 客户端；
   - 所有 Controller 响应必须使用 `Result<T>` 封装，禁止返回裸对象；
3. **算法计算与 UI 彻底解耦**：
   - 算法的核心演算逻辑存放在 `frontend/src/lib/algorithms/`，必须保持为纯函数/生成器，严禁在算法计算循环体内直接操作 DOM 或直接更新 React state；
4. **设计系统规范守则**：
   - 遵循 Apple 极简风格（`#0066cc` 唯一主色、SF Pro 字体、发丝线分割），杜绝添加花哨无意义的毛玻璃与浓烈渐变；
5. **安全凭证防泄漏**：
   - 包含真实密码与密钥的 `*-secret.properties` 或 `.env` 严禁提交至 Git。

---

## 📋 6. 下一步立即行动建议 (Next Immediate Steps)

接力开发者/Agent 可直接挑选以下切入点展开：

* [ ] **行动点 1**：完善 `frontend/src/components/sorting/RAGChatPanel.tsx` 中的引用切片点击预览交互（对应任务 `TSK-202`）；
* [ ] **行动点 2**：在 `frontend/src/app/admin/` 下补充知识库切片管理列表视图与手动重新向量化按钮（对应任务 `TSK-303`）；
* [ ] **行动点 3**：参考 `docs/prd/prd-community-and-learning.md`，推进题解博客阅读器的目录大纲（TOC）监听组件开发（对应任务 `TSK-301`）。

---

## 📜 7. 交接变更日志 (Handover Change Log)

| 日期 | 交接人 / Agent | 阶段核心动作 | 交付状态 |
| :--- | :--- | :--- | :---: |
| **2026-10-22** | Antigravity | 全面重构 `docs/` 研发体系（涵盖 `requirement` -> `design` -> `prd` -> `plan` -> `algorithms` 链路），并在根目录建立 `BACKLOG.md` 与 `HANDOVER.md` 任务跟踪体系 | 🟢 已交付 |
| **2026-10-22** | Antigravity | 整理并迁入 `docs/templates/` 标准工程写作模板库（设计、故事、场景、PRD、计划），并建立全阶段 `00-xx导航.md` 矩阵 | 🟢 已交付 |
