'use client'
import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setLoginUser } from '@/store/modules/user/userSlice'
import { editUser, getLoginUser } from '@/api/user/userController'
import { AccessGate } from '@/components/design/access-gate'
import { PageShell, ModuleEntries } from '@/components/design/page-shell'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { ImageUploader } from '@/components/common/image-uploader'
import { FileUploadBizEnum } from '@/enums/FileUploadBizEnum'
import { toast } from 'sonner'
import { PageState } from '@/components/design/page-state'
const subscribe = () => () => {}
const entries = [
  {
    title: '学习偏好',
    description: '外观、演练速度与动态效果',
    href: '/user/settings/preferences',
  },
  {
    title: '通知设置',
    description: '选择当前浏览器中的通知展示',
    href: '/user/settings/notifications',
  },
  { title: '账户安全', description: '查看登录方式与账户信息', href: '/user/settings/security' },
]
function Settings() {
  const { user } = useAppSelector(s => s.user),
    dispatch = useAppDispatch()
  const [name, setName] = useState(user?.userName || ''),
    [profile, setProfile] = useState(user?.userProfile || ''),
    [avatar, setAvatar] = useState(user?.userAvatar || '')
  const [pending, setPending] = useState(false),
    [error, setError] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('请填写昵称')
      return
    }
    setPending(true)
    setError('')
    try {
      const r = await editUser({ userName: name.trim(), userProfile: profile, userAvatar: avatar })
      if (r.code !== 0) throw Error(r.message || '保存失败')
      const current = await getLoginUser()
      if (current.code === 0 && current.data) dispatch(setLoginUser(current.data))
      toast.success('个人资料已保存')
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败，请重试')
    } finally {
      setPending(false)
    }
  }
  return (
    <PageShell title="账户设置" back={{ href: '/user/profile', label: '返回个人中心' }}>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">个人资料</h2>
          <p className="text-muted-foreground text-sm">昵称和简介会显示在你的公开主页。</p>
        </div>
        <form className="flex max-w-2xl flex-col gap-6" onSubmit={e => void submit(e)}>
          <FieldGroup>
            <Field>
              <FieldLabel>头像</FieldLabel>
              <ImageUploader
                biz={FileUploadBizEnum.USER_AVATAR}
                value={avatar}
                onChange={setAvatar}
                className="max-w-48"
              />
            </Field>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="name">昵称</FieldLabel>
              <Input
                id="name"
                autoComplete="nickname"
                maxLength={30}
                value={name}
                onChange={e => setName(e.target.value)}
                aria-invalid={!!error}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile">个人简介</FieldLabel>
              <Textarea
                id="profile"
                maxLength={500}
                value={profile}
                onChange={e => setProfile(e.target.value)}
                className="min-h-28"
              />
            </Field>
          </FieldGroup>
          {error && (
            <p role="alert" className="text-sm">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button asChild variant="ghost">
              <Link href={`/user/${user?.id}`}>查看公开主页</Link>
            </Button>
            <Button disabled={pending}>{pending && <Spinner />}保存更改</Button>
          </div>
        </form>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">更多设置</h2>
        <ModuleEntries entries={entries} />
      </section>
    </PageShell>
  )
}
function Preferences({ kind }: { kind: 'preferences' | 'notifications' | 'security' }) {
  const { user } = useAppSelector(s => s.user),
    { theme, setTheme } = useTheme()
  const [saved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`algoflow:preferences:${user?.id}`) || '{}')
    } catch {
      return {}
    }
  })
  const [speed, setSpeed] = useState(String(saved.speed || 1)),
    [motion, setMotion] = useState(!!saved.reducedMotion),
    [notify, setNotify] = useState(saved.notifications !== false)
  const save = () => {
    try {
      localStorage.setItem(
        `algoflow:preferences:${user?.id}`,
        JSON.stringify({ speed, reducedMotion: motion, notifications: notify })
      )
      toast.success('已保存在当前浏览器')
      window.dispatchEvent(new Event('algoflow-preferences'))
    } catch {
      toast.error('无法保存浏览器偏好')
    }
  }
  return (
    <PageShell
      title={{ preferences: '学习偏好', notifications: '通知设置', security: '账户安全' }[kind]}
      back={{ href: '/user/settings', label: '返回账户设置' }}
    >
      <div className="flex max-w-xl flex-col gap-6">
        <FieldGroup>
          {kind === 'preferences' ? (
            <>
              <Field>
                <FieldLabel>外观</FieldLabel>
                <Select value={theme || 'system'} onValueChange={setTheme}>
                  <SelectTrigger aria-label="外观">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {[
                        ['system', '跟随系统'],
                        ['light', '浅色'],
                        ['dark', '深色'],
                      ].map(([v, l]) => (
                        <SelectItem value={v} key={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>演练速度</FieldLabel>
                <Select value={speed} onValueChange={setSpeed}>
                  <SelectTrigger aria-label="默认演练速度">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {[
                        ['1', '1× 标准速度'],
                        ['15', '2× 速度'],
                        ['28', '4× 速度'],
                      ].map(([v, l]) => (
                        <SelectItem value={v} key={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="reduce-motion">减少动态效果</FieldLabel>
                <Switch id="reduce-motion" checked={motion} onCheckedChange={setMotion} />
              </Field>
            </>
          ) : kind === 'notifications' ? (
            <Field orientation="horizontal">
              <FieldLabel htmlFor="notify-toast">新通知提示</FieldLabel>
              <Switch id="notify-toast" checked={notify} onCheckedChange={setNotify} />
              <FieldDescription>此浏览器内的新通知提示；站内通知仍保留。</FieldDescription>
            </Field>
          ) : (
            <>
              <Field>
                <FieldLabel htmlFor="account-email">电子邮箱</FieldLabel>
                <Input id="account-email" readOnly value={user?.userEmail || '未绑定邮箱'} />
              </Field>
              <Field>
                <FieldLabel>登录方式</FieldLabel>
                <p>{user?.githubLogin ? 'GitHub 及邮箱验证码' : '邮箱验证码'}</p>
                <FieldDescription>
                  使用验证码登录，无需保存账户密码。请通过头像菜单退出当前会话。
                </FieldDescription>
              </Field>
            </>
          )}
        </FieldGroup>
        {kind !== 'security' && (
          <>
            <p className="text-muted-foreground text-xs">偏好仅在此浏览器中生效。</p>
            <div className="flex justify-end">
              <Button onClick={save}>保存偏好</Button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  )
}
export function SettingsWorkspace({
  kind,
}: {
  kind?: 'preferences' | 'notifications' | 'security'
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  return (
    <AccessGate>
      {!hydrated ? (
        <PageState loading title="加载账户设置" />
      ) : kind ? (
        <Preferences kind={kind} />
      ) : (
        <Settings />
      )}
    </AccessGate>
  )
}
