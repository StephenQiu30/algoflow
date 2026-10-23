import Link from 'next/link'
import { PageShell } from '@/components/design/page-shell'
import { PageState } from '@/components/design/page-state'
import { Button } from '@/components/ui/button'
export default function NotFound() {
  return (
    <PageShell title="页面未找到">
      <PageState title="这个地址暂时不可用" description="页面可能已移动，或链接不完整。">
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </PageState>
    </PageShell>
  )
}
