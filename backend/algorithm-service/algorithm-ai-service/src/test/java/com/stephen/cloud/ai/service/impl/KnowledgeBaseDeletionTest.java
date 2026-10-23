package com.stephen.cloud.ai.service.impl;

import com.stephen.cloud.ai.mapper.DocumentChunkMapper;
import com.stephen.cloud.ai.model.entity.KnowledgeBase;
import com.stephen.cloud.ai.service.DocumentService;
import com.stephen.cloud.ai.service.VectorStoreService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class KnowledgeBaseDeletionTest {
    @Test
    void neverPopulatedKnowledgeBaseCanBeDeletedWithoutAModel() {
        KnowledgeBaseServiceImpl service = spy(new KnowledgeBaseServiceImpl());
        DocumentChunkMapper chunks = mock(DocumentChunkMapper.class);
        VectorStoreService vectors = mock(VectorStoreService.class);
        DocumentService documents = mock(DocumentService.class);
        ReflectionTestUtils.setField(service, "documentChunkMapper", chunks);
        ReflectionTestUtils.setField(service, "vectorStoreService", vectors);
        ReflectionTestUtils.setField(service, "documentService", documents);
        KnowledgeBase kb = new KnowledgeBase();
        kb.setUserId(7L);
        doReturn(kb).when(service).getById(9L);
        doReturn(true).when(service).removeById(9L);
        assertTrue(service.deleteKnowledgeBaseById(9L, 7L, false));
        verifyNoInteractions(vectors);
        verify(documents).remove(any());
    }

    @Test
    void existingIndexCleanupFailurePreservesKnowledgeBaseAndDocuments() {
        KnowledgeBaseServiceImpl service = spy(new KnowledgeBaseServiceImpl());
        DocumentChunkMapper chunks = mock(DocumentChunkMapper.class);
        VectorStoreService vectors = mock(VectorStoreService.class);
        DocumentService documents = mock(DocumentService.class);
        ReflectionTestUtils.setField(service, "documentChunkMapper", chunks);
        ReflectionTestUtils.setField(service, "vectorStoreService", vectors);
        ReflectionTestUtils.setField(service, "documentService", documents);
        KnowledgeBase kb = new KnowledgeBase();
        kb.setUserId(7L);
        doReturn(kb).when(service).getById(9L);
        when(chunks.hasKnowledgeBaseHistory(9L)).thenReturn(true);
        doThrow(new IllegalStateException("index unavailable")).when(vectors).deleteByKnowledgeBaseId(9L);
        assertThrows(IllegalStateException.class, () -> service.deleteKnowledgeBaseById(9L, 7L, false));
        verifyNoInteractions(documents);
        verify(service, never()).removeById(9L);
    }
}
