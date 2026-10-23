package com.stephen.cloud.ai.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stephen.cloud.ai.service.KnowledgeEditingService;
import com.stephen.cloud.api.ai.model.dto.chunk.ChunkEditRequest;
import com.stephen.cloud.api.ai.model.dto.chunk.ChunkQueryRequest;
import com.stephen.cloud.api.ai.model.dto.document.DocumentIndexRequest;
import com.stephen.cloud.api.ai.model.vo.ChunkManageVO;
import com.stephen.cloud.common.common.BaseResponse;
import com.stephen.cloud.common.common.ResultUtils;
import com.stephen.cloud.common.constants.UserConstant;
import com.stephen.cloud.common.log.annotation.OperationLog;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@SaCheckRole(UserConstant.ADMIN_ROLE)
@Validated
public class KnowledgeEditingController {
    @Resource private KnowledgeEditingService editing;

    @PostMapping("/chunk/manage/page")
    public BaseResponse<Page<ChunkManageVO>> list(@RequestBody ChunkQueryRequest request) {
        return ResultUtils.success(editing.listChunks(request));
    }

    @GetMapping("/chunk/manage/get")
    public BaseResponse<ChunkManageVO> get(@RequestParam @Positive Long id) {
        return ResultUtils.success(editing.getChunk(id));
    }

    @PostMapping("/chunk/edit")
    @OperationLog(module = "知识库管理", action = "保存切片草稿", recordParams = false)
    public BaseResponse<Long> edit(@Valid @RequestBody ChunkEditRequest request) {
        return ResultUtils.success(editing.saveDraft(request));
    }

    @PostMapping("/doc/retry")
    @OperationLog(module = "知识库管理", action = "提交文档索引")
    public BaseResponse<Long> retry(@Valid @RequestBody DocumentIndexRequest request) {
        return ResultUtils.success(editing.queueIndex(request));
    }
}
