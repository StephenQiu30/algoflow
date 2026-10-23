'use client'
import { useId, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearLoginUser } from '@/store/modules/user/userSlice'
import { PageShell } from '@/components/design/page-shell'
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { PasswordInput } from '@/components/auth/password-input'
import { changePassword, sendPasswordSetupCode, setupPassword } from '@/api/user/passwordController'
import { passwordError } from '@/lib/password-auth'
import { toast } from 'sonner'

type Key = 'current' | 'next' | 'confirm' | 'code'
export function AccountSecurity() {
  const { user } = useAppSelector(state => state.user),
    dispatch = useAppDispatch(),
    id = useId()
  const [current, setCurrent] = useState(''),
    [next, setNext] = useState(''),
    [confirm, setConfirm] = useState(''),
    [code, setCode] = useState('')
  const [pending, setPending] = useState<'save' | 'code' | null>(null),
    [error, setError] = useState(''),
    [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({})
  const busy = useRef(false),
    refs = useRef<Partial<Record<Key, HTMLInputElement | null>>>({})
  const hasPassword = user?.hasPassword === true
  function failure(cause: unknown, fallback: string) {
    const message = isAxiosError(cause)
      ? cause.response?.data?.message
      : cause instanceof Error
        ? cause.message
        : ''
    return message && message !== '系统错误' ? message : fallback
  }
  async function sendCode() {
    if (busy.current) return
    busy.current = true
    setPending('code')
    setError('')
    try {
      const result = await sendPasswordSetupCode()
      if (result.code !== 0) throw Error(result.message || '验证邮件暂时无法发送，请稍后重试。')
      setSent(true)
      refs.current.code?.focus()
    } catch (cause) {
      setError(failure(cause, '验证邮件暂时无法发送，请稍后重试。'))
    } finally {
      busy.current = false
      setPending(null)
    }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (busy.current) return
    const invalid: Partial<Record<Key, string>> = { next: passwordError(next) }
    if (hasPassword) invalid.current = passwordError(current)
    else if (!/^\d{6}$/.test(code)) invalid.code = '请输入邮件中的 6 位验证码。'
    if (next !== confirm) invalid.confirm = '两次输入的密码不一致。'
    setErrors(invalid)
    setError('')
    const first = (
      hasPassword
        ? (['current', 'next', 'confirm'] as const)
        : (['code', 'next', 'confirm'] as const)
    ).find(key => invalid[key])
    if (first) {
      refs.current[first]?.focus()
      return
    }
    busy.current = true
    setPending('save')
    try {
      const values = { newPassword: next, confirmPassword: confirm }
      const result = hasPassword
        ? await changePassword({ ...values, currentPassword: current })
        : await setupPassword({ ...values, code })
      if (result.code !== 0 || result.data !== true)
        throw Error(result.message || '保存失败，请稍后重试。')
      setCurrent('')
      setNext('')
      setConfirm('')
      setCode('')
      dispatch(clearLoginUser())
      toast.success('密码已更新，请重新登录。')
    } catch (cause) {
      setError(failure(cause, '暂时无法确认密码是否已更新，请重新登录确认后再试。'))
    } finally {
      busy.current = false
      setPending(null)
    }
  }
  function update(key: Key, value: string) {
    ;({ current: setCurrent, next: setNext, confirm: setConfirm, code: setCode })[key](value)
    setErrors(old => ({ ...old, [key]: '' }))
    setError('')
  }
  return (
    <PageShell title="账户安全" back={{ href: '/user/settings', label: '返回账户设置' }}>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">登录与密码</h2>
          <p className="text-muted-foreground text-sm">更新密码后，所有旧会话将退出。</p>
        </div>
        <div className="flex max-w-xl flex-col gap-8">
          <FieldGroup className="gap-4">
            <Field className="gap-2">
              <FieldLabel htmlFor={`${id}-email`}>登录邮箱</FieldLabel>
              <Input id={`${id}-email`} readOnly value={user?.userEmail || ''} />
              <FieldDescription>
                {user?.emailVerified === 1 ? '邮箱已验证' : '邮箱未验证'}
                ；登录邮箱不通过个人资料修改。
              </FieldDescription>
            </Field>
            <Field className="gap-2">
              <FieldLabel>登录方式</FieldLabel>
              <p className="text-sm">{hasPassword ? '邮箱密码' : '尚未设置密码'}</p>
            </Field>
          </FieldGroup>
          <form
            method="post"
            noValidate
            className="flex flex-col gap-6"
            onSubmit={save}
            aria-busy={pending !== null}
          >
            <h2 className="text-xl font-medium">{hasPassword ? '修改密码' : '设置密码'}</h2>
            {!hasPassword && (
              <FieldDescription>旧账户需通过当前会话和本人邮箱验证后设置密码。</FieldDescription>
            )}
            <FieldGroup className="gap-4">
              {!hasPassword && (
                <Field className="gap-2" data-invalid={!!errors.code}>
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel htmlFor={`${id}-code`}>邮箱验证码</FieldLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={pending !== null}
                      onClick={() => void sendCode()}
                    >
                      {pending === 'code' && <Spinner />}
                      {pending === 'code' ? '正在发送' : sent ? '重新发送' : '发送验证邮件'}
                    </Button>
                  </div>
                  <Input
                    ref={node => {
                      refs.current.code = node
                    }}
                    id={`${id}-code`}
                    name="verificationCode"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                    disabled={pending !== null}
                    value={code}
                    onChange={event => update('code', event.target.value)}
                    aria-invalid={!!errors.code}
                    aria-describedby={errors.code ? `${id}-code-error` : undefined}
                  />
                  {sent && (
                    <FieldDescription role="status">验证邮件已提交，请查收。</FieldDescription>
                  )}
                  {errors.code && <FieldError id={`${id}-code-error`}>{errors.code}</FieldError>}
                </Field>
              )}
              {(hasPassword
                ? (['current', 'next', 'confirm'] as const)
                : (['next', 'confirm'] as const)
              ).map(key => {
                const label = { current: '当前密码', next: '新密码', confirm: '确认新密码' }[key]
                return (
                  <Field
                    key={key}
                    className="gap-2"
                    data-invalid={!!errors[key]}
                    data-disabled={pending !== null}
                  >
                    <FieldLabel htmlFor={`${id}-${key}`}>{label}</FieldLabel>
                    <PasswordInput
                      ref={node => {
                        refs.current[key] = node
                      }}
                      id={`${id}-${key}`}
                      label={label}
                      name={
                        {
                          current: 'currentPassword',
                          next: 'newPassword',
                          confirm: 'confirmPassword',
                        }[key]
                      }
                      autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                      maxLength={128}
                      value={{ current, next, confirm }[key]}
                      disabled={pending !== null}
                      required
                      aria-invalid={!!errors[key]}
                      aria-describedby={
                        errors[key]
                          ? `${id}-${key}-error`
                          : key === 'next'
                            ? `${id}-help`
                            : undefined
                      }
                      onChange={event => update(key, event.target.value)}
                    />
                    {key === 'next' && (
                      <FieldDescription id={`${id}-help`}>使用 8–64 个字符。</FieldDescription>
                    )}
                    {errors[key] && (
                      <FieldError id={`${id}-${key}-error`}>{errors[key]}</FieldError>
                    )}
                  </Field>
                )
              })}
            </FieldGroup>
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end">
              <Button disabled={pending !== null} type="submit">
                {pending === 'save' && <Spinner />}
                {pending === 'save' ? '正在更新' : hasPassword ? '更新密码' : '设置密码并重新登录'}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  )
}
