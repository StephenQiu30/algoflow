package com.stephen.cloud.ai.knowledge.etl;

import com.stephen.cloud.ai.mapper.DocumentMapper;
import com.stephen.cloud.ai.model.entity.Document;
import com.stephen.cloud.ai.service.DocumentService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** PENDING rows survive process restarts and transport failures; consumers claim a revision once. */
@Component
@Slf4j
public class DocumentIndexDispatcher {
    @Resource private DocumentMapper documents;
    @Resource private DocumentService service;
    @Value("${document.processing.timeout-seconds:600}") private int timeoutSeconds;

    @Scheduled(fixedDelayString = "${document.processing.dispatch-delay-ms:2000}")
    public void dispatch() {
        documents.expireProcessing(Math.max(60, timeoutSeconds));
        Document pending = documents.nextPending();
        if (pending != null) {
            try {
                service.sendDocumentProcessMessage(pending.getId());
            } catch (Exception e) {
                log.error("文档索引消息暂未投递，将继续尝试，documentId={}, revision={}", pending.getId(), pending.getRevision(), e);
            }
        }
    }
}
