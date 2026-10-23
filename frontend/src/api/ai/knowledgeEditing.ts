import request from '@/lib/request'
export type KnowledgeDocument = {
  id: string
  name: string
  status: string
  revision: number
  publishedRevision: number | null
  version?: string
  errorMessage?: string
  chunkCount: number
}
export type ManagedChunk = {
  id: string
  documentId: string
  documentRevision: number
  documentStatus: string
  content: string
  sectionTitle?: string
  sectionPath?: string
  wordCount: number
  draftContent: string | null
  draftSectionTitle: string | null
  draftSectionPath: string | null
}
type Result<T> = { code: number; message?: string; data?: T }
export const getKnowledgeDocument = (id: string) =>
  request<Result<KnowledgeDocument>>('/ai/doc/get/vo', { method: 'GET', params: { id } })
export const listManagedChunks = (body: {
  documentId: string
  current: number
  pageSize: number
  searchText?: string
}) =>
  request<Result<{ records: ManagedChunk[]; total: number }>>('/ai/chunk/manage/page', {
    method: 'POST',
    data: body,
  })
export const getManagedChunk = (id: string) =>
  request<Result<ManagedChunk>>('/ai/chunk/manage/get', { method: 'GET', params: { id } })
export const saveChunkDraft = (body: {
  id: string
  documentId: string
  expectedRevision: number
  content: string
  sectionTitle: string
  sectionPath: string
}) => request<Result<number>>('/ai/chunk/edit', { method: 'POST', data: body })
export const retryDocumentIndex = (id: string, expectedRevision: number) =>
  request<Result<number>>('/ai/doc/retry', { method: 'POST', data: { id, expectedRevision } })
