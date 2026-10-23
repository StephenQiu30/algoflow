'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  listMyNotificationVoByPage,
  markAllNotificationRead,
  markNotificationRead,
  deleteNotification,
} from '@/api/notification/notificationController'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { AccessGate } from '@/components/design/access-gate'
import { PageShell } from '@/components/design/page-shell'
import { DataTable, type DataRecord } from '@/components/design/data-table'
import { useListQuery } from '@/hooks/use-list-query'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { notificationHref } from '@/lib/notification'
import { toast } from 'sonner'
function Notifications() {
  const query = useListQuery(),
    router = useRouter(),
    [retry, setRetry] = useState(0),
    [pending, setPending] = useState(false)
  const [removing, setRemoving] = useState<DataRecord | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const refresh = () => setRetry(n => n + 1)
    window.addEventListener('notification-updated', refresh)
    return () => window.removeEventListener('notification-updated', refresh)
  }, [])
  const key = JSON.stringify([query.page, query.pageSize, query.status, query.q, retry])
  const load = useCallback(async () => {
    const r = await listMyNotificationVoByPage({
      current: query.page,
      pageSize: query.pageSize,
      searchText: query.q || undefined,
      isRead: query.status === 'unread' ? 0 : undefined,
      sortField: 'createTime',
      sortOrder: 'descend',
    })
    if (r.code !== 0 || !r.data) throw Error()
    return r.data
  }, [query.page, query.pageSize, query.status, query.q])
  const data = useRemoteResource(key, load, '请检查网络后重试。')
  async function allRead() {
    if (pending) return
    setPending(true)
    try {
      const r = await markAllNotificationRead()
      if (r.code !== 0) throw Error()
      window.dispatchEvent(new Event('notification-updated'))
      toast.success('已全部标为已读')
    } catch {
      toast.error('标记失败，请重试')
    } finally {
      setPending(false)
    }
  }
  async function open(r: DataRecord) {
    if (pending) return
    setPending(true)
    try {
      if (r.isRead !== 1) {
        const res = await markNotificationRead({ id: r.id as number })
        if (res.code !== 0) throw Error()
        window.dispatchEvent(new Event('notification-updated'))
      }
      router.push(notificationHref(r, query.href))
    } catch {
      toast.error('无法标记已读，请重试')
    } finally {
      setPending(false)
    }
  }
  async function remove() {
    if (!removing || pending) return
    setPending(true)
    setError('')
    try {
      const r = await deleteNotification({ id: removing.id as number })
      if (r.code !== 0 || !r.data) throw Error(r.message || '删除失败，请重试')
      setRemoving(null)
      window.dispatchEvent(new Event('notification-updated'))
      toast.success('通知已删除')
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败，请重试')
    } finally {
      setPending(false)
    }
  }
  return (
    <PageShell
      title="通知"
      back={{ href: '/user/profile', label: '返回个人中心' }}
      actions={
        <Button
          variant="secondary"
          disabled={pending || !data.data?.records?.length}
          onClick={() => void allRead()}
        >
          {pending && <Spinner />}全部标为已读
        </Button>
      }
    >
      <Tabs
        value={query.status === 'unread' ? 'unread' : 'all'}
        onValueChange={status => query.update({ status, page: 1 })}
      >
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="unread">未读</TabsTrigger>
        </TabsList>
        {['all', 'unread'].map(value => (
          <TabsContent key={value} value={value}>
            <DataTable
              key={key}
              query={query}
              rows={(data.data?.records || []) as DataRecord[]}
              columns={[
                { key: 'title', label: '通知' },
                { key: 'content', label: '内容' },
                { key: 'isRead', label: '状态', render: r => (r.isRead === 1 ? '已读' : '未读') },
                { key: 'createTime', label: '时间' },
              ]}
              total={data.data ? Number(data.data.total || 0) : null}
              loading={data.loading}
              error={data.error}
              retry={() => setRetry(n => n + 1)}
              onOpen={r => void open(r)}
              actions={r => (
                <DropdownMenuItem
                  disabled={pending}
                  onSelect={() => {
                    setRemoving(r)
                    setError('')
                  }}
                >
                  删除通知
                </DropdownMenuItem>
              )}
            />
          </TabsContent>
        ))}
      </Tabs>
      <AlertDialog
        open={!!removing}
        onOpenChange={v => {
          if (!v && !pending) setRemoving(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除这条通知？</AlertDialogTitle>
            <AlertDialogDescription>
              {String(removing?.title || '通知')}。删除后无法在通知中心恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p role="alert">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>取消</AlertDialogCancel>
            <Button disabled={pending} onClick={() => void remove()}>
              {pending && <Spinner />}确认删除
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
export default function Page() {
  return (
    <AccessGate>
      <Notifications />
    </AccessGate>
  )
}
