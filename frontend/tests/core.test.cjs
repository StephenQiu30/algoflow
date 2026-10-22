const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
require.extensions['.ts'] = (module, path) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    path
  )
const {
  SORTING_ALGORITHM_MAP: algorithms,
  SORTING_ALGORITHMS,
  SORTING_CODE,
} = require('../src/lib/sortingAlgorithms.ts')
const { buildMetricsPrefix, getPlaybackFrame } = require('../src/lib/sortingPlayback.ts')
const { SSEParser, readRagEvents, normalizeSources } = require('../src/lib/ragStream.ts')
let seed = 314159
const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0)
for (const { id, stability } of SORTING_ALGORITHMS)
  test(`${id}: order, input preservation, identities, trace and stability`, () => {
    const cases = [
      [],
      [0],
      [3, 1, 2],
      [3, 4, 1, 2],
      [2, 2, 1, 2],
      [0, 0, 0],
      [999, 1],
      Array.from({ length: 50 }, (_, i) => 50 - i),
    ]
    for (let i = 0; i < 150; i++)
      cases.push(Array.from({ length: random() % 50 }, () => random() % 10))
    for (const input of cases) {
      const before = [...input],
        steps = algorithms[id](input),
        last = steps.at(-1)
      assert.deepEqual(input, before)
      assert.deepEqual(
        last.array,
        [...input].sort((a, b) => a - b)
      )
      assert.deepEqual(
        [...last.elementIds].sort((a, b) => a - b),
        input.map((_, i) => i)
      )
      for (const step of steps) {
        assert(step.line > 0 && step.line <= SORTING_CODE[id].split('\n').length)
        assert.equal(step.elementIds.length, input.length)
        assert(step.activeIndices.every(i => i >= 0 && i < input.length))
        step.array.forEach((value, i) => assert.equal(value, input[step.elementIds[i]]))
      }
      if (stability === '稳定')
        for (let i = 1; i < last.array.length; i++)
          if (last.array[i] === last.array[i - 1])
            assert(last.elementIds[i] > last.elementIds[i - 1])
    }
  })
