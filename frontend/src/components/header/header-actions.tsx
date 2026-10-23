'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { AuthModal } from '@/components/auth/auth-modal'
import { UserDropdown } from '@/components/auth/user-dropdown'
import { useAppSelector } from '@/store/hooks'
import { CommandMenu } from '@/components/search/command-menu'
import { NotificationPreview } from '@/components/notification/notification-preview'
export function HeaderActions({
  onAuthModalOpenChange,
  authModalOpen,
}: {
  onAuthModalOpenChange: (open: boolean) => void
  authModalOpen: boolean
}) {
  const { user } = useAppSelector(s => s.user),
    [open, setOpen] = useState(false)
  return (
    <>
      <div className="flex shrink-0 items-center gap-0 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="搜索算法与内容"
          onClick={() => setOpen(true)}
        >
          <Search />
        </Button>
        {user && <NotificationPreview />}
        <ThemeToggle />
        {user ? (
          <UserDropdown />
        ) : (
          <Button variant="ghost" onClick={() => onAuthModalOpenChange(true)}>
            登录
          </Button>
        )}
      </div>
      <AuthModal open={authModalOpen} onOpenChange={onAuthModalOpenChange} />
      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  )
}
