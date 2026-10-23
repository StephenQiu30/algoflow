package com.stephen.cloud.user.service;

import com.stephen.cloud.api.user.model.dto.*;
import com.stephen.cloud.api.user.model.vo.LoginUserVO;
import jakarta.servlet.http.HttpServletRequest;

/** 邮箱密码认证与本人账户安全。 */
public interface UserPasswordService {
    LoginUserVO login(UserPasswordLoginRequest body, HttpServletRequest request);
    boolean register(UserPasswordRegisterRequest body, HttpServletRequest request);
    boolean change(UserPasswordChangeRequest body, HttpServletRequest request);
    Integer sendSetupCode(HttpServletRequest request);
    boolean setup(UserPasswordSetupRequest body, HttpServletRequest request);
}
