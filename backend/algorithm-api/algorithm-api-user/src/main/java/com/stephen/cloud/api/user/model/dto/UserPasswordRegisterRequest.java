package com.stephen.cloud.api.user.model.dto;

import lombok.Data;
import lombok.ToString;
import java.io.Serializable;

/** 邮箱密码认证请求；敏感字段不进入日志或持久化草稿。 */
@Data
@ToString(onlyExplicitlyIncluded = true)
public class UserPasswordRegisterRequest implements Serializable {
    private String email;
    private String password;
    private String confirmPassword;
    private String requestId;
}
