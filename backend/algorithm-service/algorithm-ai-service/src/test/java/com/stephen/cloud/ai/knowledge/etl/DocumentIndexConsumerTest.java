package com.stephen.cloud.ai.knowledge.etl;

import com.stephen.cloud.ai.mapper.DocumentMapper;
import com.stephen.cloud.ai.model.entity.Document;
import com.stephen.cloud.ai.mq.handler.DocumentProcessConsumer;
import com.stephen.cloud.ai.mq.model.DocumentProcessMessage;
import com.stephen.cloud.ai.service.DocumentService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.mockito.Mockito.*;

class DocumentIndexConsumerTest {
    @Test void staleOrDuplicateMessageNeverStartsEtl() throws Exception {
        DocumentMapper mapper = mock(DocumentMapper.class); DocumentService service = mock(DocumentService.class);
        DocumentETLPipeline pipeline = mock(DocumentETLPipeline.class); DocumentProcessConsumer consumer = consumer(mapper, service, pipeline);
        Document doc = new Document();doc.setId(9L); when(service.getById(9L)).thenReturn(doc);
        DocumentProcessMessage message = new DocumentProcessMessage();message.setDocumentId(9L);message.setRevision(3L);
        consumer.onMessage(message, null); verifyNoInteractions(pipeline);verify(mapper).claimIndex(9L, 3L);
    }
    @Test void modelFailureIsRecordedOnlyAgainstClaimedRevision() throws Exception {
        DocumentMapper mapper = mock(DocumentMapper.class);DocumentService service = mock(DocumentService.class);
        DocumentETLPipeline pipeline = mock(DocumentETLPipeline.class);DocumentProcessConsumer consumer = consumer(mapper, service, pipeline);
        Document doc = new Document();doc.setId(9L);doc.setKnowledgeBaseId(8L);doc.setFilePath("file.md");doc.setFileExtension("md");doc.setChunkCount(1);
        when(service.getById(9L)).thenReturn(doc);when(mapper.claimIndex(9L, 3L)).thenReturn(1);
        when(pipeline.process(eq("file.md"), eq("md"), anyMap())).thenThrow(new IllegalStateException("model missing"));
        DocumentProcessMessage message = new DocumentProcessMessage();message.setDocumentId(9L);message.setRevision(3L);
        consumer.onMessage(message, null);verify(mapper).failIndex(9L, 3L, "model missing");verify(service, never()).updateById(any(Document.class));
    }
    private DocumentProcessConsumer consumer(DocumentMapper mapper, DocumentService service, DocumentETLPipeline pipeline) {
        DocumentProcessConsumer c = new DocumentProcessConsumer();ReflectionTestUtils.setField(c,"documentMapper",mapper);
        ReflectionTestUtils.setField(c,"documentService",service);ReflectionTestUtils.setField(c,"documentETLPipeline",pipeline);return c;
    }
}
