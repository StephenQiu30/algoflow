// Isolated UI fixtures. Bind only to loopback; never imported by application code.
const http = require('node:http')
let role = 'admin'
let failedPath = ''
let profile = {}
const docs = Array.from({ length: 19 }, (_, i) => ({
  id: i + 1,
  name: `测试文档 ${i + 1}`,
  version: 'v1',
  knowledgeBaseId: 1,
  status: i === 1 ? 'FAILED' : 'COMPLETED',
  chunkCount: 12,
  createTime: '2026-10-23T09:20:00',
  updateTime: '2026-10-23T09:20:00',
  errorMessage: i === 1 ? '测试失败原因' : '',
}))
const user = () => ({
  id: 1,
  userName: '测试用户',
  userRole: role,
  userEmail: 'test@example.com',
  userProfile: '用于前端交互验证',
  ...profile,
})
const post = {
  id: 1,
  title: '测试：插入排序的稳定性',
  content: '这是一条隔离的浏览器测试内容。',
  userId: 1,
  userVO: { id: 1, userName: '测试作者' },
  reviewStatus: 0,
  createTime: '2026-10-23T09:20:00',
  thumbNum: 2,
  tags: ['测试'],
}
function page(rows, p) {
  return {
    records: rows.slice(
      ((p.current || 1) - 1) * (p.pageSize || 5),
      (p.current || 1) * (p.pageSize || 5)
    ),
    total: rows.length,
  }
}
http
  .createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3111')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'content-type,authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      return res.end()
    }
    const url = new URL(req.url, 'http://localhost'),
      path = url.pathname
    let body = ''
    for await (const chunk of req) body += chunk
    let p = {}
    try {
      p = JSON.parse(body || '{}')
    } catch {}
    if (path === '/__test/role') {
      role = p.role
      return res.end(JSON.stringify({ role }))
    }
    if (path === '/__test/failure') {
      failedPath = p.path || ''
      return res.end(JSON.stringify({ failedPath }))
    }
    if (path === failedPath) {
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ code: 500, message: '隔离测试：请求失败' }))
    }
    let data
    if (path === '/user/get/login') {
      if (role === 'guest') {
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({ code: 401, message: '未登录' }))
      }
      data = user()
    } else if (path === '/user/logout') {
      role = 'guest'
      data = true
    } else if (path === '/user/get/vo') data = user()
    else if (path === '/user/edit') {
      profile = { ...profile, ...p }
      data = true
    } else if (path === '/user/update') {
      if (p.userRole) role = p.userRole
      data = true
    } else if (path === '/post/review') {
      post.reviewStatus = p.reviewStatus
      data = true
    } else if (path === '/post/add') data = 2
    else if (path === '/user/login/email') {
      role = 'user'
      data = { ...user(), token: 'isolated-test-token' }
    } else if (path === '/user/login/email/code') data = 60
    else if (path === '/ai/kb/list/page/vo')
      data = { records: [{ id: 1, name: '测试知识库' }], total: 1 }
    else if (path === '/ai/doc/get/vo')
      data = docs.find(d => d.id === Number(url.searchParams.get('id')))
    else if (path === '/ai/doc/list/page') {
      const rows = docs.filter(
        d => (!p.name || d.name.includes(p.name)) && (!p.status || d.status === p.status)
      )
      data = page(rows, p)
    } else if (path === '/ai/chunk/list/page/vo')
      data = page(
        [
          {
            id: 'chunk1',
            sectionTitle: '测试章节',
            sectionPath: '原理 / 稳定性',
            wordCount: 24,
            content: '测试切片内容',
          },
        ],
        p
      )
    else if (path === '/ai/rag/recall/analyze')
      data = { question: p.question, keywordHits: [], vectorHits: [], finalResults: [] }
    else if (path === '/ai/rag/ask/stream/events') {
      res.setHeader('Content-Type', 'text/event-stream')
      res.write('data: ' + JSON.stringify({ type: 'answer', content: '测试流式回答。' }) + '\n\n')
      res.write('data: ' + JSON.stringify({ type: 'done', sources: [] }) + '\n\n')
      return res.end()
    } else if (path === '/post/get/vo') data = post
    else if (path.includes('/comment/') && path.includes('/page')) data = page([], p)
    else if (path.includes('/post/') && path.includes('/page')) data = page([post], p)
    else if (path.includes('/notification/') && path.includes('/page'))
      data = page(
        [
          {
            id: 1,
            title: '测试回复通知',
            content: '测试内容',
            isRead: 0,
            contentUrl: '/blog/1',
            createTime: '2026-10-23T09:20:00',
          },
        ],
        p
      )
    else if (path === '/user/list/page') data = page([user()], p)
    else if (path.includes('/log/'))
      data = page(
        [
          {
            id: 1,
            module: '文档',
            action: '测试读取',
            operatorName: '测试用户',
            success: 1,
            createTime: '2026-10-23T09:20:00',
          },
        ],
        p
      )
    else data = true
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ code: 0, data }))
  })
  .listen(3212, '127.0.0.1', () => console.log('Isolated UI fixtures on 127.0.0.1:3212'))
