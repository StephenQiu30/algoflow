'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SiteLogo } from './site-logo'
import { Menus } from './menus'
import { MobileMenuContent } from './mobile-menu-content'
import { HeaderActions } from './header-actions'
export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  return (
    <header className="bg-background sticky top-0 z-40 w-full">
      <div className="page-container flex h-16 items-center gap-2 lg:gap-6">
        <SiteLogo />
        <div className="hidden lg:block">
          <Menus />
        </div>
        <div className="ml-auto">
          <HeaderActions authModalOpen={authOpen} onAuthModalOpenChange={setAuthOpen} />
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="打开导航菜单">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle>站点导航</SheetTitle>
            <SheetDescription className="sr-only">选择学习或社区页面</SheetDescription>
            <MobileMenuContent onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
