'use client'

import { readRagEvents, normalizeSources, safeStorage, type RagSource } from '@/lib/ragStream'
import { listKnowledgeBaseVoByPage } from '@/api/ai/knowledgeBaseController'
import { MarkdownRender } from '@/components/blog/markdown-render'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAppSelector } from '@/store/hooks'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import request from '@/lib/request'
import { MessageCircle, MessageSquarePlus, Send } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: RagSource[]
  interrupted?: boolean
  webSearchTriggered?: boolean
}

type KnowledgeBaseRecord = {
  id: string
  name?: string
  description?: string
  [key: string]: unknown
}

type ThreadStatus = 'idle' | 'streaming' | 'completed'

type ThreadSummary = {
  threadId: string
  conversationId: string
  knowledgeBaseId: string
  title: string
  preview: string
  updatedAt: number
  lastActive: number
}

type ThreadDetail = ThreadSummary & {
  status: ThreadStatus
  messages: Message[]
}

const STORAGE_VERSION = 'v1'
const CLIENT_ID_STORAGE_KEY = `rag-chat-client-id:${STORAGE_VERSION}`

const cleanMessageContent = (content: string) => content.trim()

const getStringValue = (value: unknown) => (typeof value === 'string' ? value : '')

const truncateText = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value

const sortThreadSummaries = (threads: ThreadSummary[]) =>
  [...threads].sort((a, b) => b.lastActive - a.lastActive)

const parseJson = <T,>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback
  }
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const createMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const createThreadId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const getThreadsStorageKey = (userKey: string) => `rag_threads:${STORAGE_VERSION}:${userKey}`

const getThreadDetailStorageKey = (userKey: string, threadId: string) =>
  `rag_thread_detail:${STORAGE_VERSION}:${userKey}:${threadId}`

const getActiveThreadStorageKey = (userKey: string, knowledgeBaseId: string) =>
  `rag_active_thread:${STORAGE_VERSION}:${userKey}:${knowledgeBaseId}`

const getKnowledgeBaseSelectionKey = (userKey: string) =>
  `rag_selected_kb:${STORAGE_VERSION}:${userKey}`

const getGuestClientId = () => {
  if (typeof window === 'undefined') {
    return ''
  }
  const cachedId = safeStorage.getItem(CLIENT_ID_STORAGE_KEY)
  if (cachedId) {
    return cachedId
  }
  const nextId = createThreadId()
  safeStorage.setItem(CLIENT_ID_STORAGE_KEY, nextId)
  return nextId
}

const createWelcomeMessage = (algorithmName: string): Message => ({
  id: createMessageId(),
  role: 'assistant',
  content: `可以结合 **${algorithmName}** 的当前步骤，提问比较、交换与排序原理。`,
})

const createInterruptedMessage = (): Message => ({
  id: createMessageId(),
  role: 'assistant',
  content: '上次回答被中断，可继续提问。',
})

const buildThreadTitle = (messages: Message[]) => {
  const firstUserMessage = messages.find(message => message.role === 'user')
  const content = firstUserMessage ? cleanMessageContent(firstUserMessage.content) : ''
  return content ? truncateText(content, 24) : '新对话'
}

const buildThreadPreview = (messages: Message[]) => {
  const hasUserMessage = messages.some(message => message.role === 'user')
  if (!hasUserMessage) {
    return '从这里开始新的问题'
  }
  const latestMessage = [...messages]
    .reverse()
    .find(message => cleanMessageContent(message.content))
  if (!latestMessage) {
    return '从这里开始新的问题'
  }
  return truncateText(cleanMessageContent(latestMessage.content), 40)
}

const buildThreadSummary = (thread: ThreadDetail): ThreadSummary => ({
  threadId: thread.threadId,
  conversationId: thread.conversationId,
  knowledgeBaseId: thread.knowledgeBaseId,
  title: buildThreadTitle(thread.messages),
  preview: buildThreadPreview(thread.messages),
  updatedAt: thread.updatedAt,
  lastActive: thread.lastActive,
})

