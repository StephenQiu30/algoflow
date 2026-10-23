'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { listMyNotificationVoByPage } from '@/api/notification/notificationController'
import { useAppSelector } from '@/store/hooks'
import { PageState } from '@/components/design/page-state'
import { notificationHref } from '@/lib/notification'
export function NotificationPreview() {
  const [open, setOpen] = useState(false),
    [retry, setRetry] = useState(0),
    { user } = useAppSelector(s => s.user)
  const load = useCallback(async () => {
    const res = await listMyNotificationVoByPage({
      current: 1,
      pageSize: 3,
      sortField: 'createTime',
      sortOrder: 'descend',
    })
    if (res.code !== 0 || !res.data) throw Error()
    return res.data.records || []
  }, [])
  useEffect(() => {
    const refresh = () => setRetry(n => n + 1)
    window.addEventListener('notification-updated', refresh)
    return () => window.removeEventListener('notification-updated', refresh)
  }, [])
  const r = useRemoteResource(
    `${user?.id}:${open}:${retry}`,
    load,
    '通知暂时无法加载',
    open && !!user
  )
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="预览通知">
          <Bell />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-[min(352px,calc(100vw-40px))] flex-col gap-3">
        <h2 className="font-medium">通知</h2>
        {r.loading ? (
          <PageState loading title="加载通知" />
        ) : r.error ? (
          <>
            <p className="text-muted-foreground text-sm">{r.error}</p>
            <Button variant="ghost" onClick={() => setRetry(n => n + 1)}>
              重试
            </Button>
          </>
        ) : !r.data?.length ? (
          <p className="text-muted-foreground py-6 text-sm">暂无通知</p>
        ) : (
          r.data.map(n => (
            <Button
              variant="ghost"
              className="h-auto min-h-11 justify-start py-3 text-left whitespace-normal"
              asChild
              key={n.id}
            >
              <Link href={notificationHref(n)} onClick={() => setOpen(false)}>
                <span className="flex flex-col gap-1">
                  <span>{n.title || '通知'}</span>
                  <span className="text-muted-foreground line-clamp-2 text-xs">{n.content}</span>
                </span>
              </Link>
            </Button>
          ))
        )}
        <Button variant="secondary" asChild>
          <Link href="/user/notifications" onClick={() => setOpen(false)}>
            查看全部通知
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  )
}
