'use client'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import {
  addKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
  listKnowledgeBaseVoByPage,
} from '@/api/ai/knowledgeBaseController'
import { useListQuery } from '@/hooks/use-list-query'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { DataTable, type DataRecord } from '@/components/design/data-table'
import { PageShell } from '@/components/design/page-shell'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export function KnowledgeBases() {
  const query = useListQuery()
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState<{ id?: number; name: string; description: string } | null>(
    null
  )
  const [removing, setRemoving] = useState<DataRecord | null>(null)
  const [pending, setPending] = useState(false),
    [error, setError] = useState('')
  const load = useCallback(async () => {
    const r = await listKnowledgeBaseVoByPage({
      current: query.page,
      pageSize: query.pageSize,
      searchText: query.q || undefined,
      sortField: 'createTime',
      sortOrder: 'descend',
    })
    if (r.code !== 0 || !r.data) throw Error(r.message || '加载失败')
    return r.data
  }, [query.page, query.pageSize, query.q])
  const key = JSON.stringify([query.page, query.pageSize, query.q, attempt])
  const resource = useRemoteResource(key, load, '知识库暂时无法加载，请重试。')
  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editing || pending || !editing.name.trim()) return
    setPending(true)
    setError('')
    try {
      const payload = { ...editing, name: editing.name.trim() }
      const r = editing.id ? await updateKnowledgeBase(payload) : await addKnowledgeBase(payload)
      if (r.code !== 0 || !r.data) throw Error(r.message || '保存失败，请重试')
      setEditing(null)
      setAttempt(n => n + 1)
      toast.success('知识库已保存')
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败，请重试')
    } finally {
      setPending(false)
    }
  }
  async function remove() {
    if (!removing || pending) return
    setPending(true)
    setError('')
    try {
      const r = await deleteKnowledgeBase({ id: removing.id as number })
      if (r.code !== 0 || !r.data) throw Error(r.message || '删除失败，请重试')
      setRemoving(null)
      setAttempt(n => n + 1)
      toast.success('知识库已删除')
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败，请重试')
    } finally {
      setPending(false)
    }
  }
  return (
    <PageShell
      title="管理知识库"
      back={{ href: '/admin/knowledge', label: '返回文档列表' }}
      actions={
        <Button
          onClick={() => {
            setEditing({ name: '', description: '' })
            setError('')
          }}
        >
          新建知识库
        </Button>
      }
    >
      <DataTable
        key={key}
        query={query}
        rows={(resource.data?.records || []) as DataRecord[]}
        total={resource.data ? Number(resource.data.total || 0) : null}
        loading={resource.loading}
        error={resource.error}
        retry={() => setAttempt(n => n + 1)}
        columns={[
          { key: 'name', label: '名称' },
          { key: 'description', label: '说明' },
          { key: 'documentCount', label: '文档数量' },
          { key: 'updateTime', label: '更新时间' },
        ]}
        onOpen={r => {
          setEditing({
            id: r.id as number,
            name: String(r.name || ''),
            description: String(r.description || ''),
          })
          setError('')
        }}
        actions={r => (
          <>
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/knowledge?knowledgeBaseId=${r.id}&returnTo=${encodeURIComponent(query.href)}`}
              >
                查看文档
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/knowledge/import?knowledgeBaseId=${r.id}&returnTo=${encodeURIComponent(query.href)}`}
              >
                导入文档
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/recall?knowledgeBaseId=${r.id}&returnTo=${encodeURIComponent(query.href)}`}
              >
                召回评测
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={pending}
              onSelect={() => {
                setRemoving(r)
                setError('')
              }}
            >
              删除知识库
            </DropdownMenuItem>
          </>
        )}
      />
      <Dialog
        open={!!editing}
        onOpenChange={v => {
          if (!v && !pending) setEditing(null)
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? '编辑知识库' : '新建知识库'}</DialogTitle>
            <DialogDescription>维护名称与说明。文档与索引状态在文档列表中查看。</DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={e => void save(e)} className="flex flex-col gap-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="kb-name">名称</FieldLabel>
                  <Input
                    id="kb-name"
                    required
                    maxLength={100}
                    disabled={pending}
                    value={editing.name}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="kb-description">说明</FieldLabel>
                  <Textarea
                    id="kb-description"
                    maxLength={1000}
                    disabled={pending}
                    value={editing.description}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                  />
                </Field>
              </FieldGroup>
              {error && <p role="alert">{error}</p>}
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => setEditing(null)}
                >
                  取消
                </Button>
                <Button disabled={pending || !editing.name.trim()}>
                  {pending && <Spinner />}保存知识库
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!removing}
        onOpenChange={v => {
          if (!v && !pending) setRemoving(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除知识库？</AlertDialogTitle>
            <AlertDialogDescription>
              将删除「{String(removing?.name || '')}
              」及其文档和索引，无法撤销。索引清理失败时会保留知识库并显示原因。
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