const hydrateThreadAfterInterrupt = (thread: ThreadDetail): ThreadDetail => {
  if (thread.status !== 'streaming') {
    return thread
  }
  const messages = [...thread.messages]
  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === 'assistant') {
    const interruptedNote = '上次回答被中断，可继续提问。'
    const hasInterruptedNote = lastMessage.content.includes(interruptedNote)
    messages[messages.length - 1] = {
      ...lastMessage,
      content: hasInterruptedNote
        ? lastMessage.content
        : `${lastMessage.content}${lastMessage.content ? '\n\n' : ''}> ${interruptedNote}`,
    }
  } else {
    messages.push(createInterruptedMessage())
  }
  const updatedThread: ThreadDetail = {
    ...thread,
    status: 'completed',
    updatedAt: Date.now(),
    lastActive: Date.now(),
    messages,
  }
  const summary = buildThreadSummary(updatedThread)
  return {
    ...updatedThread,
    title: summary.title,
    preview: summary.preview,
    updatedAt: summary.updatedAt,
    lastActive: summary.lastActive,
  }
}

export function RAGChatPanel({
  algorithmName,
  teachingContext,
}: {
  algorithmName: string
  teachingContext?: Record<string, unknown>
}) {
  const { user } = useAppSelector(state => state.user)
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isKnowledgeBaseLoading, setIsKnowledgeBaseLoading] = useState(false)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseRecord[]>([])
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState('')
  const [statusText, setStatusText] = useState('')
  const [clientId, setClientId] = useState('')
  const [threadSummaries, setThreadSummaries] = useState<ThreadSummary[]>([])
  const [currentThread, setCurrentThread] = useState<ThreadDetail | null>(null)
  const [kbState, setKbState] = useState<'idle' | 'loading' | 'ready' | 'empty' | 'error'>('idle')
  const [enableWebSearch, setEnableWebSearch] = useState(false)
  const streamControllerRef = useRef<AbortController | null>(null)
  const messageAreaRef = useRef<HTMLDivElement>(null)
  const followMessagesRef = useRef(true)

  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const threadSummariesRef = useRef<ThreadSummary[]>([])
  const currentThreadRef = useRef<ThreadDetail | null>(null)

  const userStorageKey = useMemo(() => {
    if (user?.id) {
      return `user:${String(user.id)}`
    }
    if (clientId) {
      return `guest:${clientId}`
    }
    return ''
  }, [clientId, user?.id])

  const userConversationKey = useMemo(() => {
    if (user?.id) {
      return String(user.id)
    }
    return clientId
  }, [clientId, user?.id])

  const visibleThreads = useMemo(
    () =>
      sortThreadSummaries(
        threadSummaries.filter(thread => thread.knowledgeBaseId === selectedKnowledgeBaseId)
      ),
    [selectedKnowledgeBaseId, threadSummaries]
  )

  useEffect(() => {
    threadSummariesRef.current = threadSummaries
  }, [threadSummaries])

  useEffect(() => {
    currentThreadRef.current = currentThread
  }, [currentThread])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    setClientId(getGuestClientId())
  }, [])

  useEffect(() => {
    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current)
      }
    }
  }, [])

  const readThreadSummaries = (storageKey: string) =>
    sortThreadSummaries(
      parseJson<ThreadSummary[]>(
        typeof window === 'undefined'
          ? null
          : safeStorage.getItem(getThreadsStorageKey(storageKey)),
        []
      )
    )

  const writeThreadSummaries = (storageKey: string, summaries: ThreadSummary[]) => {
    if (typeof window === 'undefined') {
      return
    }
    safeStorage.setItem(
      getThreadsStorageKey(storageKey),
      JSON.stringify(sortThreadSummaries(summaries))
    )
  }

  const readThreadDetail = (storageKey: string, threadId: string) =>
    parseJson<ThreadDetail | null>(
      typeof window === 'undefined'
        ? null
        : safeStorage.getItem(getThreadDetailStorageKey(storageKey, threadId)),
      null
    )

  const writeThreadDetail = (storageKey: string, detail: ThreadDetail) => {
    if (typeof window === 'undefined') {
      return
    }
    safeStorage.setItem(
      getThreadDetailStorageKey(storageKey, detail.threadId),
      JSON.stringify(detail)
    )
  }

  const setActiveThreadId = (storageKey: string, knowledgeBaseId: string, threadId: string) => {
    if (typeof window === 'undefined') {
      return
    }
    safeStorage.setItem(getActiveThreadStorageKey(storageKey, knowledgeBaseId), threadId)
  }

  const getActiveThreadId = (storageKey: string, knowledgeBaseId: string) =>
    typeof window === 'undefined'
      ? ''
      : safeStorage.getItem(getActiveThreadStorageKey(storageKey, knowledgeBaseId)) || ''

  const scheduleThreadDetailPersist = React.useCallback(
    (storageKey: string, detail: ThreadDetail) => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current)
      }
      persistTimeoutRef.current = setTimeout(() => {
        writeThreadDetail(storageKey, detail)
      }, 180)
    },
    []
  )

  const persistThread = React.useCallback(
    (
      detail: ThreadDetail,
      options?: {
        persistMode?: 'immediate' | 'debounced'
        setActive?: boolean
      }
    ) => {
      if (!userStorageKey) {
        return
      }
      const summary = buildThreadSummary(detail)
      const normalizedDetail: ThreadDetail = {
        ...detail,
        title: summary.title,
        preview: summary.preview,
        updatedAt: summary.updatedAt,
        lastActive: summary.lastActive,
      }
      const existingSummaries = threadSummariesRef.current.filter(
        item => item.threadId !== normalizedDetail.threadId
      )
      const nextSummaries = sortThreadSummaries([...existingSummaries, summary])
      threadSummariesRef.current = nextSummaries
      setThreadSummaries(nextSummaries)
      currentThreadRef.current = normalizedDetail
      setCurrentThread(normalizedDetail)
      writeThreadSummaries(userStorageKey, nextSummaries)
      if (options?.setActive !== false) {
        setActiveThreadId(
          userStorageKey,
          normalizedDetail.knowledgeBaseId,
          normalizedDetail.threadId
        )
      }
      if (options?.persistMode === 'debounced') {
        scheduleThreadDetailPersist(userStorageKey, normalizedDetail)
      } else {
        writeThreadDetail(userStorageKey, normalizedDetail)
      }
    },
    [scheduleThreadDetailPersist, userStorageKey]
  )

  const activateThread = React.useCallback(
    (detail: ThreadDetail) => {
      if (!userStorageKey) {
        return
      }
      const normalizedThread = hydrateThreadAfterInterrupt(detail)
      const nextLastActive = Date.now()
      const nextThread: ThreadDetail = {
        ...normalizedThread,
        lastActive: nextLastActive,
        updatedAt: Math.max(normalizedThread.updatedAt, nextLastActive),
      }
      const existingSummaries = threadSummariesRef.current.filter(
        item => item.threadId !== nextThread.threadId
      )
      const nextSummary = buildThreadSummary(nextThread)
      const nextSummaries = sortThreadSummaries([...existingSummaries, nextSummary])
      threadSummariesRef.current = nextSummaries
      setThreadSummaries(nextSummaries)
      setCurrentThread(nextThread)
      writeThreadSummaries(userStorageKey, nextSummaries)
      writeThreadDetail(userStorageKey, nextThread)
      setActiveThreadId(userStorageKey, nextThread.knowledgeBaseId, nextThread.threadId)
    },
    [userStorageKey]
  )

  const createThread = React.useCallback(
    (knowledgeBaseId: string) => {
      if (!userStorageKey || !userConversationKey) {
        return
      }
      const now = Date.now()
      const threadId = createThreadId()
      const welcomeMessage = createWelcomeMessage(algorithmName)
      const detail: ThreadDetail = {
        threadId,
        conversationId: `rag:${userConversationKey}:${knowledgeBaseId}:${threadId}`,
        knowledgeBaseId,
        title: '新对话',
        preview: '从这里开始新的问题',
        updatedAt: now,
        lastActive: now,
        status: 'completed',
        messages: [welcomeMessage],
      }
      persistThread(detail, { persistMode: 'immediate', setActive: true })
    },
    [algorithmName, persistThread, userConversationKey, userStorageKey]
  )

  const restoreThreadForKnowledgeBase = React.useCallback(
    (knowledgeBaseId: string) => {
      if (!userStorageKey || !knowledgeBaseId) {
        return
      }
      const summaries = readThreadSummaries(userStorageKey)
      threadSummariesRef.current = summaries
      setThreadSummaries(summaries)

      const relevantThreads = summaries.filter(thread => thread.knowledgeBaseId === knowledgeBaseId)
      const activeThreadId = getActiveThreadId(userStorageKey, knowledgeBaseId)
      const targetSummary =
        relevantThreads.find(thread => thread.threadId === activeThreadId) || relevantThreads[0]

      if (!targetSummary) {
        createThread(knowledgeBaseId)
        return
      }

      const detail = readThreadDetail(userStorageKey, targetSummary.threadId)
      if (!detail) {
        createThread(knowledgeBaseId)
        return
      }

      activateThread(detail)
    },
    [userStorageKey, activateThread, createThread]
  )

  const handleCreateThread = () => {
    if (isLoading || !selectedKnowledgeBaseId) {
      return
    }
    createThread(selectedKnowledgeBaseId)
  }

  const handleSwitchThread = (threadId: string) => {
    if (isLoading || !userStorageKey || threadId === currentThread?.threadId) {
      return
    }
    const detail = readThreadDetail(userStorageKey, threadId)
    if (!detail) {
      return
    }
    activateThread(detail)
  }

  useEffect(() => {
    if (!isOpen || kbState !== 'idle') {
      return
    }

    const fetchKnowledgeBases = async () => {
      setKbState('loading')
      setIsKnowledgeBaseLoading(true)
      try {
        const res = await listKnowledgeBaseVoByPage({
          current: 1,
          pageSize: 100,
        })
        if (res.code !== 0) throw new Error(res.message || '知识库加载失败')
        const records = Array.isArray(res?.data?.records) ? res.data.records : []
        const normalizedRecords = records
          .filter(
            (item): item is Record<string, unknown> =>
              !!item && typeof item === 'object' && 'id' in item && item.id != null
          )
          .map(item => ({
            ...item,
            id: String(item.id),
          })) as KnowledgeBaseRecord[]

        setKnowledgeBases(normalizedRecords)
        setKbState(normalizedRecords.length ? 'ready' : 'empty')
      } catch (error) {
        setKbState('error')
        console.error('Failed to fetch knowledge base list:', error)
        setStatusText('知识库列表加载失败，请稍后重试。')
      } finally {
        setIsKnowledgeBaseLoading(false)
      }
    }

    fetchKnowledgeBases()
  }, [kbState, isOpen])

  useEffect(() => {
    if (!isOpen || !userStorageKey || knowledgeBases.length === 0) {
      return
    }
    const cachedKnowledgeBaseId =
      typeof window === 'undefined'
        ? ''
        : safeStorage.getItem(getKnowledgeBaseSelectionKey(userStorageKey)) || ''
    const resolvedKnowledgeBaseId =
      knowledgeBases.find(item => item.id === cachedKnowledgeBaseId)?.id ||
      knowledgeBases[0]?.id ||
      ''
    if (
      resolvedKnowledgeBaseId &&
      !knowledgeBases.some(item => item.id === selectedKnowledgeBaseId)
    ) {
      setSelectedKnowledgeBaseId(resolvedKnowledgeBaseId)
    }
  }, [isOpen, knowledgeBases, selectedKnowledgeBaseId, userStorageKey])

  useEffect(() => {
    if (!isOpen || !userStorageKey || !selectedKnowledgeBaseId) {
      return
    }
    if (typeof window !== 'undefined') {
      safeStorage.setItem(getKnowledgeBaseSelectionKey(userStorageKey), selectedKnowledgeBaseId)
    }
    restoreThreadForKnowledgeBase(selectedKnowledgeBaseId)
  }, [isOpen, restoreThreadForKnowledgeBase, selectedKnowledgeBaseId, userStorageKey])

  useEffect(() => {
    if (!isOpen) streamControllerRef.current?.abort()
    return () => streamControllerRef.current?.abort()
  }, [isOpen, userStorageKey])

  const handleSend = async () => {
    if (
      !input.trim() ||
      isLoading ||
      streamControllerRef.current ||
      !selectedKnowledgeBaseId ||
      !currentThread
    )
      return

    const question = input.trim()
    const assistantMessageId = createMessageId()
    const nextThreadBeforeStream: ThreadDetail = {
      ...currentThread,
      status: 'streaming',
      updatedAt: Date.now(),
      lastActive: Date.now(),
      messages: [
        ...currentThread.messages,
        {
          id: createMessageId(),
          role: 'user',
          content: question,
        },
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
        },
      ],
    }

    persistThread(nextThreadBeforeStream, {
      persistMode: 'immediate',
      setActive: true,
    })
    setInput('')
    setIsLoading(true)
    setStatusText('正在准备知识库检索...')

    const controller = new AbortController()
    streamControllerRef.current = controller
    let timedOut = false
    let terminalEvent = false
    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 120_000)
    try {
      const response = await request<ReadableStream<Uint8Array>>('/ai/rag/ask/stream/events', {
        method: 'POST',
        adapter: 'fetch',
        responseType: 'stream',
        timeout: 0,
        transformResponse: [(data: unknown) => data],
        signal: controller.signal,
        data: {
          question,
          knowledgeBaseId: selectedKnowledgeBaseId,
          topK: 5,
          conversationId: nextThreadBeforeStream.conversationId,
          enableWebSearchFallback: enableWebSearch,
          teachingContext,
        },
      })
      if (!response || typeof response.getReader !== 'function')
        throw new Error('当前浏览器无法读取流式回答。')
      for await (const eventData of readRagEvents(response)) {
        if (currentThreadRef.current?.threadId !== nextThreadBeforeStream.threadId) {
          controller.abort()
          return
        }
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError')
        const eventType = getStringValue(eventData.type)
        if (eventType === 'start' || eventType === 'retrieval' || eventType === 'generation') {
          setStatusText(getStringValue(eventData.message))
          continue
        }

        if (eventType === 'fallback') {
          setStatusText('知识库信息不足，已切换联网搜索。')
          const fallbackThread: ThreadDetail = {
            ...(currentThreadRef.current || nextThreadBeforeStream),
            messages: (currentThreadRef.current || nextThreadBeforeStream).messages.map(message =>
              message.id === assistantMessageId ? { ...message, webSearchTriggered: true } : message
            ),
          }
          persistThread(fallbackThread, {
            persistMode: 'debounced',
            setActive: true,
          })
          continue
        }

        if (eventType === 'answer') {
          const delta = getStringValue(eventData.content)
          if (!delta) continue
          const baseThread = currentThreadRef.current || nextThreadBeforeStream
          const answerThread: ThreadDetail = {
            ...baseThread,
            status: 'streaming',
            updatedAt: Date.now(),
            lastActive: Date.now(),
            messages: baseThread.messages.map(message =>
              message.id === assistantMessageId
                ? { ...message, content: message.content + delta }
                : message
            ),
          }
          persistThread(answerThread, {
            persistMode: 'debounced',
            setActive: true,
          })
          continue
        }

        if (eventType === 'done') {
          terminalEvent = true
          setStatusText('')
          const baseThread = currentThreadRef.current || nextThreadBeforeStream
          const completedThread: ThreadDetail = {
            ...baseThread,
            status: 'completed',
            updatedAt: Date.now(),
            lastActive: Date.now(),
            messages: baseThread.messages.map(message =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    sources: normalizeSources(eventData.sources),
                    webSearchTriggered:
                      Boolean(eventData.webSearchTriggered) || message.webSearchTriggered,
                  }
                : message
            ),
          }
          persistThread(completedThread, {
            persistMode: 'immediate',
            setActive: true,
          })
          controller.abort()
          break
        }

        if (eventType === 'error') {
          setInput(current => current || question)
          terminalEvent = true
          setStatusText('')
          const errorMessage =
            getStringValue(eventData.message) || '生成过程中出现异常，请稍后再试。'
          const baseThread = currentThreadRef.current || nextThreadBeforeStream
          const erroredThread: ThreadDetail = {
            ...baseThread,
            status: 'completed',
            updatedAt: Date.now(),
            lastActive: Date.now(),
            messages: baseThread.messages.map(message =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    content: message.content
                      ? `${message.content}\n\n${errorMessage}`
                      : errorMessage,
                    interrupted: true,
                  }
                : message
            ),
          }
          persistThread(erroredThread, {
            persistMode: 'immediate',
            setActive: true,
          })
          controller.abort()
          break
        }
      }
      if (!terminalEvent) throw new Error('Stream ended before done')
    } catch (error) {
      if (currentThreadRef.current?.threadId !== nextThreadBeforeStream.threadId) return
      setInput(current => current || question)
      console.error('Failed to send rag message:', error)
      setStatusText('')
      const baseThread = currentThreadRef.current || nextThreadBeforeStream
      const failedThread: ThreadDetail = {
        ...baseThread,
        status: 'completed',
        updatedAt: Date.now(),
        lastActive: Date.now(),
        messages: baseThread.messages.map(message =>
          message.id === assistantMessageId
            ? {
                ...message,
                content:
                  message.content ||
                  (timedOut
                    ? '回答超时，请重试。'
                    : controller.signal.aborted
                      ? '已停止生成，可继续提问。'
                      : error instanceof Error && error.message.includes('登录')
                        ? error.message
                        : '连接中断，请重试。'),
                interrupted: true,
              }
            : message
        ),
      }
      persistThread(failedThread, {
        persistMode: 'immediate',
        setActive: true,
      })
    } finally {
      clearTimeout(timeout)
      // Cancelling Axios's response stream may not close the underlying fetch transport.
      controller.abort()
      if (streamControllerRef.current === controller) streamControllerRef.current = null
      setIsLoading(false)
      setStatusText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const fallbackMessages = useMemo(() => [createWelcomeMessage(algorithmName)], [algorithmName])
  const currentMessages = currentThread?.messages || fallbackMessages
  useEffect(() => {
    const viewport = messageAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (viewport && followMessagesRef.current) viewport.scrollTop = viewport.scrollHeight
  }, [currentMessages, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <MessageCircle data-icon="inline-start" />
          解释当前步骤
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-4 overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>AI 算法导师</DialogTitle>
          <DialogDescription>
            {algorithmName} · 当前第 {Number(teachingContext?.currentStep) || 0}{' '}
            步。回答依据与来源随内容展示。
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>知识库</FieldLabel>
            <Select
              value={selectedKnowledgeBaseId}
              onValueChange={setSelectedKnowledgeBaseId}
              disabled={isLoading || isKnowledgeBaseLoading || !knowledgeBases.length}
            >
              <SelectTrigger aria-label="当前知识库">
                <SelectValue
                  placeholder={isKnowledgeBaseLoading ? '正在加载知识库…' : '选择知识库'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {knowledgeBases.map(k => (
                    <SelectItem value={k.id} key={k.id}>
                      {k.name || '未命名知识库'}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="web-search">知识不足时允许联网搜索</FieldLabel>
            <Switch
              id="web-search"
              checked={enableWebSearch}
              onCheckedChange={setEnableWebSearch}
              disabled={isLoading}
            />
          </Field>
        </FieldGroup>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Select
            value={currentThread?.threadId || ''}
            onValueChange={handleSwitchThread}
            disabled={isLoading || !visibleThreads.length}
          >
            <SelectTrigger aria-label="对话历史" className="max-w-64">
              <SelectValue placeholder="对话历史" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {visibleThreads.map(t => (
                  <SelectItem key={t.threadId} value={t.threadId}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            onClick={handleCreateThread}
            disabled={isLoading || !selectedKnowledgeBaseId}
          >
            <MessageSquarePlus data-icon="inline-start" />
            新对话
          </Button>
        </div>
        <ScrollArea
          ref={messageAreaRef}
          viewportProps={{
            tabIndex: 0,
            role: 'region',
            'aria-label': '导师对话',
            className:
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2',
          }}
          className="h-[min(38dvh,360px)] min-w-0"
          onScrollCapture={e => {
            const viewport = e.target as HTMLElement
            followMessagesRef.current =
              viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 48
          }}
        >
          <div className="flex flex-col gap-6 pr-4">
            {currentMessages.map(message => (
              <article key={message.id} className="flex min-w-0 flex-col gap-2">
                <p className="text-muted-foreground text-xs">
                  {message.role === 'user' ? '你' : 'AI 导师'}
                  {message.interrupted ? ' · 已中断' : ''}
                </p>
                <MarkdownRender content={message.content || '正在生成…'} />
                {message.webSearchTriggered && (
                  <p className="text-muted-foreground text-xs">此回答使用了联网搜索。</p>
                )}
                {message.sources?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((source, index) => (
                      <Dialog key={source.chunkId || index}>
                        <DialogTrigger asChild>
                          <Button variant="secondary">
                            [{index + 1}] {source.documentName || '知识来源'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80dvh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{source.documentName || '知识来源'}</DialogTitle>
                            <DialogDescription>
                              {source.sectionTitle || '相关章节'} · 版本{' '}
                              {source.version || '未提供'}
                            </DialogDescription>
                          </DialogHeader>
                          <MarkdownRender content={source.content || '当前来源没有提供摘录。'} />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                ) : (
                  message.role === 'assistant' &&
                  message.content && (
                    <p className="text-muted-foreground text-xs">未提供可核验的引用来源。</p>
                  )
                )}
              </article>
            ))}
          </div>
        </ScrollArea>
        {statusText && (
          <p role="status" className="text-muted-foreground text-sm">
            {statusText}
          </p>
        )}
        {(kbState === 'error' || kbState === 'empty') && (
          <Alert>
            <AlertDescription>
              {kbState === 'error' ? '知识库列表加载失败。' : '暂无可用知识库。'}
              <Button variant="ghost" onClick={() => setKbState('idle')}>
                重新加载
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="tutor-input">继续提问</FieldLabel>
          <Textarea
            id="tutor-input"
            aria-label="向 AI 提问"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你的疑问…"
            rows={2}
          />
        </Field>
        <div className="flex justify-end gap-2">
          {isLoading ? (
            <Button variant="secondary" onClick={() => streamControllerRef.current?.abort()}>
              停止生成
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim() || !selectedKnowledgeBaseId || !currentThread}
            >
              <Send data-icon="inline-start" />
              发送问题
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
