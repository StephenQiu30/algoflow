import request from '@/lib/request'
export type PasswordLogin = { email: string; password: string }
export type PasswordRegistration = PasswordLogin & { confirmPassword: string; requestId: string }
export type PasswordChange = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
export const loginWithPassword = (data: PasswordLogin, signal?: AbortSignal) =>
  request<UserAPI.BaseResponseLoginUserVO>('/user/login/password', { method: 'POST', data, signal })
export const registerWithPassword = (data: PasswordRegistration, signal?: AbortSignal) =>
  request<{ code?: number; data?: boolean; message?: string }>('/user/register', {
    method: 'POST',
    data,
    signal,
  })
export const changePassword = (data: PasswordChange) =>
  request<{ code?: number; data?: boolean; message?: string }>('/user/password/change', {
    method: 'POST',
    data,
  })
export const sendPasswordSetupCode = () =>
  request<{ code?: number; data?: number; message?: string }>('/user/password/setup/code', {
    method: 'POST',
  })
export const setupPassword = (data: Omit<PasswordChange, 'currentPassword'> & { code: string }) =>
  request<{ code?: number; data?: boolean; message?: string }>('/user/password/setup', {
    method: 'POST',
    data,
  })
