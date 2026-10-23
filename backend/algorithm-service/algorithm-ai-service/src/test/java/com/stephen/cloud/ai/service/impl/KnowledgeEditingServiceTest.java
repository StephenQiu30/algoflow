package com.stephen.cloud.ai.service.impl;

import com.stephen.cloud.ai.mapper.DocumentMapper;
import com.stephen.cloud.ai.mapper.DocumentChunkMapper;
import com.stephen.cloud.ai.model.entity.Document;
import com.stephen.cloud.ai.model.entity.DocumentChunk;
import com.stephen.cloud.api.ai.model.dto.chunk.ChunkEditRequest;
import com.stephen.cloud.api.ai.model.dto.document.DocumentIndexRequest;
import com.stephen.cloud.common.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class KnowledgeEditingServiceTest {
    private final DocumentMapper documents = mock(DocumentMapper.class);
    private final DocumentChunkMapper chunks = mock(DocumentChunkMapper.class);
    private final KnowledgeEditingServiceImpl service = new KnowledgeEditingServiceImpl();
    private Document document;
    @BeforeEach void setup() {
        ReflectionTestUtils.setField(service, "documents", documents);
        ReflectionTestUtils.setField(service, "chunks", chunks);
        document = new Document(); document.setId(9L); document.setRevision(3L); document.setStatus("COMPLETED");
        when(documents.lockForEdit(9L)).thenReturn(document);
    }
    private ChunkEditRequest edit() {
        ChunkEditRequest r = new ChunkEditRequest(); r.setId(7L); r.setDocumentId(9L); r.setExpectedRevision(3L);
        r.setContent("updated"); r.setSectionTitle("chapter"); r.setSectionPath("path"); return r;
    }
    @Test void savesDraftWithoutChangingPublishedContent() {
        DocumentChunk chunk = new DocumentChunk(); chunk.setId(7L); chunk.setDocumentId(9L); chunk.setContent("published");
        when(chunks.selectById(7L)).thenReturn(chunk); when(chunks.updateById(any(DocumentChunk.class))).thenReturn(1);
        when(documents.markDraft(9L, 3L)).thenReturn(1);
        assertEquals(4L, service.saveDraft(edit()));
        ArgumentCaptor<DocumentChunk> capture = ArgumentCaptor.forClass(DocumentChunk.class);
        verify(chunks).updateById(capture.capture());
        assertNull(capture.getValue().getContent()); assertNull(capture.getValue().getVectorId());
        assertEquals("updated", capture.getValue().getDraftContent());
    }
    @Test void staleEditorCannotWriteAnyChunk() {
        ChunkEditRequest r = edit(); r.setExpectedRevision(2L);
        assertEquals(40900, assertThrows(BusinessException.class, () -> service.saveDraft(r)).getCode());
        verifyNoInteractions(chunks);
    }
    @Test void processingDocumentCannotBeEdited() {
        document.setStatus("PROCESSING");
        assertThrows(BusinessException.class, () -> service.saveDraft(edit())); verifyNoInteractions(chunks);
    }
    @Test void retryUsesCompareAndSetAndRejectsRepeatedVersion() {
        document.setStatus("FAILED"); DocumentIndexRequest r = new DocumentIndexRequest();r.setId(9L);r.setExpectedRevision(3L);
        when(documents.queueIndex(9L, 3L)).thenReturn(1);
        assertEquals(4L, service.queueIndex(r)); document.setRevision(4L);document.setStatus("PENDING");
        assertEquals(40900, assertThrows(BusinessException.class, () -> service.queueIndex(r)).getCode());
        verify(documents, times(1)).queueIndex(9L, 3L);
    }
}
