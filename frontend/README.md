# 衍序 · AlgoFlow 前端交互系统 (AlgoFlow Frontend)

<p align="center">
  <strong>推衍秩序 · 步进数据心流 | 面向排序算法教学的 RAG 增强型交互式系统</strong>
</p>

<p align="center">
  <a href="../LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
  <a href="https://github.com/StephenQiu30/algoflow/stargazers"><img src="https://img.shields.io/github/stars/StephenQiu30/algoflow?style=social" alt="Stars"></a>
  <img src="https://img.shields.io/badge/Next.js-15+-black.svg" alt="Next.js 15+">
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg" alt="Tailwind CSS">
</p>

> **English**: Interactive sorting-algorithm classroom with step-by-step animation, complexity cards, and RAG-powered Q&A.
>
> **中文**：将排序动画、执行步骤、复杂度分析、代码高亮和 RAG 智能问答融汇于一体。适合算法教学、课堂演示、深度演算与面试复习。

---

## 体验与入口

| 入口 | 说明 |
| --- | --- |
| 本地开发 | `pnpm install && pnpm run dev` → <http://localhost:3000> |
| 排序工作台 | `/sorting` 算法演练与详情：`/sorting/[slug]` |
| 社区博客 | `/blog` 题解讨论与学习记录 |
| 运营后台 | `/admin` 统一管理后台 (用户、内容、知识库与日志) |

---

## 核心亮点

- **可视化优先**：高帧率步进演算比较、交换、分区、合并指针状态，而非抽象伪代码；
- **知识卡片**：19篇算法深度解析、时间/空间复杂度、稳定性、适用场景对比；
- **RAG 智能导师**：基于领域知识库召回解释，支持流式 SSE 对话；
- **现代前端全栈**：Next.js 15 App Router、React 19、Tailwind CSS、Radix UI、GSAP、Framer Motion、Zustand、Axios。

---

## 核心算法支持矩阵

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定性 |
| --- | --- | --- | --- | --- |
| 冒泡排序 Bubble | O(n²) | O(n²) | O(1) | 是 |
| 选择排序 Selection | O(n²) | O(n²) | O(1) | 否 |
| 插入排序 Insertion | O(n²) | O(n²) | O(1) | 是 |
| 希尔排序 Shell | O(n log n)~O(n²) | O(n²) | O(1) | 否 |
| 归并排序 Merge | O(n log n) | O(n log n) | O(n) | 是 |
| 快速排序 Quick | O(n log n) | O(n²) | O(log n) | 否 |
| 堆排序 Heap | O(n log n) | O(n log n) | O(1) | 否 |
| 基数排序 Radix | O(nk) | O(nk) | O(n+k) | 是 |

算法纯逻辑实现位于 [`src/lib/sortingAlgorithms.ts`](src/lib/sortingAlgorithms.ts)，可视化交互组件位于 [`src/components/sorting/`](src/components/sorting/)。

---

## 快速上手

```bash
cd frontend

# 推荐使用 pnpm
pnpm install
pnpm run dev
```

打开浏览器访问 <http://localhost:3000>。

### 脚本说明

| 命令 | 说明 |
| --- | --- |
| `pnpm run dev` | 本地热重载开发服务器 |
| `pnpm run build` | 生产包打包构建 |
| `pnpm run start` | 生产环境预览启动 |
| `pnpm run lint` | ESLint 代码规范扫描 |
| `pnpm run format` | Prettier 代码自动格式化 |
| `pnpm run typecheck` | TypeScript 严格类型检查 |

---

## 目录结构

```text
src/
├── api/                  # 基于 Axios 封装的统一业务 API 请求
├── app/                  # Next.js App Router 页面 (sorting, blog, user, admin)
├── components/           # UI 组件库 (sorting, auth, blog, common, design, ui)
├── enums/                # 前端枚举定义
├── hooks/                # 自定义 React Hooks
├── lib/                  # 工具库与 19 种排序算法核心演算步进器
├── store/                # Zustand 全局状态管理
└── types/                # TypeScript 统一类型声明
```

---

## 项目体系联动

本项目为 **衍序 · AlgoFlow** 统一代码库（Monorepo）中的前端应用：
- 完整项目仓库：[StephenQiu30/algoflow](https://github.com/StephenQiu30/algoflow)
- 后端微服务集群位于根目录下的 [`backend/`](../backend/)，启动网关与对应微服务后即可无缝对接。
