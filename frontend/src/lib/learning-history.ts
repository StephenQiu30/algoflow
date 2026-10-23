export type LearningRecord = {
  id: string
  algorithm: string
  name: string
  array: number[]
  step: number
  total: number
  updated: string
}
export function historyKey(userId: unknown) {
  return `algoflow:learning:${String(userId || 'guest')}:v1`
}
export function readHistory(key: string): LearningRecord[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter(
        (v): v is LearningRecord =>
          !!v &&
          typeof v.id === 'string' &&
          typeof v.algorithm === 'string' &&
          typeof v.name === 'string' &&
          Array.isArray(v.array) &&
          v.array.length >= 2 &&
          v.array.length <= 50 &&
          v.array.every(
            (n: unknown) => Number.isInteger(n) && Number(n) >= 1 && Number(n) <= 999
          ) &&
          Number.isInteger(v.step) &&
          v.step >= 0 &&
          Number.isInteger(v.total) &&
          v.total >= v.step &&
          typeof v.updated === 'string'
      )
      .slice(0, 50)
  } catch {
    return []
  }
}
