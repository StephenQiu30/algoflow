'use client'
import { use, useCallback, useState } from 'react'
import { getUserVoById } from '@/api/user/userController'
import { listPostVoByPage } from '@/api/post/postController'
import { PageShell } from '@/components/design/page-shell'
import { PageState } from '@/components/design/page-state'
import { UserAvatar } from '@/components/header/user-avatar'
import { PostCard } from '@/components/blog/post-card'
import { Button } from '@/components/ui/button'
import { useRemoteResource } from '@/hooks/useRemoteResource'
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params),
    [page, setPage] = useState(1),
    [retry, setRetry] = useState(0)
  const load = useCallback(async () => {
    const [u, p] = await Promise.all([
      getUserVoById({ id: id as unknown as number }),
      listPostVoByPage({ userId: id as unknown as number, current: page, pageSize: 10 }),
    ])
    if (u.code !== 0 || !u.data || p.code !== 0 || !p.data) throw Error()
    return { user: u.data, posts: p.data }
  }, [id, page])
  const r = useRemoteResource(`${id}:${page}:${retry}`, load, '该主页暂时无法加载。')
  return (
    <PageShell
      title={r.data?.user.userName || '个人主页'}
      back={{ href: '/blog', label: '返回学习社区' }}
    >
      {r.loading ? (
        <PageState loading title="加载个人主页" />
      ) : r.error ? (
        <PageState title="主页无法打开" description={r.error}>
          <Button variant="secondary" onClick={() => setRetry(n => n + 1)}>
            重试
          </Button>
        </PageState>
      ) : (
        r.data && (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            <div className="flex items-center gap-4">
              <UserAvatar user={r.data.user} size="lg" />
              <p className="text-muted-foreground text-sm leading-7">
                {r.data.user.userProfile || '这位学习者还没有填写简介。'}
              </p>
            </div>
            <h2 className="text-xl font-medium">公开内容</h2>
            {r.data.posts.records?.length ? (
              r.data.posts.records.map(p => <PostCard key={p.id} post={p} />)
            ) : (
              <PageState title="还没有公开内容" />
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(n => n - 1)}>
                上一页
              </Button>
              <Button
                variant="ghost"
                disabled={page * 10 >= Number(r.data.posts.total || 0)}
                onClick={() => setPage(n => n + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        )
      )}
    </PageShell>
  )
}
