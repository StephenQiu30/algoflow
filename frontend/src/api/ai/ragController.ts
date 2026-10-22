// @ts-ignore
/* eslint-disable */
import request from '@/lib/request'

/** RAG流式问答 基于知识库进行问答，支持流式输出答案 POST /ai/rag/ask/stream */
export async function askStream(body: AiAPI.RAGAskRequest,
                                options ?: { [key: string]: any }
) {
    return request<string[]>('/ai/rag/ask/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** RAG结构化流式问答 基于知识库进行问答，返回带阶段信息的 SSE 事件流 POST /ai/rag/ask/stream/events */
export async function askEventStream(body: AiAPI.RAGAskRequest,
                                     options ?: { [key: string]: any }
) {
    return request<AiAPI.ServerSentEventRAGStreamEventVO[]>('/ai/rag/ask/stream/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 分页获取RAG历史 分页获取当前用户的RAG问答历史记录 POST /ai/rag/history/list/page/vo */
export async function listRagHistoryVoByPage(body: AiAPI.RAGHistoryQueryRequest,
                                             options ?: { [key: string]: any }
) {
    return request<AiAPI.BaseResponsePageRAGHistoryVO>('/ai/rag/history/list/page/vo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 召回效果分析 分析给定问题的召回效果，评估检索到的知识片段的相关性 POST /ai/rag/recall/analyze */
export async function analyzeRecall(body: AiAPI.RecallAnalysisRequest,
                                    options ?: { [key: string]: any }
) {
    return request<AiAPI.BaseResponseRecallAnalysisVO>('/ai/rag/recall/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 批量召回效果分析 批量分析多个问题的召回效果，用于评估检索系统的整体性能 POST /ai/rag/recall/batch/analyze */
export async function batchAnalyzeRecall(body: AiAPI.BatchRecallRequest,
                                         options ?: { [key: string]: any }
) {
    return request<AiAPI.BaseResponseBatchRecallVO>('/ai/rag/recall/batch/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

