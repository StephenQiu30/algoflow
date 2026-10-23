'use client'
import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useAuthLoading } from '@/components/providers/root-providers'
import { useAppSelector } from '@/store/hooks'
import { AuthModal } from '@/components/auth/auth-modal'
import { Button } from '@/components/ui/button'
import { PageState } from '@/components/design/page-state'
export function AccessGate({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user } = useAppSelector(s => s.user)
  const loading = useAuthLoading()
  const [open, setOpen] = useState(false)
  if (loading) return <PageState title="正在确认登录状态" loading />
  if (!user)
    return (
      <>
        <PageState
          title="登录后继续"
          description={admin ? '请使用具有管理权限的账户。' : '登录后查看你的学习、内容与通知。'}
        >
          <Button onClick={() => setOpen(true)}>登录</Button>
        </PageState>
        <AuthModal open={open} onOpenChange={setOpen} />
      </>
    )
  if (admin && user.userRole !== 'admin')
    return (
      <PageState title="无管理权限" description="当前账户无法访问运营管理。">
        <Button asChild variant="secondary">
          <Link href="/user/profile">返回个人中心</Link>
        </Button>
      </PageState>
    )
  return children
}
