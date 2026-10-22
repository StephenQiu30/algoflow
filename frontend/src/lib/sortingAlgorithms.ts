export type SortAction =
  | 'compare'
  | 'swap'
  | 'overwrite'
  | 'pivot'
  | 'markSorted'
  | 'localSorted'
  | 'bucket'
  | 'done'
export type SortMetricsDelta = { comparisons?: number; swaps?: number; overwrites?: number }
export type SortElement = { value: number; id: number }
export type SortStep = {
  array: number[]
  elementIds: number[]
  activeIndices: number[]
  sortedIndices: number[]
  localSortedIndices?: number[]
  action?: SortAction
  message?: string
  description?: string
  line?: number
  range?: [number, number]
  pivotIndex?: number
  heapSize?: number
  gap?: number
  auxiliary?: { label: string; elements: SortElement[]; activeIndices: number[] }[]
  buckets?: SortElement[][]
  digitPlace?: number
  metricsDelta?: SortMetricsDelta
}

export type SortingAlgorithmId =
  | 'bubble'
  | 'selection'
  | 'insertion'
  | 'merge'
  | 'quick'
  | 'heap'
  | 'shell'
  | 'radix'

export type SortingAlgorithmInfo = {
  id: SortingAlgorithmId
  name: string
  shortName: string
  description: string
  timeComplexity: {
    best: string
    average: string
    worst: string
  }
  spaceComplexity: string
  stability: '稳定' | '不稳定'
  tags: string[]
}

