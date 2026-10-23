'use client'
import { useEffect, useState } from 'react'
import { getManagedChunk, saveChunkDraft, type ManagedChunk } from '@/api/ai/knowledgeEditing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { useAppSelector } from '@/store/hooks'
const values = (r: ManagedChunk) => ({
  content: r.draftContent ?? r.content,
  sectionTitle: r.draftSectionTitle ?? r.sectionTitle ?? '',
  sectionPath: r.draftSectionPath ?? r.sectionPath ?? '',
})
export function ChunkEditor({
  chunk,
  onClose,
  onSaved,
}: {
  chunk: ManagedChunk
  onClose: () => void
  onSaved: () => void
}) {
  const userId = useAppSelector(s => s.user.user?.id)
  const backupKey = `algoflow:chunk-draft:${userId}:${chunk.documentId}:${chunk.id}`
  const [backup] = useState(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(backupKey) || 'null')
      return v &&
        Number.isSafeInteger(v.revision) &&
        v.revision >= 0 &&
        ['content', 'sectionTitle', 'sectionPath'].every(k => typeof v.form?.[k] === 'string')
        ? (v as { revision: number; form: ReturnType<typeof values> })
        : null
    } catch {
      return null
    }
  })
  const [form, setForm] = useState(() => backup?.form || values(chunk))
  const [base, setBase] = useState(() => ({
    ...chunk,
    documentRevision: backup?.revision ?? chunk.documentRevision,
  }))
  const [error, setError] = useState(''),
    [pending, setPending] = useState(false)
  const [conflict, setConflict] = useState(false),
    [latest, setLatest] = useState<ManagedChunk | null>(null)
  const [discard, setDiscard] = useState(false)
  const dirty = JSON.stringify(form) !== JSON.stringify(values(base))
  useEffect(() => {
    try {
      if (dirty)
        sessionStorage.setItem(backupKey, JSON.stringify({ revision: base.documentRevision, form }))
      else sessionStorage.removeItem(backupKey)
    } catch {
      /* Editing remains available if browser storage is disabled. */
    }
  }, [dirty, backupKey, base.documentRevision, form])
  function clearBackup() {
    try {
      sessionStorage.removeItem(backupKey)
    } catch {
      /* optional browser storage */
    }
  }
  const busy = ['PENDING', 'PROCESSING'].includes(base.documentStatus)
  useEffect(() => {
    if (!dirty) return
    const protect = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', protect)
    return () => window.removeEventListener('beforeunload', protect)
  }, [dirty])
  function close() {
    if (pending) return
    if (dirty) setDiscard(true)
    else onClose()
  }
  async function save(revision = base.documentRevision) {
    if (pending || busy || !form.content.trim()) return
    setPending(true)
    setError('')
    try {
      const res = await saveChunkDraft({
        id: chunk.id,
        documentId: chunk.documentId,
        expectedRevision: revision,
        ...form,
      })
      if (res.code === 40900) {
        setConflict(true)
        setLatest(null)
        return
      }
      if (res.code !== 0) throw Error(res.message || '草稿保存失败，请重试')
      toast.success('草稿已保存，检索版本尚未更新')
      clearBackup()
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败，请重试')
    } finally {
      setPending(false)
    }
  }
  async function loadLatest() {
    setPending(true)
    setError('')
    try {
      const res = await getManagedChunk(chunk.id)
      if (res.code !== 0 || !res.data)
        throw Error(
          '无法读取该切片，可能已重新发布。你的编辑仍保留，请先复制编辑，再关闭并刷新文档。'
        )
      setLatest(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '最新版本加载失败，请重试')
    } finally {
      setPending(false)
    }
  }
  return (
    <>
      <Dialog
        open
        onOpenChange={open => {
          if (!open) close()
        }}
      >
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>编辑切片</DialogTitle>
            <DialogDescription>
              文档版本 {base.documentRevision} · 保存为草稿，重新建立索引后才会更新检索内容。
            </DialogDescription>
          </DialogHeader>
          {backup && dirty && (
            <p role="status" className="text-muted-foreground text-sm">
              已恢复本标签页未保存的编辑，保存时会重新校验版本。
            </p>
          )}
          {busy && (
            <Alert>
              <AlertDescription>
                索引排队或处理中，内容暂只读。关闭后刷新文档状态。
              </AlertDescription>
            </Alert>
          )}
          <form
            onSubmit={e => {
              e.preventDefault()
              void save()
            }}
            className="flex flex-col gap-6"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="chunk-title">章节标题</FieldLabel>
                <Input
                  id="chunk-title"
                  value={form.sectionTitle}
                  maxLength={500}
                  disabled={pending || busy}
                  onChange={e => setForm({ ...form, sectionTitle: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="chunk-path">章节路径</FieldLabel>
                <Input
                  id="chunk-path"
                  value={form.sectionPath}
                  maxLength={1000}
                  disabled={pending || busy}
                  onChange={e => setForm({ ...form, sectionPath: e.target.value })}
                />
              </Field>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="chunk-content">切片内容</FieldLabel>
                <Textarea
                  id="chunk-content"
                  className="min-h-48"
                  value={form.content}
                  required
                  maxLength={20000}
                  disabled={pending || busy}
                  aria-invalid={!!error}
                  aria-describedby="chunk-help"
                  onChange={e => setForm({ ...form, content: e.target.value })}
                />
                <FieldDescription id="chunk-help">
                  支持 Markdown，最多 20,000 个字符。未发布的修改不会覆盖当前检索版本。
                </FieldDescription>
              </Field>
            </FieldGroup>
            {error && <p role="alert">{error}</p>}
            {conflict && (
              <Alert role="alert">
                <AlertTitle>版本冲突</AlertTitle>
                <AlertDescription className="flex flex-col gap-3">
                  <p>内容已被其他人更新。你的编辑已保留，请加载最新版本后比较。</p>
                  <Button
                    variant="ghost"
                    type="button"
                    className="self-end"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          [form.sectionTitle, form.sectionPath, form.content].join('\n\n')
                        )
                        toast.success('编辑内容已复制')
                      } catch {
                        toast.error('复制失败，请手动选择并复制内容')
                      }
                    }}
                  >
                    复制我的编辑
                  </Button>
                  {latest ? (
                    <>
                      <Field>
                        <FieldLabel htmlFor="latest-chunk">
                          最新内容 · 文档版本 {latest.documentRevision}
                        </FieldLabel>
                        <Textarea
                          id="latest-chunk"
                          readOnly
                          value={`${values(latest).sectionTitle}\n${values(latest).sectionPath}\n\n${values(latest).content}`}
                          className="min-h-32"
                        />
                      </Field>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="secondary"
                          type="button"
                          disabled={pending}
                          onClick={() => {
                            setForm(values(latest))
                            setBase(latest)
                            setConflict(false)
                            setLatest(null)
                          }}
                        >
                          采用最新内容
                        </Button>
                        <Button
                          type="button"
                          disabled={
                            pending || ['PENDING', 'PROCESSING'].includes(latest.documentStatus)
                          }
                          onClick={() => void save(latest.documentRevision)}
                        >
                          保留我的编辑并保存
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={pending}
                      onClick={() => void loadLatest()}
                    >
                      {pending && <Spinner />}加载最新版本
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button variant="secondary" type="button" disabled={pending} onClick={close}>
                取消
              </Button>
              <Button
                type="submit"
                disabled={pending || busy || conflict || !dirty || !form.content.trim()}
              >
                {pending && <Spinner />}保存草稿
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={discard} onOpenChange={setDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>放弃未保存的编辑？</AlertDialogTitle>
            <AlertDialogDescription>关闭后，本次尚未保存的内容将丢失。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>继续编辑</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscard(false)
                clearBackup()
                onClose()
              }}
            >
              放弃编辑
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
