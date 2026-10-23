import { AlgorithmExplorer } from '@/components/sorting/AlgorithmExplorer'
import { SORTING_ALGORITHMS } from '@/lib/sortingAlgorithms'
import { notFound } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export default async function SortingAlgorithmPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { slug } = await params
  const { returnTo } = await searchParams
  const backHref =
    typeof returnTo === 'string' && /^\/sorting(?:\?|$)/.test(returnTo) ? returnTo : '/sorting'
  const info = SORTING_ALGORITHMS.find(a => a.id === slug)

  if (!info) notFound()

  const docPath = path.resolve(process.cwd(), 'src/app/sorting/_content', `${slug}.md`)
  let docContent = ''
  try {
    docContent = await readFile(docPath, 'utf8')
    docContent = docContent.replace(/^#\s+.+(?:\r?\n|$)/, '').trimStart()
  } catch {
    docContent = '# 文档暂缺\n\n这份算法说明暂时无法加载，你仍可使用可视化实验室。'
  }

  return (
    <div className="w-full">
      <AlgorithmExplorer algorithm={info} docContent={docContent} backHref={backHref} />
    </div>
  )
}
