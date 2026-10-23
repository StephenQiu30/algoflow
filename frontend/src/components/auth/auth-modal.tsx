'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { SiteLogo } from '@/components/header/site-logo'
import { PasswordInput } from '@/components/auth/password-input'
import { useAppDispatch } from '@/store/hooks'
import { setLoginUser } from '@/store/modules'
import { loginWithPassword, registerWithPassword } from '@/api/user/passwordController'
import { normalizeEmail, emailError, passwordError } from '@/lib/password-auth'

type Mode = 'login' | 'register' | 'success'
type Errors = Partial<Record<'email' | 'password' | 'confirm', string>>
export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const dispatch = useAppDispatch(),
    id = useId()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({}),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null),
    passwordRef = useRef<HTMLInputElement>(null),
    confirmRef = useRef<HTMLInputElement>(null)
  const opener = useRef<HTMLElement | null>(null),
    request = useRef(0),
    busy = useRef(false)
  const controller = useRef<AbortController | null>(null),
    registrationKey = useRef('')
  useEffect(
    () => () => {
      request.current++
      controller.current?.abort()
    },
    []
  )
  function clearSecrets() {
    setPassword('')
    setConfirm('')
    setErrors({})
    setError('')
  }
  function changeOpen(next: boolean) {
    if (!next) {
      request.current++
      controller.current?.abort()
      busy.current = false
      setPending(false)
      clearSecrets()
      setMode('login')
      registrationKey.current = ''
    }
    onOpenChange(next)
  }
  function switchMode(next: Mode) {
    if (busy.current) return
    clearSecrets()
    setMode(next)
    registrationKey.current = ''
    requestAnimationFrame(() => emailRef.current?.focus())
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy.current) return
    const next: Errors = { email: emailError(email), password: passwordError(password) }
    if (mode === 'register' && password !== confirm) next.confirm = '两次输入的密码不一致。'
    setErrors(next)
    setError('')
    const first = (['email', 'password', 'confirm'] as const).find(key => next[key])
    if (first) {
      ;({ email: emailRef, password: passwordRef, confirm: confirmRef })[first].current?.focus()
      return
    }
    busy.current = true
    setPending(true)
    const attempt = ++request.current
    const abort = new AbortController()
    controller.current = abort
    try {
      if (mode === 'register') {
        registrationKey.current ||= crypto.randomUUID()
        const result = await registerWithPassword(
          {
            email: normalizeEmail(email),
            password,
            confirmPassword: confirm,
            requestId: registrationKey.current,
          },
          abort.signal
        )
        if (attempt !== request.current) return
        if (result.code !== 0 || result.data !== true)
          throw Error(result.message || '创建账户失败，请稍后重试。')
        clearSecrets()
        setMode('success')
        registrationKey.current = ''
      } else {
        const result = await loginWithPassword(
          { email: normalizeEmail(email), password },
          abort.signal
        )
        if (attempt !== request.current) return
        if (result.code !== 0 || !result.data?.token)
          throw Error(result.message || '登录失败，请稍后重试。')
        localStorage.setItem('token', result.data.token)
        dispatch(setLoginUser(result.data))
        changeOpen(false)
      }
    } catch (cause) {
      if (attempt === request.current && !abort.signal.aborted) {
        const message = isAxiosError(cause)
          ? cause.response?.data?.message
          : cause instanceof Error
            ? cause.message
            : ''
        setError(
          message && message !== '系统错误'
            ? message
            : mode === 'register'
              ? '暂时无法确认注册结果。可先尝试登录，或保持信息不变后重试。'
              : '暂时无法登录，请稍后重试。'
        )
      }
    } finally {
      if (attempt === request.current) {
        busy.current = false
        setPending(false)
      }
    }
  }
  const registration = mode === 'register'
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        variant="auth"
        className="max-w-sm gap-6 p-5 sm:p-6"
        onOpenAutoFocus={event => {
          opener.current = document.activeElement as HTMLElement
          event.preventDefault()
          emailRef.current?.focus()
        }}
        onCloseAutoFocus={event => {
          const target = opener.current?.isConnected
            ? opener.current
            : document.querySelector<HTMLElement>('[data-auth-user-trigger]')
          if (target) {
            event.preventDefault()
            target.focus()
          }
        }}
      >
        <DialogHeader className="gap-3">
          <SiteLogo compact onClick={() => changeOpen(false)} />
          <div className="flex flex-col gap-1">
            <DialogTitle variant="auth">
              {mode === 'success' ? '账户已创建' : registration ? '创建账户' : '登录'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'success'
                ? '请使用刚设置的邮箱和密码登录。'
                : registration
                  ? '使用邮箱和密码创建账户。'
                  : '使用邮箱和密码登录。'}
            </DialogDescription>
          </div>
        </DialogHeader>
        {mode === 'success' ? (
          <Button size="lg" onClick={() => switchMode('login')}>
            前往登录
          </Button>
        ) : (
          <>
            <form
              method="post"
              noValidate
              className="flex flex-col gap-6"
              onSubmit={submit}
              aria-busy={pending}
            >
              <FieldGroup className="gap-4">
                <Field className="gap-2" data-invalid={!!errors.email} data-disabled={pending}>
                  <FieldLabel htmlFor={`${id}-email`}>邮箱</FieldLabel>
                  <Input
                    ref={emailRef}
                    id={`${id}-email`}
                    name="email"
                    variant="auth"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="you@example.com"
                    value={email}
                    disabled={pending}
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? `${id}-email-error` : undefined}
                    onChange={event => {
                      setEmail(event.target.value)
                      setErrors(value => ({ ...value, email: '' }))
                      setError('')
                      registrationKey.current = ''
                    }}
                  />
                  {errors.email && <FieldError id={`${id}-email-error`}>{errors.email}</FieldError>}
                </Field>
                <Field className="gap-2" data-invalid={!!errors.password} data-disabled={pending}>
                  <FieldLabel htmlFor={`${id}-password`}>密码</FieldLabel>
                  <PasswordInput
                    key={mode}
                    ref={passwordRef}
                    id={`${id}-password`}
                    name="password"
                    placeholder="输入密码"
                    autoComplete={registration ? 'new-password' : 'current-password'}
                    maxLength={128}
                    value={password}
                    disabled={pending}
                    required
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      `${registration ? `${id}-password-help ` : ''}${errors.password ? `${id}-password-error` : ''}`.trim() ||
                      undefined
                    }
                    onChange={event => {
                      setPassword(event.target.value)
                      setErrors(value => ({ ...value, password: '' }))
                      setError('')
                      registrationKey.current = ''
                    }}
                  />
                  {registration && (
                    <FieldDescription id={`${id}-password-help`}>
                      使用 8–64 个字符。
                    </FieldDescription>
                  )}
                  {errors.password && (
                    <FieldError id={`${id}-password-error`}>{errors.password}</FieldError>
                  )}
                </Field>
                {registration && (
                  <Field className="gap-2" data-invalid={!!errors.confirm} data-disabled={pending}>
                    <FieldLabel htmlFor={`${id}-confirm`}>确认密码</FieldLabel>
                    <PasswordInput
                      ref={confirmRef}
                      id={`${id}-confirm`}
                      label="确认密码"
                      name="confirmPassword"
                      placeholder="再次输入密码"
                      autoComplete="new-password"
                      maxLength={128}
                      value={confirm}
                      disabled={pending}
                      required
                      aria-invalid={!!errors.confirm}
                      aria-describedby={errors.confirm ? `${id}-confirm-error` : undefined}
                      onChange={event => {
                        setConfirm(event.target.value)
                        setErrors(value => ({ ...value, confirm: '' }))
                        setError('')
                      }}
                    />
                    {errors.confirm && (
                      <FieldError id={`${id}-confirm-error`}>{errors.confirm}</FieldError>
                    )}
                  </Field>
                )}
              </FieldGroup>
              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button size="lg" type="submit" disabled={pending}>
                {pending && <Spinner data-icon="inline-start" />}
                {pending
                  ? registration
                    ? '正在创建账户'
                    : '正在登录'
                  : registration
                    ? '创建账户'
                    : '登录'}
              </Button>
            </form>
            <div className="flex items-center justify-center gap-1">
              <span className="text-muted-foreground text-sm">
                {registration ? '已有账户？' : '还没有账户？'}
              </span>
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => switchMode(registration ? 'login' : 'register')}
              >
                {registration ? '登录' : '注册'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
