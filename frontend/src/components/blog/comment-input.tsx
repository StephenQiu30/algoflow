'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { addPostComment } from '@/api/post/postCommentController'
import { useAppSelector } from '@/store/hooks'
import { AuthModal } from '@/components/auth/auth-modal'
import { toast } from 'sonner'
export function CommentInput({
  postId,
  parentId = 0,
  onSuccess,
  onCancel,
  autoFocus = false,
  placeholder = '写下你的思考…',
}: {
  postId: string
  parentId?: number
  onSuccess?: () => void
  onCancel?: () => void
  autoFocus?: boolean
  placeholder?: string
}) {
  const { user } = useAppSelector(s => s.user),
    [content, setContent] = useState(''),
    [pending, setPending] = useState(false),
    [login, setLogin] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      setLogin(true)
      return
    }
    if (!content.trim()) return
    setPending(true)
    try {
      const r = await addPostComment({
        postId: postId as unknown as number,
        parentId,
        content: content.trim(),
      })
      if (r.code !== 0) throw Error(r.message || '回复失败')
      setContent('')
      onSuccess?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '回复失败')
    } finally {
      setPending(false)
    }
  }
  return (
    <>
      <form onSubmit={e => void submit(e)} className="flex flex-col gap-3">
        <Field>
          <FieldLabel className="sr-only">回复内容</FieldLabel>
          <Textarea
            aria-label={parentId ? '回复评论' : '回复讨论'}
            value={content}
            onChange={e => setContent(e.target.value)}
            autoFocus={autoFocus}
            placeholder={placeholder}
            required
          />
        </Field>
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button disabled={pending || !content.trim()}>{pending && <Spinner />}回复</Button>
        </div>
      </form>
      <AuthModal open={login} onOpenChange={setLogin} />
    </>
  )
}
