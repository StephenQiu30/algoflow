'use client'
import { useState, useEffect } from 'react'
import { FieldGroup, Field, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import type { SortingVisualizerState } from '@/hooks/useSortingVisualizer'
import { useAppSelector } from '@/store/hooks'
import { safeStorage } from '@/lib/ragStream'
import {
  evaluatePrediction,
  practiceSummary,
  recordPracticeAttempt,
  type PracticeAttempt,
} from '@/lib/sortingPractice'
import { COURSE_VERSION } from '@/lib/courseVersion'

const concepts = {
  bubble: {
    question: '有序数组上，本页的冒泡排序为什么只需 n−1 次比较？',
    choices: ['一轮没有交换便提前结束', '所有相等元素都会交换', '直接跳过全部比较'],
    correct: 0,
  },
  selection: {
    question: '选择排序交换最小值时会怎样影响相等元素？',
    choices: ['可能改变原始相对顺序，因此不稳定', '始终保持相对顺序', '相等元素不能参与排序'],
    correct: 0,
  },
  insertion: {
    question: '左侧前缀已经有序，是否意味着每个元素都已归位？',
    choices: ['后续插入仍会移动它们', '每个位置都不会再变', '有序前缀必须单独生成数组'],
    correct: 0,
  },
  merge: {
    question: '归并时两个辅助数组的当前元素相等，应如何保持稳定？',
    choices: ['先取左侧元素', '先取右侧元素', '交换两个元素'],
    correct: 0,
  },
  quick: {
    question: '本页用末尾元素做枢轴，有序输入最坏需要多少递归栈空间？',
    choices: ['O(n)', 'O(1)', '始终 O(log n)'],
    correct: 0,
  },
  heap: {
    question: '大顶堆取出根节点后，应修复哪个部分？',
    choices: ['缩小后的有效堆，已归位尾部不再参与', '包含已归位尾部的整个数组', '只交换两个叶节点'],
    correct: 0,
  },
  shell: {
    question: '为什么不能把任意希尔排序都标成同一平均复杂度？',
    choices: ['复杂度依赖增量序列，本页使用折半增量', '它没有任何比较', '数组长度始终固定'],
    correct: 0,
  },
  radix: {
    question: 'LSD 基数排序为什么要求每一位的分配与收集稳定？',
    choices: ['保留低位排序的相对顺序', '为了让相等元素逆序', '为了支持任意小数'],
    correct: 0,
  },
}
export function SortingPractice({ visualizer }: { visualizer: SortingVisualizerState }) {
  const { user } = useAppSelector(s => s.user)
  const storageKey = `sorting-practice:${COURSE_VERSION}:${user?.id || 'device-guest'}`
  const [history, setHistory] = useState<PracticeAttempt[]>([])
  const [action, setAction] = useState('compare'),
    [answer, setAnswer] = useState(''),
    [feedback, setFeedback] = useState('')
  const [conceptChoice, setConceptChoice] = useState<number | null>(null)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved: unknown = JSON.parse(safeStorage.getItem(storageKey) || '[]')
        setHistory(
          Array.isArray(saved)
            ? saved.filter(a => a && typeof a.taskId === 'string' && typeof a.correct === 'boolean')
            : []
        )
      } catch {
        setHistory([])
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [storageKey])
  const summary = practiceSummary(history, visualizer.algorithmId),
    concept = concepts[visualizer.algorithmId]
  function save(objective: PracticeAttempt['objective'], taskId: string, correct: boolean) {
    const next = recordPracticeAttempt(history, {
      taskId,
      algorithmId: visualizer.algorithmId,
      objective,
      correct,
      at: Date.now(),
    })
    setHistory(next)
    safeStorage.setItem(storageKey, JSON.stringify(next))
  }
  function predict() {
    const step = visualizer.nextStepInfo
    if (!step) return
    visualizer.seek(visualizer.currentStep)
    const values = answer
      .trim()
      .split(/[\s,，]+/)
      .filter(Boolean)
      .map(Number)
    const correct = evaluatePrediction(step, action, values)
    save(
      'predict-step',
      `${visualizer.algorithmId}:${visualizer.inputArray.join(',')}:${visualizer.currentStep}`,
      correct
    )
    setFeedback(
      correct
        ? `预测正确。${step.description || step.message}`
        : `再想一想：${step.description || step.message}。比较不会改变数组；交换或写入才会改变值的位置。`
    )
    if (correct) {
      visualizer.stepForward()
      setAnswer('')
    }
  }
  return (
    <section className="flex flex-col gap-6" aria-label="课堂练习">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl font-medium">先想一步，再运行</h2>
        <p className="text-muted-foreground text-sm">预测下一步操作与完整数组，验证后观察变化。</p>
      </header>
      <FieldGroup>
        <Field>
          <FieldLabel>下一步操作</FieldLabel>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger aria-label="预测下一步操作">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[
                  ['compare', '比较'],
                  ['swap', '交换'],
                  ['overwrite', '写入'],
                  ['pivot', '选择枢轴'],
                  ['markSorted', '归位'],
                  ['localSorted', '局部有序'],
                  ['bucket', '放入桶'],
                  ['done', '完成'],
                ].map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="prediction">操作后的数组</FieldLabel>
          <Input
            id="prediction"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="例如 3, 1, 2"
          />
        </Field>
      </FieldGroup>
      <div className="flex justify-end">
        <Button
          onClick={predict}
          disabled={visualizer.isPlaying || !visualizer.nextStepInfo || !answer.trim()}
        >
          验证并执行
        </Button>
      </div>
      <FieldSet>
        <FieldLegend>{concept.question}</FieldLegend>
        <ToggleGroup
          aria-label={concept.question}
          type="single"
          value={conceptChoice === null ? '' : String(conceptChoice)}
          onValueChange={value => setConceptChoice(value === '' ? null : Number(value))}
          className="flex flex-col items-stretch gap-2"
        >
          {concept.choices.map((c, i) => (
            <ToggleGroupItem
              key={c}
              value={String(i)}
              className="h-auto min-h-11 justify-start py-3 text-left whitespace-normal"
            >
              {c}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FieldSet>
      <div className="flex justify-end">
        <Button
          variant="secondary"
          disabled={conceptChoice === null}
          onClick={() => {
            const correct = conceptChoice === concept.correct
            save('concept', visualizer.algorithmId + ':concept', correct)
            setFeedback(
              correct ? '概念回答正确。' : '正确理解是：' + concept.choices[concept.correct]
            )
          }}
        >
          检查概念
        </Button>
      </div>
      <p role="status" className="text-sm">
        {feedback}
      </p>
      <p className="text-muted-foreground text-xs">
        首次答对的不同步骤 {summary.independent}/3 · 概念{summary.concept ? '已通过' : '待练习'} ·{' '}
        {summary.passed ? '练习目标已达成' : '继续练习'}。记录保存在当前设备。
      </p>
    </section>
  )
}
