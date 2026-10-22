# Apple 极简设计系统与视觉规范 (DESIGN.md)

> 本文档为 AlgoFlow 全局视觉规范的主入口，详细规范已升级并收录至：  
> **👉 [02. Design / 02-Apple极简视觉与高帧率动效设计 (docs/design/02-Apple极简视觉与高帧率动效设计.md)](./design/02-Apple极简视觉与高帧率动效设计.md)**

---

## 🎨 核心色彩速查 (Color System)

* **核心交互色 (Action Blue)**：`#0066cc` (Dark: `#2997ff` / Focus: `#0071e3`)
* **文本主色 (Ink)**：`#1d1d1f` (Dark: `#f5f5f7`)
* **次级文字 (Muted)**：`#7a7a7a` (Dark: `#86868b`)
* **算法状态-比较 (Comparing)**：`#f5a623` (暖琥珀色)
* **算法状态-交换 (Swapping)**：`#d0021b` (苹果亮红)
* **算法状态-已排序 (Sorted)**：`#34c759` (翡翠绿)
* **算法状态-基准值 (Pivot)**：`#af52de` (淡紫色)

---

## 📐 排版与动效标准
* **字体规范**：SF Pro Display / SF Pro Text / SF Mono（等宽数字 `font-variant-numeric: tabular-nums`）；
* **动效引擎**：GSAP (GreenSock) 60 FPS 物理插值动效，严格遵守 `prefers-reduced-motion`；
* **设计哲学**：Content First（内容为先），极简留白，发丝细线分割（Hairline `#e0e0e0`），杜绝重阴影与多余眩光渐变。
