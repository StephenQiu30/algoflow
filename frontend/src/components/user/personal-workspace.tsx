'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { AccessGate } from '@/components/design/access-gate'
import { PageShell, ModuleEntries } from '@/components/design/page-shell'
import { DataTable, type DataRecord, type DataColumn } from '@/components/design/data-table'
import { useListQuery } from '@/hooks/use-list-query'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { listMyPostVoByPage } from '@/api/post/postController'
import { listMyFavourPostByPage } from '@/api/post/postFavourController'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { historyKey, readHistory, type LearningRecord } from '@/lib/learning-history'
const personalEntries = [
  { title: '我的内容', description: '管理发布内容', href: '/user/content' },
  { title: '我的收藏', description: '整理有用的题解与讨论', href: '/user/collections' },
  { title: '账户设置', description: '个人资料、学习偏好与安全', href: '/user/settings' },
]
function useHistory() {
  const { user } = useAppSelector(s => s.user)
  const [records, setRecords] = useState<LearningRecord[]>([])
  useEffect(() => {
    const read = () => setRecords(readHistory(historyKey(user?.id)))
    read()
    window.addEventListener('storage', read)
    return () => window.removeEventListener('storage', read)
  }, [user?.id])
  return records
}
function resume(r: LearningRecord) {
  return `/visualizer?algorithm=${r.algorithm}&array=${r.array.join(',')}&step=${r.step}`
}
const learningColumns: DataColumn[] = [
  { key: 'name', label: '算法' },
  { key: 'state', label: '学习状态' },
  { key: 'size', label: '数组长度' },
  { key: 'progress', label: '演练进度' },
  { key: 'updated', label: '最近学习' },
]
function Overview() {
  const { user } = useAppSelector(s => s.user),
    records = useHistory(),
    latest = records[0]
  return (
    <PageShell
      title="个人空间"
      description={user?.userName || '学习者'}
      actions={
        <>
          <Button variant="ghost" asChild>
            <Link href={`/user/${user?.id}`}>公开主页</Link>
          </Button>
          <Button asChild>
            <Link href="/blog/create">发布内容</Link>
          </Button>
        </>
      }
    >
      {latest ? (
        <Card className="bg-muted">
          <CardHeader>
            <CardDescription>继续学习</CardDescription>
            <CardTitle>{latest.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              第 {latest.step} / {latest.total} 步 · 数组长度 {latest.array.length}
            </p>
          </CardContent>
          <CardFooter className="justify-end">
            <Button asChild>
              <Link href={resume(latest)}>继续演练</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>开始一次演练</CardTitle>
            <CardDescription>你的学习记录将保存在当前浏览器。</CardDescription>
          </CardHeader>
          <CardFooter className="justify-end">
            <Button asChild>
              <Link href="/sorting">选择算法</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-medium">最近学习</h2>
          <Button asChild variant="ghost">
            <Link href="/user/learning">全部学习记录</Link>
          </Button>
        </div>
        {records.length ? (
          records.slice(0, 3).map(r => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex flex-col gap-1">
                <p>{r.name}</p>
                <p className="text-muted-foreground text-sm">
                  第 {r.step} / {r.total} 步 · {new Date(r.updated).toLocaleString('zh-CN')}
                </p>
              </div>
              <Button variant="ghost" asChild>
                <Link href={resume(r)}>继续演练</Link>
              </Button>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground py-4">还没有学习记录。</p>
        )}
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">个人管理</h2>
        <ModuleEntries entries={personalEntries} />
      </section>
    </PageShell>
  )
}
export function PersonalOverview() {
  return (
    <AccessGate>
      <Overview />
    </AccessGate>
  )
}
function PersonalListInner({ kind }: { kind: 'content' | 'collections' | 'learning' }) {
  const query = useListQuery(),
    router = useRouter(),
    [retry, setRetry] = useState(0),
    history = useHistory()
  const key = JSON.stringify([kind, query.page, query.pageSize, query.q, retry])
  const load = useCallback(async () => {
    const p = {
      current: query.page,
      pageSize: query.pageSize,
      searchText: query.q || undefined,
      sortField: 'createTime',
      sortOrder: 'descend',
    }
    const r = await (kind === 'collections' ? listMyFavourPostByPage(p) : listMyPostVoByPage(p))
    if (r.code !== 0 || !r.data) throw Error(r.message || '加载失败')
    return { rows: (r.data.records as DataRecord[]) || [], total: Number(r.data.total || 0) }
  }, [kind, query.page, query.pageSize, query.q])
  const data = useRemoteResource(key, load, '暂时无法加载，请重试。', kind !== 'learning')
  const filtered = history.filter(r => r.name.includes(query.q))
  const rows =
    kind === 'learning'
      ? filtered.slice((query.page - 1) * query.pageSize, query.page * query.pageSize).map(r => ({
          ...r,
          state: r.step === r.total ? '已完成' : '进行中',
          size: r.array.length,
          progress: `${r.step} / ${r.total}`,
          updated: new Date(r.updated).toLocaleString('zh-CN'),
        }))
      : data.data?.rows || []
  const columns =
    kind === 'learning'
      ? learningColumns
      : [
          { key: 'title', label: '标题' },
          {
            key: 'reviewStatus',
            label: '审核状态',
            render: (r: DataRecord) =>
              ['待审核', '已通过', '已退回'][Number(r.reviewStatus)] || '—',
          },
          { key: 'createTime', label: '发布时间' },
        ]
  return (
    <PageShell
      title={{ content: '我的内容', collections: '收藏', learning: '学习记录' }[kind]}
      back={{ href: '/user/profile', label: '返回个人中心' }}
      actions={
        kind === 'content' ? (
          <Button asChild>
            <Link href="/blog/create">发布内容</Link>
          </Button>
        ) : undefined
      }
    >
      {kind === 'learning' && (
        <p className="text-muted-foreground text-sm">仅显示当前账户在此浏览器中的演练记录。</p>
      )}
      <DataTable
        key={key}
        query={query}
        rows={rows}
        columns={columns}
        total={kind === 'learning' ? filtered.length : (data.data?.total ?? null)}
        loading={kind !== 'learning' && data.loading}
        error={data.error}
        retry={() => setRetry(x => x + 1)}
        actions={
          kind === 'content'
            ? r => (
                <DropdownMenuItem asChild>
                  <Link href={`/blog/create?edit=${r.id}`}>编辑内容</Link>
                </DropdownMenuItem>
              )
            : undefined
        }
        onOpen={r =>
          router.push(
            kind === 'learning'
              ? resume(r as unknown as LearningRecord)
              : `/blog/${r.id}?returnTo=${encodeURIComponent(query.href)}`
          )
        }
      />
    </PageShell>
  )
}
export function PersonalList({ kind }: { kind: 'content' | 'collections' | 'learning' }) {
  return (
    <AccessGate>
      <PersonalListInner kind={kind} />
    </AccessGate>
  )
}
