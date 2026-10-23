-- Apply once after backing up user. Existing accounts remain unchanged, with no default password.
ALTER TABLE `user`
  ADD COLUMN `password_hash` varchar(256) DEFAULT NULL COMMENT 'PBKDF2 password hash',
  ADD COLUMN `registration_key` varchar(36) DEFAULT NULL COMMENT 'Registration idempotency key',
  ADD UNIQUE KEY `uk_user_registration_key` (`registration_key`);
