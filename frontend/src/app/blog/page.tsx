import Link from 'next/link'
import { PageShell } from '@/components/design/page-shell'
import { CommunityFeed } from '@/components/blog/community-feed'
import { Button } from '@/components/ui/button'
export default function Page() {
  return (
    <PageShell
      title="学习社区"
      actions={
        <Button asChild>
          <Link href="/blog/create">发布内容</Link>
        </Button>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <CommunityFeed />
        <aside className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">正在讨论</h2>
          {['稳定性与相等元素', '分治的边界条件', '我的第一篇题解'].map(t => (
            <Button asChild variant="ghost" className="justify-start" key={t}>
              <Link href={`/blog?q=${encodeURIComponent(t)}`}>{t}</Link>
            </Button>
          ))}
          <p className="text-muted-foreground text-sm leading-7">
            从一个具体问题开始，附上数据、代码和你的思考。
          </p>
        </aside>
      </div>
    </PageShell>
  )
}
