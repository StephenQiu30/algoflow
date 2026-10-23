# Figma 当前设计与验收

> DES-06 · 更新：2026-10-23。仅维护当前结果，不累积阶段快照。本文记录 Figma 基线与原型验收；前端已按此基线进入实现，范围和运行证据分别见 [前端实施计划](../plan/05-全站前端页面实现计划.md) 与 [HANDOVER](../../HANDOVER.md)。

## 设计入口

唯一文件为 [AlgoFlow 教学与运营设计系统](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=74-31)，唯一页面为「AlgoFlow · 当前设计」（74:31）。只保留当前页面、必要的响应式/状态变体、组件和一块基础说明板。

| 场景 | 桌面 | 平板 | 手机 |
| --- | --- | --- | --- |
| 发现 | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=77-31) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=217-14556) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=80-318) |
| 算法目录 | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=77-134) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=217-17616) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=207-9817) |
| 算法演练 | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=77-226) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=217-14648) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=80-374) |
| 个人空间 | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=82-621) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=217-15578) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=142-5131) |
| 运营管理 | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=79-193) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=217-15984) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=142-5712) |
| 通知 | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=77-755) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=217-15894) | [查看](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz?node-id=142-5578) |

全部当前画板与浮层名称、node-id、尺寸集中在 [当前清单与结构检查](assets/current/audit.json)，不再在多个文档复制全量表格。

## 当前结构与来源

- 190 个 UI/状态画板；41 个独立浮层（账户 32、主题 3、通知 6）；133 个组件、6996 个实例。
- 64 个变量：Primitives 15、Semantic 24、Layout 21、Prototype state 4；11 个文字样式。角色与主题变量仅用于设计演示。
- shadcn/Radix 本地可编辑映射，非官方 Figma Kit；未建立 Code Connect。页面包含可编辑文字、Auto Layout、矢量与组件实例。
- Logo 只保留 A「阶序」主组件（91:1335）及响应式 Lockup。学习目录覆盖 8 个算法与三端详情；19 种为产品规划。
- 生产复用既有 Radix base 与 default 风格；组件安装、聊天 registry 和目标字体限制见 [主规范](../DESIGN.md)。页面、权限、分页、动效和通知规则见 [DES-05](05-shadcn顶部布局与全站交互规范.md)。

## 验证状态与边界

当前演练视觉稿已原位更新 10 个相关画板和 17 个共享组件，覆盖桌面、平板、手机、深色、下一步及数据设置。统一页面与面板底色、栏目图标、辅助文案和 Footer 操作对齐；桌面两侧保持 640px 等高，手机执行控制在示例首屏内，代码区纵向接续。已检查三端截图、手机代码与设置组件；这 10 个画板的 103 个交互定义未发现目标缺失，未发现文字横向超出父容器。此项仅为 Figma 视觉与结构检查，未重新执行逐点击验收；这版演练调整待用户确认，尚未同步前端代码，不沿用已有代码测试作为本次验收结论。

2026-10-23 重新检查当前全文件：3188 个目标连接无缺失，其中 UI 与浮层内 3068 个连接无跨视口目标；失去主组件的实例为 0。第二行分区导航与设置跨页 Tabs 为 0；所有 UI 顶栏为 64px，滚动区域从 y=64 开始。账户菜单项均为单一点击动作，不再继承首页占位导航。

当前稿已原位调整 99 个受影响的个人、管理及状态画板，删除 6 个废弃的手机/平板分区导航画板、2 个旧导航组件与 1 个无引用高度变量。管理首页六个模块在桌面、平板、手机均连接到对应尺寸；管理内页、个人内页和设置子页提供明确返回入口。业务页面 node-id 保持不变。

本次在浏览器中运行 390×844 手机原型，逐项点击验证以下路径；桌面和平板本次检查结构与路由，不将其计为逐点击验收。

| 验证范围 | 运行结果 |
| --- | --- |
| 普通用户头像 → 个人中心、账户设置 | 进入正确尺寸页面并关闭菜单；个人中心当前项显示一致，无管理入口 |
| 菜单关闭 | 再次点击头像、外部点击、Esc 关闭；管理员菜单 Esc 关闭，选择条目后关闭 |
| 个人模块与返回 | 我的内容、收藏进入后标题与返回入口出现在顶部；返回个人中心；账户设置 → 学习偏好 → 返回账户设置 |
| 管理模块 | 从管理员头像菜单进入管理；知识库、召回评测、社区审核、用户、索引任务、审计六个模块逐项进入并返回；从管理头像切到个人中心再回管理 |
| 权限演示 | 普通用户直接进入管理显示无权限，可返回个人中心；退出到登录后，演示登录恢复普通用户菜单 |
| 分页 | 知识库 1 → 2 → 3 → 4 → 3，记录范围与页数一致；首页上一页、末页下一页禁用；收藏与用户单页列表两端禁用 |

修复了跨模块继承旧滚动位置、账户菜单继承首页占位动作，以及手机/平板知识库第 2 页之后断链的问题。仅补充四个必要分页状态，三端均为 19 条、四页；旧业务页面保持 node-id。最终菜单修复后重新运行管理与个人中心互跳，确认只执行目标导航。管理员评审从 [手机管理员菜单](https://www.figma.com/proto/cMWO5SCKWFqJafxME0yhFz?node-id=156-8830&starting-point-node-id=156%3A8830&scaling=scale-down) 启动；此入口只设置原型演示角色，不代表真实授权。

上述为明确范围内的运行验证，未覆盖每个页面的每个操作。此前通知与主题的运行抽检不重复计入本轮；所有记录维护于当前 audit.json。

真实排序播放、任意输入与筛选、所有分页请求、后台写入、RAG 来源、账户权限和持久化均需实施验证。焦点、读屏、设备键盘、320px/1024px/超宽屏、缩放和系统主题尚需生产验收。此段为 Figma 原型验收边界，不代表代码运行结果；当前真实本机接口与 agent-browser 运行证据独立记录于 HANDOVER 和当前 audit.json 的 frontendAcceptance，不将代码测试冒充 Figma 逐页复验。

## 当前预览

只保留通知、个人空间与管理桌面/手机四个当前预览，变更时原位覆盖；手机管理预览为本次运行中的头像菜单截图，设计细节直接查看 Figma。

![通知预览](assets/current/notification-preview.png)

![手机个人空间](assets/current/mobile-personal.png)

![桌面运营管理](assets/current/admin-desktop.png)

![手机运营管理](assets/current/admin-mobile.png)
