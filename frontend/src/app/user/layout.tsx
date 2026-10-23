import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '个人中心',
  description: '管理您的个人资料和设置。',
}

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
