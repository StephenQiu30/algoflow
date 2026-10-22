# shadcn 顶部布局与全站交互规范

> **文档编号**：DES-05  
> **所属模块**：02. Design  
> **状态**：已确认。依据：[docs/DESIGN.md](../DESIGN.md)、[Figma 设计文件](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz) 与 [需求01 §3.4 NFR](../requirement/01-产品总览与系统需求规格说明.md)；已确认、建议与待定分别标注。不要复制 BACKLOG 的进度表。

---

## 1. 摘要

本设计定义 AlgoFlow 全站的统一顶部导航系统（SiteHeader）、响应式抽屉菜单、用户会话状态呈现与 shadcn/ui (Radix Primitives) 组件使用规约。教学前台、算法演练工作台、社区题解与运营管理后台（`/admin`）共享一致的顶部布局与交互语义。

---

## 2. 参与者与职责

* **设计与交互确认**：UI/UX 负责人（对接 Figma 设计稿）、前端架构师；
* **实施责任**：`frontend/src/components/header/`、`frontend/src/components/ui/`。

---

## 3. 背景与约束

* **系统现状**：组件库基于 shadcn/ui（Radix UI Primitives）+ Tailwind CSS 构建；
* **统一性要求**：全站前台与管理后台统一共享同一套 Layout 与全局 Provider，严禁出现割裂的视觉风格；
* **设计原则**：以内容为先，去除多余厚重背景；Action Blue (`#0066cc`) 为核心可点击焦点，采用发丝线 (`hairline #e0e0e0`) 进行物理区隔。

---

## 4. 目标与非目标

### 4.1 核心目标
1. 规范 `SiteHeader`、`SiteLogo`、`UserAvatar`、`ThemeToggle` 与 `MobileMenuContent` 的布局契约；
2. 规范 shadcn 原子组件（Button、Dialog、DropdownMenu、NavigationMenu、Tooltip、Tabs）的变体与 Token；
3. 支持 Desktop 完整导航行与 Mobile (≤ 834px) 优雅汉堡抽屉折叠。

### 4.2 非目标
* 不照搬高通量营销页面的沉重背景与大图留白，遵循高信息密度与教学专注原则。

---

## 5. 使用场景与界面布局

```text
+-----------------------------------------------------------------------------------------+
| [AlgoFlow Logo] 算法大厅  算法演练  算法知识库  社区题解  管理后台  | [Cmd+K 搜索] [主题] [头像] |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [Page Content Area: 页面主体区域 (RSC / Suspense)]                                     |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
|  [SiteFooter: 页脚与备案信息]                                                           |
+-----------------------------------------------------------------------------------------+
```

---

## 6. 核心价值

* **一致性**：前后台共用同一套交互语言，用户无需重新适应；
* **无障碍保障**：Radix UI 原生支持键盘导航、Focus 焦点捕获与屏幕阅读器无障碍读屏。

---

## 7. 方案详述

### 7.1 顶部导航与组件层次 [已确认]
* **`SiteHeader`**：高度 56px，常驻吸顶（`sticky top-0 z-50 backdrop-blur-md`），背景采用半透明柔和遮罩；
* **`NavigationMenu`**：PC 端展示“排序算法大厅”、“演练工作台”、“教研知识库”、“题解社区”；管理角色登录时追加展示“运营后台”；
* **`HeaderActions`**：
  - 聚合搜索快捷按钮（呼出 Command Palette `Cmd+K`）；
  - 主题切换开关（Light / Dark / System）；
  - 用户状态：未登录显示“登录 / 注册”组合按钮；已登录显示用户头像与下拉操作菜单（个人中心、我的题解、退出登录）。

### 7.2 移动端折叠契约 [已确认]
* 视口宽度 `< 834px` 时，水平菜单自动折叠为汉堡图标；
* 点击呼出 Radix `Sheet` 抽屉，从右侧滑出完整导航项，确保触控区域 ≥ 44px。

### 7.3 用户故事映射 [已确认]
* 支撑用户故事 [US-101 算法单步与多速演示控制](../requirement/02-敏捷用户故事与验收准则.md)；
* 支撑用户故事 [US-401 知识库 Markdown 自动化切片与向量化](../requirement/02-敏捷用户故事与验收准则.md)。

---

## 8. 实施与验收核对

* **实施依赖**：`@radix-ui/react-navigation-menu`、`@radix-ui/react-sheet`、`lucide-react`；
* **正常场景验收**：全站所有路由顶栏正常吸顶渲染，无横向溢出；切换暗色模式时顶栏无白底闪烁；
* **真实执行证据**：`tests/browser-smoke.sh` 冒烟测试全量通过；调度引用 [BACKLOG.md](../../BACKLOG.md)。
