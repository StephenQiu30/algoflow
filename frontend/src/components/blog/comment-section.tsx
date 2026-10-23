'use client'
import { useCallback, useState } from 'react'
import { listPostCommentVoByPage } from '@/api/post/postCommentController'
import { useRemoteResource } from '@/hooks/useRemoteResource'
import { Button } from '@/components/ui/button'
import { PageState } from '@/components/design/page-state'
import { CommentInput } from './comment-input'
import { CommentItem } from './comment-item'
export function CommentSection({
  postId,
  onTotalChange,
}: {
  postId: string
  onTotalChange?: (total: number) => void
}) {
  const [page, setPage] = useState(1),
    [retry, setRetry] = useState(0)
  const load = useCallback(async () => {
    const r = await listPostCommentVoByPage({
      postId: postId as unknown as number,
      current: page,
      pageSize: 10,
    })
    if (r.code !== 0 || !r.data) throw Error()
    onTotalChange?.(Number(r.data.total || 0))
    return r.data
  }, [postId, page, onTotalChange])
  const data = useRemoteResource(`${postId}:${page}:${retry}`, load, '讨论暂时无法加载。')
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-medium">
        参与讨论 {data.data?.total === undefined ? '' : `(${data.data.total})`}
      </h2>
      <CommentInput postId={postId} onSuccess={() => setRetry(n => n + 1)} />
      {data.loading ? (
        <PageState title="加载讨论" loading />
      ) : data.error ? (
        <PageState title="讨论加载失败" description={data.error}>
          <Button variant="secondary" onClick={() => setRetry(n => n + 1)}>
            重试
          </Button>
        </PageState>
      ) : data.data?.records?.length ? (
        data.data.records.map(c => (
          <CommentItem
            key={c.id}
            comment={c}
            postId={postId}
            onReplySuccess={() => setRetry(n => n + 1)}
          />
        ))
      ) : (
        <PageState title="还没有讨论" description="分享你的思考，或提出一个具体问题。" />
      )}
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          disabled={page <= 1 || data.loading}
          onClick={() => setPage(n => n - 1)}
        >
          上一页
        </Button>
        <Button
          variant="ghost"
          disabled={!data.data || page * 10 >= Number(data.data.total) || data.loading}
          onClick={() => setPage(n => n + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  )
}
