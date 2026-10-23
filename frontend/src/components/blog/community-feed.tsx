'use client'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import { listPostVoByPage } from '@/api/post/postController'
import { PageState } from '@/components/design/page-state'
import { PostCard } from './post-card'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { useListQuery } from '@/hooks/use-list-query'
export function CommunityFeed({ compact = false }: { compact?: boolean }) {
  const query = useListQuery(),
    [search, setSearch] = useState(query.q),
    [retry, setRetry] = useState(0)
  const load = useCallback(async () => {
    const res = await listPostVoByPage({
      current: query.page,
      pageSize: compact ? 3 : 10,
      searchText: query.q || undefined,
      sortField: query.status === 'latest' ? 'createTime' : 'thumbNum',
      sortOrder: 'descend',
    })
    if (res.code !== 0 || !res.data) throw Error()
    return res.data
  }, [query.page, query.q, query.status, compact])
  const key = JSON.stringify([query.page, query.q, query.status, retry, compact])
  const data = useRemoteResource(key, load, '社区内容暂时无法加载，请稍后重试。')
  const feed = (
    <>
      {data.loading ? (
        <PageState loading title="正在加载社区" />
      ) : data.error ? (
        <PageState title="社区加载失败" description={data.error}>
          <Button variant="secondary" onClick={() => setRetry(n => n + 1)}>
            重试
          </Button>
        </PageState>
      ) : !data.data?.records?.length ? (
        <PageState title="还没有内容" description="分享你的学习笔记，或提出一个具体问题。">
          <Button asChild>
            <Link href="/blog/create">发布内容</Link>
          </Button>
        </PageState>
      ) : (
        data.data.records.map(post => <PostCard key={post.id} post={post} />)
      )}
      {!compact && data.data && Number(data.data.total) > 10 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            disabled={query.page <= 1}
            onClick={() => query.update({ page: query.page - 1 })}
          >
            上一页
          </Button>
          <span className="text-muted-foreground text-sm">第 {query.page} 页</span>
          <Button
            variant="ghost"
            disabled={query.page * 10 >= Number(data.data.total)}
            onClick={() => query.update({ page: query.page + 1 })}
          >
            下一页
          </Button>
        </div>
      )}
    </>
  )
  return (
    <Tabs
      value={query.status === 'latest' ? 'latest' : 'featured'}
      onValueChange={status => query.update({ status, page: 1 })}
      className="flex min-w-0 flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="featured">精选</TabsTrigger>
          <TabsTrigger value="latest">最新</TabsTrigger>
        </TabsList>
        {!compact && (
          <form
            className="flex min-w-0 gap-2"
            onSubmit={e => {
              e.preventDefault()
              query.update({ q: search, page: 1 })
            }}
          >
            <Input
              aria-label="搜索题解与讨论"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索题解与讨论…"
            />
            <Button variant="secondary">搜索</Button>
          </form>
        )}
      </div>
      {['featured', 'latest'].map(value => (
        <TabsContent key={value} value={value} className="flex min-w-0 flex-col gap-4">
          {feed}
        </TabsContent>
      ))}
    </Tabs>
  )
}
