# 衍序 AlgoFlow · 产品设计规范

> 更新：2026-10-23。本文是全局视觉与组件规范的唯一来源。适用范围：学习、演练、RAG 导师、知识阅读、分享交流及 `frontend/src/app/admin/` 内的运营管理。
> 当前 Figma 基线已进入前端实现。设计入口见 [DES-06](design/06-Figma全站设计交付与验收.md)，代码范围见 [前端实施计划](plan/05-全站前端页面实现计划.md)，运行证据与真实联调边界见 [HANDOVER](../HANDOVER.md)。

## 1. 产品与视觉方向

AlgoFlow 是算法学习与分享交流社区。核心旅程是“发现算法 → 演练与提问 → 阅读依据 → 分享理解 → 参与讨论”，管理端负责知识质量、内容治理与可追溯运营。

采用 shadcn/ui + **Radix Primitives** 的组件语义，参考 Vercel 的排版、信息层级、交互与可访问性指引。**克制、清楚、极简是优先设计准则。** 设计感来自清晰内容、稳定对齐和适度留白；首页展示学习与社区内容，不展示虚构的平台规模、排行或增长数据。

- 标题直接说明页面用途，如「学习排序算法」「运营概览」；说明仅在补充对象、范围、条件或后果时出现，避免口号、重复解释与抽象文案。
- 每个任务区域只突出一个主要动作；低频操作进入既有菜单。保留必要文字标签，不把所有内容变成图标，也不为装饰添加图标。
- 页面只放支持当前任务的内容。社区辅助区保留话题入口；个人主页聚焦资料和动态，不堆叠推荐、排行和额外数据面板。
- 默认直接排版，不为每段内容包卡片；使用现有字号、间距和圆角。普通页面标题使用 Title，Display 不作为默认页面标题；不通过超大字号或过量留白制造设计感。
- 极简不删去字段名、数据范围、分页、选中状态、错误恢复、操作后果和无障碍提示。评审说明集中在 Figma 基础说明板与设计文档，不混入产品正文。

