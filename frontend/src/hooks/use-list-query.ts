'use client'
import { parseListPage, parseListSize } from '@/lib/pagination'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
export function useListQuery() {
  const params = useSearchParams(),
    router = useRouter(),
    pathname = usePathname()
  const page = parseListPage(params.get('page'))
  const pageSize = parseListSize(params.get('pageSize'))
  const update = (values: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === '') next.delete(key)
      else next.set(key, String(value))
    }
    router.push(`${pathname}?${next}`, { scroll: true })
  }
  return {
    href: `${pathname}${params.size ? `?${params}` : ''}`,
    page,
    pageSize,
    q: params.get('q') || '',
    status: params.get('status') || 'all',
    sort: ['createTime', 'updateTime', 'name', 'userName', 'thumbNum'].includes(
      params.get('sort') || ''
    )
      ? params.get('sort')!
      : 'createTime',
    order: params.get('order') === 'ascend' ? 'ascend' : 'descend',
    update,
  }
}
