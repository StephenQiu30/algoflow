export function parseListPage(value: string | null) {
  const n = Number(value)
  return Number.isSafeInteger(n) && n >= 1 && n <= 100000 ? n : 1
}
export function parseListSize(value: string | null) {
  const n = Number(value)
  return [5, 10, 20].includes(n) ? n : 5
}
