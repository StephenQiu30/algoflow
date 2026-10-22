import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SiteLogoProps {
  className?: string
  showText?: boolean
  onClick?: () => void
}

export function SiteLogo({ className, showText = true, onClick }: SiteLogoProps) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '衍序 AlgoFlow'
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${siteName}首页`}
      className={cn(
        'flex min-h-11 shrink-0 items-center gap-2 font-semibold tracking-tight',
        className
      )}
    >
      <span
        className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md"
        aria-hidden="true"
      >
        衍
      </span>
      {showText && <span>{siteName}</span>}
    </Link>
  )
}
