package com.stephen.cloud.user.service.impl;

import cn.dev33.satoken.json.SaJsonTemplateForJackson;
import com.stephen.cloud.api.user.model.vo.UserVO;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SessionSerializationTest {
    @Test
    void sharedUserViewSurvivesRedisJsonRoundTrip() {
        SaJsonTemplateForJackson json = new SaJsonTemplateForJackson();
        UserVO user = new UserVO();
        user.setId(2092151326606471170L);
        user.setUserRole("admin");
        Object restored = json.jsonToObject(json.objectToJson(user), Object.class);
        UserVO view = assertInstanceOf(UserVO.class, restored);
        assertEquals(user.getId(), view.getId());
        assertEquals("admin", view.getUserRole());
    }
}
