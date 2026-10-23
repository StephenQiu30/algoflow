package com.stephen.cloud.api.user.model.dto;

import lombok.Data;
import lombok.ToString;
import java.io.Serializable;

/** 邮箱密码认证请求；敏感字段不进入日志或持久化草稿。 */
@Data
@ToString(onlyExplicitlyIncluded = true)
public class UserPasswordSetupRequest implements Serializable {
    private String code;
    private String newPassword;
    private String confirmPassword;
}
