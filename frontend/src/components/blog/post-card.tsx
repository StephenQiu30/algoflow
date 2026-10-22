'use client'

import * as React from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { UserAvatar } from '@/components/header/user-avatar'
import { ArrowUpRight, Bookmark, Heart, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import dayjs from '@/lib/dayjs'

gsap.registerPlugin(ScrollTrigger)

interface PostCardProps {
  post: Partial<PostAPI.PostVO>
  className?: string
  href?: string
  onClick?: () => void
}

export function PostCard({ post, className, href, onClick }: PostCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const { id, title, content, cover, thumbNum = 0, favourNum = 0, createTime, userVO } = post

  const excerpt =
    (
      content
        ?.replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
        .replace(/[#*`>~_]/g, '')
        .trim() || ''
    ).slice(0, 70) + ((content?.length ?? 0) > 70 ? '...' : '')

  const formattedDate = createTime ? dayjs(createTime).format('MMM D, YYYY') : ''

  return (
    <div ref={cardRef} className={cn('group relative h-full cursor-pointer', className)}>
      <div
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-[32px] bg-card transition-all duration-500 will-change-transform border border-transparent dark:border-white/5',
          'shadow-[0_8px_40px_rgba(0,0,0,0.03)] dark:shadow-none group-hover:scale-[1.01] group-hover:shadow-[0_16px_60px_rgba(0,0,0,0.06)]'
        )}
      >
        {/* Cover Image Area */}
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
          {cover ? (
            <img
              src={cover}
              alt={title || ''}
              className="h-full w-full object-cover grayscale-[0.2] transition-transform duration-500 group-hover:scale-105 group-hover:grayscale-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-50 dark:bg-zinc-900">
              <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase dark:text-zinc-700">
                No Cover
              </span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserAvatar user={userVO} size="sm" className="h-4 w-4" />
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                {userVO?.userName || 'Anonymous'}
              </span>
            </div>
            <span className="font-mono text-[9px] font-bold tracking-widest text-zinc-300 uppercase italic dark:text-zinc-600">
              {formattedDate}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="line-clamp-2 text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-[#007AFF]">
              {title || 'Untitled'}
            </h3>
            <p className="line-clamp-2 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
              {excerpt}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 opacity-60">
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="flex items-center gap-1.5 transition-colors group-hover:text-amber-500">
                <Heart size={12} className={thumbNum > 0 ? 'fill-current' : ''} />
                <span className="text-[10px] font-bold tabular-nums">{thumbNum}</span>
              </div>
              <div className="flex items-center gap-1.5 transition-colors group-hover:text-primary">
                <Bookmark size={12} className={favourNum > 0 ? 'fill-current' : ''} />
                <span className="text-[10px] font-bold tabular-nums">{favourNum}</span>
              </div>
            </div>
              <ArrowUpRight
                size={16}
                className="text-zinc-300 transition-colors group-hover:text-[#007AFF] group-hover:scale-110"
              />
            </div>
          </div>

        {onClick ? (
          <button onClick={onClick} className="absolute inset-0 z-20" aria-label="Details" />
        ) : (
          <Link href={href || `/blog/${id}`} className="absolute inset-0 z-20">
            <span className="sr-only">View</span>
          </Link>
        )}
      </div>
    </div>
  )
}

export function PostCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="shimmer border-border/10 bg-card/40 flex h-full flex-col overflow-hidden rounded-[2.5rem] border"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="aspect-[16/10] w-full bg-zinc-100 dark:bg-zinc-900/50" />
      <div className="flex flex-1 flex-col space-y-5 p-7">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-2 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-6 w-3/4 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-3 pt-2">
          <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-3 w-2/3 rounded-full bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </div>
    </div>
  )
}
