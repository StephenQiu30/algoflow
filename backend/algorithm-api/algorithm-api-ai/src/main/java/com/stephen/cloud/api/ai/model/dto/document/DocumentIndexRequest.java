package com.stephen.cloud.api.ai.model.dto.document;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DocumentIndexRequest {
    @NotNull @Positive
    private Long id;
    @NotNull @PositiveOrZero
    private Long expectedRevision;
}
