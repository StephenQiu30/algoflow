/** Incremental SSE framing: accepts LF, CRLF and CR, including split delimiters. */
export class SSEParser {
  private buffer = ''
  private data: string[] = []
  push(text: string, flush = false): string[] {
    this.buffer += text
    const events: string[] = []
    while (this.buffer.length) {
      const end = this.buffer.search(/[\r\n]/)
      if (end < 0 || (!flush && end === this.buffer.length - 1 && this.buffer[end] === '\r')) break
      const line = this.buffer.slice(0, end)
      const width = this.buffer[end] === '\r' && this.buffer[end + 1] === '\n' ? 2 : 1
      this.buffer = this.buffer.slice(end + width)
      if (line === '') {
        if (this.data.length) events.push(this.data.join('\n'))
        this.data = []
      } else if (line.startsWith('data:')) this.data.push(line.slice(5).replace(/^ /, ''))
    }
    // SSE dispatches only complete events; EOF does not manufacture a missing done event.
    return events
  }
}
export async function* readRagEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader(),
    decoder = new TextDecoder(),
    parser = new SSEParser()
  try {
    while (true) {
      const { value, done } = await reader.read()
      for (const payload of parser.push(
        done ? decoder.decode() : decoder.decode(value, { stream: true }),
        done
      )) {
        if (payload === '[DONE]') {
          yield { type: 'done' }
          return
        }
        const event: unknown = JSON.parse(payload)
        if (event && typeof event === 'object') yield event as Record<string, unknown>
      }
      if (done) return
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
export type RagSource = {
  documentName?: string
  documentId?: string | number
  chunkId?: string
  sectionTitle?: string
  version?: string
  content?: string
  sourceType?: string
  url?: string
}
export function normalizeSources(value: unknown): RagSource[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(item => item && typeof item === 'object')
    .map(
      item =>
        Object.fromEntries(
          Object.entries(item).filter(
            ([key, value]) =>
              [
                'documentName',
                'documentId',
                'chunkId',
                'sectionTitle',
                'version',
                'content',
                'sourceType',
                'url',
              ].includes(key) &&
              (typeof value === 'string' || typeof value === 'number')
          )
        ) as RagSource
    )
}
export const safeStorage = {
  getItem(key: string) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* optional device persistence */
    }
  },
  removeItem(key: string) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* optional device persistence */
    }
  },
}
