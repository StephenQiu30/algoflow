import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import dayjs from '@/lib/dayjs'

interface PostHeaderProps {
  post: PostAPI.PostVO
  className?: string
}

export function PostHeader({ post, className }: PostHeaderProps) {
  const { title, createTime, tags, content } = post

  const readingTime = content ? Math.max(1, Math.ceil(content.length / 300)) : 1

  const formattedDate = createTime ? dayjs(createTime).format('LL') : ''

  return (
    <header className={cn('relative mb-12 w-full', className)}>
      <h1 className="text-foreground mb-6 text-3xl leading-[1.2] font-black tracking-tight text-balance md:text-4xl lg:text-5xl">
        {title || '无标题文章'}
      </h1>

      <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
        <div className="text-foreground/80 flex items-center gap-5 text-lg font-bold tracking-tight md:text-xl">
          <time dateTime={createTime}>{formattedDate}</time>
          <span className="bg-primary/20 h-2 w-2 rounded-full" />
          <span>{readingTime} 分钟阅读见解</span>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-muted/30 text-foreground/60 hover:bg-muted hover:text-primary rounded-full border-transparent px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase transition-all"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
