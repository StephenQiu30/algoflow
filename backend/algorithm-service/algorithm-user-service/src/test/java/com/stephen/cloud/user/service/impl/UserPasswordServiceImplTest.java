package com.stephen.cloud.user.service.impl;
import cn.dev33.satoken.stp.StpUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stephen.cloud.api.user.model.dto.*;
import com.stephen.cloud.api.user.model.vo.UserVO;
import com.stephen.cloud.common.exception.BusinessException;
import com.stephen.cloud.user.mapper.UserMapper;
import com.stephen.cloud.user.model.entity.User;
import com.stephen.cloud.user.security.*;
import com.stephen.cloud.user.service.*;
import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserPasswordServiceImplTest {
    @BeforeAll static void initializeEntityMetadata() {
        com.baomidou.mybatisplus.core.metadata.TableInfoHelper.initTableInfo(
                new org.apache.ibatis.builder.MapperBuilderAssistant(
                        new com.baomidou.mybatisplus.core.MybatisConfiguration(), "password-test"), User.class);
    }
    private static final PasswordHasher HASHER = new PasswordHasher();
    private UserMapper mapper;
    private UserService users;
    private UserEmailService emails;
    private UserPasswordServiceImpl service;
    private final MockHttpServletRequest request = new MockHttpServletRequest();
    @BeforeEach void setup() {
        mapper=mock(UserMapper.class); users=mock(UserService.class); emails=mock(UserEmailService.class);
        service=new UserPasswordServiceImpl(mapper, users, emails, HASHER, mock(PasswordRateLimiter.class));
    }
    private User user(String password) {
        User u=new User();u.setId(4L);u.setUserEmail("learner@example.com");u.setUserRole("user");
        if(password!=null)u.setPasswordHash(HASHER.encode(password));return u;
    }
    private UserPasswordLoginRequest login(String password) {
        var b=new UserPasswordLoginRequest();b.setEmail(" Learner@Example.com ");b.setPassword(password);return b;
    }
    private UserPasswordRegisterRequest registration() {
        var b=new UserPasswordRegisterRequest();b.setEmail(" Learner@Example.com ");b.setPassword("  preserved password  ");b.setConfirmPassword(b.getPassword());b.setRequestId(UUID.randomUUID().toString());return b;
    }
    @Test void hashesHaveUniqueSaltAndPreserveWhitespaceUnicode() {
        String raw=" 密码密码😀密码 ";String a=HASHER.encode(raw), b=HASHER.encode(raw);
        assertNotEquals(a,b);assertTrue(HASHER.matches(raw,a));assertFalse(HASHER.matches(raw.trim(),a));
        assertFalse(HASHER.matches(raw,null));assertFalse(HASHER.matches(raw,"plaintext"));assertFalse(HASHER.matches(raw,"{pbkdf2-sha256-600000}invalid"));
    }
    @Test void passwordLengthUsesCodePoints() {
        assertDoesNotThrow(()->UserPasswordServiceImpl.validatePassword("😀".repeat(8)));
        assertThrows(BusinessException.class,()->UserPasswordServiceImpl.validatePassword("😀".repeat(7)));
        assertThrows(BusinessException.class,()->UserPasswordServiceImpl.validatePassword("a".repeat(65)));
    }
    @Test void registrationCreatesUnverifiedOrdinaryUserAndNoSession() {
        when(mapper.insert(any(User.class))).thenReturn(1);
        var b=registration();assertTrue(service.register(b,request));
        var capture=ArgumentCaptor.forClass(User.class);verify(mapper).insert(capture.capture());User u=capture.getValue();
        assertEquals("learner@example.com",u.getUserEmail());assertEquals("user",u.getUserRole());assertEquals(0,u.getEmailVerified());
        assertTrue(HASHER.matches(b.getPassword(),u.getPasswordHash()));verifyNoInteractions(users);
    }
    @Test void registrationRequiresMatchingPasswords() {
        var b=registration();b.setConfirmPassword("different");assertThrows(BusinessException.class,()->service.register(b,request));verifyNoInteractions(mapper);
    }
    @Test void retryIsIdempotentOnlyForSameKeyAndCredential() {
        var b=registration();User u=user(b.getPassword());u.setRegistrationKey(b.getRequestId());when(mapper.selectOne(any())).thenReturn(u);
        assertTrue(service.register(b,request));b.setRequestId(UUID.randomUUID().toString());
        assertThrows(BusinessException.class,()->service.register(b,request));verify(mapper,never()).insert(any(User.class));
    }
    @Test void unknownWrongLegacyAndBannedUseSameLoginFailure() {
        User wrong=user("correct-password"), legacy=user(null), banned=user("wrong-password");banned.setUserRole("ban");
        for(User u:new User[]{null,wrong,legacy,banned}) {
            when(mapper.selectOne(any())).thenReturn(u);
            assertEquals("邮箱或密码不正确",assertThrows(BusinessException.class,()->service.login(login("wrong-password"),request)).getMessage());
        }
        verifyNoInteractions(users);
    }
    @Test void passwordChangeRaceCannotCreateSessionWithOldPassword() {
        when(mapper.selectOne(any())).thenReturn(user("correct-password"),user("changed-password"));
        assertThrows(BusinessException.class,()->service.login(login("correct-password"),request));verifyNoInteractions(users);
    }
    @Test void passwordChangeChecksCurrentAndRevokesAllSessions() {
        User u=user("current-password");when(users.getLoginUser(request)).thenReturn(u);when(mapper.update(isNull(),any())).thenReturn(1);
        var b=new UserPasswordChangeRequest();b.setCurrentPassword("current-password");b.setNewPassword("next-password");b.setConfirmPassword("next-password");
        try(var stp=mockStatic(StpUtil.class)){assertTrue(service.change(b,request));stp.verify(()->StpUtil.logout(4L));}
    }
    @Test void wrongCurrentCannotUpdate() {
        when(users.getLoginUser(request)).thenReturn(user("current-password"));
        var b=new UserPasswordChangeRequest();b.setCurrentPassword("wrong-password");b.setNewPassword("next-password");b.setConfirmPassword("next-password");
        assertThrows(BusinessException.class,()->service.change(b,request));verify(mapper,never()).update(isNull(),any());
    }
    @Test void setupRequiresOwnerProof() {
        when(users.getLoginUser(request)).thenReturn(user(null));when(emails.verifyEmailCode(any(),any())).thenReturn(false);
        var b=new UserPasswordSetupRequest();b.setCode("123456");b.setNewPassword("next-password");b.setConfirmPassword("next-password");
        assertThrows(BusinessException.class,()->service.setup(b,request));verify(mapper,never()).update(isNull(),any());
    }
    @Test void setupUsesAtomicFirstPasswordAndRevokesSessions() {
        when(users.getLoginUser(request)).thenReturn(user(null));when(emails.verifyEmailCode(any(),any())).thenReturn(true);when(mapper.update(isNull(),any())).thenReturn(1);
        var b=new UserPasswordSetupRequest();b.setCode("123456");b.setNewPassword("next-password");b.setConfirmPassword("next-password");
        try(var stp=mockStatic(StpUtil.class)){assertTrue(service.setup(b,request));stp.verify(()->StpUtil.logout(4L));}
        verify(emails).deleteEmailCode("learner@example.com");
    }
    @Test void secretsAndPrivateContactDataAreNotSerialized() throws Exception {
        var json=new ObjectMapper();User u=user("never-serialize-me");u.setRegistrationKey("private-key");
        String entity=json.writeValueAsString(u);assertFalse(entity.contains("passwordHash"));assertFalse(entity.contains("registrationKey"));assertFalse(u.toString().contains("pbkdf2"));
        UserVO v=new UserVO();v.setUserEmail("private@example.com");v.setUserPhone("13800000000");
        assertFalse(json.writeValueAsString(v).contains("userEmail"));assertFalse(json.writeValueAsString(v).contains("userPhone"));
        assertFalse(registration().toString().contains("preserved password"));
    }
}
