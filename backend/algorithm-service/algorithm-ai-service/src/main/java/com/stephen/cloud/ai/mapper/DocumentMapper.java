package com.stephen.cloud.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.stephen.cloud.ai.model.entity.Document;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.Param;

/**
 * 文档 Mapper
 *
 * @author StephenQiu30
 * @Entity com.stephen.cloud.ai.model.entity.Document
 */
@Mapper
public interface DocumentMapper extends BaseMapper<Document> {
    @Select("SELECT * FROM document WHERE id = #{id} AND is_delete = 0 FOR UPDATE")
    Document lockForEdit(@Param("id") Long id);

    @Update("UPDATE document SET revision = revision + 1, status = 'DRAFT', error_message = NULL WHERE id = #{id} AND revision = #{revision} AND is_delete = 0")
    int markDraft(@Param("id") Long id, @Param("revision") Long revision);

    @Update("UPDATE document SET revision = revision + 1, status = 'PENDING', error_message = NULL, process_start_time = NULL, process_end_time = NULL WHERE id = #{id} AND revision = #{revision} AND status IN ('DRAFT', 'FAILED', 'TIMEOUT') AND is_delete = 0")
    int queueIndex(@Param("id") Long id, @Param("revision") Long revision);

    @Select("SELECT * FROM document WHERE status = 'PENDING' AND is_delete = 0 ORDER BY update_time, id LIMIT 1")
    Document nextPending();

    @Update("UPDATE document SET status = 'PROCESSING', process_start_time = CURRENT_TIMESTAMP, process_end_time = NULL WHERE id = #{id} AND revision = #{revision} AND status = 'PENDING' AND is_delete = 0")
    int claimIndex(@Param("id") Long id, @Param("revision") Long revision);

    @Update("UPDATE document SET status = 'FAILED', error_message = #{error}, process_end_time = CURRENT_TIMESTAMP WHERE id = #{id} AND revision = #{revision} AND status = 'PROCESSING' AND is_delete = 0")
    int failIndex(@Param("id") Long id, @Param("revision") Long revision, @Param("error") String error);

    @Update("UPDATE document SET status = 'TIMEOUT', error_message = '索引处理超时，请检查服务后重试', process_end_time = CURRENT_TIMESTAMP WHERE status = 'PROCESSING' AND process_start_time < TIMESTAMPADD(SECOND, -#{seconds}, CURRENT_TIMESTAMP) AND is_delete = 0")
    int expireProcessing(@Param("seconds") int seconds);

}
