import Link from 'next/link'
import { PageShell } from '@/components/design/page-shell'
import { Button } from '@/components/ui/button'
import { MarkdownRender } from '@/components/blog/markdown-render'
import { SORTING_ALGORITHMS, type SortingAlgorithmInfo } from '@/lib/sortingAlgorithms'
export function AlgorithmExplorer({
  algorithm,
  docContent,
  backHref = '/sorting',
}: {
  algorithm: SortingAlgorithmInfo
  docContent?: string
  backHref?: string
}) {
  return (
    <PageShell
      title={algorithm.name}
      description={algorithm.description}
      back={{ href: backHref, label: '返回算法学习' }}
      actions={
        <Button asChild>
          <Link href={`/visualizer?algorithm=${algorithm.id}`}>开始演练</Link>
        </Button>
      }
    >
      <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        {[
          ['最好', algorithm.timeComplexity.best],
          ['平均', algorithm.timeComplexity.average],
          ['最坏', algorithm.timeComplexity.worst],
          ['额外空间', algorithm.spaceComplexity],
        ].map(([l, v]) => (
          <div key={l} className="flex flex-col gap-1">
            <dt className="text-muted-foreground">{l}</dt>
            <dd className="font-mono">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">{docContent && <MarkdownRender content={docContent} />}</div>
        <aside className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">继续学习</h2>
          {SORTING_ALGORITHMS.filter(a => a.id !== algorithm.id).map(a => (
            <Button asChild variant="ghost" className="justify-start" key={a.id}>
              <Link href={`/sorting/${a.id}`}>{a.name}</Link>
            </Button>
          ))}
        </aside>
      </div>
    </PageShell>
  )
}
