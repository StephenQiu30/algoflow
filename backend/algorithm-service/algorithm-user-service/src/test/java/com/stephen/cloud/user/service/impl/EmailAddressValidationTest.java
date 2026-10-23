package com.stephen.cloud.user.service.impl;

import com.stephen.cloud.common.utils.RegexUtils;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmailAddressValidationTest {
    @Test
    void acceptsCommonMailboxCharacters() {
        for (String email : new String[]{"student.name@example.com", "student+course@example.com",
                "algoflow-admin.qa@localhost.test"}) {
            assertTrue(RegexUtils.checkEmail(email), email);
        }
    }

    @Test
    void rejectsMalformedAddressesAndHeaderInjection() {
        for (String email : new String[]{"", "student", "student@@example.com", "a b@example.com",
                "student@example.com\r\nBcc: other@example.com"}) {
            assertFalse(RegexUtils.checkEmail(email), email);
        }
    }
}
