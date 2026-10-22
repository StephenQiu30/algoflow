# 衍序 · AlgoFlow 设计规范

更新：2026-10-22。全局设计规范唯一维护于 docs；前端 DESIGN.md 仅作入口。

- [视觉与动效基线](design/02-Apple极简视觉与高帧率动效设计.md)
- [顶部布局、shadcn 组件与完整页面规范](design/05-shadcn顶部布局与全站交互规范.md)
- [Figma 设计文件](https://www.figma.com/design/cMWO5SCKWFqJafxME0yhFz)

以内容为中心，使用 shadcn/ui 的 Radix primitives。教学端和管理端共用顶部导航、语义 Token 与基础组件；管理路由统一位于 frontend/src/app/admin/。

Action Blue #0066cc 为亮色主交互色。布局为白色画布、轻描边与有限层级，禁止装饰性渐变、厚重阴影及无意义闪烁。工具页面遵循控件密度与可访问性要求，不照搬营销网站大图与超大留白。

设计稿与示例数据不是业务上线或接口验收证明。实现、测试与产品验收分别记录。
