import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '排序可视化课堂 · 排序算法',
  description: '排序算法的交互式可视化与教学。',
}

export default function SortingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Background stays in layout for smooth transitions */}
      <div className="fixed inset-0 -z-10 bg-background bg-linear-to-br from-primary/5 via-background to-background" />

      {/* Content wrapper */}
      <div className="relative z-0">{children}</div>
    </div>
  )
}
