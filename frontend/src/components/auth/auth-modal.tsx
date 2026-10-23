'use client'
import { useEffect, useState } from 'react'
import { Github, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { useAppDispatch } from '@/store/hooks'
import { setLoginUser } from '@/store/modules'
import {
  getGitHubAuthorizeUrl,
  sendEmailLoginCode,
  userLoginByEmail,
} from '@/api/user/userController'
export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const dispatch = useAppDispatch(),
    [email, setEmail] = useState(''),
    [code, setCode] = useState(''),
    [sent, setSent] = useState(false),
    [countdown, setCountdown] = useState(0),
    [pending, setPending] = useState(false),
    [error, setError] = useState('')
  useEffect(() => {
    if (!countdown) return
    const timer = setTimeout(() => setCountdown(n => n - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])
  async function send() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效邮箱')
      return
    }
    setPending(true)
    setError('')
    try {
      const r = await sendEmailLoginCode({ email })
      if (r.code !== 0) throw Error(r.message || '发送失败')
      setSent(true)
      setCountdown(60)
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败，请重试')
    } finally {
      setPending(false)
    }
  }
  async function login(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      setError('请输入 6 位验证码')
      return
    }
    setPending(true)
    setError('')
    try {
      const r = await userLoginByEmail({ email, code })
      if (r.code !== 0 || !r.data) throw Error(r.message || '登录失败')
      if (r.data.token) localStorage.setItem('token', r.data.token)
      dispatch(setLoginUser(r.data))
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : '登录失败，请重试')
    } finally {
      setPending(false)
    }
  }
  async function github() {
    setPending(true)
    setError('')
    try {
      const r = await getGitHubAuthorizeUrl()
      if (r.code !== 0 || !r.data) throw Error(r.message || '无法获取授权链接')
      window.location.assign(r.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败')
    } finally {
      setPending(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>登录 AlgoFlow</DialogTitle>
          <DialogDescription>使用邮箱验证码或 GitHub 继续。</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-6" onSubmit={e => void login(e)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email">邮箱</FieldLabel>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setSent(false)
                }}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="login-code">验证码</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="login-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending || countdown > 0}
                  onClick={() => void send()}
                >
                  {countdown ? `${countdown}s` : '获取验证码'}
                </Button>
              </div>
            </Field>
          </FieldGroup>
          {sent && (
            <p role="status" className="text-muted-foreground text-sm">
              验证码已发送，请查收邮件。
            </p>
          )}
          {error && (
            <Alert>
              <AlertDescription role="alert">{error}</AlertDescription>
            </Alert>
          )}
          <Button disabled={pending}>
            {pending ? <Spinner /> : <Mail data-icon="inline-start" />}登录并继续
          </Button>
        </form>
        <Button variant="secondary" disabled={pending} onClick={() => void github()}>
          <Github data-icon="inline-start" />
          使用 GitHub 登录
        </Button>
      </DialogContent>
    </Dialog>
  )
}
