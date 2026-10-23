'use client'
import { use, useCallback, useState } from 'react'
import { addDocument } from '@/api/ai/documentController'
import { listKnowledgeBaseVoByPage, getKnowledgeBaseVoById } from '@/api/ai/knowledgeBaseController'
import Link from 'next/link'
import { analyzeRecall } from '@/api/ai/ragController'
import { PageShell } from '@/components/design/page-shell'
import { PageState } from '@/components/design/page-state'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { DocumentWorkspace } from './document-workspace'
import { useRouter, useSearchParams } from 'next/navigation'
export function KnowledgeTask({ kind }: { kind: 'import' | 'recall' }) {
  const preselected = useSearchParams().get('knowledgeBaseId')
  const source = useSearchParams().get('returnTo')
  const basesBack =
    source && /^\/admin\/knowledge\/bases(?:\?|$)/.test(source) && !/[\\\r\n]/.test(source)
      ? source
      : null
  const [retry, setRetry] = useState(0),
    [kb, setKb] = useState(preselected || ''),
    [file, setFile] = useState<File | null>(null),
    [question, setQuestion] = useState(''),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false),
    [result, setResult] = useState<AiAPI.RecallAnalysisVO | null>(null),
    [uploaded, setUploaded] = useState<string | null>(null)
  const router = useRouter()
  const load = useCallback(async () => {
    const [r, selected] = await Promise.all([
      listKnowledgeBaseVoByPage({ current: 1, pageSize: 20 }),
      preselected
        ? getKnowledgeBaseVoById({ id: preselected as unknown as number })
        : Promise.resolve(null),
    ])
    if (r.code !== 0 || !r.data) throw Error()
    if (selected && (selected.code !== 0 || !selected.data)) throw Error('所选知识库无法加载')
    const rows = r.data.records || []
    return selected?.data && !rows.some(k => String(k.id) === String(selected.data?.id))
      ? [selected.data, ...rows]
      : rows
  }, [preselected])
  const resource = useRemoteResource(String(retry), load, '知识库暂时无法加载。')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!kb) {
      setError('请选择知识库')
      return
    }
    if (kind === 'import' && !file) {
      setError('请选择文档')
      return
    }
    if (kind === 'recall' && !question.trim()) {
      setError('请填写问题')
      return
    }
    setPending(true)
    setError('')
    try {
      if (kind === 'import') {
        const r = await addDocument({ knowledgeBaseId: kb as unknown as number }, {}, file!)
        if (r.code !== 0 || !r.data) throw Error(r.message || '上传失败')
        setUploaded(String(r.data))
      } else {
        const r = await analyzeRecall({
          question: question.trim(),
          knowledgeBaseId: kb as unknown as number,
          topK: 5,
          enableRerank: true,
        })
        if (r.code !== 0 || !r.data) throw Error(r.message || '评测失败')
        setResult(r.data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败，请重试')
    } finally {
      setPending(false)
    }
  }
  return (
    <PageShell
      title={kind === 'import' ? '导入文档' : '召回评测'}
      back={
        basesBack
          ? { href: basesBack, label: '返回知识库管理' }
          : {
              href: kind === 'import' ? '/admin/knowledge' : '/admin',
              label: kind === 'import' ? '返回知识库' : '返回运营管理',
            }
      }
    >
      <form onSubmit={e => void submit(e)} className="flex max-w-2xl flex-col gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel>知识库</FieldLabel>
            <Select value={kb} onValueChange={setKb} disabled={pending || resource.loading}>
              <SelectTrigger aria-label="选择知识库">
                <SelectValue placeholder={resource.loading ? '正在加载…' : '请选择知识库'} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {resource.data?.map(k => (
                    <SelectItem key={k.id} value={String(k.id)}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              <Link className="underline underline-offset-4" href="/admin/knowledge/bases">
                查找或新建知识库
              </Link>
            </FieldDescription>
            {resource.error && (
              <FieldDescription>
                {resource.error}
                <Button variant="ghost" onClick={() => setRetry(n => n + 1)} type="button">
                  重试
                </Button>
              </FieldDescription>
            )}
          </Field>
          {kind === 'import' ? (
            <Field>
              <FieldLabel htmlFor="knowledge-file">文档文件</FieldLabel>
              <Input
                id="knowledge-file"
                type="file"
                accept=".md,.txt,.pdf,.doc,.docx"
                onChange={e => setFile(e.target.files?.[0] || null)}
                disabled={pending}
              />
              <FieldDescription>
                上传后继续查看解析与索引状态。上传成功不等于已可检索。
              </FieldDescription>
            </Field>
          ) : (
            <Field>
              <FieldLabel htmlFor="recall-question">测试问题</FieldLabel>
              <Textarea
                id="recall-question"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required
              />
              <FieldDescription>比较关键词、向量、融合及重排结果。</FieldDescription>
            </Field>
          )}
        </FieldGroup>
        {error && <p role="alert">{error}</p>}
        <div className="flex justify-end">
          <Button disabled={pending || !!uploaded}>
            {pending && <Spinner />}
            {kind === 'import' ? '上传文档' : '开始评测'}
          </Button>
        </div>
      </form>
      {uploaded && (
        <PageState title="文档已上传" description="继续查看后续处理状态。">
          <Button onClick={() => router.push(`/admin/knowledge/${uploaded}`)}>查看文档</Button>
        </PageState>
      )}
      {result && (
        <section className="grid gap-6 md:grid-cols-2">
          {(
            [
              ['关键词召回', result.keywordHits],
              ['向量召回', result.vectorHits],
              ['融合结果', result.fusedHits],
              ['最终重排', result.finalResults],
            ] as const
          ).map(([title, hits]) => (
            <section key={title} className="flex min-w-0 flex-col gap-4">
              <h2 className="text-xl font-medium">{title}</h2>
              {hits?.length ? (
                hits.map((h, i) => (
                  <article
                    key={h.chunkId || i}
                    className="bg-muted flex flex-col gap-2 rounded-lg p-4"
                  >
                    <h3 className="font-medium">
                      {h.documentName} · {h.sectionTitle}
                    </h3>
                    <p className="text-sm leading-7 break-words">{h.content}</p>
                    <p className="text-muted-foreground text-xs">
                      分数 {h.score ?? h.keywordScore ?? h.vectorScore ?? '—'} ·{' '}
                      {h.matchReason || '检索结果'}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">未召回相关来源。</p>
              )}
            </section>
          ))}
        </section>
      )}
    </PageShell>
  )
}
export function DocumentDetail({ params }: { params: Promise<{ id: string }> }) {
  const target = useSearchParams().get('returnTo')
  const back =
    target && /^\/admin\/(?:knowledge|tasks)(?:\?|$)/.test(target) ? target : '/admin/knowledge'
  const { id } = use(params)
  return <DocumentWorkspace id={id} back={back} />
}
