import { useMemo, useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { Pause, Play, Shuffle, StepBack, StepForward } from 'lucide-react'
import { SORTING_ALGORITHM_NAME_BY_ID, SortingAlgorithmId } from '@/lib/sortingAlgorithms'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface ControlPanelProps {
  algorithms: SortingAlgorithmId[]
  selectedAlgorithmId: SortingAlgorithmId
  onSelectAlgorithmId: (alg: SortingAlgorithmId) => void
  size: number
  onSizeChange: (size: number) => void
  speed: number
  onSpeedChange: (speed: number) => void
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  currentStep: number
  totalSteps: number
  onStepBack: () => void
  onStepForward: () => void
  metrics: { comparisons: number; swaps: number; overwrites: number }
  onApplyArrayInput: (arr: number[]) => void
  compact?: boolean
}

export function ControlPanel({
  algorithms,
  selectedAlgorithmId,
  onSelectAlgorithmId,
  size,
  onSizeChange,
  speed,
  onSpeedChange,
  isPlaying,
  onPlayPause,
  onReset,
  onStepBack,
  onStepForward,
  currentStep,
  totalSteps,
  onApplyArrayInput,
  compact = false,
}: ControlPanelProps) {
  const [arrayText, setArrayText] = useState<string>('')
  const parsedArray = useMemo(() => {
    const raw = arrayText.trim()
    if (!raw) return null
    const parts = raw.split(/[\s,]+/).filter(Boolean)
    const nums = parts.map(p => Number(p))
    if (nums.some(n => Number.isNaN(n))) return null
    return nums
  }, [arrayText])

  const canStep = !isPlaying && totalSteps > 0
  const canBack = canStep && currentStep > 0
  const canForward = canStep && currentStep < totalSteps

  return (
    <div
      className={cn(
        'relative flex w-full flex-col overflow-hidden rounded-[40px] bg-card border border-transparent transition-all duration-500 shadow-[0_8px_40px_rgba(0,0,0,0.03)] dark:shadow-none dark:border-white/5',
        compact ? 'max-w-full' : 'mx-auto max-w-5xl'
      )}
    >
      <div className={cn('flex flex-col', compact ? 'gap-3 p-6' : 'gap-4 p-8')}>
        <div className="flex items-center justify-between pl-1">
          <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            算法选择
          </label>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black text-primary tabular-nums font-mono">
            {SORTING_ALGORITHM_NAME_BY_ID[selectedAlgorithmId]}
          </span>
        </div>
        <Tabs
          value={selectedAlgorithmId}
          onValueChange={v => onSelectAlgorithmId(v as SortingAlgorithmId)}
        >
          <ScrollArea className="-mx-1 px-1">
            <TabsList className="h-11 w-max rounded-full bg-muted p-1.5">
              {algorithms.map(id => (
                <TabsTrigger
                  key={id}
                  value={id}
                  disabled={isPlaying}
                  className={cn(
                    'h-8 rounded-full px-3 text-[11px] font-black cursor-pointer transition-all',
                    'data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  {SORTING_ALGORITHM_NAME_BY_ID[id]}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>
      </div>

      {/* Primary Playback Bar */}
      <div
        className={cn(
          'flex items-center gap-4 border-b border-border/50',
          compact ? 'px-6 pb-6' : 'px-8 pb-10'
        )}
      >
        <div className="flex flex-1 items-center gap-3">
          <button
            onClick={onStepBack}
            disabled={!canBack}
            className="flex flex-shrink-0 items-center justify-center rounded-[24px] border border-border bg-muted/50 p-4 text-muted-foreground shadow-sm transition-all hover:bg-muted active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            title="上一步"
          >
            <StepBack size={20} />
          </button>

          <button
            onClick={onPlayPause}
            className={`group flex flex-1 items-center justify-center gap-3 rounded-[24px] py-4 text-sm font-black shadow-sm transition-all duration-500 active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-foreground text-background shadow-xl'
                : 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,122,255,0.3)]'
            }`}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
            <span className="tracking-tight">{isPlaying ? '暂停执行' : '开始排序'}</span>
          </button>

          <button
            onClick={onStepForward}
            disabled={!canForward}
            className="flex flex-shrink-0 items-center justify-center rounded-[24px] border border-border bg-muted/50 p-4 text-muted-foreground shadow-sm transition-all hover:bg-muted active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            title="下一步"
          >
            <StepForward size={20} />
          </button>
        </div>

        <button
          onClick={onReset}
          disabled={isPlaying}
          className="flex flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/50 p-4 text-muted-foreground shadow-sm transition-all hover:bg-muted active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="重新打乱数组"
        >
          <Shuffle size={20} />
        </button>
      </div>

      {/* Main Configuration Grid */}
      <div className={cn('flex flex-col', compact ? 'gap-6 px-6 pb-6' : 'gap-10 px-8 pb-8')}>
        <div className={cn('flex flex-col', compact ? 'gap-6' : 'gap-8')}>
          {/* Speed Slider */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                动画速度
              </label>
              <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-black text-muted-foreground tabular-nums font-mono">
                {speed}%
              </span>
            </div>
            <Slider.Root
              className="relative flex h-5 w-full touch-none items-center select-none"
              defaultValue={[speed]}
              max={100}
              min={1}
              step={1}
              value={[speed]}
              onValueChange={([val]) => onSpeedChange(val)}
            >
              <Slider.Track className="relative h-[3px] grow rounded-full bg-muted/60 cursor-pointer">
                <Slider.Range className="absolute h-full rounded-full bg-primary" />
              </Slider.Track>
              <Slider.Thumb
                className="block h-4 w-4 rounded-full border border-border bg-background shadow-xl ring-offset-4 ring-offset-background cursor-pointer transition-transform hover:scale-125 focus:ring-2 focus:ring-primary focus:outline-none active:scale-90"
                aria-label="Speed"
              />
            </Slider.Root>
          </div>

          {/* Size Slider */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                数组规模
              </label>
              <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-black text-muted-foreground tabular-nums font-mono">
                {size}
              </span>
            </div>
            <Slider.Root
              className="relative flex h-5 w-full touch-none items-center select-none"
              defaultValue={[size]}
              max={100}
              min={10}
              step={1}
              value={[size]}
              onValueChange={([val]) => onSizeChange(val)}
              disabled={isPlaying}
            >
              <Slider.Track className="relative h-[3px] grow rounded-full bg-muted/60 cursor-pointer">
                <Slider.Range className="absolute h-full rounded-full bg-foreground" />
              </Slider.Track>
              <Slider.Thumb
                className="block h-4 w-4 rounded-full border border-border bg-background shadow-xl ring-offset-4 ring-offset-background cursor-pointer transition-transform hover:scale-125 focus:ring-2 focus:ring-foreground focus:outline-none active:scale-90"
                aria-label="Size"
              />
            </Slider.Root>
          </div>
        </div>

        <details
          className={cn(
            'border-t border-border pt-4',
            compact ? 'pt-4' : 'pt-6'
          )}
          open={!compact}
        >
          <summary className="cursor-pointer list-none select-none">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                自定义数据导入
              </label>
              <div className="flex gap-1">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <div className="h-1 w-1 rounded-full bg-primary/30" />
              </div>
            </div>
          </summary>

          <div className={cn('flex flex-col', compact ? 'gap-4 pt-4' : 'gap-6 pt-6')}>
            <div className="group relative transition-all">
              <input
                value={arrayText}
                onChange={e => setArrayText(e.target.value)}
                placeholder="例如: 15, 42, 8, 33, 91"
                className={cn(
                  'w-full rounded-2xl border-2 border-transparent bg-muted/50 px-5 text-sm font-bold font-mono text-foreground shadow-inner transition-all outline-none placeholder:text-muted-foreground focus:border-primary/20 focus:bg-card disabled:opacity-50 cursor-text',
                  compact ? 'py-4' : 'py-5'
                )}
                disabled={isPlaying}
              />
              {parsedArray && (
                <button
                  onClick={() => onApplyArrayInput(parsedArray)}
                  className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2 rounded-xl bg-primary px-5 py-2 text-[10px] font-black tracking-wider text-primary-foreground uppercase shadow-lg transition-all active:scale-95 cursor-pointer hover:opacity-90"
                >
                  Apply
                </button>
              )}
            </div>

            <p className="px-1 text-[9px] font-medium text-muted-foreground italic">
              逗号/空格分隔；应用后同步到左侧图。
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}
