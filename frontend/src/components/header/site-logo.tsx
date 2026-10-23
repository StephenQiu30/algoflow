import Link from 'next/link'
import { cn } from '@/lib/utils'
export function SiteLogo({
  className,
  showText = true,
  onClick,
  compact = false,
}: {
  compact?: boolean
  className?: string
  showText?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="衍序 AlgoFlow，返回首页"
      className={cn('flex min-h-11 shrink-0 items-center gap-2 font-medium', className)}
    >
      <span aria-hidden="true" className={cn('brand-mark size-6', !compact && 'lg:size-7')} />
      {showText && compact ? (
        <span className="text-lg">衍序 AlgoFlow</span>
      ) : (
        showText && (
          <>
            <span className="text-lg max-[359px]:hidden lg:hidden">衍序</span>
            <span className="hidden text-xl lg:inline">衍序 AlgoFlow</span>
          </>
        )
      )}
    </Link>
  )
}
