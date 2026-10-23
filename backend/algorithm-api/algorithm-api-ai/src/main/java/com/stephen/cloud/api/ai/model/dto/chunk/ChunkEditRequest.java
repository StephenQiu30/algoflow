package com.stephen.cloud.api.ai.model.dto.chunk;

import jakarta.validation.constraints.*;
import lombok.Data;

/** An edit changes only the draft; the published chunk remains available until indexing succeeds. */
@Data
public class ChunkEditRequest {
    @NotNull @Positive
    private Long id;
    @NotNull @Positive
    private Long documentId;
    @NotNull @PositiveOrZero
    private Long expectedRevision;
    @NotBlank @Size(max = 20000)
    private String content;
    @NotNull @Size(max = 500)
    private String sectionTitle;
    @NotNull @Size(max = 1000)
    private String sectionPath;
}
