package com.stephen.cloud.user.security;

import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.stereotype.Component;

/** PBKDF2-HMAC-SHA256，600000 轮、16 字节随机盐；版本前缀便于未来升级。 */
@Component
public class PasswordHasher {
    private static final String PREFIX = "{pbkdf2-sha256-600000}";
    private final Pbkdf2PasswordEncoder encoder = new Pbkdf2PasswordEncoder("", 16, 600000,
            Pbkdf2PasswordEncoder.SecretKeyFactoryAlgorithm.PBKDF2WithHmacSHA256);
    private final String dummy = encoder.encode("not-a-user-password-" + java.util.UUID.randomUUID());

    public String encode(String password) {
        return PREFIX + encoder.encode(password);
    }

    public boolean matches(String password, String stored) {
        boolean supported = stored != null && stored.startsWith(PREFIX);
        String encoded = supported ? stored.substring(PREFIX.length()) : dummy;
        boolean matches;
        try {
            matches = encoder.matches(password, encoded);
        } catch (IllegalArgumentException e) {
            // Malformed stored data is never accepted as plaintext or a legacy digest.
            encoder.matches(password, dummy);
            return false;
        }
        return supported && matches;
    }
}
