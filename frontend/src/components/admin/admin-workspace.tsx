'use client'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { listDocumentByPage } from '@/api/ai/documentController'
import { listPostByPage, reviewPost } from '@/api/post/postController'
import { listUserByPage, updateUser, getLoginUser } from '@/api/user/userController'
import { listLogByPage } from '@/api/log/operationLogController'
import { PageShell, ModuleEntries } from '@/components/design/page-shell'
import { DataTable, type DataColumn, type DataRecord } from '@/components/design/data-table'
import { RecordDetail } from '@/components/design/record-detail'
import { useListQuery } from '@/hooks/use-list-query'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setLoginUser } from '@/store/modules/user/userSlice'
import { Spinner } from '@/components/ui/spinner'
import { MarkdownRender } from '@/components/blog/markdown-render'
export const adminEntries = [
  { title: '知识库', description: '维护文档、来源与切片', href: '/admin/knowledge' },
  { title: '召回评测', description: '检查检索结果与引用质量', href: '/admin/recall' },
  { title: '社区审核', description: '阅读与处理待审核内容', href: '/admin/moderation' },
  { title: '用户与权限', description: '管理用户与角色', href: '/admin/users' },
  { title: '索引任务', description: '查看文档处理状态与失败原因', href: '/admin/tasks' },
  { title: '审计日志', description: '查看操作记录与处理依据', href: '/admin/audit' },
]
const displayStatus = (r: DataRecord) =>
  ({
    DRAFT: '待索引',
    PENDING: '待处理',
    PROCESSING: '处理中',
    COMPLETED: '已完成',
    FAILED: '失败',
    TIMEOUT: '超时',
  })[String(r.status)] || String(r.status ?? '—')
