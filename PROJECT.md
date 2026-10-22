# 衍序 · AlgoFlow 项目工程与代码目录规范手册 (PROJECT.md)

本文档作为 **衍序 · AlgoFlow** 项目的统一工程架构与目录全貌规范指南，旨在约束全栈代码目录结构、微服务矩阵划分、前端组件与路由体系，确保团队开发者与 AI Agent 遵循一致的工程边界。

---

## 1. 顶层目录架构全貌

项目采用统一 Monorepo（单一代码库）组织模式，分为前端交互层、后端微服务集群、统一文档中心及自动化部署环境：

```text
AlgoFlow/
├── backend/                  # 后端微服务集群 (Java 21 / Spring Boot 3.5 / Spring Cloud Alibaba)
├── frontend/                 # 统一交互前端 (Next.js 15 / React 19 / Tailwind / shadcn/ui / GSAP)
├── docs/                     # 统一文档中心 (UI/UX 规范、系统架构设计、算法教学知识库)
├── .github/                  # CI/CD 工作流、Issue/PR 协作模板
├── docker-compose.yml        # 应用服务容器编排配置
├── docker-compose-env.yml    # 中间件基础环境 (MySQL, Redis, RabbitMQ, Nacos, ES)
├── AGENTS.md                 # Agent 研发协同与规范文件 (Alibaba Java + Vercel 规范)
├── PROJECT.md                # 统一项目工程与目录规范手册 (本文档)
├── CONTRIBUTING.md           # 开源贡献指南
├── README.md                 # 项目介绍主文档
└── LICENSE                   # 开源许可协议
```

---

## 2. 前端工程规范 (`frontend/`)

### 2.1 技术栈选型
前端采用业界前沿且高性能的技术组合：
* **核心框架**：`Next.js 15+ (App Router)` + `React 19` + `TypeScript`
* **样式与组件库**：`Tailwind CSS` + `shadcn/ui` + `Radix UI Primitives`
* **交互与动效**：`GSAP` (高帧率演算与算法步骤动画) + `Framer Motion` (页面转场与微交互)
* **网络与状态管理**：`Axios` (统一请求封装与拦截器) + `Zustand` (轻量高性能全局状态管理)
* **代码质量与格式化**：`ESLint` + `Prettier`

### 2.2 前端目录拓扑
前端严格采用模块化分层，禁止混乱导入与循环依赖：

