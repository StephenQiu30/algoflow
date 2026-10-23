'use client'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AccessGate } from '@/components/design/access-gate'
import { PageShell } from '@/components/design/page-shell'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { MarkdownEditor } from '@/components/blog/markdown-editor'
import { addPost, editPost, getPostVoById } from '@/api/post/postController'
import { safeStorage } from '@/lib/ragStream'
import { useAppSelector } from '@/store/hooks'
import { toast } from 'sonner'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { PageState } from '@/components/design/page-state'
import { contentReturnTo } from '@/lib/personal-navigation'
import Link from 'next/link'
const subscribe = () => () => {}
function Editor({ post, back }: { post?: PostAPI.PostVO; back: string }) {
  const { user } = useAppSelector(s => s.user),
    key = `algoflow:draft:${user?.id}${post?.id ? `:edit:${post.id}` : ''}`,
    router = useRouter()
  const [draft] = useState(() => {
    const fallback = {
      title: post?.title || '',
      content: post?.content || '',
      tags: post?.tags?.join('，') || '',
    }
    try {
      return { ...fallback, ...JSON.parse(safeStorage.getItem(key) || '{}') }
    } catch {
      return fallback
    }
  })
  const [title, setTitle] = useState<string>(draft.title),
    [content, setContent] = useState<string>(draft.content),
    [tags, setTags] = useState<string>(draft.tags),
    [pending, setPending] = useState(false),
    [error, setError] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      safeStorage.setItem(key, JSON.stringify({ title, content, tags }))
    }, 500)
    return () => clearTimeout(timer)
  }, [key, title, content, tags])
  async function publish(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('请填写标题和正文')
      return
    }
    setPending(true)
    setError('')
    try {
      const payload = {
        title: title.trim(),
        content,
        tags: tags
          .split(/[,，]/)
          .map(t => t.trim())
          .filter(Boolean),
      }
      const r = post?.id ? await editPost({ ...payload, id: post.id }) : await addPost(payload)
      if (r.code !== 0 || !r.data) throw Error(r.message || '发布失败')
      safeStorage.removeItem(key)
      toast.success('已提交审核')
      router.push(back)
    } catch (e) {
      setError(e instanceof Error ? e.message : '发布失败，请重试')
    } finally {
      setPending(false)
    }
  }
  return (
    <PageShell
      title={post ? '编辑内容' : '发布内容'}
      back={{
        href: post ? back : '/blog',
        label: post ? '返回我的内容' : '返回学习社区',
      }}
    >
      <form className="flex min-w-0 flex-col gap-6" onSubmit={e => void publish(e)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="post-title">标题</FieldLabel>
            <Input
              id="post-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </Field>
          <Field>
            <FieldLabel>正文</FieldLabel>
            <MarkdownEditor value={content} onChange={setContent} viewMode="edit" />
          </Field>
          <Field>
            <FieldLabel htmlFor="post-tags">标签</FieldLabel>
            <Input
              id="post-tags"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="例如：插入排序，学习笔记"
            />
            <FieldDescription>使用逗号分隔。内容提交后进入审核。</FieldDescription>
          </Field>
        </FieldGroup>
        {error && <p role="alert">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              safeStorage.setItem(key, JSON.stringify({ title, content, tags }))
              toast.success('草稿已保存在此浏览器')
            }}
          >
            保存草稿
          </Button>
          <Button disabled={pending}>
            {pending && <Spinner />}
            {post ? '提交更改' : '提交发布'}
          </Button>
        </div>
      </form>
    </PageShell>
  )
}
function EditorRoute() {
  const params = useSearchParams()
  const id = params.get('edit'),
    [retry, setRetry] = useState(0)
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  const load = useCallback(async () => {
    const r = await getPostVoById({ id: id as unknown as number })
    if (r.code !== 0 || !r.data) throw Error(r.message || '内容不存在')
    return r.data
  }, [id])
  const data = useRemoteResource(`${id}:${retry}`, load, '内容无法加载，请重试。', !!id)
  const { user } = useAppSelector(s => s.user)
  if (!hydrated || (id && data.loading)) return <PageState loading title="准备编辑器" />
  if (id && (data.error || !data.data))
    return (
      <PageState title="内容无法编辑" description={data.error}>
        <Button asChild variant="secondary">
          <Link href={contentReturnTo(params.get('returnTo'))}>返回我的内容</Link>
        </Button>
        <Button onClick={() => setRetry(n => n + 1)}>重试</Button>
      </PageState>
    )
  if (id && String(data.data?.userId) !== String(user?.id))
    return (
      <PageState title="只能编辑自己的内容">
        <Button asChild variant="secondary">
          <Link href={contentReturnTo(params.get('returnTo'))}>返回我的内容</Link>
        </Button>
      </PageState>
    )
  return (
    <Editor
      key={id || 'new'}
      post={id ? data.data || undefined : undefined}
      back={id ? contentReturnTo(params.get('returnTo')) : '/user/content'}
    />
  )
}
export default function Page() {
  return (
    <AccessGate>
      <EditorRoute />
    </AccessGate>
  )
}
