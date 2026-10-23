'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Bookmark, Share2, MessageSquare } from 'lucide-react'
import { UserAvatar } from '@/components/header/user-avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { doThumb } from '@/api/post/postThumbController'
import { doFavour } from '@/api/post/postFavourController'
import { useAppSelector } from '@/store/hooks'
import { AuthModal } from '@/components/auth/auth-modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
export function PostCard({
  post,
  className,
  href,
  onClick,
  hideContent = false,
}: {
  post: Partial<PostAPI.PostVO>
  className?: string
  href?: string
  onClick?: () => void
  hideContent?: boolean
}) {
  const { user } = useAppSelector(s => s.user),
    [login, setLogin] = useState(false),
    [pending, setPending] = useState(false)
  const [liked, setLiked] = useState(!!post.hasThumb),
    [saved, setSaved] = useState(!!post.hasFavour),
    [likes, setLikes] = useState(post.thumbNum || 0)
  const url = href || `/blog/${post.id}`
  async function react(kind: 'like' | 'save') {
    if (!user) {
      setLogin(true)
      return
    }
    if (!post.id || pending) return
    setPending(true)
    try {
      const r = await (kind === 'like'
        ? doThumb({ postId: post.id })
        : doFavour({ postId: post.id }))
      if (r.code !== 0) throw Error(r.message || '操作失败')
      if (kind === 'like') {
        setLiked(!liked)
        setLikes(n => Math.max(0, n + (liked ? -1 : 1)))
      } else setSaved(!saved)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '操作失败，请重试')
    } finally {
      setPending(false)
    }
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).href)
      toast.success('链接已复制')
    } catch {
      toast.error('无法复制，请复制浏览器地址栏中的链接')
    }
  }
  return (
    <article className={cn('flex min-w-0 gap-3 py-5', className)}>
      <UserAvatar user={post.userVO} size="md" className="size-8" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
          <Link
            href={`/user/${post.userId || post.userVO?.id}`}
            className="text-foreground font-medium"
          >
            {post.userVO?.userName || '社区成员'}
          </Link>
          {post.createTime && (
            <time dateTime={post.createTime}>
              {new Date(post.createTime).toLocaleDateString('zh-CN')}
            </time>
          )}
        </div>
        {!hideContent && (
          <Link href={url} onClick={onClick} className="rounded-sm focus-visible:outline-2">
            <h2 className="text-lg leading-7 font-medium">{post.title || '未命名内容'}</h2>
          </Link>
        )}
        {!hideContent && (
          <p className="text-muted-foreground line-clamp-3 text-sm leading-7 break-words">
            {post.content?.replace(/[#*>`]/g, '').slice(0, 240)}
          </p>
        )}
        {!hideContent && post.cover && (
          <Image
            src={post.cover}
            alt={post.title || '内容配图'}
            width={800}
            height={450}
            unoptimized
            className="h-auto max-h-80 w-full rounded-lg object-cover"
          />
        )}
        {!hideContent && !!post.tags?.length && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(t => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" asChild>
            <Link href={`${url}#comments`} aria-label="查看讨论">
              <MessageSquare />
            </Link>
          </Button>
          <Button
            variant="ghost"
            aria-label={liked ? '取消赞同' : '赞同'}
            aria-pressed={liked}
            disabled={pending}
            onClick={() => void react('like')}
          >
            <Heart data-icon="inline-start" className={cn(liked && 'fill-current')} />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={saved ? '取消收藏' : '收藏'}
            aria-pressed={saved}
            disabled={pending}
            onClick={() => void react('save')}
          >
            <Bookmark className={cn(saved && 'fill-current')} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="分享" onClick={() => void share()}>
            <Share2 />
          </Button>
        </div>
      </div>
      <AuthModal open={login} onOpenChange={setLogin} />
    </article>
  )
}