```text
frontend/
├── public/                   # 静态静态资源 (图标、图片、公开数据等)
├── src/
│   ├── api/                  # 统一 API 请求接口层 (按业务模块划分，基于 axios 封装)
│   │   ├── ai/               # AI 问答、RAG 向量问答与流式接口
│   │   ├── auth/             # 认证与用户鉴权相关接口
│   │   ├── file/             # 文件上传与管理接口
│   │   ├── log/              # 审计日志接口
│   │   ├── mail/             # 邮件发送与校验接口
│   │   ├── notification/     # 系统通知与推送接口
│   │   ├── post/             # 社区讨论与题解博客接口
│   │   ├── search/           # 全局与知识库聚合检索接口
│   │   ├── user/             # 用户中心接口
│   │   └── websocket/        # WebSocket 客户端连接与事件协议
│   ├── app/                  # Next.js 15 App Router 路由体系
│   │   ├── admin/            # 统一管理后台路由 (严禁新建独立 admin 项目)
│   │   ├── blog/             # 题解与技术博客路由
│   │   ├── sorting/          # 核心排序算法可视化演练工作台路由
│   │   ├── user/             # 个人中心与账号设置路由
│   │   ├── layout.tsx        # 根布局组件 (全局 Provider, Header, Footer)
│   │   ├── page.tsx          # 官网主页 (Hero, 算法大厅入口, 特性展示)
│   │   ├── loading.tsx       # 全局 Suspense 加载占位
│   │   ├── error.tsx         # 全局错误捕获边界
│   │   └── globals.css       # Tailwind 基础层与设计系统变量定义
│   ├── components/           # UI 组件库
│   │   ├── auth/             # 登录、注册、找回密码弹窗/组件
│   │   ├── blog/             # 博客阅读、Markdown 渲染器
│   │   ├── common/           # 通用基础组件 (Loading, Empty, StatusBadge 等)
│   │   ├── design/           # Apple 极简风格特制设计组件
│   │   ├── footer/           # 页脚组件
│   │   ├── header/           # 导航栏组件 (含响应式抽屉与主题切换)
│   │   ├── notification/     # 通知栏与实时消息列表
│   │   ├── providers/        # 全局上下文 Provider (Theme, Store, Query)
│   │   ├── search/           # 聚合搜索弹窗组件 (Command Palette 风格)
│   │   ├── sorting/          # 算法可视化演练专项组件 (画布、步进轴、控制面板)
│   │   ├── theme/            # 亮暗色主题切换组件
│   │   └── ui/               # 基于 shadcn/ui (Radix Primitives) 的无样式原子组件
│   ├── enums/                # 前端枚举定义 (角色、业务类型、WS消息类型等)
│   ├── hooks/                # 自定义 React Hooks (算法控制 useSortingVisualizer, useWebSocket 等)
│   ├── lib/                  # 工具类库与算法实现引擎
│   │   ├── algorithms/       # 19 种基础与高级排序算法核心演算步进器 (纯逻辑)
│   │   ├── courseVersion.ts  # 课程与教学文档版本管理
│   │   ├── dayjs.ts          # 时间日期格式化工具
│   │   ├── ragStream.ts      # AI RAG 流式解码器
│   │   ├── request.ts        # Axios 统一客户端实例 (拦截器、Token 刷新、统一错误处理)
│   │   └── utils.ts          # Tailwind 样式合并 (cn) 等常用工具函数
│   ├── store/                # Zustand 全局状态管理
│   │   ├── modules/          # 业务状态切片 (算法演练状态, 播放控制, 用户信息)
│   │   ├── hooks.ts          # Zustand 便捷 Hook 导出
│   │   └── index.ts          # Store 入口
│   └── types/                # TypeScript 统一类型定义
│       └── sorting.ts        # 排序步骤、指针、比较高亮类型定义
├── tests/                    # 单元测试与集成测试目录
├── components.json           # shadcn/ui 配置文件
├── eslint.config.mjs         # ESLint 代码风格规范配置
├── next.config.ts            # Next.js 运行配置
├── package.json              # 前端包管理与构建脚本
├── postcss.config.mjs        # PostCSS 插件配置
├── tailwind.config.ts        # Tailwind CSS 主题与颜色扩展配置
└── tsconfig.json             # 严格 TypeScript 编译配置
```

### 2.3 前端架构守则：
1. **统一后台管理**：所有 Admin 页面统一放置在 `src/app/admin/`，严禁新建独立的前端项目；
2. **规范请求客户端**：所有的外部 API 交互统一经由 `src/lib/request.ts` 封装的 Axios 实例发起，禁止在页面组件中裸写 `fetch` 发送业务请求；
3. **分层状态管理**：局部状态使用 `useState`，组件树共享状态优先使用 `Zustand`（放置于 `src/store/`），避免 Context 的无效重渲染；
4. **动效职责划分**：GSAP 用于处理复杂的 Canvas / SVG 算法指针变换与高帧率排序矩阵演练，Framer Motion 用于页面路由转场与弹性交互。

---

## 3. 后端微服务集群规范 (`backend/`)

### 3.1 技术栈选型
后端微服务集群全面遵循现代化、高内聚、低耦合与高可用设计：

