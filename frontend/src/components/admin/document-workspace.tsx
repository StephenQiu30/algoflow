'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  getKnowledgeDocument,
  listManagedChunks,
  retryDocumentIndex,
  type ManagedChunk,
} from '@/api/ai/knowledgeEditing'
import { useListQuery } from '@/hooks/use-list-query'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { PageShell } from '@/components/design/page-shell'
import { PageState } from '@/components/design/page-state'
import { DataTable, type DataRecord } from '@/components/design/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ChunkEditor } from './chunk-editor'
const states: Record<string, string> = {
  DRAFT: '待索引',
  PENDING: '等待处理',
  PROCESSING: '索引处理中',
  FAILED: '索引失败',
  TIMEOUT: '索引超时',
  COMPLETED: '已发布',
}
export function DocumentWorkspace({ id, back }: { id: string; back: string }) {
  const query = useListQuery(),
    [attempt, setAttempt] = useState(0)
  const [selected, setSelected] = useState<ManagedChunk | null>(null)
  const [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('')
  const load = useCallback(async () => {
    const [d, c] = await Promise.all([
      getKnowledgeDocument(id),
      listManagedChunks({
        documentId: id,
        current: query.page,
        pageSize: query.pageSize,
        searchText: query.q || undefined,
      }),
    ])
    if (d.code !== 0 || !d.data || c.code !== 0 || !c.data) throw Error('文档暂时无法加载')
    return { document: d.data, chunks: c.data }
  }, [id, query.page, query.pageSize, query.q])
  const key = JSON.stringify([id, query.page, query.pageSize, query.q, attempt])
  const resource = useRemoteResource(key, load, '文档暂时无法加载，请重试。')
  const document = resource.data?.document
  const busy = !!document && ['PENDING', 'PROCESSING'].includes(document.status)
  useEffect(() => {
    if (!busy || selected) return
    const timer = setTimeout(() => setAttempt(n => n + 1), 2000)
    return () => clearTimeout(timer)
  }, [busy, selected, resource.data])
  async function retry() {
    if (!document || pending || busy) return
    setPending(true)
    setError('')
    setNotice('')
    try {
      const r = await retryDocumentIndex(id, document.revision)
      if (r.code === 40900) {
        setError('文档已更新，已刷新状态。请检查后重新提交。')
        setAttempt(n => n + 1)
        return
      }
      if (r.code !== 0) throw Error(r.message || '索引任务提交失败')
      setNotice('索引任务已提交，等待处理。当前检索版本会保留至新版本发布成功。')
      setAttempt(n => n + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交结果暂未确认，请刷新状态后再重试。')
    } finally {
      setPending(false)
    }
  }
  const open = (r: DataRecord) => setSelected(r as unknown as ManagedChunk)
  return (
    <PageShell
      title={document?.name || '文档详情'}
      back={{ href: back, label: back.startsWith('/admin/tasks') ? '返回索引任务' : '返回知识库' }}
      actions={
        <>
          <Button
            variant="secondary"
            disabled={resource.loading || pending}
            onClick={() => setAttempt(n => n + 1)}
          >
            刷新状态
          </Button>
          {document && ['DRAFT', 'FAILED', 'TIMEOUT'].includes(document.status) && (
            <Button disabled={pending || resource.loading} onClick={() => void retry()}>
              {pending && <Spinner />}
              {document.status === 'DRAFT' ? '建立索引' : '重试索引'}
            </Button>
          )}
        </>
      }
    >
      {resource.loading ? (
        <PageState loading title="加载文档" />
      ) : resource.error ? (
        <PageState title="加载失败" description={resource.error}>
          <Button onClick={() => setAttempt(n => n + 1)}>重试</Button>
        </PageState>
      ) : (
        document && (
          <>
            <section className="flex flex-col gap-3" aria-label="文档索引状态">
              <p className="text-sm">
                {states[document.status] || document.status} · 文档版本 {document.revision} ·
                已发布版本 {document.publishedRevision ?? '无'} · 切片 {document.chunkCount}
              </p>
              <p className="text-muted-foreground text-sm">
                草稿保存不会改变当前检索内容。只有新索引发布成功，检索版本才会更新。
              </p>
              {busy && <p role="status">{states[document.status]}，状态将自动刷新。</p>}
              {document.errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>索引未完成</AlertTitle>
                  <AlertDescription>{document.errorMessage}</AlertDescription>
                </Alert>
              )}
            </section>
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-medium">文档切片</h2>
              <DataTable
                key={key}
                query={query}
                rows={resource.data!.chunks.records as unknown as DataRecord[]}
                total={Number(resource.data!.chunks.total)}
                columns={[
                  {
                    key: 'sectionTitle',
                    label: '章节',
                    render: r => String(r.draftSectionTitle ?? r.sectionTitle ?? '未命名章节'),
                  },
                  {
                    key: 'sectionPath',
                    label: '章节路径',
                    render: r => String(r.draftSectionPath ?? r.sectionPath ?? '—'),
                  },
                  { key: 'wordCount', label: '已发布字符数' },
                  {
                    key: 'draftContent',
                    label: '草稿',
                    render: r => (
                      <Badge variant="secondary">
                        {r.draftContent != null ? '待索引' : '无修改'}
                      </Badge>
                    ),
                  },
                ]}
                onOpen={open}
                actions={r => (
                  <DropdownMenuItem disabled={busy} onSelect={() => open(r)}>
                    编辑切片
                  </DropdownMenuItem>
                )}
              />
            </section>
          </>
        )
      )}
      {notice && (
        <p role="status" className="text-muted-foreground text-sm">
          {notice}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {selected && (
        <ChunkEditor
          key={selected.id}
          chunk={selected}
          onClose={() => setSelected(null)}
          onSaved={() => setAttempt(n => n + 1)}
        />
      )}
    </PageShell>
  )
}
