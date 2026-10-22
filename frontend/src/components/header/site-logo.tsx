import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SiteLogoProps {
  className?: string
  showText?: boolean
  onClick?: () => void
}

export function SiteLogo({ className, showText = true, onClick }: SiteLogoProps) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '排序可视化课堂'
  const logoLetter = siteName.charAt(0).toUpperCase()

  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn('site-logo group flex items-center space-x-2', className)}
    >
      <div className="bg-primary shadow-primary/10 flex h-9 w-9 items-center justify-center rounded-[12px] shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 active:scale-95">
        <span className="text-primary-foreground text-xl font-black tracking-tight">
          {logoLetter}
        </span>
      </div>
      {showText && (
        <span className="text-foreground/90 group-hover:text-foreground text-lg font-black tracking-tight transition-colors">
          {siteName}
        </span>
      )}
    </Link>
  )
}
