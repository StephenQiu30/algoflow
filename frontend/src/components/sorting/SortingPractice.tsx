'use client'
import { useState, useEffect } from 'react'
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
    <section className="rounded-[32px] bg-card p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)] dark:ring-1 dark:ring-white/10 mt-8" aria-label="课堂练习">
      <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">预测 · 操作 · 反馈</span>
      <h3>先想一步，再运行</h3>
      <p>预测下一步的操作和操作后的完整数组。答对后执行该步；用原始编号观察相等元素。</p>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <label>
          下一步操作{' '}
          <select
            aria-label="预测下一步操作"
            className="rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground"
            value={action}
            onChange={e => setAction(e.target.value)}
          >
            {[
              ['compare', '比较'],
              ['swap', '交换'],
              ['overwrite', '写入'],
              ['pivot', '选择枢轴或记录位置'],
              ['markSorted', '归位'],
              ['localSorted', '局部有序'],
              ['bucket', '放入桶'],
              ['done', '完成'],
            ].map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          操作后的数组{' '}
          <input
            aria-label="预测操作后的数组"
            className="rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground"
            value={answer}
            placeholder="例如 3, 1, 2"
            onChange={e => setAnswer(e.target.value)}
          />
        </label>
        <Button
          onClick={predict}
          disabled={visualizer.isPlaying || !visualizer.nextStepInfo || !answer.trim()}
        >
          验证并执行
        </Button>
      </div>
      <p className="mt-4" role="status">
        {feedback}
      </p>
      <fieldset className="mt-6">
        <legend>{concept.question}</legend>
        {concept.choices.map((choice, i) => (
          <label className="mt-2 block" key={choice}>
            <input
              type="radio"
              name={`concept-${visualizer.algorithmId}`}
              checked={conceptChoice === i}
              onChange={() => setConceptChoice(i)}
            />{' '}
            {choice}
          </label>
        ))}
      </fieldset>
      <Button
        className="mt-3"
        variant="outline"
        disabled={conceptChoice === null}
        onClick={() => {
          const correct = conceptChoice === concept.correct
          save('concept', `${visualizer.algorithmId}:concept`, correct)
          setFeedback(
            correct ? '概念回答正确。' : `正确理解是：${concept.choices[concept.correct]}`
          )
        }}
      >
        检查概念
      </Button>
      <p className="text-sm text-muted-foreground mt-4">
        本算法尝试 {summary.attempts} 次 · 首次答对的不同步骤 {summary.independent}/3 · 概念{' '}
        {summary.concept ? '已通过' : '待练习'} · {summary.passed ? '练习目标已达成' : '继续练习'}
        。记录仅保存在当前设备，按登录用户区分；观看动画不计为掌握。
      </p>
    </section>
  )
}
