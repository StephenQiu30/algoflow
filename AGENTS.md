# 衍序 · AlgoFlow Agent 协同与研发指南

本指南为参与 **衍序 (AlgoFlow)** 项目的 AI Agent（包括 Antigravity, Claude Code, Cursor, Codex 等）及开发团队提供统一的系统上下文、工程架构约束与编码执行准则。项目代码目录与微服务划分详见 [PROJECT.md](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/PROJECT.md)。

---

## 1. 系统概述与技术定位

* **项目名称**：**衍序 · AlgoFlow**
* **核心定位**：面向排序算法教学的 RAG 增强型交互式系统（推衍秩序 · 步进数据心流）
* **核心三要素**：
  1. **沉浸式算法可视化**：高帧率、可步进、可暂停、多维指标实时演算；
  2. **RAG 增强型 AI 导师**：基于领域知识库、向量检索与大模型的实时解惑与学习规划；
  3. **Apple 极简设计系统**：克制、精致、以内容为核心的视觉与交互语言。

---

## 2. 架构设计与编码规范

### 2.1 后端代码设计规范：阿里巴巴 Java 开发手册
后端开发全面遵循**《阿里巴巴 Java 开发手册》**规范：
1. **命名风格**：
   - 类名使用 `UpperCamelCase`，方法名/参数/局部变量使用 `lowerCamelCase`，常量全大写下划线分割；
   - 抽象类命名使用 `Abstract` 或 `Base` 开头；异常类命名以 `Exception` 结尾；测试类以它要测试的类名加 `Test` 结尾；
   - Service 与 DAO 规范：Service 接口与实现类分离（接口 `UserService`，实现类 `UserServiceImpl`）。
2. **OOP 与代码分层**：
   - 严格遵循 `Controller` -> `Service` -> `Manager` -> `DAO` / `Mapper` 分层边界；
   - 控制器层只负责参数校验、鉴权透传与响应包装，不堆砌业务逻辑；
   - 数据对象规约：数据模型严禁越层混用（`DO`/`Entity` 仅限持久层，`DTO` 用于跨服务/外部传输，`VO` 用于前端展示）。
3. **安全与异常处理**：
   - 统一返回实体：使用 `Result<T>` 封装 API 响应，严禁返回裸对象或抛出未捕获的运行时异常；
   - 异常不得直接吞没，捕获异常后必须记录完整上下文日志或向上转换抛出有语义的业务异常；
   - 禁止在循环体内执行远程 RPC、SQL 查询或高耗时 I/O 操作。
4. **并发与日志规范**：
   - 线程资源必须通过自定义线程池提供，不允许在代码中自行显式创建未命名的线程；
   - 日志记录统一使用 SLF4J 门面接口，严禁使用 `System.out.println` 或 `e.printStackTrace()`；
   - 条件输出与占位符规范：使用 `log.info("id: {}, name: {}", id, name)` 占位符输出，避免字符串拼接消耗。

### 2.2 前端代码设计规范：Vercel 最佳实践
前端工程全面遵循 **Vercel 官方与 Next.js 最佳实践**：
1. **服务端与客户端边界（RSC 架构）**：
   - 默认采用 React Server Components (RSC)，减少客户端 JavaScript 打包体积；
   - 仅在需要处理状态（`useState`、`useReducer`）、副作用（`useEffect`）或绑定浏览器事件监听时添加 `'use client'` 指令，且尽可能将客户端组件下沉至叶子节点；
   - 保证数据流单向流动，敏感凭证与内部 API 请求优先在服务端组件中完成。
2. **数据流与流式渲染（Streaming & Suspense）**：
   - 善用 Next.js 15 App Router 的并行路由、拦截路由与 `loading.tsx` / `error.tsx` 错误边界；
   - 长耗时与 AI 串流响应通过 React `Suspense` + 流式协议（Server-Sent Events / ReadableStream）实现，杜绝整页长时间阻塞。
3. **性能与包体积优化**：
   - 组件按需动态引入（`next/dynamic`），重型图表或算法动效容器只在挂载时动态加载；
   - 图片使用 `next/image` 并显式配置宽高与优化占位符，字体通过 `next/font` 本地加载；
   - 保持 Web Vitals 指标健康，重点保障 LCP（最大内容渲染）、INP（交互到下次绘制）和 CLS（累积布局偏移）。
4. **UI/UX 规范**：
   - 严格遵循 [docs/DESIGN.md](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/docs/DESIGN.md) 的设计规范：核心主色使用 Action Blue (`#0066cc`)；
   - 聚焦算法教学与内容本身，杜绝多余的炫光渐变与重阴影；
   - 全面支持高对比度、无障碍辅助访问（a11y）与移动端响应式。

---

## 3. 技术栈规范与版本约束

### 3.1 前端核心技术选型
| 领域 | 核心技术栈 | 选型与版本约束 |
| :--- | :--- | :--- |
| **框架与核心** | Next.js + React | **Next.js 15+ (App Router)** / **React 19** / **TypeScript 5.x** |
| **样式与组件库** | Tailwind CSS + shadcn/ui + Radix UI | Tailwind CSS 3.4+ / shadcn/ui (Radix Primitives) |
| **交互与动效** | Framer Motion + GSAP | 复杂高帧率排序动效与 SVG 演算使用 **GSAP**，微交互与页面转场使用 **Framer Motion** |
| **网络与状态** | Axios + Zustand | 客户端统一请求封装使用 **Axios**，轻量化全局状态管理使用 **Zustand** |
| **代码质量** | Prettier + ESLint | 严格类型检查、统一代码格式化与规范检查 |

