'use client'

import * as React from 'react'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SiteLogo } from '@/components/header/site-logo'
import { Menus } from '@/components/header/menus'
import { MobileMenuContent } from '@/components/header/mobile-menu-content'
import { HeaderActions } from '@/components/header/header-actions'

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <header
      className="bg-background border-border sticky top-0 z-40 w-full border-b"
    >
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu data-icon="inline-start" />
                <span className="sr-only">打开导航菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs overflow-y-auto">
              <SheetTitle className="sr-only">站点导航</SheetTitle>
              <MobileMenuContent onClose={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          <SiteLogo showText={true} className="hidden shrink-0 sm:flex" />
          <SiteLogo showText={false} className="shrink-0 sm:hidden" />
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <Menus />
        </div>

        <div className="flex items-center justify-end">
          <HeaderActions authModalOpen={authModalOpen} onAuthModalOpenChange={setAuthModalOpen} />
        </div>
      </div>
    </header>
  )
}
