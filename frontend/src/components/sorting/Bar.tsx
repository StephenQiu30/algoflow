import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type BarState = 'default' | 'compare' | 'swap' | 'overwrite' | 'pivot' | 'sorted'
export interface BarProps {
  value: number
  maxValue: number
  state: BarState
  dimmed?: boolean
  elementId?: number
  showValue?: boolean
}

const stateLabels: Record<BarState, string> = {
  default: '待处理',
  compare: '比较',
  swap: '交换',
  overwrite: '写入',
  pivot: '基准',
  sorted: '已排序',
}
const stateClasses: Record<BarState, string> = {
  default: 'bg-muted-foreground/30 border-transparent',
  compare: 'bg-state-comparing border-foreground border-dashed',
  swap: 'bg-primary border-foreground border-double',
  overwrite: 'bg-state-comparing border-foreground',
  pivot: 'bg-state-pivot border-foreground border-dashed',
  sorted: 'bg-state-sorted border-transparent',
}

export function Bar({
  value,
  maxValue,
  state,
  elementId,
  dimmed = false,
  showValue = true,
}: BarProps) {
  const reducedMotion = useReducedMotion()
  const height = Math.max(7, maxValue > 0 ? (value / maxValue) * 100 : 5)
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-end px-0.5',
        dimmed && 'opacity-40'
      )}
      aria-label={`${value}，${stateLabels[state]}${elementId === undefined ? '' : `，元素 ${elementId + 1}`}`}
    >
      {showValue && (
        <div className="text-foreground mb-2 flex flex-col items-center font-mono text-[10px] tabular-nums">
          <span>{value}</span>
          {elementId !== undefined && <small>#{elementId + 1}</small>}
          {state !== 'default' && <span>{stateLabels[state]}</span>}
        </div>
      )}
      <motion.div
        layout={!reducedMotion}
        initial={false}
        animate={{ height: `${height}%` }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
        className={cn('w-full rounded-t-sm border-2', stateClasses[state])}
      />
    </div>
  )
}
