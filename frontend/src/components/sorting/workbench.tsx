'use client'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSortingVisualizer } from '@/hooks/useSortingVisualizer'
import { SortingPractice } from './SortingPractice'
import { SortingVisualizer } from './SortingVisualizer'
import { SORTING_ALGORITHMS, type SortingAlgorithmId } from '@/lib/sortingAlgorithms'
import { PageShell } from '@/components/design/page-shell'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppSelector } from '@/store/hooks'
import { historyKey, readHistory } from '@/lib/learning-history'
import { Button } from '@/components/ui/button'
import { Link2 } from 'lucide-react'
import { toast } from 'sonner'
export default function Workbench() {
  const params = useSearchParams(),
    initial = params.get('algorithm') || 'insertion'
  const id = SORTING_ALGORITHMS.some(a => a.id === initial)
    ? (initial as SortingAlgorithmId)
    : 'insertion'
  const v = useSortingVisualizer(8, id),
    { user } = useAppSelector(s => s.user)
  const restored = useRef(false)
  const setSpeed = v.setSpeed
  useEffect(() => {
    try {
      const pref = JSON.parse(localStorage.getItem(`algoflow:preferences:${user?.id}`) || '{}')
      if (pref.speed && [1, 15, 28].includes(Number(pref.speed))) setSpeed(Number(pref.speed))
      if (pref.reducedMotion) document.documentElement.dataset.reducedMotion = 'true'
      else delete document.documentElement.dataset.reducedMotion
    } catch {
      /* browser preferences optional */
    }
  }, [user?.id, setSpeed])
  useEffect(() => {
    if (restored.current || !v.inputArray.length) return
    restored.current = true
    const array = params.get('array')
    if (array) {
      const values = array.split(',').map(Number)
      try {
        v.setArrayFromInput(values)
      } catch {
        /* invalid URL input keeps the validated array */
      }
    }
  }, [params, v])
  const seeked = useRef(false)
  useEffect(() => {
    if (seeked.current || !v.totalSteps) return
    const requestedArray = params.get('array')
    if (
      requestedArray &&
      requestedArray.split(',').map(Number).join(',') !== v.inputArray.join(',')
    )
      return
    seeked.current = true
    const n = Number(params.get('step'))
    if (Number.isFinite(n) && n > 0) v.seek(n)
  }, [params, v])
  useEffect(() => {
    if (!v.inputArray.length) return
    const timer = setTimeout(() => {
      try {
        const key = historyKey(user?.id),
          rows = readHistory(key),
          name = SORTING_ALGORITHMS.find(a => a.id === v.algorithmId)!.name
        const row = {
          id: v.algorithmId,
          algorithm: v.algorithmId,
          name,
          array: v.inputArray,
          step: v.currentStep,
          total: v.totalSteps,
          updated: new Date().toISOString(),
        }
        localStorage.setItem(
          key,
          JSON.stringify([row, ...rows.filter(r => r.id !== row.id)].slice(0, 50))
        )
      } catch {
        /* storage is optional */
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [v.inputArray, v.algorithmId, v.currentStep, v.totalSteps, user?.id])
  return (
    <div className="bg-muted min-h-[calc(100dvh-64px)]">
      <PageShell
        title={SORTING_ALGORITHMS.find(a => a.id === v.algorithmId)!.name}
        description="逐步比较与移动，理解当前数据如何变得有序。"
        actions={
          <>
            <Button
              variant="ghost"
              onClick={async () => {
                const link = new URL('/visualizer', window.location.origin)
                link.searchParams.set('algorithm', v.algorithmId)
                link.searchParams.set('array', v.inputArray.join(','))
                link.searchParams.set('step', String(v.currentStep))
                try {
                  await navigator.clipboard.writeText(link.href)
                  toast.success('已复制当前演练链接')
                } catch {
                  toast.error('无法复制链接，请检查浏览器权限')
                }
              }}
            >
              <Link2 data-icon="inline-start" />
              复制演练链接
            </Button>
            <Select
              value={v.algorithmId}
              onValueChange={value => v.setAlgorithmId(value as SortingAlgorithmId)}
              disabled={v.isPlaying}
            >
              <SelectTrigger aria-label="选择算法" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SORTING_ALGORITHMS.map(a => (
                    <SelectItem value={a.id} key={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </>
        }
      >
        <SortingVisualizer visualizer={v} />
        <SortingPractice key={v.algorithmId} visualizer={v} />
      </PageShell>
    </div>
  )
}
