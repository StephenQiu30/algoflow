export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}
export function emailError(email: string) {
  const value = normalizeEmail(email)
  return value.length > 256 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? '请输入有效的邮箱地址。'
    : ''
}
export function passwordError(password: string) {
  const length = Array.from(password).length
  return length < 8 || length > 64 ? '密码需使用 8–64 个字符。' : ''
}
