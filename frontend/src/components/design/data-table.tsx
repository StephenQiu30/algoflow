'use client'
import { useState, useEffect, type ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, Columns3, MoreHorizontal } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { PageState } from './page-state'
import { useListQuery } from '@/hooks/use-list-query'

export type DataRecord = Record<string, unknown> & { id?: string | number }
export type DataColumn = {
  key: string
  label: string
  sortable?: boolean
  render?: (row: DataRecord) => ReactNode
}
export function DataTable({
  rows,
  columns,
  total,
  loading,
  error,
  retry,
  onOpen,
  actions,
  query,
  statuses = [],
}: {
  rows: DataRecord[]
  columns: DataColumn[]
  total: number | null
  loading?: boolean
  error?: string
  retry?: () => void
  onOpen?: (row: DataRecord) => void
  actions?: (row: DataRecord) => ReactNode
  query: ReturnType<typeof useListQuery>
  statuses?: { value: string; label: string }[]
}) {
  'use no memo'
  const [visibility, setVisibility] = useState<VisibilityState>({})
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [search, setSearch] = useState(query.q)
  const defs: ColumnDef<DataRecord>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label="选择本页全部记录"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`选择 ${String(row.original[columns[0].key] ?? '记录')}`}
          checked={row.getIsSelected()}
          onCheckedChange={v => row.toggleSelected(!!v)}
        />
      ),
      enableHiding: false,
    },
    ...columns.map(c => ({
      id: c.key,
      accessorFn: (row: DataRecord) => row[c.key],
      header: () =>
        c.sortable ? (
          <Button
            variant="ghost"
            onClick={() =>
              query.update({
                sort: c.key,
                order: query.sort === c.key && query.order === 'descend' ? 'ascend' : 'descend',
                page: 1,
              })
            }
          >
            {c.label}
            <ArrowUpDown data-icon="inline-end" />
          </Button>
        ) : (
          c.label
        ),
      cell: ({ row }: { row: { original: DataRecord } }) =>
        c.render ? c.render(row.original) : formatValue(c.key, row.original[c.key]),
    })),
    {
      id: 'actions',
      enableHiding: false,
      header: () => <span className="sr-only">操作</span>,
      cell: ({ row }) => (
        <RowActions row={row.original} onOpen={onOpen}>
          {actions?.(row.original)}
        </RowActions>
      ),
    },
  ]
  // This component opts out of React Compiler above; TanStack owns mutable table state.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns: defs,
    state: { columnVisibility: visibility, rowSelection: selection },
    onColumnVisibilityChange: setVisibility,
    onRowSelectionChange: setSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: (row, index) => String(row.id ?? index),
  })
  const pages = total === null ? null : Math.max(1, Math.ceil(total / query.pageSize))
  const disabled = !!loading || !!error || total === null
  useEffect(() => {
    if (!loading && !error && pages !== null && query.page > pages) query.update({ page: pages })
  }, [loading, error, pages, query])
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={e => {
            e.preventDefault()
            query.update({ q: search, page: 1 })
          }}
          className="flex w-full min-w-0 gap-2 sm:w-auto sm:max-w-sm sm:flex-1"
        >
          <Input
            aria-label="搜索记录"
            placeholder="搜索名称…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>
        {statuses.length > 0 && (
          <Select
            value={query.status}
            onValueChange={value => query.update({ status: value, page: 1 })}
          >
            <SelectTrigger aria-label="筛选状态" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">所有状态</SelectItem>
                {statuses.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ml-auto" variant="ghost" aria-label="显示列">
              <Columns3 data-icon="inline-start" />
              <span className="hidden sm:inline">显示列</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>显示字段</DropdownMenuLabel>
            <DropdownMenuGroup>
              {table
                .getAllLeafColumns()
                .filter(c => c.getCanHide())
                .map(c => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={c.getIsVisible()}
                    onCheckedChange={value => c.toggleVisibility(!!value)}
                  >
                    {columns.find(x => x.key === c.id)?.label}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {Object.keys(selection).length > 0 && (
        <p className="text-muted-foreground text-sm" aria-live="polite">
          已选择 {table.getSelectedRowModel().rows.length} 项（本页）
        </p>
      )}
      {loading ? (
        <PageState title="正在加载记录" loading />
      ) : error ? (
        <PageState title="记录加载失败" description={error}>
          <Button variant="secondary" onClick={retry}>
            重试
          </Button>
        </PageState>
      ) : rows.length === 0 ? (
        <PageState title="暂无记录" description="可以调整搜索或筛选条件。">
          <Button
            variant="ghost"
            onClick={() => query.update({ q: undefined, status: undefined, page: 1 })}
          >
            清除筛选
          </Button>
        </PageState>
      ) : (
        <>
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(g => (
                  <TableRow key={g.id}>
                    {g.headers.map(h => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder
                          ? null
                          : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                    {row.getVisibleCells().map(c => (
                      <TableCell key={c.id}>
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-6 lg:hidden">
            {rows.map((row, index) => (
              <article key={String(row.id ?? index)} className="flex flex-col gap-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 text-base font-medium break-words">
                    {String(row[columns[0].key] ?? '未命名记录')}
                  </h2>
                  <RowActions row={row} onOpen={onOpen}>
                    {actions?.(row)}
                  </RowActions>
                </div>
                <dl className="grid gap-2 text-sm">
                  {columns
                    .slice(1)
                    .filter(c => visibility[c.key] !== false)
                    .map(c => (
                      <div key={c.key} className="flex flex-wrap gap-x-2">
                        <dt className="text-muted-foreground">{c.label}</dt>
                        <dd className="min-w-0 break-words">
                          {c.render ? c.render(row) : formatValue(c.key, row[c.key])}
                        </dd>
                      </div>
                    ))}
                </dl>
                {onOpen && (
                  <div className="flex justify-end">
                    <Button variant="ghost" onClick={() => onOpen(row)}>
                      查看详情
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {total === null
            ? '总数暂不可用'
            : total === 0
              ? '0 项'
              : `显示 ${(query.page - 1) * query.pageSize + 1}–${Math.min(query.page * query.pageSize, total)}，共 ${total} 项`}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Select
            value={String(query.pageSize)}
            onValueChange={v => query.update({ pageSize: Number(v), page: 1 })}
          >
            <SelectTrigger aria-label="每页条数" className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[5, 10, 20].map(n => (
                  <SelectItem key={n} value={String(n)}>
                    每页 {n}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Pagination aria-label="记录分页" className="w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="上一页"
                  disabled={disabled || query.page <= 1}
                  onClick={() => query.update({ page: query.page - 1 })}
                >
                  <ChevronLeft />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span
                  className="bg-muted inline-flex min-h-11 items-center rounded-md px-3 text-sm"
                  aria-current="page"
                >
                  {query.page} / {pages ?? '—'}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="下一页"
                  disabled={disabled || pages === null || query.page >= pages}
                  onClick={() => query.update({ page: query.page + 1 })}
                >
                  <ChevronRight />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
function RowActions({
  row,
  onOpen,
  children,
}: {
  row: DataRecord
  onOpen?: (row: DataRecord) => void
  children?: ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="记录操作">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {onOpen && <DropdownMenuItem onSelect={() => onOpen(row)}>查看详情</DropdownMenuItem>}
          {children}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatValue(key: string, value: unknown) {
  if (value === undefined || value === null) return '—'
  if ((key.endsWith('Time') || key === 'updated') && typeof value === 'string') {
    const date = new Date(value)
    if (!Number.isNaN(date.valueOf()))
      return new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date)
  }
  return String(value)
}
