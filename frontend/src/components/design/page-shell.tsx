import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
export function PageShell({
  title,
  description,
  back,
  actions,
  children,
  className,
}: {
  title: string
  description?: string
  back?: { href: string; label: string }
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('page-container flex flex-col gap-6 py-6 lg:py-8', className)}>
      {back && (
        <div>
          <Button asChild variant="ghost">
            <Link href={back.href}>
              <ArrowLeft data-icon="inline-start" />
              {back.label}
            </Link>
          </Button>
        </div>
      )}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-[32px] leading-normal font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground leading-7">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  )
}
export function ModuleEntries({
  entries,
}: {
  entries: { title: string; description: string; href: string }[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(e => (
        <Card key={e.href} className="bg-muted flex flex-row items-center">
          <CardHeader className="min-w-0 flex-1 p-4">
            <CardTitle className="text-sm">{e.title}</CardTitle>
            <CardDescription className="text-xs">{e.description}</CardDescription>
          </CardHeader>
          <CardFooter className="p-4 pl-0">
            <Button asChild variant="ghost" size="icon">
              <Link href={e.href} aria-label={`进入${e.title}`}>
                <ArrowRight />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
