# Algorithm Next · Interactive Sorting Visualizer + RAG Q&A

<p align="center">
  <strong>排序算法可视化课堂 · Next.js + React + RAG 智能问答</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
  <a href="https://github.com/StephenQiu30/algorithm-next/stargazers"><img src="https://img.shields.io/github/stars/StephenQiu30/algorithm-next?style=social" alt="Stars"></a>
  <img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-blue.svg" alt="TypeScript">
</p>

> **English**: Interactive sorting-algorithm classroom with step-by-step animation, complexity cards, and RAG-powered Q&A.
>
> **中文**：把排序动画、执行步骤、复杂度分析、代码高亮和 RAG 问答放进同一条学习路径。适合算法入门、课堂演示与面试复习。

---

## Demo

| 入口 | 说明 |
| --- | --- |
| 本地体验 | `pnpm install && pnpm run dev` → <http://localhost:3000> |
| 在线 Demo | 部署到 Vercel 后替换此链接（见 `GITHUB_SEO_CHECKLIST.md`） |
| 排序工作台 | `/sorting`　算法详情：`/sorting/[slug]` |
| 社区博客 | `/blog` |

> 建议：Fork 后部署到 Vercel，30 秒即可拥有可分享的 Demo 链接——这对转化 Star 非常关键。

---

## Why this project

- **可视化优先**：逐步展示比较、交换、分区、合并，而不是只丢一段伪代码
- **知识卡片**：原理、时间/空间复杂度、稳定性、适用场景
- **RAG 问答**：围绕当前算法从知识库召回解释，支持流式对话
- **现代前端栈**：Next.js 16、React 19、Tailwind、Radix UI、GSAP、Framer Motion

---

## Supported Algorithms

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定 |
| --- | --- | --- | --- | --- |
| 冒泡排序 Bubble | O(n²) | O(n²) | O(1) | 是 |
| 选择排序 Selection | O(n²) | O(n²) | O(1) | 否 |
| 插入排序 Insertion | O(n²) | O(n²) | O(1) | 是 |
| 希尔排序 Shell | O(n log n)~O(n²) | O(n²) | O(1) | 否 |
| 归并排序 Merge | O(n log n) | O(n log n) | O(n) | 是 |
| 快速排序 Quick | O(n log n) | O(n²) | O(log n) | 否 |
| 堆排序 Heap | O(n log n) | O(n log n) | O(1) | 否 |
| 基数排序 Radix | O(nk) | O(nk) | O(n+k) | 是 |

实现位于 [`src/lib/sortingAlgorithms.ts`](src/lib/sortingAlgorithms.ts)，可视化组件见 [`src/components/sorting/`](src/components/sorting/)。

---

## Features

- 排序过程逐步播放 / 暂停 / 调速
- 算法知识卡片与复杂度对比
- 代码高亮 + Markdown / GFM / KaTeX
- RAG 对话面板（对接 `algorithm-cloud` AI 服务）
- 响应式布局、暗色主题、动效
- 用户登录、博客、通知、搜索（依赖后端）

---

## Quick Start

```bash
git clone https://github.com/StephenQiu30/algorithm-next.git
cd algorithm-next

# 推荐 pnpm
pnpm install
pnpm run dev
```

打开 <http://localhost:3000>。

| 命令 | 说明 |
| --- | --- |
| `pnpm run dev` | 开发服务器 |
| `pnpm run build` | 生产构建 |
| `pnpm run start` | 生产启动 |
| `pnpm run lint` | ESLint |
| `pnpm run format` | Prettier 格式化 |
| `pnpm run openapi2ts` | 按 OpenAPI 生成类型 |

RAG / 登录等能力需要启动 [algorithm-cloud](https://github.com/StephenQiu30/algorithm-cloud) 后端，并检查 `src/api/` 与 `src/lib/` 中的 API 地址。

---

## Project Layout

```text
src/
├── app/                  # 路由页面（sorting / blog / user ...）
├── components/sorting/   # 可视化、控制条、RAG 面板
├── lib/sortingAlgorithms.ts # 唯一的算法实现、教学步骤与代码行映射
├── api/                  # OpenAPI 生成的请求层
└── store/                # Redux Toolkit
```

---

## Related Repositories

| 仓库 | 角色 |
| --- | --- |
| [algorithm-cloud](https://github.com/StephenQiu30/algorithm-cloud) | 微服务后端 + RAG 核心（**主仓库**） |
| [algorithm-admin](https://github.com/StephenQiu30/algorithm-admin) | 管理后台 |
| **algorithm-next（本仓库）** | 用户端可视化课堂 |

---

## Contributing

欢迎补充新的排序算法、可视化步骤与教学案例。提交前请运行：

```bash
pnpm run lint
pnpm run format:check
```

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=StephenQiu30/algorithm-next&type=Date)](https://star-history.com/#StephenQiu30/algorithm-next&Date)

觉得有用就点个 **Star** 吧，让更多学算法的人看到这个可视化课堂。

---

## License

[Apache License 2.0](LICENSE)

## Maintainer

[StephenQiu30](https://github.com/StephenQiu30)
