'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { DataColumn, DataRecord } from './data-table'
import type { ReactNode } from 'react'
export function RecordDetail({
  record,
  columns,
  onClose,
  children,
}: {
  record: DataRecord | null
  columns: DataColumn[]
  onClose: () => void
  children?: ReactNode
}) {
  return (
    <Dialog
      open={!!record}
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {record ? String(record[columns[0].key] ?? '记录详情') : '记录详情'}
          </DialogTitle>
          <DialogDescription>查看当前记录的信息。</DialogDescription>
        </DialogHeader>
        {record && (
          <dl className="flex flex-col gap-4">
            {columns.map(c => (
              <div key={c.key} className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-sm">{c.label}</dt>
                <dd className="break-words">
                  {c.render ? c.render(record) : String(record[c.key] ?? '—')}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
