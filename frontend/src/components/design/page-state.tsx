import { CircleAlert, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

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
  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center" role={loading ? 'status' : undefined} aria-live="polite">
      {loading ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <CircleAlert aria-hidden="true" />
      )}
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
      {children}
    </div>
  )
}
