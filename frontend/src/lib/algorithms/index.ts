export * from '../sortingAlgorithms'
import { SORTING_ALGORITHMS, SORTING_ALGORITHM_MAP } from '../sortingAlgorithms'
export const sortingAlgorithms = Object.fromEntries(SORTING_ALGORITHMS.map(a => [a.id, {...a, key: a.id, generator: SORTING_ALGORITHM_MAP[a.id]}]))
