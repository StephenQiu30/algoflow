package com.stephen.cloud.user.security;

import com.stephen.cloud.common.common.ErrorCode;
import com.stephen.cloud.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** 独立认证限流键；启动或停止服务不会清除全站限流状态。 */
@Component
@RequiredArgsConstructor
public class PasswordRateLimiter {
    private final StringRedisTemplate redis;
    private static final DefaultRedisScript<Long> COUNT = new DefaultRedisScript<>(
            "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n", Long.class);

    public void check(String action, String account, String ip) {
        count(action + ":ip:" + key(ip == null ? "unknown" : ip), 60);
        count(action + ":account:" + key(account), 10);
    }

    private void count(String key, int max) {
        Long value = redis.execute(COUNT, List.of("auth:password:limit:" + key));
        if (value == null || value > max) throw new BusinessException(ErrorCode.TOO_MANY_REQUEST, "操作过于频繁，请稍后再试");
    }

    private String key(String value) {
        // Identifier hashing only; password hashing is handled exclusively by PasswordHasher.
        return DigestUtils.md5DigestAsHex(value.getBytes(StandardCharsets.UTF_8));
    }
}
