import { DocumentDetail } from '@/components/admin/knowledge-tools'
export default function Page(props: { params: Promise<{ id: string }> }) {
  return <DocumentDetail {...props} />
}
