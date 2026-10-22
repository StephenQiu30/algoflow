'use client'

import { Menus } from '@/components/header/menus'
import { SiteLogo } from '@/components/header/site-logo'

export function MobileMenuContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <SiteLogo onClick={onClose} />
      <Menus vertical onNavigate={onClose} />
    </div>
  )
}
