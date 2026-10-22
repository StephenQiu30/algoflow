import {
  SORTING_ALGORITHM_IDS,
  SORTING_ALGORITHM_MAP,
  type SortingAlgorithmId,
  validateSortInput,
} from '@/lib/sortingAlgorithms'
import { buildMetricsPrefix, getPlaybackFrame } from '@/lib/sortingPlayback'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const INPUT_KEY = 'sorting-lab-input:v2'
export const useSortingVisualizer = (initialSize = 10, initialAlgorithmId?: SortingAlgorithmId) => {
  const [input, setInput] = useState<number[]>([])
  const [algorithmId, setAlgorithmId] = useState<SortingAlgorithmId>(initialAlgorithmId ?? 'bubble')
  const [speed, setSpeed] = useState(1)
  const [cursor, setCursor] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const initialized = useRef(false)
  const replaceInput = useCallback((values: number[]) => {
    validateSortInput(values)
    initialized.current = true
    setIsPlaying(false)
    setCursor(0)
    setInput([...values])
    try {
      sessionStorage.setItem(INPUT_KEY, JSON.stringify(values))
    } catch {
      /* session storage is optional */
    }
  }, [])
  const generateArray = useCallback(
    (size = initialSize) => {
      replaceInput(
        Array.from(
          { length: Math.max(2, Math.min(50, size)) },
          () => Math.floor(Math.random() * 100) + 10
        )
      )
    },
    [initialSize, replaceInput]
  )
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (initialized.current) return
      try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(INPUT_KEY) || 'null')
        if (
          Array.isArray(stored) &&
          stored.length >= 2 &&
          stored.length <= 50 &&
          stored.every(n => Number.isInteger(n) && n >= 1 && n <= 999)
        ) {
          replaceInput(stored)
          return
        }
      } catch {
        /* start with a new input if storage is unavailable */
      }
      generateArray()
    })
    return () => cancelAnimationFrame(frame)
  }, [generateArray, replaceInput])
  // A route change chooses an algorithm, while preserving the problem's original input.
  useEffect(() => {
    if (!initialAlgorithmId) return
    const frame = requestAnimationFrame(() => {
      setIsPlaying(false)
      setCursor(0)
      setAlgorithmId(initialAlgorithmId)
    })
    return () => cancelAnimationFrame(frame)
  }, [initialAlgorithmId])
  const steps = useMemo(
    () => (input.length ? SORTING_ALGORITHM_MAP[algorithmId](input) : []),
    [algorithmId, input]
  )
  const prefix = useMemo(() => buildMetricsPrefix(steps), [steps])
  const frame = getPlaybackFrame(input, steps, cursor)
  useEffect(() => {
    if (!isPlaying || frame.isSorted) return
    const delay = Math.max(16, Math.round(1200 * Math.pow(0.95, speed - 1)))
    const timer = setTimeout(() => setCursor(value => Math.min(value + 1, steps.length)), delay)
    return () => clearTimeout(timer)
  }, [isPlaying, frame.isSorted, speed, cursor, steps.length])
  const seek = (index: number) => {
    setIsPlaying(false)
    setCursor(Math.max(0, Math.min(index, steps.length)))
  }
  return {
    array: frame.array,
    inputArray: input,
    elementIds: frame.elementIds,
    size: input.length || initialSize,
    setSize: generateArray,
    generateArray: () => generateArray(input.length || initialSize),
    algorithmId,
    setAlgorithmId: (id: SortingAlgorithmId) => {
      setIsPlaying(false)
      setCursor(0)
      setAlgorithmId(id)
    },
    speed,
    setSpeed,
    isPlaying: isPlaying && !frame.isSorted,
    handlePlayPause: () => {
      if (frame.isSorted) {
        setCursor(0)
        setIsPlaying(true)
      } else setIsPlaying(value => !value)
    },
    reset: () => seek(0),
    activeIndices: frame.step?.activeIndices ?? [],
    sortedIndices: frame.step?.sortedIndices ?? [],
    isSorted: frame.isSorted,
    algorithms: SORTING_ALGORITHM_IDS,
    currentStep: frame.cursor,
    totalSteps: steps.length,
    stepForward: () => seek(cursor + 1),
    stepBack: () => seek(cursor - 1),
    seek,
    metrics: prefix[frame.cursor],
    currentStepInfo: frame.step,
    nextStepInfo: steps[frame.cursor] ?? null,
    setArrayFromInput: replaceInput,
  }
}
export type SortingVisualizerState = ReturnType<typeof useSortingVisualizer>
