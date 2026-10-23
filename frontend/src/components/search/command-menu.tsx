'use client'
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useRouter } from 'next/navigation'
import { SORTING_ALGORITHMS } from '@/lib/sortingAlgorithms'
import { useEffect, useState } from 'react'
export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])
  const navigate = (path: string) => {
    onOpenChange(false)
    router.push(path)
  }
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        aria-label="搜索文章或页面"
        placeholder="搜索文章，或前往页面"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList><CommandGroup heading="算法学习">{SORTING_ALGORITHMS.map(a=><CommandItem key={a.id} value={a.name} onSelect={()=>navigate(`/sorting/${a.id}`)}>{a.name}</CommandItem>)}</CommandGroup>
        <CommandGroup heading="搜索文章">
          <CommandItem
            forceMount
            value={`搜索 ${query}`}
            onSelect={() =>
              navigate(`/blog${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
            }
          >
            {query.trim() ? `搜索“${query.trim()}”的相关文章` : '浏览全部学习手记'}
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="前往页面">
          {[
            ['首页', '/'],
            ['排序算法', '/sorting'],
            ['学习手记', '/blog'],
            ['个人主页', '/user/profile'],
            ['通知', '/user/notifications'],
            ['账户设置', '/user/settings'],
          ].map(([label, path]) => (
            <CommandItem key={path} value={label} onSelect={() => navigate(path)}>
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
