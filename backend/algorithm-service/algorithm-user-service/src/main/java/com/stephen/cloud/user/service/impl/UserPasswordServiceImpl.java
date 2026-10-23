package com.stephen.cloud.user.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.stephen.cloud.api.user.model.dto.*;
import com.stephen.cloud.api.user.model.vo.LoginUserVO;
import com.stephen.cloud.common.common.ErrorCode;
import com.stephen.cloud.common.common.ThrowUtils;
import com.stephen.cloud.common.exception.BusinessException;
import com.stephen.cloud.common.utils.IpUtils;
import com.stephen.cloud.common.utils.RegexUtils;
import com.stephen.cloud.user.mapper.UserMapper;
import com.stephen.cloud.user.model.entity.User;
import com.stephen.cloud.user.security.PasswordHasher;
import com.stephen.cloud.user.security.PasswordRateLimiter;
import com.stephen.cloud.user.service.UserEmailService;
import com.stephen.cloud.user.service.UserPasswordService;
import com.stephen.cloud.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

/** 密码验证、注册幂等与凭证变更均在服务层完成。 */
@Service
@RequiredArgsConstructor
public class UserPasswordServiceImpl implements UserPasswordService {
    private static final String INVALID_CREDENTIALS = "邮箱或密码不正确";
    private final UserMapper userMapper;
    private final UserService userService;
    private final UserEmailService emailService;
    private final PasswordHasher hasher;
    private final PasswordRateLimiter limiter;

    public static String normalizeEmail(String value) {
        String email = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        ThrowUtils.throwIf(email.length() > 256 || !RegexUtils.checkEmail(email), ErrorCode.PARAMS_ERROR, "请输入有效的邮箱地址");
        return email;
    }

    public static void validatePassword(String value) {
        int length = value == null ? 0 : value.codePointCount(0, value.length());
        ThrowUtils.throwIf(length < 8 || length > 64, ErrorCode.PARAMS_ERROR, "密码需使用 8–64 个字符");
    }

    private void validatePair(String password, String confirm) {
        validatePassword(password);
        ThrowUtils.throwIf(!password.equals(confirm), ErrorCode.PARAMS_ERROR, "两次输入的密码不一致");
    }

