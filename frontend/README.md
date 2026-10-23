# 衍序 · AlgoFlow 前端

排序算法学习、可视化演练、RAG 导师与分享社区。个人中心和运营管理共用同一个顶部 Layout。

当前环境：Next.js 16.4.2、React 19、TypeScript、Tailwind v4、shadcn/ui default + Radix、Lucide、Geist、Axios、GSAP。账户状态复用现有 Redux；本轮未引入第二套账户状态管理。

## 启动

```bash
cd frontend
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev --port 3111
```

浏览 <http://localhost:3111>。默认 /api 请求经 Next.js 转发到本机 8080 网关；网关未启动时，公开算法演练仍可运行，远程列表显示错误和重试。变更 ALGOFLOW_GATEWAY_URL 后重新构建；NEXT_PUBLIC_* 是公开构建配置，不能放密钥。

## 页面与规范

- 发现 /；算法目录 /sorting；知识详情 /sorting/[slug]；演练 /visualizer。
- 社区 /blog；讨论 /blog/[id]；发布 /blog/create，编辑使用 ?edit=id。
- 个人中心 /user/profile；内容、收藏、学习记录、通知和设置从头像菜单及个人模块进入。
- 运营管理 /admin，六个模块均在同一工程；普通用户不展示管理入口，实际权限由网关控制。
- 支持 8 种现有排序算法：冒泡、选择、插入、希尔、归并、快速、堆、基数。19 种是规划。

[设计唯一来源](../docs/DESIGN.md) · [实现范围与数据边界](../docs/plan/05-全站前端页面实现计划.md) · [当前验证与待办](../HANDOVER.md)

## 验证

```bash
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

tests/browser-smoke.sh 供已安装 agent-browser 的 CI 使用。单元测试、浏览器夹具测试和真实后端验收分别记录，不互相替代。

隔离 UI 验证（不要作为普通开发或生产配置）：

```bash
# 终端 1：仅绑定 loopback 的测试 API
node tests/fixtures-api.cjs
# 终端 2：显式连接测试 API
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3212 pnpm dev --port 3111
```

夹具中的用户、文档、审核与回答都是测试数据。学习记录、草稿和学习偏好目前保存在此浏览器，界面明确标注其范围。
