# 前端设计规范入口

全局规范唯一来源：[docs/DESIGN.md](../docs/DESIGN.md)。

实现细则：[shadcn 顶部布局与全站交互规范](../docs/design/05-shadcn顶部布局与全站交互规范.md)。

使用现有 shadcn/ui Radix 组件，导入前检查组件已安装；不得创建独立 Admin 工程。主题变量仅在 src/app/globals.css 维护。

此入口替代旧版 Apple 营销页面分析，避免两套视觉规则并存。
