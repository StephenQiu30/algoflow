'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

const menuItems = [
  { title: '学习首页', href: '/', activePrefix: '' },
  { title: '算法大厅', href: '/sorting', activePrefix: '/sorting' },
  { title: '题解社区', href: '/blog', activePrefix: '/blog' },
  { title: '我的学习', href: '/user/profile', activePrefix: '/user' },
]

export function Menus({
  className,
  vertical = false,
  onNavigate,
}: {
  className?: string
  vertical?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  return (
    <NavigationMenu
      aria-label="主导航"
      orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn(vertical && 'w-full max-w-none justify-start', className)}
    >
      <NavigationMenuList className={cn('gap-1', vertical && 'w-full flex-col items-stretch')}>
        {menuItems.map(item => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.activePrefix)
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild active={active}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={onNavigate}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'min-h-11',
                    vertical && 'w-full justify-start'
                  )}
                >
                  {item.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
