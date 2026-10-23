'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bell, LogOut, ExternalLink, Settings, User, ShieldCheck, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearLoginUser } from '@/store/modules'
import { userLogout } from '@/api/user/userController'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserDropdown() {
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAppSelector(state => state.user)
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const name = user?.userName || '学习者'

  const handleLogout = async () => {
    if (pending) return
    setPending(true)
    try {
      const result = await userLogout()
      if (result.code !== 0) throw new Error(result.message || '退出失败')
      dispatch(clearLoginUser())
      setOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('退出登录失败，请重试')
    } finally {
      setPending(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-11 p-0" aria-label={`${name}，打开用户菜单`}>
          <Avatar className="size-7">
            <AvatarImage src={user?.userAvatar} alt="" />
            <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="truncate">{name}</span>
          <span>{user?.userRole === 'admin' ? '管理员' : '学习者'}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {[
            { href: '/user/profile', label: '个人中心', icon: User },
            { href: `/user/${user?.id}`, label: '公开主页', icon: ExternalLink },
            { href: '/user/notifications', label: '通知中心', icon: Bell },
            { href: '/user/settings', label: '账户设置', icon: Settings },
            ...(user?.userRole === 'admin'
              ? [{ href: '/admin', label: '运营管理', icon: ShieldCheck }]
              : []),
          ].map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} onClick={() => setOpen(false)}>
                <Icon aria-hidden="true" />
                {label}
                {(href === '/admin' ? pathname.startsWith('/admin') : pathname === href) && (
                  <Check className="ml-auto" aria-label="当前页面" />
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={pending}
            onSelect={event => {
              event.preventDefault()
              void handleLogout()
            }}
          >
            <LogOut aria-hidden="true" />
            {pending ? '正在退出…' : '退出登录'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
