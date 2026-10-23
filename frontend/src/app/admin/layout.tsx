import type { ReactNode } from 'react'
import { AccessGate } from '@/components/design/access-gate'
export const metadata = { title: '运营管理' }
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AccessGate admin>{children}</AccessGate>
}