    private User byEmail(String email) {
        return userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUserEmail, email));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginUserVO login(UserPasswordLoginRequest body, HttpServletRequest request) {
        ThrowUtils.throwIf(body == null, ErrorCode.PARAMS_ERROR);
        String email = normalizeEmail(body.getEmail());
        validatePassword(body.getPassword());
        limiter.check("login", email, IpUtils.getClientIp(request));
        User candidate = byEmail(email);
        boolean matches = hasher.matches(body.getPassword(), candidate == null ? null : candidate.getPasswordHash());
        ThrowUtils.throwIf(!matches || candidate == null || "ban".equals(candidate.getUserRole()), ErrorCode.PARAMS_ERROR, INVALID_CREDENTIALS);
        // Serialize session creation against password change, deletion and role changes.
        User locked = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getId, candidate.getId()).last("FOR UPDATE"));
        ThrowUtils.throwIf(locked == null || "ban".equals(locked.getUserRole())
                || !candidate.getPasswordHash().equals(locked.getPasswordHash()), ErrorCode.PARAMS_ERROR, INVALID_CREDENTIALS);
        return userService.createPasswordSession(locked, request);
    }

    @Override
    public boolean register(UserPasswordRegisterRequest body, HttpServletRequest request) {
        ThrowUtils.throwIf(body == null, ErrorCode.PARAMS_ERROR);
        String email = normalizeEmail(body.getEmail());
        validatePair(body.getPassword(), body.getConfirmPassword());
        try {
            ThrowUtils.throwIf(body.getRequestId() == null || !UUID.fromString(body.getRequestId()).toString().equals(body.getRequestId()),
                    ErrorCode.PARAMS_ERROR, "注册请求标识无效，请重新提交");
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "注册请求标识无效，请重新提交");
        }
        limiter.check("register", email, IpUtils.getClientIp(request));
        User existing = byEmail(email);
        if (existing != null) return repeatRegistration(existing, body);
        User user = new User();
        user.setUserEmail(email);
        user.setUserName("学习者");
        user.setUserRole("user");
        user.setEmailVerified(0);
        user.setPasswordHash(hasher.encode(body.getPassword()));
        user.setRegistrationKey(body.getRequestId());
        try {
            ThrowUtils.throwIf(userMapper.insert(user) != 1, ErrorCode.OPERATION_ERROR, "注册失败，请稍后重试");
        } catch (DuplicateKeyException e) {
            User winner = byEmail(email);
            if (winner != null) return repeatRegistration(winner, body);
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "该邮箱暂无法注册，请登录或稍后重试");
        }
        return true;
    }

    private boolean repeatRegistration(User user, UserPasswordRegisterRequest body) {
        if (body.getRequestId().equals(user.getRegistrationKey()) && !"ban".equals(user.getUserRole())
                && hasher.matches(body.getPassword(), user.getPasswordHash())) return true;
        throw new BusinessException(ErrorCode.PARAMS_ERROR, "该邮箱暂无法注册，请登录或稍后重试");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean change(UserPasswordChangeRequest body, HttpServletRequest request) {
        User user = userService.getLoginUser(request);
        ThrowUtils.throwIf(body == null, ErrorCode.PARAMS_ERROR);
        validatePassword(body.getCurrentPassword());
        validatePair(body.getNewPassword(), body.getConfirmPassword());
        limiter.check("change", user.getId().toString(), IpUtils.getClientIp(request));
        ThrowUtils.throwIf(!hasher.matches(body.getCurrentPassword(), user.getPasswordHash()), ErrorCode.PARAMS_ERROR, "当前密码不正确");
        ThrowUtils.throwIf(body.getCurrentPassword().equals(body.getNewPassword()), ErrorCode.PARAMS_ERROR, "新密码不能与当前密码相同");
        String next = hasher.encode(body.getNewPassword());
        int changed = userMapper.update(null, new LambdaUpdateWrapper<User>().eq(User::getId, user.getId())
                .eq(User::getPasswordHash, user.getPasswordHash()).set(User::getPasswordHash, next));
        ThrowUtils.throwIf(changed != 1, ErrorCode.OPERATION_ERROR, "账户信息已变化，请重新登录后重试");
        StpUtil.logout(user.getId());
        return true;
    }

    @Override
    public Integer sendSetupCode(HttpServletRequest request) {
        User user = userService.getLoginUser(request);
        ThrowUtils.throwIf(user.getPasswordHash() != null, ErrorCode.PARAMS_ERROR, "请使用当前密码修改账户密码");
        return emailService.sendEmailCode(user.getUserEmail(), IpUtils.getClientIp(request));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean setup(UserPasswordSetupRequest body, HttpServletRequest request) {
        User user = userService.getLoginUser(request);
        ThrowUtils.throwIf(body == null, ErrorCode.PARAMS_ERROR);
        validatePair(body.getNewPassword(), body.getConfirmPassword());
        limiter.check("setup", user.getId().toString(), IpUtils.getClientIp(request));
        ThrowUtils.throwIf(user.getPasswordHash() != null, ErrorCode.PARAMS_ERROR, "账户已设置密码，请重新登录");
        ThrowUtils.throwIf(body.getCode() == null || !body.getCode().matches("\\d{6}"), ErrorCode.PARAMS_ERROR, "请输入邮件中的 6 位验证码");
        ThrowUtils.throwIf(!emailService.verifyEmailCode(user.getUserEmail(), body.getCode()), ErrorCode.PARAMS_ERROR, "验证码无效或已过期");
        String next = hasher.encode(body.getNewPassword());
        int changed = userMapper.update(null, new LambdaUpdateWrapper<User>().eq(User::getId, user.getId())
                .isNull(User::getPasswordHash).set(User::getPasswordHash, next).set(User::getEmailVerified, 1));
        ThrowUtils.throwIf(changed != 1, ErrorCode.OPERATION_ERROR, "账户信息已变化，请重新登录");
        emailService.deleteEmailCode(user.getUserEmail());
        StpUtil.logout(user.getId());
        return true;
    }
}
