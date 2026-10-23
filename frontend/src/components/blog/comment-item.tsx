'use client'
import { useState } from 'react'
import { UserAvatar } from '@/components/header/user-avatar'
import { Button } from '@/components/ui/button'
import { CommentInput } from './comment-input'
export function CommentItem({
  comment,
  postId,
  onReplySuccess,
}: {
  comment: PostAPI.PostCommentVO
  postId: string
  onReplySuccess?: () => void
}) {
  const [reply, setReply] = useState(false)
  return (
    <article className="flex min-w-0 flex-col gap-3 py-3">
      <div className="flex gap-3">
        <UserAvatar user={comment.userVO} className="size-8" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-sm font-medium">{comment.userVO?.userName || '社区成员'}</p>
          <p className="text-sm leading-7 break-words whitespace-pre-wrap">{comment.content}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground text-xs">
              {comment.createTime ? new Date(comment.createTime).toLocaleString('zh-CN') : ''}
            </span>
            <Button variant="ghost" onClick={() => setReply(!reply)}>
              回复
            </Button>
          </div>
          {reply && (
            <CommentInput
              postId={postId}
              parentId={comment.id}
              onSuccess={() => {
                setReply(false)
                onReplySuccess?.()
              }}
              onCancel={() => setReply(false)}
            />
          )}
        </div>
      </div>
      {comment.children?.map(c => (
        <div className="pl-4" key={c.id}>
          <CommentItem comment={c} postId={postId} onReplySuccess={onReplySuccess} />
        </div>
      ))}
    </article>
  )
}
