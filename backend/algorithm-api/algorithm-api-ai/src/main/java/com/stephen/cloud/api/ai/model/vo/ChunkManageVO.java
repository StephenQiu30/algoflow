package com.stephen.cloud.api.ai.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

/** Administrator-only draft fields are never included in the public ChunkVO. */
@Data
@EqualsAndHashCode(callSuper = true)
public class ChunkManageVO extends ChunkVO {
    private Long documentRevision;
    private String documentStatus;
    private String draftContent;
    private String draftSectionTitle;
    private String draftSectionPath;
}
