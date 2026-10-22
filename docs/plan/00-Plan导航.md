# 实施与交付计划导航 (docs/plan)

> **研发链路定位**：04. Plan (实施与交付阶段)  
> **流转规则**：实施计划负责说明前置依赖、改动文件清单、精确代码步骤、验证命令与回滚预案。实施状态统一只在 [BACKLOG.md](../../BACKLOG.md) 调度，执行证据只在 [HANDOVER.md](../../HANDOVER.md) 或测试日志中记录。  
> **撰写模板**：新增研发计划请使用 [实施计划模板 (docs/templates/05-实施计划模板.md)](../templates/05-实施计划模板.md)，新增测试用例请使用 [测试场景模板 (docs/templates/03-测试场景模板.md)](../templates/03-测试场景模板.md)。

---

## 📂 实施计划与测试文档矩阵

| 文档编号 | 实施计划 / 测试文档名称 | 核心定位与说明 | 唯一来源 PRD | 当前执行状态 |
| :---: | :--- | :--- | :--- | :---: |
| **00** | [研发规划与路线总览 (README.md)](README.md) | 总体工程排期、甘特图与研发阶段划分 | [PRD 体系总览](../prd/README.md) | Baseline v1.0 |
| **01** | [里程碑与迭代路线图 (milestone-roadmap.md)](milestone-roadmap.md) | M1 (基础底座/已完成) → M2 (演练与RAG/进行中) → M3 (社区/待排期) | [各模块 PRD 集合](../prd/00-PRD导航.md) | M1: 100% / M2: 85% |
| **02** | [测试策略与交付发布方案 (test-and-release-plan.md)](test-and-release-plan.md) | 测试金字塔、60FPS 与 TTFB 性能基线、CI/CD 自动化流水线门禁 | [全系统 NFR 规范](../requirement/system-requirements.md) | Active |

---

## 🔗 快速流转
- [返回统一文档中心](../README.md)
- [查看工程写作模板库](../templates/00-模板导航.md)
- [查看当前研发任务积压看板 (BACKLOG.md)](../../BACKLOG.md)
- [查看系统接力备忘 (HANDOVER.md)](../../HANDOVER.md)
