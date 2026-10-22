'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark, Heart, MessageSquare, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QRCodeSVG } from 'qrcode.react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface PostActionBarProps {
  hasThumb: boolean
  hasFavour: boolean
  onThumb: () => void
  onFavour: () => void
  onComment: () => void
  onShare: () => void
  className?: string
  title?: string // For QR code alt text
  commentNum?: number
  thumbNum?: number
  favourNum?: number
}

export function PostActionBar({
  hasThumb,
  hasFavour,
  onThumb,
  onFavour,
  onComment,
  className,
  title = 'Share',
  commentNum = 0,
  thumbNum = 0,
  favourNum = 0,
}: PostActionBarProps) {
  const barRef = React.useRef<HTMLDivElement>(null)
  const [currentUrl, setCurrentUrl] = React.useState('')

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }
  }, [])

  useGSAP(
    () => {
      gsap.from(barRef.current, {
        y: 40,
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.5, // Delay to let page content start revealing first
      })
    },
    { scope: barRef }
  )

  return (
    <div className={cn('fixed bottom-8 left-1/2 z-40 -translate-x-1/2', className)}>
      <div
        ref={barRef}
        className="relative flex items-center gap-2 overflow-hidden rounded-[32px] bg-white/70 px-3 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-2xl dark:bg-zinc-900/80 dark:ring-white/10 dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent dark:from-white/[0.05]" />
        <div className="text-foreground/80 relative flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'hover:bg-zinc-100 dark:hover:bg-zinc-800 h-10 rounded-full px-5 transition-all duration-300',
              hasThumb && 'text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 shadow-[0_0_15px_rgba(0,122,255,0.15)] dark:bg-[#007AFF]/20 dark:hover:bg-[#007AFF]/30'
            )}
            onClick={onThumb}
          >
            <Heart
              className={cn(
                'mr-2.5 h-[18px] w-[18px] transition-all duration-300',
                hasThumb && 'scale-110 fill-[#007AFF] text-[#007AFF] drop-shadow-md'
              )}
            />
            {thumbNum > 0 && (
              <span className="text-[14px] font-bold tracking-tight">{thumbNum}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'hover:bg-zinc-100 dark:hover:bg-zinc-800 h-10 rounded-full px-5 transition-all duration-300',
              hasFavour && 'text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 shadow-[0_0_15px_rgba(0,122,255,0.15)] dark:bg-[#007AFF]/20 dark:hover:bg-[#007AFF]/30'
            )}
            onClick={onFavour}
          >
            <Bookmark
              className={cn(
                'mr-2.5 h-[18px] w-[18px] transition-all duration-300',
                hasFavour && 'scale-110 fill-[#007AFF] text-[#007AFF] drop-shadow-md'
              )}
            />
            {favourNum > 0 && (
              <span className="text-[14px] font-bold tracking-tight">{favourNum}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 h-10 rounded-full px-5 transition-all duration-300"
            onClick={onComment}
          >
            <MessageSquare className="mr-2.5 h-[18px] w-[18px]" />
            {commentNum > 0 && (
              <span className="text-[14px] font-bold tracking-tight">{commentNum}</span>
            )}
          </Button>
        </div>

        <div className="bg-border/40 relative mx-3 h-4 w-px" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/80 relative h-9 w-9 rounded-full transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Share2 className="h-[18px] w-[18px]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto rounded-3xl border border-black/5 bg-white/80 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95 dark:shadow-none"
            align="center"
            side="top"
            sideOffset={20}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-black/5">
                <QRCodeSVG value={currentUrl} size={140} level="M" />
              </div>
              <p className="text-foreground/70 text-[11px] font-semibold tracking-wider uppercase">
                Share
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
