'use client'
import { use, useCallback, useState } from 'react'
import { getPostVoById } from '@/api/post/postController'
import { PageShell } from '@/components/design/page-shell'
import { PageState } from '@/components/design/page-state'
import { MarkdownRender } from '@/components/blog/markdown-render'
import { CommentSection } from '@/components/blog/comment-section'
import { PostCard } from '@/components/blog/post-card'
import { Button } from '@/components/ui/button'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { useSearchParams } from 'next/navigation'
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params),
    [retry, setRetry] = useState(0)
  const target = useSearchParams().get('returnTo')
  const back =
    target && /^\/(?:blog|user\/(?:content|collections))(?:\?|$)/.test(target) ? target : '/blog'
  const load = useCallback(async () => {
    const r = await getPostVoById({ id: id as unknown as number })
    if (r.code !== 0 || !r.data) throw Error(r.message || '内容不存在')
    return r.data
  }, [id])
  const data = useRemoteResource(`${id}:${retry}`, load, '内容暂时无法加载，或你没有访问权限。')
  if (data.loading) return <PageState loading title="正在加载内容" />
  if (!data.data || data.error)
    return (
      <PageState title="内容无法打开" description={data.error}>
        <Button variant="secondary" onClick={() => setRetry(n => n + 1)}>
          重试
        </Button>
      </PageState>
    )
  const post = data.data
  return (
    <PageShell
      title={post.title || '讨论详情'}
      back={{
        href: back,
        label: back.startsWith('/user/content')
          ? '返回我的内容'
          : back.startsWith('/user/collections')
            ? '返回收藏'
            : '返回学习社区',
      }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <PostCard post={post} hideContent />
        <MarkdownRender content={post.content || ''} />
        <section id="comments" className="scroll-mt-24">
          <CommentSection postId={id} />
        </section>
      </div>
    </PageShell>
  )
}
