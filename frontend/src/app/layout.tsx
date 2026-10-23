import { SiteLayout } from '@/components/layout/site-layout'
import { RootProviders } from '@/components/providers/root-providers'
import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export const metadata: Metadata = {
  title: { default: '衍序 AlgoFlow', template: '%s · 衍序 AlgoFlow' },
  description: '面向排序算法教学的交互式可视化课堂。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} bg-background text-foreground min-h-screen font-sans antialiased`}
      >
        <RootProviders>
          <SiteLayout>{children}</SiteLayout>
        </RootProviders>
      </body>
    </html>
  )
}
