'use client'
import { useState, useRef } from 'react'
import {
  ArrowUpDown,
  Code2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings,
} from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { SortingVisualizerState } from '@/hooks/useSortingVisualizer'
import { SORTING_ALGORITHMS, SORTING_CODE } from '@/lib/sortingAlgorithms'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { CodeHighlighter } from './CodeHighlighter'
import { RAGChatPanel } from './RAGChatPanel'
import { COURSE_VERSION } from '@/lib/courseVersion'
import { cn } from '@/lib/utils'
export function SortingVisualizer({ visualizer: v }: { visualizer: SortingVisualizerState }) {
  const [open, setOpen] = useState(false),
    [text, setText] = useState(''),
    [error, setError] = useState('')
  const scope = useRef<HTMLDivElement>(null)
  const algorithm = SORTING_ALGORITHMS.find(a => a.id === v.algorithmId)!
  const max = Math.max(...v.array, 1),
    step = v.currentStepInfo
  useGSAP(
    () => {
      if (
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        document.documentElement.dataset.reducedMotion !== 'true'
      )
        gsap.fromTo(
          '.algorithm-bar',
          { scaleY: 0.92 },
          { scaleY: 1, duration: 0.15, stagger: 0, ease: 'power1.out' }
        )
    },
    { scope, dependencies: [v.currentStep] }
  )
  function apply() {
    const values = text
      .trim()
      .split(/[\s,，]+/)
      .filter(Boolean)
      .map(Number)
    if (
      values.length < 2 ||
      values.length > 50 ||
      values.some(n => !Number.isInteger(n) || n < 1 || n > 999)
    ) {
      setError('请输入 2–50 个 1–999 的整数，用逗号分隔。')
      return
    }
    v.setArrayFromInput(values)
    setOpen(false)
    setError('')
  }
  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <div
          ref={scope}
          data-sorting-step={v.currentStep}
          className="grid min-w-0 items-stretch gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
        >
          <Card
            variant="muted"
            data-visualizer-panel="execution"
            className="flex min-w-0 flex-col lg:min-h-[640px]"
          >
            <CardHeader className="gap-2 p-4 sm:p-6">
              <CardTitle asChild>
                <h2 className="flex items-center gap-2">
                  <ArrowUpDown className="size-5" aria-hidden="true" />
                  执行过程
                </h2>
              </CardTitle>
              <CardDescription className="text-xs">{v.array.length} 个元素</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary">
                  {v.isSorted
                    ? '排序完成'
                    : step?.action === 'compare'
                      ? '比较中'
                      : step?.action === 'overwrite'
                        ? '移动元素'
                        : `步骤 ${v.currentStep}`}
                </Badge>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setText(v.inputArray.join(', '))
                      setError('')
                    }}
                  >
                    <Settings data-icon="inline-start" />
                    数据设置
                  </Button>
                </DialogTrigger>
              </div>
              <div
                className="min-w-0 overflow-x-auto pb-2"
                role="region"
                tabIndex={0}
                aria-label="数组可视化"
              >
                <div
                  className="flex h-44 items-end gap-2 sm:h-48 sm:gap-4"
                  style={{ minWidth: v.array.length > 15 ? v.array.length * 30 : undefined }}
                  role="img"
                  aria-label={`当前数组：${v.array.join('、')}。活动索引：${v.activeIndices.join('、') || '无'}`}
                >
                  {v.array.map((value, index) => (
                    <div
                      className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
                      key={`${index}:${v.elementIds[index]}`}
                    >
                      <div
                        className={cn(
                          'algorithm-bar min-h-1 origin-bottom rounded-t-sm',
                          v.activeIndices.includes(index)
                            ? 'bg-visualizer-accent'
                            : v.sortedIndices.includes(index)
                              ? 'bg-state-sorted'
                              : 'bg-state-comparing'
                        )}
                        style={{ height: `${(value / max) * 74}%` }}
                      />
                      <span
                        className={cn(
                          'text-center font-mono text-xs',
                          v.activeIndices.includes(index) && 'text-visualizer-accent'
                        )}
                      >
                        {value}
                      </span>
                      <span className="text-muted-foreground text-center font-mono text-xs">
                        {index}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {step?.auxiliary?.map((a, index) => (
                <div key={index} className="flex flex-wrap gap-2">
                  <span className="text-muted-foreground text-sm">{a.label}</span>
                  <span className="text-visualizer-accent font-mono text-sm">
                    {a.elements.map(e => e.value).join(', ') || '空'}
                  </span>
                </div>
              ))}
              {step?.gap && <p className="text-muted-foreground text-sm">当前间隔 {step.gap}</p>}
              {step?.buckets && (
                <div className="grid grid-cols-5 gap-2">
                  {step.buckets.map((b, i) => (
                    <div key={i} className="bg-muted rounded-md p-2 text-xs">
                      桶 {i}：{b.map(e => e.value).join(', ') || '空'}
                    </div>
                  ))}
                </div>
              )}
              <p className="min-h-12 text-sm leading-6" aria-live="polite">
                {step?.description || step?.message || '选择播放或下一步，观察比较与移动。'}
              </p>
            </CardContent>
            <CardFooter className="mt-auto flex flex-col items-stretch gap-2 px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs">
                  步骤 {v.currentStep} / {v.totalSteps}
                </span>
                <Select value={String(v.speed)} onValueChange={s => v.setSpeed(Number(s))}>
                  <SelectTrigger aria-label="演练速度" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {[
                        [1, '1× 速度'],
                        [15, '2× 速度'],
                        [28, '4× 速度'],
                      ].map(([value, label]) => (
                        <SelectItem key={value} value={String(value)}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Slider
                className="min-h-11"
                aria-label="演练进度"
                min={0}
                max={Math.max(1, v.totalSteps)}
                step={1}
                value={[v.currentStep]}
                onValueChange={([n]) => v.seek(n)}
                disabled={!v.totalSteps}
              />
              <div className="flex items-center gap-2">
                {[
                  {
                    label: '上一步',
                    Icon: SkipBack,
                    run: v.stepBack,
                    disabled: v.currentStep === 0,
                  },
                ].map(({ label, Icon, run, disabled }) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={label}
                        disabled={disabled}
                        onClick={run}
                      >
                        <Icon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
                <Button disabled={!v.totalSteps} onClick={v.handlePlayPause}>
                  {v.isPlaying ? (
                    <Pause data-icon="inline-start" />
                  ) : (
                    <Play data-icon="inline-start" />
                  )}
                  {v.isPlaying ? '暂停' : v.isSorted ? '重新播放' : '播放'}
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="下一步"
                      disabled={v.currentStep >= v.totalSteps}
                      onClick={v.stepForward}
                    >
                      <SkipForward />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>下一步</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="ml-auto"
                      variant="ghost"
                      size="icon"
                      aria-label="重置"
                      onClick={v.reset}
                    >
                      <RotateCcw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>重置</TooltipContent>
                </Tooltip>
              </div>
              <p className="text-muted-foreground text-xs">
                比较 {v.metrics?.comparisons || 0} 次 · 交换 {v.metrics?.swaps || 0} 次 · 写入{' '}
                {v.metrics?.overwrites || 0} 次
              </p>
            </CardFooter>
          </Card>
          <Card
            variant="muted"
            data-visualizer-panel="implementation"
            className="flex min-w-0 flex-col lg:min-h-[640px]"
          >
            <CardHeader className="gap-2 p-4 sm:p-6">
              <CardTitle asChild>
                <h2 className="flex items-center gap-2">
                  <Code2 className="size-5" aria-hidden="true" />
                  代码与分析
                </h2>
              </CardTitle>
              <CardDescription className="text-xs">JavaScript · 与当前执行步骤同步</CardDescription>
            </CardHeader>
            <CardContent className="flex min-w-0 flex-1 flex-col gap-4 px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
              <CodeHighlighter algorithmId={v.algorithmId} currentLine={step?.line} />
              <h3 className="text-sm font-medium">当前分析</h3>
              <p className="leading-6">
                {step?.description || step?.message || '执行算法后，这里会显示当前步骤的说明。'}
              </p>
              <p className="text-muted-foreground text-xs">
                平均 {algorithm.timeComplexity.average} · 空间 {algorithm.spaceComplexity} ·{' '}
                {algorithm.stability}
              </p>
              {step?.range && <p className="font-mono text-xs">区间 [{step.range.join(', ')}]</p>}
            </CardContent>
            <CardFooter className="mt-auto justify-end px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
              <RAGChatPanel
                algorithmName={algorithm.name}
                teachingContext={{
                  algorithmId: v.algorithmId,
                  courseVersion: COURSE_VERSION,
                  originalArray: v.inputArray,
                  currentArray: v.array,
                  currentStep: v.currentStep,
                  totalSteps: v.totalSteps,
                  action: step?.action,
                  activeIndices: v.activeIndices,
                  codeLine: step?.line,
                  metrics: v.metrics,
                  auxiliary: step?.auxiliary,
                  elementIds: v.elementIds,
                  sortedIndices: v.sortedIndices,
                  range: step?.range,
                  codeSnippet: SORTING_CODE[v.algorithmId],
                }}
              />
            </CardFooter>
          </Card>
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>数据设置</DialogTitle>
            <DialogDescription>应用新数据后将从第 0 步开始。</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="array-input">数组</FieldLabel>
              <Input
                id="array-input"
                value={text}
                onChange={e => setText(e.target.value)}
                aria-invalid={!!error}
              />
              <FieldDescription>{error || '2–50 个 1–999 的整数，用逗号分隔。'}</FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={apply}>应用数据</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
