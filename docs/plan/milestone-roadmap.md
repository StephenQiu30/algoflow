# 里程碑与迭代路线图 (Milestones & Engineering Roadmap)

> **文档编号**：PLN-ROD-001  
> **所属模块**：04. Plan  
> **状态**：Active / Baseline v1.0.0

---

## 1. 里程碑阶段规划 (Milestone Breakdown)

### 🚩 Milestone 1: 核心底座与算法演算引擎 (M1 - 基础夯实)
* **目标周期**：2026.09.01 ~ 2026.10.05
* **完成状态**：✅ **100% 达成 (Completed)**
* **交付物清单**：
  1. 完成 Monorepo 代码架构重组（`backend/`, `frontend/`, `docs/`）；
  2. 后端 30 个微服务模块 Maven 拓扑治理，统一 Parent POM 与公共组件封装；
  3. 建立 19 篇结构化排序算法官方知识库（`docs/algorithms/00~18`）；
  4. 实现前端 19 种基础与高级排序算法核心演算步进器（`src/lib/algorithms/`），具备纯函数步骤生成与不可变快照特性；
  5. 核心算法逻辑 17 项端到端单元测试全量通过（测试通过率 100%）。

---

### 🚩 Milestone 2: 交互演练工作台与领域 RAG 导师 (M2 - 核心体验)
* **目标周期**：2026.09.25 ~ 2026.11.05
* **完成状态**：🟡 **85% 进行中 (In Progress)**
* **交付物清单**：
  1. 基于 Next.js 15 + GSAP + Radix UI 构建 Apple 极简风格演练工作台（`SortingVisualizer.tsx`）；
  2. 支持播放/暂停、单步前进、单步后退、速度滑块及 4 种预设形态数据集（随机、近乎有序、逆序、重复）；
  3. 后端 `algorithm-ai-service` 接入 Spring AI Alibaba 与通义千问，支持 SSE 流式推演输出；
  4. 整合 Elasticsearch 向量数据库与 Flexmark 文档语义 AST 切片；
  5. 演练工作台与 RAG AI 导师的上下文快照双向绑定（正在执行联调与边界防护）。

---

### 🚩 Milestone 3: 社区生态、题解互动与统一运营后台 (M3 - 扩展演进)
* **目标周期**：2026.11.01 ~ 2026.11.30
* **完成状态**：⚪ **规划待排期 (Planned)**
* **交付物清单**：
  1. 题解博客 Markdown 阅读器、TOC 大纲与发布草稿箱（`src/app/blog/`）；
  2. 用户学习打卡足迹与成就勋章系统（`src/app/user/`）；
  3. 统一内嵌管理后台（`src/app/admin/`）：切片可视化微调、多路召回效果评测与全站 API 审计日志；
  4. 生产环境容器化自动化构建与性能压力测试（60 FPS 压测与 P99 延迟保障）。

---

## 2. 详细工作分解结构 (WBS & Task Matrix)

| 阶段 | 模块 / 任务项 | 负责端 | 优先级 | 当前状态 | 关联文件 / 目录 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M1** | 核心算法纯逻辑步进器 | 前端 | P0 | ✅ 已完成 | `frontend/src/lib/algorithms/` |
| **M1** | 微服务架构与网关鉴权底座 | 后端 | P0 | ✅ 已完成 | `backend/algorithm-gateway/` |
| **M1** | 19 篇算法教学官方文档 | 文档 | P0 | ✅ 已完成 | `docs/algorithms/` |
| **M1** | 算法演算核心单元测试集 | 前端 | P0 | ✅ 已完成 | `frontend/tests/core.test.cjs` |
| **M2** | 演练工作台与 GSAP 高帧率渲染 | 前端 | P0 | ✅ 已完成 | `frontend/src/components/sorting/` |
| **M2** | RAG 向量切片与 ES 混合检索 | 后端 | P0 | ✅ 已完成 | `backend/algorithm-service/algorithm-ai-service/` |
| **M2** | 演算上下文快照与 AI 导师联调 | 全栈 | P0 | 🟡 联调中 | `frontend/src/components/sorting/RAGChatPanel.tsx` |
| **M3** | 题解博客 Markdown 发布与浏览 | 前端/全栈 | P1 | ⚪ 待开始 | `frontend/src/app/blog/` |
| **M3** | 统一管理后台 Admin 路由实现 | 前端 | P1 | ⚪ 待开始 | `frontend/src/app/admin/` |
| **M3** | 召回评测实验室与可视化分析 | 全栈 | P2 | ⚪ 待开始 | `frontend/src/app/admin/evaluation/` |
