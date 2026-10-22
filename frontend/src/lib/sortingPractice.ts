import type { SortingAlgorithmId, SortStep } from './sortingAlgorithms'
export type PracticeAttempt = {
  taskId: string
  algorithmId: SortingAlgorithmId
  objective: 'predict-step' | 'concept'
  correct: boolean
  firstTry: boolean
  at: number
}
export function evaluatePrediction(step: SortStep, action: string, answer: number[]) {
  return (
    step.action === action &&
    step.array.length === answer.length &&
    step.array.every((n, i) => n === answer[i])
  )
}
export function recordPracticeAttempt(
  history: PracticeAttempt[],
  attempt: Omit<PracticeAttempt, 'firstTry'>
) {
  const firstTry = !history.some(item => item.taskId === attempt.taskId)
  return [...history, { ...attempt, firstTry }].slice(-500)
}
export function practiceSummary(history: PracticeAttempt[], algorithmId: SortingAlgorithmId) {
  const attempts = history.filter(a => a.algorithmId === algorithmId)
  const independent = new Set(
    attempts
      .filter(a => a.correct && a.firstTry && a.objective === 'predict-step')
      .map(a => a.taskId)
  ).size
  const concept = attempts.some(a => a.correct && a.objective === 'concept')
  return { attempts: attempts.length, independent, concept, passed: independent >= 3 && concept }
}
