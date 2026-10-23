package com.stephen.cloud.ai.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stephen.cloud.api.ai.model.dto.chunk.ChunkEditRequest;
import com.stephen.cloud.api.ai.model.dto.chunk.ChunkQueryRequest;
import com.stephen.cloud.api.ai.model.dto.document.DocumentIndexRequest;
import com.stephen.cloud.api.ai.model.vo.ChunkManageVO;

public interface KnowledgeEditingService {
    Page<ChunkManageVO> listChunks(ChunkQueryRequest request);
    ChunkManageVO getChunk(Long id);
    Long saveDraft(ChunkEditRequest request);
    Long queueIndex(DocumentIndexRequest request);
}
