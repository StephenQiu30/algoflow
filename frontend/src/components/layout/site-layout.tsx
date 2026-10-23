import { Suspense, type ReactNode } from 'react'
import { SiteHeader } from '@/components/header/site-header'
import { Footer } from '@/components/footer/footer'

/** Shared application shell; interactive controls stay in the header's client leaves. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        跳转到主要内容
      </a>
      <SiteHeader />
      <main id="main-content" className="min-w-0 flex-1 scroll-mt-20" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="page-container py-12" role="status">
              正在加载…
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
