# 衍序 · AlgoFlow Agent 协同与研发指南

本指南为参与 **衍序 (AlgoFlow)** 项目的 AI Agent（包括 Antigravity, Claude Code, Cursor, Codex 等）及开发团队提供统一的系统上下文、工程架构约束与编码执行准则。

---

## 1. 系统概述与技术定位

* **项目名称**：**衍序 · AlgoFlow**
* **核心定位**：面向排序算法教学的 RAG 增强型交互式系统（推衍秩序 · 步进数据心流）
* **核心三要素**：
  1. **沉浸式算法可视化**：高帧率、可步进、可暂停、多维指标实时演算；
  2. **RAG 增强型 AI 导师**：基于领域知识库、向量检索与大模型的实时解惑与学习规划；
  3. **Apple 极简设计系统**：克制、精致、以内容为核心的视觉与交互语言。

---

## 2. 目录结构与架构边界

工程采用统一 Monorepo 体系，划分为三大顶层模块，**严禁越界或混淆职责**：

```text
AlgoFlow/
├── backend/          # 后端微服务集群 (Java 21 / Spring Boot 3.5 / Spring Cloud Alibaba)
├── frontend/         # 统一交互前端 (Next.js 15 / React 19 / GSAP / Radix UI / Tailwind CSS)
├── docs/             # 统一文档中心 (UI/UX 规范、系统设计、19篇排序算法知识库)
├── .github/          # 统一 CI/CD 工作流、Issue/PR 模板与协作规范
└── .agent/           # Agent 技能库与协同规则
```

### 架构约束守则：
1. **统一前端架构**：
   - 所有的用户界面、算法演练、AI 对话以及**系统运营管理后台（Admin）**均在 `frontend/` 中统一实现（管理路由统一置于 `frontend/src/app/admin/` 或相关路由分组下）；
   - **绝对不允许**创建独立的 admin 代码库或独立工程；
2. **微服务后端规范**：
   - 所有数据持久化、高并发控制、分布式缓存、消息队列与 RAG 向量管道均在 `backend/` 下管理；
   - 严格遵循 `algorithm-gateway` 统一鉴权路由与微服务通信契约；
3. **文档单一可信源**：
   - 所有的全局系统设计文档、算法知识库文档必须集中存放于 `docs/`，并在代码或注释中通过相对路径引用。

---

## 3. 技术栈规范与版本约束

| 领域 | 核心技术栈 | 版本 / 约束 |
| :--- | :--- | :--- |
| **后端语言与核心** | Java | 21 (LTS) |
| **后端框架** | Spring Boot / Spring Cloud | Spring Boot 3.5+ / Spring Cloud 2025 / Spring Cloud Alibaba 2023 |
| **AI 与 RAG** | Spring AI Alibaba / Elasticsearch | Spring AI 1.1+ / Elasticsearch 9.3+ / 通义千问 (Qwen) / 本地模型 |
| **鉴权与安全** | Sa-Token | 1.44+，网关集中鉴权 |
| **前端语言与框架** | TypeScript / Next.js | Next.js 15+ (App Router) / React 19 |
| **前端动效与 UI** | GSAP / Tailwind CSS / Radix UI | 严格遵循 `docs/DESIGN.md` 设计规范 |
| **包管理器** | pnpm / npm | 前端首选 pnpm 或 npm |

---

## 4. 编码与设计准则

### 4.1 UI/UX 规范
- 严格遵循 [docs/DESIGN.md](file:///Users/stephenqiu/Desktop/StephenQiu/Algorithm/docs/DESIGN.md) 的设计规范：
  - 核心主色使用 Action Blue (`#0066cc`)；
  - 聚焦产品与算法本身，去除多余的炫光渐变、复杂的重阴影装饰；
  - 确保键盘可访问性、高对比度与移动端/桌面端自适应。

### 4.2 前端工程规范
- 在提交任何前端变更前，必须确保以下命令执行通过：
  ```bash
  cd frontend
  npm run typecheck    # 严格 TypeScript 类型检查
  npm run lint         # ESLint 代码风格检查
  npm test             # 核心单元测试
  npm run course:check # 课程文档一致性校验
  npm run build        # 生产构建验证
  ```

### 4.3 后端工程规范
- 统一返回实体：使用 `Result<T>` 封装 API 响应，严禁返回裸对象或未捕获的运行时异常；
- 单元测试与契约：涉及 AI RAG 知识检索、分块、权限过滤的变更必须补充单元测试；
- 构建验证：
  ```bash
  cd backend
  mvn clean test-compile
  mvn -B package -DskipTests
  ```

---

## 5. Git 提交与协作守则

- 提交信息必须遵循 **Conventional Commits** 规范：
  - `feat: ...` 新功能
  - `fix: ...` 缺陷修复
  - `docs: ...` 文档变更
  - `refactor: ...` 代码重构
  - `perf: ...` 性能优化
  - `test: ...` 测试用例新增或调整
  - `chore: ...` 依赖构建或流程琐事
- **安全红线**：严禁提交包含真实密钥、密码或生产配置的 `.env` 或 `common-secret.properties` 文件。
