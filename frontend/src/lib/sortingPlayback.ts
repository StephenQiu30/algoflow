import type { SortStep } from './sortingAlgorithms'
export type SortMetrics = { comparisons: number; swaps: number; overwrites: number }
export function buildMetricsPrefix(steps: SortStep[]): SortMetrics[] {
  const prefix: SortMetrics[] = [{ comparisons: 0, swaps: 0, overwrites: 0 }]
  for (const step of steps) {
    const prev = prefix[prefix.length - 1],
      d = step.metricsDelta
    prefix.push({
      comparisons: prev.comparisons + (d?.comparisons ?? 0),
      swaps: prev.swaps + (d?.swaps ?? 0),
      overwrites: prev.overwrites + (d?.overwrites ?? 0),
    })
  }
  return prefix
}
/** Cursor counts executed events: 0 is the untouched input, N is the final event. */
export function getPlaybackFrame(input: number[], steps: SortStep[], cursor: number) {
  const index = Math.max(0, Math.min(Math.trunc(cursor), steps.length))
  const step = index === 0 ? null : steps[index - 1]
  return {
    cursor: index,
    array: step?.array ?? [...input],
    elementIds: step?.elementIds ?? input.map((_, i) => i),
    step,
    isSorted: steps.length > 0 && index === steps.length,
  }
}