| 领域与层次 | 核心技术选型 | 版本基线与功能定位 |
| :--- | :--- | :--- |
| **基础语言与环境** | **Java 21 (LTS)** | 现代化 Java 语法，虚拟线程与高吞吐并发支持友好 |
| **核心微服务底座** | **Spring Boot 3.5+** / **Spring Cloud 2025** | 企业级微服务治理与自动化装配核心 |
| **注册与配置中心** | **Spring Cloud Alibaba Nacos 2023+** | 分布式微服务服务发现、服务健康监测与动态配置热拉取 |
| **网关与路由鉴权** | **Spring Cloud Gateway 5.0+** + **Sa-Token 1.44+** | 响应式 WebFlux 网关路由、统一限流与跨域拦截；结合 Sa-Token 实现网关统一鉴权 |
| **服务通信与 RPC** | **Spring Cloud OpenFeign** | 声明式 HTTP 客户端，配合 `algorithm-api/*` 契约模块实现跨服务安全调用 |
| **持久层与 ORM** | **MyBatis-Plus 3.5+** + **MySQL 8.0/8.4** | 简化 CRUD、内置分页插件与自动填充，配合 HikariCP 高性能连接池 |
| **分布式缓存与锁** | **Redis 7.0+** + **Redisson 3.48+** + **Caffeine 3.2+** | 二级缓存架构（Caffeine 本地 + Redis 集中），Redisson 提供安全可靠的分布式锁 |
| **异步消息驱动** | **RabbitMQ 3.13+** (Spring Boot AMQP) | 消息确认（ACK）、延迟死信队列、日志埋点与异步解耦消费 |
| **AI 与 RAG 智能体系**| **Spring AI 1.1+** + **Spring AI Alibaba 1.1+** | 领域大模型（通义千问 Qwen）对接、流式响应（SSE）、Prompt 模板引擎与问答链 |
| **全文检索与向量存储**| **Elasticsearch 9.3+** (Spring Data Elasticsearch) | 19 篇算法教程结构化切片索引、知识点多路混合检索与高亮召回 |
| **实时全双工通信** | **Spring WebSocket** + **Netty 4.2+** | 算法演算协同、系统通知与实时长连接保持 |
| **对象存储 (OSS)** | **Tencent Cloud COS** (cos_api) / 阿里云 OSS | 静态资源、头像、算法课件附件的统一对象存储管理 |
| **文档与表格解析** | **Flexmark** + **EasyExcel 4.0+** + **OpenPDF** | Markdown 知识库 AST 语法树解析与分块、高性能 Excel 批量报表导入导出 |
| **开放接口文档** | **Knife4j 4.5+** (OpenAPI 3 / Jakarta) | 自动生成标准化微服务交互式调试文档 |
| **通用工具链** | **Hutool 5.8+** + **Lombok** + **Apache Commons** | 常用工具方法、类型转换、IO 处理与简化样板代码 |
| **日志与审计监控** | **SLF4J** + **Logback** + **Logstash Logback Encoder** | 结构化 JSON 日志归档与集中式日志采集管道对接 |

### 3.2 后端目录拓扑

```text
backend/
├── pom.xml                               # 顶层 Parent POM (统一依赖版本与插件管理)
├── nacos-config/                         # Nacos 集中配置中心配置文件
│   ├── common-ai.yml                     # AI 服务大模型与向量配置
│   ├── common-cache.yml                  # Redis 分布式缓存配置
│   ├── common-elasticsearch.yml          # ES 索引与检索连接配置
│   ├── common-mail.yml                   # 邮件发信服务器配置
│   ├── common-mysql.yml                  # 数据库连接池配置
│   ├── common-oss.yml                    # 对象存储配置
│   ├── common-rabbitmq.yml               # 消息队列交换机与队列配置
│   ├── common-web.yml                    # 通用 Web、Actuator 与跨域配置
│   ├── common-secret.properties.example  # 敏感配置模板 (严禁提交实际密钥)
│   └── import-config.sh                  # 一键导入 Nacos 配置脚本
├── sql/                                  # 数据库 DDL 与增量更新脚本
│   ├── algorithm.sql                     # 基础数据库全量建表与初始数据脚本
│   └── migrations/                       # 版本演进增量 SQL 迁移目录
├── algorithm-gateway/                    # API 统一路由网关服务 (Spring Cloud Gateway + Sa-Token)
├── algorithm-api/                        # Feign 客户端与跨服务契约接口定义 (只声明接口与 DTO)
│   ├── algorithm-api-ai/                 # AI 服务 RPC 契约
│   ├── algorithm-api-file/               # 文件服务 RPC 契约
│   ├── algorithm-api-log/                # 日志审计 RPC 契约
│   ├── algorithm-api-mail/               # 邮件服务 RPC 契约
│   ├── algorithm-api-notification/       # 通知推送 RPC 契约
│   ├── algorithm-api-post/               # 讨论社区 RPC 契约
│   ├── algorithm-api-search/             # 检索服务 RPC 契约
│   └── algorithm-api-user/               # 用户中心 RPC 契约
├── algorithm-common/                     # 通用公共依赖与基础设施 Starter
│   ├── algorithm-common-auth/            # Sa-Token 分布式鉴权扩展、用户上下文拦截器
│   ├── algorithm-common-cache/           # Redis 多级缓存、分布式锁封装
│   ├── algorithm-common-core/            # 核心公共类 (Result<T>, 基础异常, 工具类)
│   ├── algorithm-common-elasticsearch/   # ES 统一连接与检索封装
│   ├── algorithm-common-log/             # 统一操作审计日志 AOP 拦截器
│   ├── algorithm-common-mysql/           # MyBatis-Plus 自动填充、分页与多数据源基类
│   ├── algorithm-common-rabbitmq/        # 统一消息模型与队列封装
│   ├── algorithm-common-web/             # 全局统一异常捕获处理器, WebMvc 配置
│   └── algorithm-common-websocket/       # 实时通信 WebSocket 服务支持
└── algorithm-service/                    # 业务微服务实现集群 (包含实际业务逻辑与持久化)
    ├── algorithm-ai-service/             # RAG 增强导师、文档切片、向量嵌入与问答服务
    ├── algorithm-file-service/           # OSS 文件存储与临时凭证下发服务
    ├── algorithm-log-service/            # 系统审计日志与埋点持久化服务
    ├── algorithm-mail-service/           # 验证码邮件与系统告警异步发送服务
    ├── algorithm-notification-service/   # 站内信、广播消息与实时推送服务
    ├── algorithm-post-service/           # 算法学习笔记、题解与讨论社区服务
    ├── algorithm-search-service/         # 基于 ES 的全量算法与内容检索服务
    └── algorithm-user-service/           # 用户注册登录、权限控制与个人中心服务
```

