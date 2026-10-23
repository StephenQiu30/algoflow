package com.stephen.cloud.search.datasource;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stephen.cloud.api.search.model.entity.UserEsDTO;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class PublicUserSearchViewTest {
    @Test
    void bothSearchViewsKeepPaginationWithoutContactOrInternalFields() throws Exception {
        UserEsDTO document = new UserEsDTO();
        document.setId(12L);
        document.setUserName("Learner");
        document.setUserEmail("private@example.com");
        document.setUserPhone("13800000000");
        Page<UserEsDTO> source = new Page<>(2, 5, 12);
        source.setRecords(List.of(document));
        var publicPage = PublicUserSearchView.page(source, user -> user);
        var aggregatePage = PublicUserSearchView.page(source, user -> (Object) user);
        assertEquals(2, publicPage.getCurrent());
        assertEquals(5, publicPage.getSize());
        assertEquals(12, publicPage.getTotal());
        assertEquals("Learner", publicPage.getRecords().getFirst().getUserName());
        for (Object page : List.of(publicPage, aggregatePage)) {
            String json = new ObjectMapper().writeValueAsString(page);
            assertFalse(json.contains("userEmail"));
            assertFalse(json.contains("userPhone"));
            assertFalse(json.contains("private@example.com"));
        }
        assertEquals("private@example.com", document.getUserEmail());
    }
}
