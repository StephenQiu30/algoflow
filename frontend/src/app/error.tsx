'use client'
import { PageState } from '@/components/design/page-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageState title="内容暂时无法显示" description="请重试，或继续浏览其他页面。">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>重试</Button>
        <Link className="text-primary hover:underline" href="/sorting">
          探索排序算法
        </Link>
      </div>
    </PageState>
  )
}
