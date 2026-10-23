import Link from 'next/link'
import { PageShell } from '@/components/design/page-shell'
import { CommunityFeed } from '@/components/blog/community-feed'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
export default function Page() {
  return (
    <PageShell
      title="学习排序算法"
      description="观察排序过程，向 AI 导师提问，分享学习笔记。"
      actions={
        <>
          <Button variant="ghost" asChild>
            <Link href="/blog">浏览社区</Link>
          </Button>
          <Button asChild>
            <Link href="/sorting">开始学习</Link>
          </Button>
        </>
      }
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_352px]">
        <CommunityFeed compact />
        <aside className="flex flex-col gap-6">
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>从一次比较开始</CardTitle>
              <CardDescription>观察插入排序如何构建有序区间。</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="flex h-32 items-end gap-2"
                role="img"
                aria-label="插入排序示例数组 16、28、42、63、35、81、54、72"
              >
                {[16, 28, 42, 63, 35, 81, 54, 72].map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
                    <div className="bg-state-comparing w-full rounded-t-sm" style={{ height: v }} />
                    <span className="font-mono text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button asChild>
                <Link href="/visualizer?algorithm=insertion&array=16,28,42,63,35,81,54,72">
                  开始演练
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">学习路径</h2>
            <p className="text-muted-foreground text-sm leading-7">
              先理解比较与交换，再学习分治、堆结构与按位排序。
            </p>
            <Button asChild variant="ghost" className="self-end">
              <Link href="/sorting">浏览算法</Link>
            </Button>
          </section>
        </aside>
      </div>
    </PageShell>
  )
}