- 全站顶部导航，无常驻侧栏；管理端同样采用顶部布局。
- 黑白灰为主体；旧 Action Blue 主色规则停止沿用。演练页仅允许执行状态使用局部蓝色 token；栏目图标、按钮、按钮内图标和 Slider 保持黑白主题，详见 [交互规范](design/05-shadcn顶部布局与全站交互规范.md#算法演练与动效)。
- **无装饰边框**：页面、卡片、顶栏、内容分组与表格不依赖描边分隔，使用间距、底色与对齐建立层次；不使用发丝线卡片网格、厚重阴影、装饰渐变或炫光。
- 无边框不等于无焦点：保留键盘焦点环、错误提示、拖拽反馈和必要的算法指针标记。危险操作必须有具体对象、影响说明和确认。
- 卡片不嵌套卡片。文章和列表优先直接排版；浅灰面仅用于辅助区域、工具、输入和状态。
- 外观默认跟随系统；顶栏常驻 Lucide 主题图标，通过 shadcn DropdownMenu 提供浅色、深色、跟随系统选项，设置页保留同一偏好。主题触发器显示当前解析出的 Sun / Moon 图标。

## 2. 字体、网格与层级

| 项目 | 规范 |
| --- | --- |
| 字体 | 拉丁字符使用 Geist Sans，代码/数组索引使用 Geist Mono；中文使用 Noto Sans SC，生产环境可回退 PingFang SC / 系统无衬线 |
| 字号 | Display 48（仅品牌/基础说明）、Title 32、Heading 20、Heading compact 18、Body 16、Label 14、Caption 12；Code 14、Code caption 12；手机主标题 32，输入文字至少 16 |
| 行高 | 正文 1.5–1.75；代码 1.5；长段落控制阅读宽度，不让行长随超宽屏无限增长 |
| 间距 | 4 / 8 / 12 / 16 / 24 / 32 / 48；横向和纵向布局均使用 gap；正文分区间距 24，桌面顶部内边距 32、手机/平板 24，底部 48 |
| 圆角 | 复用项目 `--radius` 与派生 token；当前设计为 10 / 12 / 14，不新增胶囊式视觉体系 |
| 桌面 | 1440 × 900 设计视口、1280 内容宽度、左右 80；12 列网格；社区内容区采用 864 + 64 + 352 的正文/话题组合，公开个人主页使用居中 864 单列 |
| 平板 | 768 × 1024 设计视口、704 内容宽度、左右 32，导航折叠，内容可单列；保持字号和内容优先级 |
| 手机 | 390 × 844 设计视口、350 内容宽度、左右 20；4 列网格；触控目标至少 44；支持 320 宽度与浏览器缩放 |

前端已通过 geist/font/sans 与 geist/font/mono 接入包内本地字体（基于 next/font/local）；中文当前使用 PingFang SC / Noto Sans SC / 系统无衬线回退，未额外下载中文字体。

## 3. 语义 token

颜色只在主题变量定义；页面使用 `bg-background`、`text-muted-foreground` 等语义 token。Figma 使用 Primitive → Semantic 别名并绑定 Light / Dark 模式；布局使用独立变量集。

| Token | Light | Dark | 用途 |
| --- | --- | --- | --- |
| background / card | #ffffff | #0a0a0a | 页面与阅读背景 |
| foreground | #171717 | #ededed | 正文和主要信息 |
| primary | #171717 | #ededed | 主要动作、选中项与 Slider |
| primary-foreground | #ffffff | #0a0a0a | 主按钮文字 |
| muted / secondary / accent | #f5f5f5 | #171717 | 辅助内容、选项和输入面 |
| muted-foreground | #666666 | #a1a1a1 | 次要文字 |
| ring | #171717 | #ededed | 明确可见的键盘焦点 |
| state-comparing | #666666 | #a1a1a1 | 比较元素，同时有文字说明 |
| state-sorted | #a1a1a1 | #666666 | 已排序区间，同时标明索引范围 |
| state-pivot | #333333 | #e5e5e5 | 基准或关键元素，同时有标签 |
| visualizer-accent | #2563eb | #60a5fa | 当前执行柱体、key、变量与代码高亮；不用于栏目图标或按钮 |
| visualizer-accent-muted | #eff6ff | #172554 | 演练 key 与当前代码行的底色 |

保留项目 `border` / `input` token 供必要控件状态使用；不能通过全局 `border: none !important` 删除无障碍边界。无边框主题在共享组件层集中维护，不在每个业务页面反复覆盖颜色、字体与边框。

## 4. 组件与实现边界

**复用和组合，不重新实现基础交互。** 业务页面允许必要的 `main`、`section`、标题、文本与算法 SVG/Canvas 内容；所有按钮、输入、菜单、对话框、表格与反馈均使用 shadcn 组件。算法柱体是领域可视化内容，不是替代组件库的控件。

| 需要 | 组件组合 |
| --- | --- |
| 顶部导航 | NavigationMenu / List / Item / Link / Trigger，链接用 Next Link + `asChild` |
| 用户与移动菜单 | Avatar + Fallback、DropdownMenu + Group、Sheet + Title |
| 筛选与分组 | Tabs + TabsList + TabsTrigger；互斥选项使用 ToggleGroup；SelectItem 必须在 SelectGroup 内 |
| 编辑表单 | FieldGroup + Field + FieldLabel；Input / Textarea；复合输入使用 InputGroupInput 或 InputGroupTextarea |
| 信息与状态 | Card 完整结构、Badge、Alert、Empty、Skeleton、Progress、Sonner |
| 个人记录与管理列表 | Data Table 按官方指南组合 Table + TanStack Table，配合 Pagination、Checkbox、Select、DropdownMenu；不手写基础控件 |
| 确认与来源 | Dialog / AlertDialog / Sheet，始终提供 Title 与 Description、取消与关闭方式 |
| 算法控制 | Button、Slider、ToggleGroup、Tooltip；不用自制按钮、下拉或滑块 |
| 对话目标结构 | MessageScroller → Message → Bubble，引用使用来源操作与 Sheet；滚动跟随由组件负责 |

截至本轮，CLI 确认项目为 Next.js 16.4.2、React 19、Tailwind v4、Radix、Lucide、pnpm，现有组件目录为 `frontend/src/components/ui/`。使用当前 `default` 风格，不切换 preset；新增组件先通过 CLI 检查，既有组件仅做必要的样式和可访问性修复。

已安装：Alert、Avatar、Badge、Button、Card、Command、Dialog、DropdownMenu、Form、Input、Label、NavigationMenu、Pagination、Popover、ScrollArea、Sheet、Skeleton、Slider、Tabs、Textarea、Tooltip，以及本轮通过 CLI 补充的 Table、Field、InputGroup、Select、ToggleGroup、AlertDialog、Empty、Checkbox、Progress、Separator、Switch、Spinner、Toggle。Data Table 使用 TanStack Table v8；保留 default / Radix，baseColor 使用 neutral。

**本轮 CLI 对 MessageScroller / Message / Bubble 无文档链接，`@shadcn` 搜索也未返回 message**。当前聊天使用官方 ScrollArea / Dialog / Field / Textarea / Button 与语义消息内容组合；流式跟随与中止作为业务逻辑实现，不伪造 registry 依赖或自建聊天基础组件。Sheet 已替换原手写抽屉，弹层统一使用 Radix 焦点约束；关闭控件维持 44px 触控区域。

其余硬规则：使用 `cn()`、`size-*`、`truncate`、`gap-*`；所有操作图标统一使用 Lucide 矢量与 `data-icon`，禁止字符箭头、Emoji 或混用其他图标库；不自行给 overlay 设置 z-index，不用 raw 色值或逐页面 `dark:` 覆盖；提交中使用 Spinner + disabled + 原有标签。

## 5. 交互、数据与可访问性

- 全程键盘可达，焦点可见且不被吸顶内容遮挡；弹层正确捕获并返回焦点。手机按钮至少 44px，浏览器缩放不能禁用。代码、数组与导师对话的局部滚动区域可聚焦并具名；滑块名称绑定实际滑块。
- 筛选、分页、算法和阅读位置可分享、刷新恢复；详情返回列表保留查询与阅读上下文。跨模块进入及明确的「返回个人中心 / 返回运营管理 / 返回账户设置」从目标页顶部开始，不继承无关页面的滚动位置。导航用真实链接，不能使用按钮模拟 URL 跳转。
- 设计覆盖加载、空内容、失败、断线、权限不足、输入错误、版本冲突与提交中；失败保留输入和已生成内容，并提供恢复入口。
- 数据状态明确区分“已上传 / 已解析 / 向量化中 / 索引失败 / 已发布”，操作回执不能伪装成检索已成功。
- 切片编辑先保存草稿；冲突保留输入并显式比较，重试受理与索引发布分别反馈。文档修订号与课程版本分开，失败保留已发布内容。具体契约见 DES-05。
- 个人编辑、通知目标和知识库子页保留来源列表上下文；失败或无权限也提供返回入口。通知预览先保存单条已读再导航，元信息保存及删除以真实接口回执为准。
- RAG 在发送时固定算法快照；展示来源标题、章节与版本。未召回来源时明确说明，无真实依据时不显示相似度百分比或引用。模型未配置时显示明确错误，保留原问题和已有内容供重试，不显示成功回答。
- 算法状态同时用数值、索引、文字、当前元素和有序区间表示，不能只靠颜色；减少动态效果时保留单步与关键状态变化。
- 前端默认 RSC；交互下沉客户端，长任务使用 Suspense 与流式协议。所有真实业务请求沿用 Axios 封装；权限在服务端和网关执行，不能只隐藏菜单。

## 6. 官方依据与项目决策

- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)：键盘、焦点、触控、状态反馈、表单、性能及可访问性。
- [Geist Design System](https://vercel.com/geist/introduction) 与 [Geist 字体](https://vercel.com/font)：排版与视觉层级参考。
- [shadcn/ui Radix](https://ui.shadcn.com/docs/components/radix/button)：组件文档、API 与组合方式；[Field](https://ui.shadcn.com/docs/components/radix/field)、[Table](https://ui.shadcn.com/docs/components/radix/table)、[NavigationMenu](https://ui.shadcn.com/docs/components/radix/navigation-menu) 为本轮关键依据。

“全站无装饰边框、顶部布局、黑白灰、顶栏可见主题切换”是 AlgoFlow 的项目决策，不冒称 Vercel 的强制规定。Figma 是可编辑设计载体，规范与交付状态以本仓库文档为准。

## 7. 品牌与共享布局

正式 Logo 为 A「阶序」，Figma 唯一源为 `Brand / Logo / 阶序`（91:1335），通过 `Brand / Lockup` 复用，不拉伸或逐页重画。标志与字标绑定 foreground，无描边、渐变或阴影。品牌链接名称为「衍序 AlgoFlow，返回首页」，装饰标志对读屏隐藏。

| 视口 | 品牌 | 顶部操作 |
| --- | --- | --- |
| 桌面 ≥1024 | 28px 标志 + 20px 完整字标 | 搜索 / 通知 / 主题 / 头像，40px 点击区域、8px 间距 |
| 平板 640–1023 | 24px 标志 + 18px 完整字标 | 同上并追加菜单，44px 点击区域、4px 间距 |
| 手机 <640 | 24px 标志 + 18px「衍序」 | 同上并追加菜单，44px 点击区域、4px 间距 |

图文间距 8px；品牌与桌面导航间距 24px，按内容宽度排列。两端靠弹性空白分开，手机固定组间 gap 12px。320–359px 使用 16px 页边距并允许品牌仅显示标志，不能压缩触控区域；1024–1279px 使用 24px 页边距。图标视觉尺寸 20px，几何来自 Lucide 24px/strokeWidth=2；行内图标 16–18px，所有图标按钮须有中文名称与可见焦点。

全站只保留一层 64px 共享顶栏，个人中心、账户设置和运营管理均不增加第二行菜单、分区选择器或常驻侧栏。模块入口放在所属概览正文中，内页提供左对齐的返回入口。桌面正文顶部 32px，平板/手机 24px；分区间隔 24px，底部 48px。Figma 固定评审视口，长正文在 Scroll viewport 中纵向滚动；生产不得锁定浏览器宽高或裁掉首屏之后的内容。

内容沿所属容器左边线排列，任务操作组沿该容器右边线排列；次要在前、主要在后，间距 8px。空间不足时操作纵向铺满，主操作置后。返回、导航、筛选、播放、引用和社区互动保留语义顺序。具体页面、通知预览、账户权限和分页契约统一维护于 [DES-05](design/05-shadcn顶部布局与全站交互规范.md)。

## 8. 当前稿维护规则

- 只保留一个当前 Figma 设计页与一套当前规范；修改现有节点和章节，不为每次反馈新增版本文件、设计页或末尾“修订记录”。
- 新功能允许增加必要页面、组件、响应式变体和交互状态；已替代的候选、重复稿与旧说明板在替换完成后删除，删除前检查实例和原型引用。
- 本地只保留 `assets/current/` 的当前必要预览和一份当前检查清单，原位覆盖。不得新增日期目录、截图总览归档、带 final/v2/最终版 的副本。
- `docs/DESIGN.md` 负责视觉与组件基线，DES-05 负责交互，DES-06 负责当前入口与验收边界；同一规则不复制到多个文档。README 只做导航，删除文件时同步清理链接。
- Git 与 Figma 自身版本历史承担追溯，不另外堆放历史副本；本规则不授权自动提交、推送或清除版本历史。
