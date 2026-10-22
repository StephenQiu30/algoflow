import * as React from 'react'
import Link from 'next/link'
import { Bell, Github, Search, UserCircle, PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { AuthModal } from '@/components/auth/auth-modal'
import { UserDropdown } from '@/components/auth/user-dropdown'
import { useAppSelector } from '@/store/hooks'
import type { RootState } from '@/store'
import { CommandMenu } from '@/components/search/command-menu'
import { getNotificationUnreadCount } from '@/api/notification/notificationController'

interface HeaderActionsProps {
  onAuthModalOpenChange: (open: boolean) => void
  authModalOpen: boolean
}

export function HeaderActions({ onAuthModalOpenChange, authModalOpen }: HeaderActionsProps) {
  const { user } = useAppSelector((state: RootState) => state.user)
  const [open, setOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user) return
    try {
      const res = await getNotificationUnreadCount()
      if (res.code === 0) {
        setUnreadCount(Number(res.data) || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [user])

  React.useEffect(() => {
    fetchUnreadCount()

    const handleUpdate = () => {
      fetchUnreadCount()
    }

    window.addEventListener('notification-updated', handleUpdate)
    return () => window.removeEventListener('notification-updated', handleUpdate)
  }, [fetchUnreadCount])

  return (
    <>
      <div className="flex items-center gap-1.5 md:gap-2">
        <div className="hidden h-9 items-center gap-1.5 sm:flex">
          <Button
            variant="ghost"
            size="icon"
            className="action-item text-muted-foreground hover:text-foreground m-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0 transition-colors hover:bg-transparent"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="action-item text-muted-foreground hover:text-foreground m-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0 transition-colors hover:bg-transparent"
          >
            <Link
              href={process.env.NEXT_PUBLIC_AUTHOR_GITHUB || 'https://github.com/StephenQiu30'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
            </Link>
          </Button>
          <div className="action-item flex h-9 w-9 items-center justify-center">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="action-item text-muted-foreground hover:text-foreground h-9 w-9 rounded-full transition-colors hover:bg-transparent sm:hidden"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {user ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="action-item text-muted-foreground hover:text-foreground hidden h-9 rounded-full px-3 text-[13px] font-medium transition-colors hover:bg-transparent md:flex"
            >
              <Link href="/blog/create">
                <PenSquare className="mr-1.5 h-3.5 w-3.5" />
                写文章
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="action-item text-muted-foreground hover:text-foreground relative h-9 w-9 rounded-full transition-colors hover:bg-transparent"
            >
              <Link href="/user/notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="ring-background absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-red-500 shadow-sm ring-1" />
                )}
                <span className="sr-only">通知</span>
              </Link>
            </Button>
            <div className="action-item ml-0.5 flex h-9 items-center">
              <UserDropdown />
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAuthModalOpenChange(true)}
            className="action-item text-muted-foreground hover:text-foreground group m-0 flex h-9 items-center justify-center rounded-full px-4 transition-colors hover:bg-transparent"
          >
            <UserCircle className="group-hover:text-foreground mr-2 h-4 w-4 shrink-0 transition-colors" />
            <span className="text-[13px] leading-none font-medium">登录</span>
          </Button>
        )}
      </div>
      <AuthModal open={authModalOpen} onOpenChange={onAuthModalOpenChange} />
      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  )
}