### 3.2 后端核心技术选型
| 领域 | 核心技术栈 | 选型与版本约束 |
| :--- | :--- | :--- |
| **语言与运行时** | Java | **Java 21 (LTS)** |
| **微服务底座** | Spring Boot / Spring Cloud | **Spring Boot 3.5+** / **Spring Cloud 2025** / **Spring Cloud Alibaba 2023** |
| **服务注册与配置** | Nacos | **Spring Cloud Alibaba Nacos 2023+** (动态配置与服务发现) |
| **API 网关与通信** | Spring Cloud Gateway / OpenFeign | Gateway 5.0+ (WebFlux 响应式路由) + OpenFeign 服务契约调用 |
| **认证鉴权与安全** | Sa-Token | **Sa-Token 1.44+** (网关集中鉴权 + Redis Session 共享 + JWT 无状态令牌) |
| **ORM 与数据持久化**| MyBatis-Plus / MySQL | **MyBatis-Plus 3.5+** / **MySQL 8.0+** (HikariCP 高性能连接池) |
| **分布式缓存与锁** | Redis / Redisson / Caffeine | **Redis 7.0+** + **Redisson 3.48+** (分布式锁与分布式集合) + **Caffeine 3.2+** (本地一级缓存) |
| **消息队列与解耦** | RabbitMQ | **RabbitMQ 3.13+** (Spring Boot AMQP，实现削峰、异步解耦与死信保障) |
| **AI 与 RAG 智能底座**| Spring AI Alibaba / Qwen | **Spring AI 1.1+** / **Spring AI Alibaba 1.1+** (对接通义千问大模型与流式对话) |
| **搜索引擎与向量库**| Elasticsearch | **Elasticsearch 9.3+** (Spring Data Elasticsearch，全文与混合分词检索) |
| **实时网络通信** | WebSocket / Netty | Spring WebSocket + Netty 4.2+ (算法演练协同与消息推送) |
| **对象存储与文档** | 腾讯云 COS / EasyExcel / Flexmark | Tencent COS SDK / EasyExcel 4.0+ / Flexmark (Markdown 结构化解析切片) |
| **API 契约文档** | Knife4j | **Knife4j 4.5+** (基于 OpenAPI 3 / Jakarta 规范) |
| **基础工具库** | Hutool / Lombok / Commons | Hutool 5.8+ / Lombok 1.18+ / Apache Commons (Lang3, IO, FileUpload) / Ip2region |
| **日志与审计监控** | SLF4J / Logback / Actuator | Logstash Logback Encoder 8.0+ + Spring Boot Actuator |

---

## 4. 架构边界与工程执行守则

工程详细目录分工请参阅 [PROJECT.md](file:///Users/stephenqiu/Desktop/StephenQiu/AlgoFlow/PROJECT.md)。

1. **统一前端架构**：
   - 所有的用户界面、算法演练、AI 对话以及**系统运营管理后台（Admin）**均在 `frontend/` 中统一实现（管理路由统一置于 `frontend/src/app/admin/` 或相关路由分组下）；
   - **绝对不允许**创建独立的 admin 代码库或独立工程。
2. **微服务后端规范**：
   - 所有数据持久化、高并发控制、分布式缓存、消息队列与 RAG 向量管道均在 `backend/` 下管理；
   - 严格遵循 `algorithm-gateway` 统一鉴权路由与微服务通信契约，不得在微服务间绕开网关随意暴露公共访问端口。
3. **文档单一可信源**：
   - 所有的全局系统设计文档、算法知识库文档必须集中存放于 `docs/`，并在代码或注释中通过相对路径引用。

### 研发验证流水线：
- **前端提交前验证**：
  ```bash
  cd frontend
  npm run typecheck    # 严格 TypeScript 类型检查
  npm run lint         # ESLint 代码风格检查
  npm test             # 核心单元测试
  npm run build        # 生产构建验证
  ```
- **后端提交前验证**：
  ```bash
  cd backend
  mvn clean test-compile
  mvn -B package -DskipTests
  ```

---

## 5. Git 提交与协作守则

提交信息**必须严格遵循 `type(scope): xxx` 规范**：

### 5.1 提交格式：
```text
type(scope): 动词开头的简明描述
```

### 5.2 常用 Type 标识：
- `feat`: 新增功能特性
- `fix`: 缺陷修复
- `docs`: 文档编写或变更
- `style`: 代码格式变动（标点、空格、格式化，不影响代码逻辑）
- `refactor`: 代码重构（非新增功能且非 bug 修复）
- `perf`: 性能优化
- `test`: 测试用例新增或调整
- `chore`: 构建配置、脚本、依赖库等辅助工具变更
- `ci`: CI/CD 持续集成流程调整

### 5.3 规范化 Scope 范围示例：
- **前端作用域**：`visualizer`, `ai-chat`, `sorting-lib`, `admin`, `auth-ui`, `store`, `components`
- **后端作用域**：`gateway`, `ai-service`, `search-service`, `user-service`, `post-service`, `file-service`, `common-auth`, `nacos`
- **公共与全局**：`docs`, `config`, `deps`, `docker`

**提交示例**：
```bash
feat(visualizer): 增加归并算法递归树可视化高亮步进
fix(ai-service): 修复 RAG 知识库切片相似度重排分值溢出问题
refactor(store): 使用 zustand 重构算法播放器全局上下文
docs(readme): 更新 PROJECT.md 目录划分与环境运行指引
```

- **安全红线**：严禁提交包含真实密钥、密码或生产配置的 `.env` 或 `common-secret.properties` 文件。
