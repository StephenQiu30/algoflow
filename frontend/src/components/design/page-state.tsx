import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
export function PageState({
  title,
  description,
  loading = false,
  children,
}: {
  title: string
  description?: string
  loading?: boolean
  children?: ReactNode
}) {
  if (loading)
    return (
      <div className="page-container flex flex-col gap-4 py-12" role="status" aria-label={title}>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <span className="sr-only">{title}</span>
      </div>
    )
  return (
    <Empty className="min-h-64">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>
          <h2>{title}</h2>
        </EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  )
}