### 3.3 后端架构守则：
1. **接口与实现解耦**：微服务之间的相互调用必须通过 `algorithm-api/*` 声明的标准 OpenFeign 接口，禁止直接引用其他服务的实现包（`algorithm-service/*`）；
2. **统一统一响应与错误**：所有 Controller 响应必须使用 `Result<T>` 封装，禁止裸露底层实体或抛出未捕获的 NullPointerException 等异常；
3. **通用能力下沉**：所有的基础工具类、缓存逻辑、切面统一维护在 `algorithm-common/*`，保持业务微服务的纯粹性；
4. **安全配置红线**：所有密钥类配置必须通过环境变量注入或加密后的 Nacos 远端配置托管，本地 `*-secret.properties` 严禁提交至版本库。

---

## 4. 统一文档中心 (`docs/`)

所有的项目规范与教学内容集中在 `docs/` 统一管理：
```text
docs/
├── algorithms/               # 19 篇经典与高级排序算法教学文档与深度分析 (单一可信源)
├── DESIGN.md                 # UI/UX 设计规范 (Apple 极简风格, 色彩, 动效, 交互约束)
└── README.md                 # 知识库索引与贡献文档说明
```

---

## 5. 本地开发与指令速查

### 5.1 环境启动
使用 Docker 一键启动所有支撑组件：
```bash
# 启动基础中间件 (MySQL, Redis, RabbitMQ, Nacos, ES)
docker-compose -f docker-compose-env.yml up -d

# 启动应用编排服务 (可选)
docker-compose up -d
```

### 5.2 前端常用指令 (`frontend/`)
```bash
cd frontend

# 安装依赖
pnpm install

# 本地热更新开发 (端口 3000)
pnpm dev

# 代码质量规范校验 (提交前必过)
npm run typecheck    # TypeScript 类型检查
npm run lint         # ESLint 代码规范扫描
npm test             # 单元测试
npm run course:check # 算法课程文档一致性校验
npm run build        # 生产打包测试
```

### 5.3 后端常用指令 (`backend/`)
```bash
cd backend

# 编译所有模块
mvn clean compile

# 单元测试与语法检查
mvn test-compile

# 跳过测试快速打包所有微服务 Jar
mvn -B package -DskipTests
```

---

## 6. 协作与模块拓展约束

1. **新建微服务**：必须在 `backend/algorithm-api/` 先行定义对外 Feign 接口及传输 DTO，在 `backend/algorithm-service/` 创建实现模块，并在 `backend/pom.xml` 中统一配置模块名及依赖版本。
2. **新建前端页面**：按照 Next.js 15 App Router 规范在 `frontend/src/app/` 下组织路由文件夹，非页面展示逻辑严格沉淀至 `components/`, `hooks/`, `lib/`，API 声明放至 `api/`。
3. **提交代码前检查**：Git Commit 遵从 `type(scope): message`，确保 CI 自动化验证无阻塞。
