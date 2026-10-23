'use client'
import { useState } from 'react'
import { PageShell } from '@/components/design/page-shell'
import { AlgorithmCard } from '@/components/sorting/AlgorithmCard'
import { SORTING_ALGORITHMS } from '@/lib/sortingAlgorithms'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useListQuery } from '@/hooks/use-list-query'
import { PageState } from '@/components/design/page-state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
const groups: Record<string, string[]> = {
  basic: ['bubble', 'selection', 'insertion'],
  advanced: ['shell', 'merge', 'quick', 'heap'],
  distribution: ['radix'],
}
export default function Page() {
  const query = useListQuery()
  const [search, setSearch] = useState(query.q)
  const rows = SORTING_ALGORITHMS.filter(
    a =>
      (!groups[query.status] || groups[query.status].includes(a.id)) &&
      `${a.name} ${a.description} ${a.tags.join(' ')}`.includes(query.q.trim())
  )
  return (
    <PageShell title="算法学习" description="从比较与交换开始，逐步理解分治、堆和按位排序。">
      <form
        className="flex w-full max-w-md gap-2"
        onSubmit={e => {
          e.preventDefault()
          query.update({ q: search, page: 1 })
        }}
      >
        <Input
          aria-label="搜索算法"
          placeholder="搜索算法名称或概念…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          搜索
        </Button>
      </form>
      <ToggleGroup
        type="single"
        value={query.status}
        onValueChange={status => {
          if (status) query.update({ status })
        }}
        aria-label="算法分类"
        className="flex flex-wrap justify-start gap-2"
      >
        {[
          ['all', '全部'],
          ['basic', '基础比较'],
          ['advanced', '进阶比较'],
          ['distribution', '非比较'],
        ].map(([v, l]) => (
          <ToggleGroupItem key={v} value={v}>
            {l}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-muted-foreground text-xs">{rows.length} 个算法</p>
      {rows.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(a => (
            <AlgorithmCard
              key={a.id}
              algorithm={a}
              href={`/sorting/${a.id}?returnTo=${encodeURIComponent(query.href)}`}
            />
          ))}
        </div>
      ) : (
        <PageState title="暂无匹配算法" />
      )}
    </PageShell>
  )
}
