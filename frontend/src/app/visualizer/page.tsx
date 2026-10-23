'use client'
import dynamic from 'next/dynamic'
import { PageState } from '@/components/design/page-state'
const Workbench = dynamic(() => import('@/components/sorting/workbench'), {
  ssr: false,
  loading: () => <PageState title="正在加载演练" loading />,
})
export default function Page() {
  return <Workbench />
}
