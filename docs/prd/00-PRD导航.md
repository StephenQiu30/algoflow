# 产品需求与规格文档导航 (docs/prd)

> **研发链路定位**：03. PRD (产品规格阶段)  
> **流转规则**：每份 PRD 链接唯一来源设计，说明用户需要什么、范围到哪里、交互规格是什么、如何验收。每份 PRD 可拆解对应多份实施计划（Plan）。  
> **撰写模板**：新增产品需求文档请使用 [PRD 模板 (docs/templates/04-PRD模板.md)](../templates/04-PRD模板.md)。

---

## 📂 PRD 文档矩阵与来源映射表

| 文档编号 | 产品需求文档名称 | 核心产品范围与功能 | 唯一来源技术设计 | 对应实施计划 |
| :---: | :--- | :--- | :--- | :--- |
| **00** | [产品全景与信息架构 (README.md)](README.md) | 全站信息架构 (IA)、路由组织与用户旅程 | [设计体系概览](../design/README.md) | [研发计划总览](../plan/README.md) |
| **01** | [算法动态演练工作台 PRD (prd-sorting-visualizer.md)](prd-sorting-visualizer.md) | 19 种排序算法画布、多速步进、指针高亮、自定义输入、指标演算 | [微服务架构与通信设计](../design/architecture.md) | [M1~M2 迭代实施计划](../plan/milestone-roadmap.md) |
| **02** | [RAG 增强型 AI 导师 PRD (prd-ai-mentor.md)](prd-ai-mentor.md) | 演练步骤快照感知提问、流式打字机答疑、知识库溯源引用卡片 | [RAG 算法导师架构](../design/rag-architecture.md) | [M2 迭代实施计划](../plan/milestone-roadmap.md) |
| **03** | [社区讨论与题解博客 PRD (prd-community-and-learning.md)](prd-community-and-learning.md) | 算法深度题解、Markdown 阅读器、点赞评论、成长勋章 | [数据模型与缓存架构](../design/data-model.md) | [M3 社区生态计划](../plan/milestone-roadmap.md) |
| **04** | [统一运营与切片管理后台 PRD (prd-admin-ops.md)](prd-admin-ops.md) | 内嵌 `/admin` 路由、Markdown AST 分块微调、多路召回实验室 | [微服务架构与设计](../design/architecture.md) | [M3 统一后台计划](../plan/milestone-roadmap.md) |

---

## 🔗 快速流转
- [返回统一文档中心](../README.md)
- [查看工程写作模板库](../templates/00-模板导航.md)
- [流转至研发与实施计划 (docs/plan)](../plan/00-Plan导航.md)
