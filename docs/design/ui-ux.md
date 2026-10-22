# Apple 极简设计系统与交互规范 (UI/UX Design System)

> **文档编号**：DES-UIUX-001  
> **所属模块**：02. Design  
> **设计哲学**：Content First · Edge-to-Edge · Restrained Motion · WCAG 2.1 AA

---

## 1. 核心设计哲学 (Design Philosophy)

AlgoFlow 的视觉语言全面汲取 **Apple 极简设计哲学**：
1. **内容为先 (Product / Content First)**：UI 容器、导航和边框退居幕后，将最充足的高对比度舞台留给算法柱状图、数据交换流转与代码行；
2. **克制的主色 (Single Action Blue)**：全站仅保留一个核心可交互色彩 **`#0066cc` (Action Blue)**，杜绝非功能性的眩光渐变与多余重阴影；
3. **层次分明的材质与留白 (Airy Surfaces & Grayscale)**：利用不同深浅的纯净灰阶与极细发丝线（Hairline），构建如美术馆画廊般的精致层次；
4. **高帧率物理动效 (Restrained Physics)**：借助 GSAP 实现丝滑的 60 FPS 物理插值动效，拒绝生硬位移，严禁产生视觉眩晕的无意义动效。

---

## 2. 统一色彩体系 (Color Palette)

系统采用双色调主题设计（Light & Dark Mode），满足高对比度与暗光学习环境：

| 语义变量名 | Hex 标值 (Light) | Hex 标值 (Dark) | 适用场景与视觉规范 |
| :--- | :--- | :--- | :--- |
| **`primary`** | `#0066cc` | `#2997ff` | **唯一主交互色**：主按钮、选中状态、活动 Tab 强调 |
| **`primary-focus`** | `#0071e3` | `#0077ed` | 交互元素 Focus / Hover 高亮环 |
| **`ink` (文本正色)** | `#1d1d1f` | `#f5f5f7` | 页面一级标题、重点强调文字与代码正文 |
| **`ink-muted`** | `#7a7a7a` | `#86868b` | 二级说明文字、时间戳、算法复杂度次级标签 |
| **`canvas` (画布底色)** | `#ffffff` | `#000000` | 页面顶层背景与工作区基底 |
| **`canvas-parchment`**| `#f5f5f7` | `#161617` | 次级工作区背景、算法控制栏容器底色 |
| **`hairline` (发丝边框)**| `#e0e0e0` | `#2d2d2d` | 极细卡片描边 (1px)，杜绝重阴影 |
| **`state-comparing`** | `#f5a623` | `#ffb340` | **算法演练-比较中**：高辨识度暖琥珀色 |
| **`state-swapping`**  | `#d0021b` | `#ff453a` | **算法演练-交换中**：警示与位移动作高亮 |
| **`state-sorted`**    | `#34c759` | `#30d158` | **算法演练-已排序完成**：稳定翡翠绿 |
| **`state-pivot`**     | `#af52de` | `#bf5af2` | **算法演练-基准值 (Pivot)**：专属紫色标识 |

---

## 3. 字体与排版网格 (Typography & Spacing)

采用以 **SF Pro** 为核心的高清晰度现代字体栈：
`font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;`

* **Hero Display**：`56px / LineHeight 1.07 / LetterSpacing -0.28px / Weight 600`，用于官网首页震撼标语；
* **Display Large**：`40px / LineHeight 1.1 / Weight 600`，用于算法工作台大标题；
* **Tagline / Subhead**：`21px / LineHeight 1.19 / Weight 500`，段落导言；
* **Body Text**：`17px / LineHeight 1.47 / Weight 400`，算法深度文档与正文阅读；
* **Code / Metrics**：`SF Mono, Menlo, monospace`，等宽数字字体，确保指标计数变动时不引起排版抖动（`font-variant-numeric: tabular-nums`）。

---

## 4. GSAP 算法动效标准 (Animation Standard)

为保证长时间算法推演不造成视觉疲劳，算法动效遵循以下物理参数标准：

1. **缓动函数 (Easing)**：
   - 交换位移：采用 `power2.out` 或 `back.out(1.2)`，呈现自然物理惯性感；
   - 颜色渐变过渡：采用 `power1.inOut`，时长控制在 `150ms ~ 250ms`；
2. **动效自适应调速**：
   - 当播放速度达到 `2.0x` 或 `4.0x` 时，自动简化辅助动效，优先保障关键指针与数值实时落位，彻底杜绝动画队列堆积导致的帧率暴跌。
3. **无障碍动效退化 (prefers-reduced-motion)**：
   - 当检测到用户开启“减少动态效果”偏好时，关闭过度位移动效，以即时颜色切换替代柱体飞行动画。

---

## 5. 无障碍 (a11y) 守则

* **键盘全功能操作**：全站所有控制（播放、单步、重置、调速）均支持标准键盘快捷键（如空格键播放/暂停，左右方向键单步步进）；
* **辅助读屏与色彩独立**：算法柱体必须提供 `aria-label="数值: 42, 状态: 比较中, 索引: 3"`，且禁止以唯一颜色表达信息，柱体顶部常驻数值标注。