test('counts reflect comparisons, early exit and actual exchanges', () => {
  const count = (id, a) => buildMetricsPrefix(algorithms[id](a)).at(-1)
  assert.equal(count('insertion', [1, 2, 3, 4, 5]).comparisons, 4)
  assert.equal(count('bubble', [1, 2, 3, 4, 5]).comparisons, 4)
  assert.deepEqual(count('merge', [1, 2]), { comparisons: 1, swaps: 0, overwrites: 2 })
  assert.equal(count('quick', [1, 2, 3]).swaps, 0)
  assert(
    algorithms
      .insertion([3, 1, 2])
      .filter(s => s.action === 'localSorted')
      .every(s => !s.sortedIndices.length)
  )
})
test('cursor zero, first comparison, completed metrics and rewind share one definition', () => {
  const input = [3, 1, 2],
    steps = algorithms.bubble(input),
    prefix = buildMetricsPrefix(steps)
  assert.deepEqual(getPlaybackFrame(input, steps, 0).array, input)
  assert.equal(getPlaybackFrame(input, steps, 1).step.action, 'compare')
  assert.equal(prefix[1].comparisons, 1)
  assert.equal(getPlaybackFrame(input, steps, steps.length).isSorted, true)
  assert.equal(getPlaybackFrame(input, steps, steps.length - 1).isSorted, false)
  assert.deepEqual(getPlaybackFrame(input, steps, 0).array, input)
})
test('invalid radix input is rejected without changing values', () => {
  for (const input of [[-1, 2], [1.5, 2], [Infinity, 3], [NaN, 4], [Number.MAX_SAFE_INTEGER + 1]])
    assert.throws(() => algorithms.radix(input), RangeError)
  assert.throws(() => algorithms.bubble(Array(51).fill(1)), RangeError)
})
test('merge operands refer to auxiliary values despite overwritten main array', () => {
  const steps = algorithms.merge([3, 4, 1, 2])
  const comparison = steps.find(s => s.action === 'compare' && s.message.includes('3 与 2'))
  assert(comparison)
  assert.deepEqual(
    comparison.auxiliary.map(b => b.elements[b.activeIndices[0]].value),
    [3, 2]
  )
  assert.deepEqual(comparison.activeIndices, [])
})
test('SSE supports split UTF-8, all delimiters, multiline fields and ignores comments', async () => {
  for (const sep of ['\n', '\r\n', '\r']) {
    const parser = new SSEParser(),
      payload = `:heartbeat${sep}event: answer${sep}data: {"type":"answer",${sep}data: "content":"中文"}${sep}${sep}`
    const events = []
    for (const char of payload) events.push(...parser.push(char))
    events.push(...parser.push('', true))
    assert.equal(events.length, 1)
    assert.equal(JSON.parse(events[0]).content, '中文')
  }
  const bytes = new TextEncoder().encode(
    'data: {"type":"answer","content":"中文"}\r\n\r\ndata: {"type":"done"}\r\n\r\n'
  )
  const body = new ReadableStream({
      start(c) {
        for (const b of bytes) c.enqueue(Uint8Array.of(b))
        c.close()
      },
    }),
    result = []
  for await (const e of readRagEvents(body)) result.push(e)
  assert.equal(result[0].content, '中文')
  assert.equal(result[1].type, 'done')
})
test('ending iteration on done cancels an open stream and sources preserve provenance', async () => {
  let cancelled = false
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode('data: {"type":"done","sources":[]}\n\n'))
    },
    cancel() {
      cancelled = true
    },
  })
  for await (const e of readRagEvents(stream)) if (e.type === 'done') break
  assert(cancelled)
  assert.deepEqual(
    normalizeSources([{ documentName: '教程', chunkId: 'x', version: 'v2', bad: () => 1 }, null]),
    [{ documentName: '教程', chunkId: 'x', version: 'v2' }]
  )
})
const {
  evaluatePrediction,
  recordPracticeAttempt,
  practiceSummary,
} = require('../src/lib/sortingPractice.ts')
test('practice credits only distinct first-attempt answers and a passed concept', () => {
  let history = [],
    base = { algorithmId: 'bubble', objective: 'predict-step', at: 1 }
  history = recordPracticeAttempt(history, { ...base, taskId: 'a', correct: false })
  history = recordPracticeAttempt(history, { ...base, taskId: 'a', correct: true })
  assert.equal(practiceSummary(history, 'bubble').independent, 0)
  for (const taskId of ['b', 'c', 'd'])
    history = recordPracticeAttempt(history, { ...base, taskId, correct: true })
  assert.equal(practiceSummary(history, 'bubble').passed, false)
  history = recordPracticeAttempt(history, {
    ...base,
    objective: 'concept',
    taskId: 'concept',
    correct: true,
  })
  assert.equal(practiceSummary(history, 'bubble').passed, true)
  assert.equal(practiceSummary(history, 'merge').passed, false)
  assert(evaluatePrediction(algorithms.bubble([3, 1, 2])[0], 'compare', [3, 1, 2]))
  assert(!evaluatePrediction(algorithms.bubble([3, 1, 2])[0], 'swap', [1, 3, 2]))
})
test('generated form requests retain FormData and remove generator-only flags', async () => {
  const source = fs.readFileSync(require.resolve('../src/lib/request.ts'), 'utf8')
  const Module = require('node:module')
  const compiled = new Module(require.resolve('../src/lib/request.ts'), module)
  compiled.filename = require.resolve('../src/lib/request.ts')
  compiled.paths = require('node:module')._nodeModulePaths(
    require('node:path').dirname(compiled.filename)
  )
  compiled._compile(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText,
    compiled.filename
  )
  const request = compiled.exports.default
  const data = new FormData()
  data.append('file', new Blob(['course']), 'course.md')
  let observed
  const response = await request('/controlled-upload', {
    method: 'POST',
    requestType: 'form',
    data,
    adapter: async config => {
      observed = config
      return { data: '{"code":0}', status: 200, statusText: 'OK', headers: {}, config }
    },
  })
  assert.equal(observed.data, data)
  assert.equal(observed.requestType, undefined)
  assert.notEqual(observed.headers.getContentType(), 'application/json')
  assert.equal(response.code, 0)
})
test('displayed code sorts the same element identities as the live trace', () => {
  const vm = require('node:vm')
  for (const { id } of SORTING_ALGORITHMS) {
    for (let sample = 0; sample < 25; sample++) {
      const values = Array.from({ length: sample % 12 }, () => random() % 6)
      const input = values.map((value, id) => ({
        value,
        id,
        valueOf() {
          return this.value
        },
      }))
      vm.runInNewContext(
        `function swap(a,i,j){[a[i],a[j]]=[a[j],a[i]];}\n${SORTING_CODE[id]}\n${id}Sort(input);`,
        { input }
      )
      const expected = algorithms[id](values).at(-1)
      assert.deepEqual(
        input.map(e => e.value),
        expected.array
      )
      assert.deepEqual(
        input.map(e => e.id),
        expected.elementIds
      )
    }
  }
  const comparison = algorithms.merge([3, 4, 1, 2]).find(s => s.action === 'compare')
  assert(SORTING_CODE.merge.split('\n')[comparison.line - 1].includes('left[i] <= right[j]'))
})