const dateColumn: DataColumn = { key: 'createTime', label: '创建时间', sortable: true }
const columnsByModule: Record<string, DataColumn[]> = {
  knowledge: [
    { key: 'name', label: '文档名称' },
    { key: 'version', label: '版本' },
    { key: 'status', label: '处理状态', render: displayStatus },
    { key: 'chunkCount', label: '切片数量' },
    { key: 'updateTime', label: '更新时间', sortable: true },
  ],
  tasks: [
    { key: 'name', label: '文档名称' },
    { key: 'status', label: '处理状态', render: displayStatus },
    { key: 'errorMessage', label: '失败原因' },
    { key: 'updateTime', label: '更新时间', sortable: true },
  ],
  moderation: [
    { key: 'title', label: '内容标题' },
    { key: 'userId', label: '作者 ID' },
    {
      key: 'reviewStatus',
      label: '审核状态',
      render: r => ['待审核', '已通过', '已退回'][Number(r.reviewStatus)] || '—',
    },
    dateColumn,
  ],
  users: [
    { key: 'userName', label: '用户' },
    { key: 'userEmail', label: '邮箱' },
    { key: 'userRole', label: '角色', render: r => (r.userRole === 'admin' ? '管理员' : '学习者') },
    dateColumn,
  ],
  audit: [
    { key: 'module', label: '模块' },
    { key: 'action', label: '操作' },
    { key: 'operatorName', label: '操作人' },
    {
      key: 'success',
      label: '结果',
      render: r => (r.success === 1 ? '成功' : r.success === 0 ? '失败' : '—'),
    },
    dateColumn,
  ],
}
export function AdminOverview() {
  const router = useRouter()
  const [attempt, setAttempt] = useState(0)
  const query = useListQuery()
  const load = useCallback(async () => {
    const res = await listPostByPage({
      current: query.page,
      pageSize: query.pageSize,
      searchText: query.q || undefined,
      reviewStatus: 0,
    })
    if (res.code !== 0 || !res.data) throw Error()
    return res.data
  }, [query.page, query.pageSize, query.q])
  const r = useRemoteResource(
    JSON.stringify(['admin-todo', attempt, query.page, query.pageSize, query.q]),
    load,
    '待审核内容暂时无法加载'
  )
  return (
    <PageShell title="运营管理">
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">需要处理</h2>
        <DataTable
          query={query}
          rows={(r.data?.records || []) as DataRecord[]}
          total={r.data ? Number(r.data.total || 0) : null}
          loading={r.loading}
          error={r.error}
          retry={() => setAttempt(n => n + 1)}
          columns={columnsByModule.moderation}
          onOpen={row => router.push(`/admin/moderation?record=${row.id}`)}
        />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">管理工作</h2>
        <ModuleEntries entries={adminEntries} />
      </section>
    </PageShell>
  )
}
export function AdminList({
  module,
}: {
  module: 'knowledge' | 'tasks' | 'moderation' | 'users' | 'audit'
}) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(s => s.user)
  const query = useListQuery(),
    router = useRouter()
  const recordId = useSearchParams().get('record')
  const [retry, setRetry] = useState(0),
    [selected, setSelected] = useState<DataRecord | null>(null)
  const [change, setChange] = useState<{ row: DataRecord; kind: 'review' | 'role' } | null>(null)
  const [reason, setReason] = useState(''),
    [value, setValue] = useState('1'),
    [pending, setPending] = useState(false),
    [error, setError] = useState('')
  const key = JSON.stringify([
    module,
    query.page,
    query.pageSize,
    query.q,
    query.status,
    query.sort,
    query.order,
    retry,
    recordId,
  ])
  const load = useCallback(async () => {
    const p = {
      current: query.page,
      pageSize: query.pageSize,
      sortField: query.sort,
      sortOrder: query.order,
    }
    const status = query.status === 'all' ? undefined : query.status
    const res =
      module === 'knowledge' || module === 'tasks'
        ? await listDocumentByPage({ ...p, name: query.q || undefined, status })
        : module === 'users'
          ? await listUserByPage({ ...p, userName: query.q || undefined, userRole: status })
          : module === 'audit'
            ? await listLogByPage({ ...p, module: query.q || undefined })
            : await listPostByPage({
                ...p,
                id: recordId ? (recordId as unknown as number) : undefined,
                searchText: query.q || undefined,
                reviewStatus: status === undefined ? undefined : Number(status),
              })
    if (res.code !== 0 || !res.data) throw new Error(res.message || '加载失败')
    return { rows: (res.data.records || []) as DataRecord[], total: Number(res.data.total || 0) }
  }, [module, query.page, query.pageSize, query.q, query.status, query.sort, query.order, recordId])
  const resource = useRemoteResource(key, load, '请检查网络连接后重试。')
  const columns = columnsByModule[module]
  const title = adminEntries.find(e => e.href === `/admin/${module}`)?.title || '运营管理'
  const statuses =
    module === 'knowledge' || module === 'tasks'
      ? ['DRAFT', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'TIMEOUT'].map(s => ({
          value: s,
          label: displayStatus({ status: s }),
        }))
      : module === 'moderation'
        ? [
            { value: '0', label: '待审核' },
            { value: '1', label: '已通过' },
            { value: '2', label: '已退回' },
          ]
        : module === 'users'
          ? [
              { value: 'user', label: '学习者' },
              { value: 'admin', label: '管理员' },
            ]
          : []
  async function submit() {
    if (!change || pending) return
    if (change.kind === 'review' && value === '2' && !reason.trim()) {
      setError('请说明退回原因')
      return
    }
    setPending(true)
    setError('')
    try {
      const res =
        change.kind === 'review'
          ? await reviewPost({
              id: change.row.id as number,
              reviewStatus: Number(value),
              reviewMessage: reason.trim() || undefined,
            })
          : await updateUser({ id: change.row.id as number, userRole: value })
      if (res.code !== 0) throw Error(res.message || '操作失败')
      if (change.kind === 'role' && String(change.row.id) === String(user?.id)) {
        const current = await getLoginUser()
        if (current.code === 0 && current.data) dispatch(setLoginUser(current.data))
      }
      toast.success('已保存')
      setChange(null)
      setRetry(x => x + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败，请重试')
    } finally {
      setPending(false)
    }
  }
  return (
    <PageShell
      title={title}
      back={{ href: '/admin', label: '返回运营管理' }}
      actions={
        module === 'knowledge' ? (
          <>
            <Button asChild variant="secondary">
              <Link href="/admin/tasks">查看索引任务</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/knowledge/import">导入文档</Link>
            </Button>
          </>
        ) : undefined
      }
    >
      {module === 'tasks' && (
        <p className="text-muted-foreground text-sm">
          查看文档解析与索引处理状态。失败原因保留在对应记录中。
        </p>
      )}
      {recordId && (
        <Button
          variant="ghost"
          className="self-start"
          onClick={() => query.update({ record: undefined, page: 1 })}
        >
          查看全部记录
        </Button>
      )}
      <DataTable
        key={key}
        query={query}
        columns={columns}
        rows={resource.data?.rows || []}
        total={resource.data?.total ?? null}
        loading={resource.loading}
        error={resource.error}
        retry={() => setRetry(x => x + 1)}
        statuses={statuses}
        onOpen={row =>
          module === 'knowledge' || module === 'tasks'
            ? router.push(`/admin/knowledge/${row.id}?returnTo=${encodeURIComponent(query.href)}`)
            : setSelected(row)
        }
        actions={row =>
          module === 'moderation' ? (
            <DropdownMenuItem
              onSelect={() => {
                setChange({ row, kind: 'review' })
                setValue('1')
                setReason('')
                setError('')
              }}
            >
              审核内容
            </DropdownMenuItem>
          ) : module === 'users' ? (
            <DropdownMenuItem
              onSelect={() => {
                setChange({ row, kind: 'role' })
                setValue(String(row.userRole || 'user'))
                setError('')
              }}
            >
              调整角色
            </DropdownMenuItem>
          ) : null
        }
      />
      <RecordDetail
        record={
          selected ||
          (recordId ? resource.data?.rows.find(row => String(row.id) === recordId) || null : null)
        }
        columns={columns}
        onClose={() => {
          setSelected(null)
          if (recordId) query.update({ record: undefined })
        }}
      >
        {module === 'moderation' && (
          <MarkdownRender
            content={String(
              (selected || resource.data?.rows.find(row => String(row.id) === recordId))?.content ||
                '正文为空'
            )}
          />
        )}
      </RecordDetail>
      <Dialog
        open={!!change}
        onOpenChange={open => {
          if (!open && !pending) setChange(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{change?.kind === 'review' ? '审核内容' : '调整用户角色'}</DialogTitle>
            <DialogDescription>
              {change?.kind === 'review'
                ? String(change.row.title)
                : `为 ${String(change?.row.userName || '该用户')} 调整角色。管理员可访问全部运营模块。`}
            </DialogDescription>
          </DialogHeader>
          {change?.kind === 'review' && (
            <div className="max-h-[35dvh] overflow-y-auto">
              <MarkdownRender content={String(change.row.content || '正文为空')} />
            </div>
          )}
          <FieldGroup>
            <Field>
              <FieldLabel>处理结果</FieldLabel>
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger aria-label="处理结果">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(change?.kind === 'review'
                      ? [
                          ['1', '通过'],
                          ['2', '退回'],
                        ]
                      : [
                          ['user', '学习者'],
                          ['admin', '管理员'],
                        ]
                    ).map(([v, l]) => (
                      <SelectItem value={v} key={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            {change?.kind === 'review' && (
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="review-reason">审核说明</FieldLabel>
                <Textarea
                  id="review-reason"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  aria-invalid={!!error}
                />
                <FieldDescription>退回时必须说明具体原因。</FieldDescription>
              </Field>
            )}
          </FieldGroup>
          {error && (
            <p role="alert" className="text-sm">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="secondary" disabled={pending} onClick={() => setChange(null)}>
              取消
            </Button>
            <Button disabled={pending} onClick={() => void submit()}>
              {pending && <Spinner />}确认保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