export const SORTING_ALGORITHMS: SortingAlgorithmInfo[] = [
  {
    id: 'bubble',
    name: '冒泡排序 (Bubble Sort)',
    shortName: '冒泡',
    description: '通过重复走访要排序的数列，一次比较两个元素，如果它们的顺序错误就把它们交换过来。',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stability: '稳定',
    tags: ['基础', '交换', '原地'],
  },
  {
    id: 'selection',
    name: '选择排序 (Selection Sort)',
    shortName: '选择',
    description: '每一次从待排序的数据元素中选出最小（或最大）的一个元素，存放在序列的起始位置。',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stability: '不稳定',
    tags: ['基础', '选择', '原地'],
  },
  {
    id: 'insertion',
    name: '插入排序 (Insertion Sort)',
    shortName: '插入',
    description:
      '通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stability: '稳定',
    tags: ['基础', '插入', '原地'],
  },
  {
    id: 'shell',
    name: '希尔排序 (Shell Sort)',
    shortName: '希尔',
    description:
      '通过将整个有序列分割成若干个子序列分别进行直接插入排序，待整个序列中的记录“基本有序”时，再对全部记录进行依次直接插入排序。',
    timeComplexity: { best: 'O(n log n)', average: '取决于增量序列', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stability: '不稳定',
    tags: ['进阶', '插入', '原地'],
  },
  {
    id: 'merge',
    name: '归并排序 (Merge Sort)',
    shortName: '归并',
    description:
      '建立在归并操作上的一种有效的排序算法，该算法是采用分治法（Divide and Conquer）的一个非常典型的应用。',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stability: '稳定',
    tags: ['经典', '分治', '递归'],
  },
  {
    id: 'quick',
    name: '快速排序 (Quick Sort)',
    shortName: '快速',
    description:
      '通过一趟排序将要排序的数据分割成独立的两部分，其中一部分的所有数据都比另外一部分的所有数据都要小，然后再按此方法对这两部分数据分别进行快速排序。',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: '平均 O(log n)，最坏 O(n)',
    stability: '不稳定',
    tags: ['经典', '分治', '交换'],
  },
  {
    id: 'heap',
    name: '堆排序 (Heap Sort)',
    shortName: '堆',
    description:
      '利用堆这种数据结构所设计的一种排序算法。堆积是一个近似完全二叉树的结构，并同时满足堆积的性质。',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    stability: '不稳定',
    tags: ['进阶', '选择', '堆'],
  },
  {
    id: 'radix',
    name: '基数排序 (Radix Sort)',
    shortName: '基数',
    description: '透过键值的部份资讯，将要排序的元素分配至某些“桶”中，借以达到排序的作用。',
    timeComplexity: { best: 'O(d(n+b))', average: 'O(d(n+b))', worst: 'O(d(n+b))' },
    spaceComplexity: 'O(n+b)，b=10',
    stability: '稳定',
    tags: ['特殊', '桶排序', '非比较'],
  },
]

export const SORTING_ALGORITHM_NAME_BY_ID = SORTING_ALGORITHMS.reduce(
  (acc, a) => {
    acc[a.id] = a.name
    return acc
  },
  {} as Record<SortingAlgorithmId, string>
)

const CODE_LINES = {
  bubble: [
    ['start', 'function bubbleSort(a) {'],
    ['outer', '  for (let end = a.length - 1; end > 0; end--) {'],
    ['init', '    let changed = false;'],
    ['compare', '    for (let j = 0; j < end; j++) if (a[j] > a[j + 1]) {'],
    ['swap', '      swap(a, j, j + 1); changed = true;'],
    ['close', '    }'],
    ['mark', '    // end 已归位'],
    ['exit', '    if (!changed) break;'],
    ['end', '  }'],
    ['done', '}'],
  ],
  selection: [
    ['start', 'function selectionSort(a) {'],
    ['outer', '  for (let i = 0; i < a.length; i++) {'],
    ['pivot', '    let min = i;'],
    ['compare', '    for (let j = i + 1; j < a.length; j++) if (a[j] < a[min]) {'],
    ['min', '      min = j;'],
    ['close', '    }'],
    ['swap', '    if (min !== i) swap(a, i, min);'],
    ['mark', '    // i 已归位'],
    ['end', '  }'],
    ['done', '}'],
  ],
  insertion: [
    ['start', 'function insertionSort(a) {'],
    ['outer', '  for (let i = 1; i < a.length; i++) {'],
    ['init', '    let j = i;'],
    ['compare', '    while (j > 0) { if (a[j - 1] <= a[j]) break;'],
    ['swap', '      swap(a, j - 1, j); j--;'],
    ['close', '    }'],
    ['local', '    // [0, i] 局部有序，后续仍可移动'],
    ['end', '  }'],
    ['done', '}'],
  ],
  shell: [
    ['start', 'function shellSort(a) {'],
    ['gap', '  for (let gap = Math.floor(a.length / 2); gap > 0; gap = Math.floor(gap / 2)) {'],
    ['outer', '    for (let i = gap; i < a.length; i++) {'],
    ['init', '      let j = i;'],
    ['compare', '      while (j >= gap) { if (a[j - gap] <= a[j]) break;'],
    ['swap', '        swap(a, j - gap, j); j -= gap;'],
    ['close', '      }'],
    ['end', '    }'],
    ['endgap', '  }'],
    ['done', '}'],
  ],
  merge: [
    ['start', 'function mergeSort(a, lo = 0, hi = a.length - 1) {'],
    ['base', '  if (lo >= hi) return;'],
    ['split', '  const mid = Math.floor((lo + hi) / 2);'],
    ['recurse', '  mergeSort(a, lo, mid); mergeSort(a, mid + 1, hi);'],
    ['buffers', '  const left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1);'],
    ['init', '  let i = 0, j = 0, k = lo;'],
    ['loop', '  while (i < left.length && j < right.length) {'],
    ['compare', '    if (left[i] <= right[j]) {'],
    ['overwriteLeft', '      a[k++] = left[i++];'],
    ['otherwise', '    } else {'],
    ['overwriteRight', '      a[k++] = right[j++];'],
    ['endIf', '    }'],
    ['close', '  }'],
    ['remainder', '  while (i < left.length) a[k++] = left[i++];'],
    ['remainderRight', '  while (j < right.length) a[k++] = right[j++];'],
    ['done', '}'],
  ],
  quick: [
    ['start', 'function quickSort(a, lo = 0, hi = a.length - 1) {'],
    ['base', '  if (lo >= hi) return;'],
    ['pivot', '  const pivot = a[hi]; let i = lo;'],
    ['compare', '  for (let j = lo; j < hi; j++) if (a[j] < pivot) {'],
    ['swap', '    if (i !== j) swap(a, i, j); i++;'],
    ['close', '  }'],
    ['pivotSwap', '  if (i !== hi) swap(a, i, hi);'],
    ['mark', '  // i 的枢轴已归位'],
    ['recurse', '  quickSort(a, lo, i - 1); quickSort(a, i + 1, hi);'],
    ['done', '}'],
  ],
  heap: [
    ['start', 'function heapSort(a) {'],
    ['sift', '  function sift(root, size) {'],
    ['init', '    while (2 * root + 1 < size) { let largest = root;'],
    ['compareLeft', '      const left = 2 * root + 1; if (a[left] > a[largest]) largest = left;'],
    [
      'compareRight',
      '      const right = left + 1; if (right < size && a[right] > a[largest]) largest = right;',
    ],
    ['base', '      if (largest === root) break;'],
    ['swap', '      swap(a, root, largest); root = largest;'],
    ['close', '    }'],
    ['endsift', '  }'],
    ['build', '  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) sift(i, a.length);'],
    ['outer', '  for (let end = a.length - 1; end > 0; end--) {'],
    ['extract', '    swap(a, 0, end); sift(0, end);'],
    ['end', '  }'],
    ['done', '}'],
  ],
  radix: [
    ['start', 'function radixSort(a) { // 非负安全整数；保留元素原始身份'],
    ['init', '  const max = Math.max(0, ...a);'],
    ['digit', '  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {'],
    ['buckets', '    const buckets = Array.from({ length: 10 }, () => []);'],
    ['bucket', '    for (const x of a) buckets[Math.floor(x / exp) % 10].push(x);'],
    [
      'overwrite',
      '    const output = buckets.flat(); for (let i = 0; i < a.length; i++) a[i] = output[i];',
    ],
    ['end', '  }'],
    ['done', '}'],
  ],
} as const
export const SORTING_CODE = Object.fromEntries(
  Object.entries(CODE_LINES).map(([id, lines]) => [id, lines.map(([, code]) => code).join('\n')])
) as Record<SortingAlgorithmId, string>
const lineFor = (id: SortingAlgorithmId, tag: string) =>
  CODE_LINES[id].findIndex(([key]) => key === tag) + 1

/** Reject invalid data instead of silently changing the problem being demonstrated. */
export function validateSortInput(input: number[], radix = false) {
  if (input.length > 50 || input.some(value => !Number.isFinite(value)))
    throw new RangeError('数组最多 50 个有限数值')
  if (radix && input.some(value => !Number.isSafeInteger(value) || value < 0))
    throw new RangeError('基数排序仅支持非负安全整数')
}

class Trace {
  elements: SortElement[]
  steps: SortStep[] = []
  sorted: number[] = []
  constructor(
    public id: SortingAlgorithmId,
    input: number[]
  ) {
    validateSortInput(input, id === 'radix')
    this.elements = input.map((value, id) => ({ value, id }))
  }
  emit(
    action: SortAction,
    tag: string,
    active: number[],
    message: string,
    extra: Partial<SortStep> = {}
  ) {
    this.steps.push({
      array: this.elements.map(e => e.value),
      elementIds: this.elements.map(e => e.id),
      activeIndices: [...active],
      sortedIndices: [...this.sorted],
      action,
      message,
      description: message,
      line: lineFor(this.id, tag),
      ...extra,
    })
  }
  compare(a: number, b: number, tag = 'compare', extra: Partial<SortStep> = {}) {
    this.emit(
      'compare',
      tag,
      [a, b],
      `比较 ${this.elements[a].value} 与 ${this.elements[b].value}`,
      { metricsDelta: { comparisons: 1 }, ...extra }
    )
    return this.elements[a].value - this.elements[b].value
  }
  swap(a: number, b: number, tag = 'swap', extra: Partial<SortStep> = {}) {
    if (a === b) return
    const message = `交换 ${this.elements[a].value} 与 ${this.elements[b].value}`
    ;[this.elements[a], this.elements[b]] = [this.elements[b], this.elements[a]]
    this.emit('swap', tag, [a, b], message, { metricsDelta: { swaps: 1 }, ...extra })
  }
  done() {
    this.sorted = this.elements.map((_, i) => i)
    this.emit('done', 'done', [], '排序完成；相同数值的原始编号可用于观察稳定性。')
    return this.steps
  }
}

export function bubbleSort(input: number[]): SortStep[] {
  const t = new Trace('bubble', input)
  for (let end = input.length - 1; end > 0; end--) {
    let changed = false
    for (let j = 0; j < end; j++)
      if (t.compare(j, j + 1) > 0) {
        t.swap(j, j + 1)
        changed = true
      }
    t.sorted.push(end)
    t.emit('markSorted', 'mark', [], `位置 ${end} 已归位`)
    if (!changed) break
  }
  return t.done()
}
export function selectionSort(input: number[]): SortStep[] {
  const t = new Trace('selection', input)
  for (let i = 0; i < input.length; i++) {
    let min = i
    t.emit('pivot', 'pivot', [i], `从位置 ${i} 开始寻找最小值`)
    for (let j = i + 1; j < input.length; j++)
      if (t.compare(j, min) < 0) {
        min = j
        t.emit('pivot', 'min', [min], `记录更小值 ${t.elements[min].value}`)
      }
    t.swap(i, min)
    t.sorted.push(i)
    t.emit('markSorted', 'mark', [], `位置 ${i} 已归位`)
  }
  return t.done()
}
export function insertionSort(input: number[]): SortStep[] {
  const t = new Trace('insertion', input)
  for (let i = 1; i < input.length; i++) {
    let j = i
    while (j > 0) {
      if (t.compare(j - 1, j) <= 0) break
      t.swap(j - 1, j)
      j--
    }
    t.emit('localSorted', 'local', [], `[0, ${i}] 局部有序；后续插入仍可能移动这些元素。`, {
      localSortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
    })
  }
  return t.done()
}
export function shellSort(input: number[]): SortStep[] {
  const t = new Trace('shell', input)
  for (let gap = Math.floor(input.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    t.emit('pivot', 'gap', [], `当前增量 gap = ${gap}`, { gap })
    for (let i = gap; i < input.length; i++) {
      let j = i
      while (j >= gap) {
        if (t.compare(j - gap, j, 'compare', { gap }) <= 0) break
        t.swap(j - gap, j, 'swap', { gap })
        j -= gap
      }
    }
  }
  return t.done()
}
export function mergeSort(input: number[]): SortStep[] {
  const t = new Trace('merge', input)
  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    const left = t.elements.slice(lo, mid + 1),
      right = t.elements.slice(mid + 1, hi + 1)
    let i = 0,
      j = 0,
      k = lo
    const buffers = () => [
      {
        label: '左侧辅助数组',
        elements: left.map(e => ({ ...e })),
        activeIndices: i < left.length ? [i] : [],
      },
      {
        label: '右侧辅助数组',
        elements: right.map(e => ({ ...e })),
        activeIndices: j < right.length ? [j] : [],
      },
    ]
    while (i < left.length || j < right.length) {
      const both = i < left.length && j < right.length
      if (both)
        t.emit(
          'compare',
          'compare',
          [],
          `在辅助数组比较 ${left[i].value} 与 ${right[j].value}；相等时先取左侧以保持稳定。`,
          { range: [lo, hi], auxiliary: buffers(), metricsDelta: { comparisons: 1 } }
        )
      const takeLeft = j >= right.length || (i < left.length && left[i].value <= right[j].value)
      const extra = {
        range: [lo, hi] as [number, number],
        auxiliary: buffers(),
        metricsDelta: { overwrites: 1 },
      }
      t.elements[k] = takeLeft ? left[i++] : right[j++]
      t.emit(
        'overwrite',
        both
          ? takeLeft
            ? 'overwriteLeft'
            : 'overwriteRight'
          : takeLeft
            ? 'remainder'
            : 'remainderRight',
        [k],
        `将辅助数组的 ${t.elements[k].value} 写入位置 ${k}；剩余复制不计为比较。`,
        extra
      )
      k++
    }
  }
  sort(0, input.length - 1)
  return t.done()
}
export function quickSort(input: number[]): SortStep[] {
  const t = new Trace('quick', input)
  const sort = (lo: number, hi: number) => {
    if (lo > hi) return
    if (lo === hi) {
      t.sorted.push(lo)
      return
    }
    let i = lo
    const extra = { range: [lo, hi] as [number, number], pivotIndex: hi }
    t.emit('pivot', 'pivot', [hi], `选择末尾元素 ${t.elements[hi].value} 为枢轴`, extra)
    for (let j = lo; j < hi; j++)
      if (t.compare(j, hi, 'compare', extra) < 0) {
        t.swap(i, j, 'swap', extra)
        i++
      }
    t.swap(i, hi, 'pivotSwap', { range: [lo, hi], pivotIndex: i })
    t.sorted.push(i)
    t.emit('markSorted', 'mark', [i], `枢轴位置 ${i} 已归位`, { range: [lo, hi], pivotIndex: i })
    sort(lo, i - 1)
    sort(i + 1, hi)
  }
  sort(0, input.length - 1)
  return t.done()
}
export function heapSort(input: number[]): SortStep[] {
  const t = new Trace('heap', input)
  const sift = (start: number, size: number) => {
    let root = start
    while (2 * root + 1 < size) {
      let largest = root
      const left = 2 * root + 1,
        right = left + 1
      if (t.compare(left, largest, 'compareLeft', { heapSize: size }) > 0) largest = left
      if (right < size && t.compare(right, largest, 'compareRight', { heapSize: size }) > 0)
        largest = right
      if (largest === root) break
      t.swap(root, largest, 'swap', { heapSize: size })
      root = largest
    }
  }
  for (let i = Math.floor(input.length / 2) - 1; i >= 0; i--) sift(i, input.length)
  for (let end = input.length - 1; end > 0; end--) {
    t.swap(0, end, 'extract', { heapSize: end })
    t.sorted.push(end)
    sift(0, end)
  }
  return t.done()
}
export function radixSort(input: number[]): SortStep[] {
  const t = new Trace('radix', input),
    max = Math.max(0, ...input)
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const buckets: SortElement[][] = Array.from({ length: 10 }, () => [])
    for (let i = 0; i < t.elements.length; i++) {
      const e = t.elements[i],
        digit = Math.floor(e.value / exp) % 10
      buckets[digit].push({ ...e })
      t.emit(
        'bucket',
        'bucket',
        [i],
        `按 ${exp} 位的数字 ${digit} 放入桶 ${digit}（桶内顺序不变）`,
        { digitPlace: exp, buckets: buckets.map(b => b.map(e => ({ ...e }))) }
      )
    }
    const output = buckets.flat()
    for (let i = 0; i < output.length; i++) {
      t.elements[i] = output[i]
      t.emit('overwrite', 'overwrite', [i], `按桶号收集 ${output[i].value}`, {
        digitPlace: exp,
        buckets: buckets.map(b => b.map(e => ({ ...e }))),
        metricsDelta: { overwrites: 1 },
      })
    }
  }
  return t.done()
}
export const SORTING_ALGORITHM_MAP: Record<SortingAlgorithmId, (arr: number[]) => SortStep[]> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  shell: shellSort,
  merge: mergeSort,
  quick: quickSort,
  heap: heapSort,
  radix: radixSort,
}
export const SORTING_ALGORITHM_IDS = SORTING_ALGORITHMS.map(a => a.id)
