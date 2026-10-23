import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '学习社区',
  description: '分享算法学习笔记与题解，参与讨论。',
}

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
