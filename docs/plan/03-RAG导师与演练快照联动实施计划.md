# RAG导师与演练快照联动实施计划

> **文档编号**：PLN-03  
> **所属模块**：04. Plan  
> **唯一来源 PRD**：[PRD03 RAG增强型AI算法导师PRD](../prd/03-RAG增强型AI算法导师PRD.md)  
> **状态**：联调中 (In Progress)。实施状态统一在 [BACKLOG.md](../../BACKLOG.md) 调度，运行证据在 [HANDOVER.md](../../HANDOVER.md) 中记录。

---

## 1. 计划目标与交付范围

打通前端演练工作台瞬时快照与后端 RAG 问答服务的实时数据链路。在用户提问时自动挂载算法当前步数、数组快照、当前活动指针与代码行号；后端结合 ES 知识库向量切片进行混合召回，通过 SSE 流式向前端下发回答与溯源卡片。

---

## 2. 前置依赖与环境要求

* **后端服务**：`algorithm-gateway` (5.0+)、`algorithm-ai-service` (Spring AI Alibaba 1.1+)；
* **存储与检索**：Elasticsearch 9.3+（已建立 `algoflow_knowledge_chunk` 索引并初始化向量）；
* **大模型**：通义千问 API 凭证有效，支持流式 SSE 协议。

---

## 3. 涉及模块与改动文件清单

| 操作类型 | 文件相对路径 | 核心修改说明 |
| :---: | :--- | :--- |
| **已实现** | `backend/algorithm-api/algorithm-api-ai/` | 声明 `RAGAskRequest`、`RAGAnswerVO` 与流式接口契约 |
| **已实现** | `backend/algorithm-service/algorithm-ai-service/` | 混合检索召回逻辑、Prompt 动态编排、流式控制器 |
| **联调中** | `frontend/src/components/sorting/RAGChatPanel.tsx` | 演练状态机快照提取、SSE 事件流解析与溯源卡片渲染 |
| **已实现** | `frontend/src/lib/ragStream.ts` | 健壮的 SSE 解码器（支持多行字段、Split UTF-8 及 Abort 取消） |

---

## 4. 详细分步实施步骤

### Step 1: 契约模型与 Prompt 模板定义
* 定义 `RAGAskRequest` 包含 `algorithmType`, `currentStep`, `arraySnapshot`, `comparing`, `swapping`, `highlightLine`, `question`；
* 后端注入系统角色 Prompt，强制针对当前步骤解答并杜绝幻觉。

### Step 2: ES 混合检索与 Top-K 重排
* 用户提问先由 IK 分词器执行 BM25 文本匹配；
* 同时调用通义千问 Embedding 生成向量执行余弦相似度匹配；
* 线性加权（0.3 BM25 + 0.7 向量），提取 Top-3 最相关切片并入 Prompt。

### Step 3: SSE 流式解码与打字机动效
* 前端通过 `fetch` + `ReadableStream` 建立 SSE 连接；
* 解析 `event: message` 更新正文字符；
* 解析 `event: source` 渲染参考知识库卡片；
* 点击卡片打开对应 `docs/algorithms/` 原文浮层。

### Step 4: 异常容错与取消机制
* 客户端挂载 `AbortController`，点击“停止”即时向后端发出取消信号；
* 网络中断自动尝试 1 次重连。

---

## 5. 验证方式与测试命令

```bash
# 验证前端 SSE 解析器 (支持断字、注释与取消)
cd frontend && npm test
```
* **单测依据**：`SSE supports split UTF-8, all delimiters, multiline fields and ignores comments` 与 `ending iteration on done cancels an open stream` 全量通过。

---

## 6. 回滚预案与应急措施

* 若大模型或向量检索接口发生超时（> 5000ms），后端降级拦截器返回备用规则回答，并提示“AI 导师当前繁忙，请稍候重试”，保障演练工作台基础功能不被阻断。
