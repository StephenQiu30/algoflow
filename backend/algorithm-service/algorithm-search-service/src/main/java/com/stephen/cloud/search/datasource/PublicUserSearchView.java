package com.stephen.cloud.search.datasource;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stephen.cloud.api.search.model.entity.UserEsDTO;
import com.stephen.cloud.api.user.model.vo.UserVO;

/** Public search never returns an internal search document or its contact fields. */
public final class PublicUserSearchView {
    private PublicUserSearchView() {
    }

    public static <T> Page<T> page(Page<UserEsDTO> source, java.util.function.Function<UserVO, T> convert) {
        Page<T> result = new Page<>(source.getCurrent(), source.getSize(), source.getTotal());
        result.setRecords(source.getRecords().stream().map(PublicUserSearchView::user).map(convert).toList());
        return result;
    }

    private static UserVO user(UserEsDTO source) {
        UserVO result = new UserVO();
        result.setId(source.getId());
        result.setUserName(source.getUserName());
        result.setUserAvatar(source.getUserAvatar());
        result.setUserProfile(source.getUserProfile());
        result.setUserRole(source.getUserRole());
        result.setCreateTime(source.getCreateTime());
        result.setUpdateTime(source.getUpdateTime());
        return result;
    }
}
