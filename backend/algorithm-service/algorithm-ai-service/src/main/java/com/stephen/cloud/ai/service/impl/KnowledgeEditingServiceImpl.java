package com.stephen.cloud.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stephen.cloud.ai.mapper.DocumentMapper;
import com.stephen.cloud.ai.mapper.DocumentChunkMapper;
import com.stephen.cloud.ai.model.entity.Document;
import com.stephen.cloud.ai.model.entity.DocumentChunk;
import com.stephen.cloud.ai.service.KnowledgeEditingService;
import com.stephen.cloud.api.ai.model.dto.chunk.ChunkEditRequest;
import com.stephen.cloud.api.ai.model.dto.chunk.ChunkQueryRequest;
import com.stephen.cloud.api.ai.model.dto.document.DocumentIndexRequest;
import com.stephen.cloud.api.ai.model.vo.ChunkManageVO;
import com.stephen.cloud.common.common.ErrorCode;
import com.stephen.cloud.common.common.ThrowUtils;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;
import java.util.Set;

@Service
public class KnowledgeEditingServiceImpl implements KnowledgeEditingService {
    @Resource private DocumentMapper documents;
    @Resource private DocumentChunkMapper chunks;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Page<ChunkManageVO> listChunks(ChunkQueryRequest request) {
        ThrowUtils.throwIf(request.getDocumentId() == null || request.getDocumentId() <= 0
                || request.getCurrent() < 1 || request.getPageSize() < 1 || request.getPageSize() > 20, ErrorCode.PARAMS_ERROR);
        Document document = documents.lockForEdit(request.getDocumentId());
        ThrowUtils.throwIf(document == null, ErrorCode.NOT_FOUND_ERROR);
        LambdaQueryWrapper<DocumentChunk> query = new LambdaQueryWrapper<DocumentChunk>()
                .eq(DocumentChunk::getDocumentId, request.getDocumentId());
        if (request.getSearchText() != null && !request.getSearchText().isBlank()) {
            query.and(q -> q.like(DocumentChunk::getSectionTitle, request.getSearchText())
                    .or().like(DocumentChunk::getDraftSectionTitle, request.getSearchText())
                    .or().like(DocumentChunk::getSectionPath, request.getSearchText())
                    .or().like(DocumentChunk::getDraftSectionPath, request.getSearchText())
                    .or().like(DocumentChunk::getContent, request.getSearchText())
                    .or().like(DocumentChunk::getDraftContent, request.getSearchText()));
        }
        Page<DocumentChunk> page = chunks.selectPage(new Page<>(request.getCurrent(), request.getPageSize()),
                query.orderByAsc(DocumentChunk::getChunkIndex).orderByAsc(DocumentChunk::getId));
        Page<ChunkManageVO> result = new Page<>(page.getCurrent(), page.getSize(), page.getTotal());
        result.setRecords(page.getRecords().stream().map(row -> {
            ChunkManageVO vo = new ChunkManageVO();
            BeanUtils.copyProperties(row, vo);
            vo.setId(String.valueOf(row.getId()));
            vo.setChunkId(row.getVectorId());
            vo.setDocumentRevision(document.getRevision());
            vo.setDocumentStatus(document.getStatus());
            return vo;
        }).toList());
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChunkManageVO getChunk(Long id) {
        DocumentChunk initial = chunks.selectById(id);
        ThrowUtils.throwIf(initial == null, ErrorCode.NOT_FOUND_ERROR);
        Document document = documents.lockForEdit(initial.getDocumentId());
        ThrowUtils.throwIf(document == null, ErrorCode.NOT_FOUND_ERROR);
        DocumentChunk row = chunks.selectForEdit(id);
        ThrowUtils.throwIf(row == null, ErrorCode.NOT_FOUND_ERROR);
        ChunkManageVO vo = new ChunkManageVO();
        BeanUtils.copyProperties(row, vo);
        vo.setId(String.valueOf(row.getId()));
        vo.setChunkId(row.getVectorId());
        vo.setDocumentRevision(document.getRevision());
        vo.setDocumentStatus(document.getStatus());
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveDraft(ChunkEditRequest request) {
        Document document = documents.lockForEdit(request.getDocumentId());
        checkRevision(document, request.getExpectedRevision());
        ThrowUtils.throwIf(!Set.of("DRAFT", "COMPLETED", "FAILED", "TIMEOUT").contains(document.getStatus()),
                ErrorCode.OPERATION_ERROR, "索引排队或处理中，暂不能编辑，请刷新状态");
        DocumentChunk chunk = chunks.selectById(request.getId());
        ThrowUtils.throwIf(chunk == null || !Objects.equals(chunk.getDocumentId(), document.getId()), ErrorCode.NOT_FOUND_ERROR);
        DocumentChunk update = new DocumentChunk();
        update.setId(chunk.getId());
        update.setDraftContent(request.getContent());
        update.setDraftSectionTitle(request.getSectionTitle());
        update.setDraftSectionPath(request.getSectionPath());
        ThrowUtils.throwIf(chunks.updateById(update) != 1, ErrorCode.OPERATION_ERROR);
        ThrowUtils.throwIf(documents.markDraft(document.getId(), request.getExpectedRevision()) != 1, ErrorCode.VERSION_CONFLICT);
        return document.getRevision() + 1;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long queueIndex(DocumentIndexRequest request) {
        Document document = documents.lockForEdit(request.getId());
        checkRevision(document, request.getExpectedRevision());
        ThrowUtils.throwIf(!Set.of("DRAFT", "FAILED", "TIMEOUT").contains(document.getStatus()),
                ErrorCode.OPERATION_ERROR, "当前状态不支持提交索引，请刷新状态");
        // PENDING is durable dispatch inventory; republish until a worker claims this revision.
        ThrowUtils.throwIf(documents.queueIndex(document.getId(), request.getExpectedRevision()) != 1, ErrorCode.VERSION_CONFLICT);
        return document.getRevision() + 1;
    }

    private void checkRevision(Document document, Long expected) {
        ThrowUtils.throwIf(document == null, ErrorCode.NOT_FOUND_ERROR);
        ThrowUtils.throwIf(!Objects.equals(document.getRevision(), expected), ErrorCode.VERSION_CONFLICT);
    }
}
