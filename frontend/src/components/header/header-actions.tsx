'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { AuthModal } from '@/components/auth/auth-modal'
import { UserDropdown } from '@/components/auth/user-dropdown'
import { useAppSelector } from '@/store/hooks'
import { CommandMenu } from '@/components/search/command-menu'
import { getNotificationUnreadCount } from '@/api/notification/notificationController'

interface HeaderActionsProps {
  onAuthModalOpenChange: (open: boolean) => void
  authModalOpen: boolean
}

export function HeaderActions({ onAuthModalOpenChange, authModalOpen }: HeaderActionsProps) {
  const { user } = useAppSelector(state => state.user)
  const [open, setOpen] = React.useState(false)
  const [notification, setNotification] = React.useState({ userId: '', count: 0 })

  React.useEffect(() => {
    if (!user) return
    let active = true
    const refresh = async () => {
      try {
        const res = await getNotificationUnreadCount()
        if (active && res.code === 0) {
          setNotification({ userId: String(user.id), count: Number(res.data) || 0 })
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }
    void refresh()
    window.addEventListener('notification-updated', refresh)
    return () => {
      active = false
      window.removeEventListener('notification-updated', refresh)
    }
  }, [user])

  const unread = user && notification.userId === String(user.id) ? notification.count : 0
  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label="搜索算法与内容"
          onClick={() => setOpen(true)}
        >
          <Search data-icon="inline-start" aria-hidden="true" />
        </Button>
        {user && (
          <Button variant="ghost" size="icon" asChild className="hidden size-11 sm:inline-flex">
            <Link
              href="/user/notifications"
              aria-label={unread ? `通知，${unread} 条未读` : '通知'}
            >
              <Bell data-icon="inline-start" aria-hidden="true" />
            </Link>
          </Button>
        )}
        <ThemeToggle />
        {user ? (
          <UserDropdown />
        ) : (
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => onAuthModalOpenChange(true)}
          >
            登录
          </Button>
        )}
      </div>
      <AuthModal open={authModalOpen} onOpenChange={onAuthModalOpenChange} />
      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  )
}
