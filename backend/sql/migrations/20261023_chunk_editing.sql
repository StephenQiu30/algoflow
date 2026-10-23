-- Additive migration; back up document/document_chunk first. Do not run algorithm.sql on an existing DB.
ALTER TABLE document
    ADD COLUMN revision BIGINT NOT NULL DEFAULT 0 COMMENT '编辑及索引任务乐观版本',
    ADD COLUMN published_revision BIGINT NULL COMMENT '当前检索版本';
ALTER TABLE document_chunk
    ADD COLUMN draft_content MEDIUMTEXT NULL COMMENT '未发布内容',
    ADD COLUMN draft_section_title VARCHAR(500) NULL COMMENT '未发布章节',
    ADD COLUMN draft_section_path VARCHAR(1000) NULL COMMENT '未发布路径';
UPDATE document SET published_revision = 0 WHERE status = 'COMPLETED' AND chunk_count > 0;
