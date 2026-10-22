import { Footer } from '@/components/footer/footer'
import { SiteHeader } from '@/components/header/site-header'
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
          <div className="flex min-h-screen flex-col">
            <a href="#main-content" className="skip-link">
              跳转到主要内容
            </a>
            <SiteHeader />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </div>
        </RootProviders>
      </body>
    </html>
  )
}
