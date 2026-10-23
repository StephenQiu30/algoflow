const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'),
  ts = require('typescript')
require.extensions['.ts'] = (module, path) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    path
  )
const { parseListPage, parseListSize } = require('../src/lib/pagination.ts')
const { notificationHref, notificationPreview } = require('../src/lib/notification.ts')
test('notification preview reads the real MQ envelope and legacy text payloads', () => {
  assert.deepEqual(
    notificationPreview({ type: 3, data: { title: '审核结果', content: '已通过' } }),
    { title: '审核结果', description: '已通过' }
  )
  assert.deepEqual(notificationPreview({ type: 3, title: '回复', content: '已回复' }), {
    title: '回复',
    description: '已回复',
  })
  assert.deepEqual(notificationPreview({ type: 3, data: '知识库已更新' }), {
    title: '新通知',
    description: '知识库已更新',
  })
  assert.deepEqual(notificationPreview({ type: 3, data: null }), {
    title: '新通知',
    description: '',
  })
})
test('pagination rejects malformed, fractional and unbounded URL values', () => {
  for (const v of [null, '', '0', '-1', '1.5', 'Infinity', 'NaN', '100001', '9007199254740993'])
    assert.equal(parseListPage(v), 1)
  assert.equal(parseListPage('4'), 4)
  assert.equal(parseListSize('20'), 20)
  for (const v of [null, '', '1', '1000', 'NaN']) assert.equal(parseListSize(v), 5)
})
test('notifications navigate only to local paths or known related records', () => {
  assert.equal(notificationHref({ contentUrl: '/blog/42' }), '/blog/42')
  for (const url of [
    'https://example.com',
    '//example.com',
    '/\\example.com',
    'javascript:alert(1)',
    '/blog\n42',
  ])
    assert.equal(notificationHref({ contentUrl: url }), '/user/notifications')
  assert.equal(notificationHref({ relatedType: 'POST', relatedId: 42 }), '/blog/42')
  assert.equal(notificationHref({ relatedType: 'unknown', relatedId: 42 }), '/user/notifications')
})
