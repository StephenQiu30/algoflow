import { SiteLayout } from '@/components/layout/site-layout'
import { RootProviders } from '@/components/providers/root-providers'
import type { Metadata } from 'next'
import React from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: '排序可视化课堂',
  description: '面向排序算法教学的交互式可视化课堂。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        <RootProviders>
          <SiteLayout>{children}</SiteLayout>
        </RootProviders>
      </body>
    </html>
  )
}
