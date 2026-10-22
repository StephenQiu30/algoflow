# 衍序 · AlgoFlow

> **推衍秩序 · 步进数据心流**  
> 面向排序算法教学的 RAG 增强型交互式系统 (RAG-enhanced Interactive System for Sorting Algorithm Teaching)

---

## 📖 项目简介

**衍序 (AlgoFlow)** 是一套融合**算法动态可视化演练**、**RAG 智能导师问答**与**沉浸式交互教学**的现代化全栈系统。系统旨在打破传统算法教学中“抽象难懂、步骤不可见、缺乏即时反馈”的壁垒，通过丝滑的动态演进过程与 AI 智能知识库辅导，让学习者深度洞察排序逻辑的每一步流转。

---

## 🏗️ 整体架构

项目整体工程架构划分为三大核心目录：

```text
AlgoFlow/
├── backend/          # 后端分布式微服务系统 (Java 21 / Spring Boot 3.5 / Spring Cloud / Spring AI)
├── frontend/         # 现代化交互前端系统 (Next.js 15 / React 19 / GSAP / Radix UI / Tailwind CSS)
└── docs/             # 统一文档中心 (UI/UX 规范、系统设计、19篇系统化排序算法知识库)
```

### 1. `backend/`（后端微服务）
基于 **Java 21 + Spring Boot 3.5 + Spring Cloud Alibaba + Spring AI** 构建的高可用微服务集群：
- **`algorithm-gateway`**: 统一 API 网关与路由鉴权
- **`algorithm-api`**: 微服务间 Feign 接口契约与 DTO 规范
- **`algorithm-common`**: 基础公共组件库（认证、安全、全局异常、通用工具）
- **`algorithm-service`**:
  - `algorithm-ai-service`: RAG 向量检索、知识库问答与 AI 导师辅导
  - `algorithm-user-service`: 用户账户体系、权限与资料中心
  - `algorithm-post-service`: 讨论区与算法笔记交流
  - `algorithm-search-service`: Elasticsearch 高性能全文检索
  - `algorithm-file-service`: 对象存储与附件管理
  - `algorithm-log-service`: 系统审计与访问日志服务
  - `algorithm-notification-service`: 站内消息与异步通知中心
  - `algorithm-mail-service`: 邮件异步推送服务

### 2. `frontend/`（统一交互前端）
统一整合前台算法沉浸学习、可视化步进演示、AI 对话助手以及系统运营管理后台功能：
- **技术栈**：Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
- **动效引擎**：GSAP (GreenSock) + Framer Motion，提供高帧率排序演进可视化
- **UI 规范**：遵循 Apple 极简科技设计语言与 Radix UI 无障碍设计标准
- **管理能力**：原独立 Admin 后台已收敛至前端体系中统一实现（`/admin` 路由管理模块）

### 3. `docs/`（统一设计与文档中心）
- **`docs/design/DESIGN.md`**: Apple 设计规范与视觉设计分析
- **`docs/algorithms/`**: 包含 19 篇高品质排序算法教学、工程实践、场景选型与知识图谱系统化文档
- **`docs/teaching-repair.md`**: 教学交互与修复规范

---

## 🚀 快速启动

### 前端开发运行
```bash
cd frontend

# 安装依赖
pnpm install # 或 npm install

# 启动开发服务器
npm run dev
# 访问 http://localhost:3000
```

### 后端服务启动
```bash
cd backend

# 构建项目
mvn clean install -DskipTests

# 按需启动核心微服务组件
# 1. Nacos 配置与注册中心
# 2. algorithm-gateway 网关
# 3. 业务服务 (algorithm-user-service, algorithm-ai-service 等)
```

---

## 📄 开源许可证

本项目基于 MIT 许可证开源。
