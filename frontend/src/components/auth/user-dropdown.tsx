'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bell, LogOut, PenSquare, Settings, User } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserDropdown() {
  const dispatch = useAppDispatch()
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
        <Button
          variant="ghost"
          className="min-h-11 max-w-44 gap-2 px-2"
          aria-label={`${name}，打开用户菜单`}
        >
          <Avatar className="size-7">
            <AvatarImage src={user?.userAvatar} alt="" />
            <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-24 truncate xl:inline">{name}</span>
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
            { href: '/user/profile', label: '我的学习', icon: User },
            { href: '/blog/create', label: '撰写题解', icon: PenSquare },
            { href: '/user/notifications', label: '通知中心', icon: Bell },
            { href: '/user/settings', label: '账号设置', icon: Settings },
          ].map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} onClick={() => setOpen(false)}>
                <Icon aria-hidden="true" />
                {label}
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
