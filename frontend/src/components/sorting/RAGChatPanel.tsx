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
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  Database,
  Loader2,
  MessageSquarePlus,
  Send,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-react'
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
  content: `你好！我是 AI 算法助手 🤖。关于 **${algorithmName}**，你有什么疑问吗？无论是原理解释还是时间复杂度分析，我都可以为你解答！`,
})

const createInterruptedMessage = (): Message => ({
  id: createMessageId(),
  role: 'assistant',
  content: '上次回答被中断，可继续提问。',
})

const formatThreadTime = (timestamp: number) => {
  if (!timestamp) {
    return ''
  }
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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
  const scrollRef = useRef<HTMLDivElement>(null)
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentThread?.messages, isLoading, statusText])

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

  const deleteThreadDetail = (storageKey: string, threadId: string) => {
    if (typeof window === 'undefined') {
      return
    }
    safeStorage.removeItem(getThreadDetailStorageKey(storageKey, threadId))
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

  const removeActiveThreadId = (storageKey: string, knowledgeBaseId: string) => {
    if (typeof window === 'undefined') {
      return
    }
    safeStorage.removeItem(getActiveThreadStorageKey(storageKey, knowledgeBaseId))
  }

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

  const handleDeleteThread = (threadId: string) => {
    if (isLoading || !userStorageKey) {
      return
    }
    const existingThread = threadSummariesRef.current.find(item => item.threadId === threadId)
    const nextSummaries = sortThreadSummaries(
      threadSummariesRef.current.filter(item => item.threadId !== threadId)
    )
    threadSummariesRef.current = nextSummaries
    setThreadSummaries(nextSummaries)
    deleteThreadDetail(userStorageKey, threadId)
    writeThreadSummaries(userStorageKey, nextSummaries)
    if (existingThread) {
      removeActiveThreadId(userStorageKey, existingThread.knowledgeBaseId)
    }

    if (currentThread?.threadId !== threadId) {
      return
    }

    const nextThread =
      nextSummaries.find(item => item.knowledgeBaseId === selectedKnowledgeBaseId) || null
    if (!nextThread) {
      createThread(selectedKnowledgeBaseId)
      return
    }
    const nextDetail = readThreadDetail(userStorageKey, nextThread.threadId)
    if (!nextDetail) {
      createThread(selectedKnowledgeBaseId)
      return
    }
    activateThread(nextDetail)
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
      const token = typeof window !== 'undefined' ? safeStorage.getItem('token') || '' : ''
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''

      const response = await fetch(`${baseUrl}/ai/rag/ask/stream/events`, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question,
          knowledgeBaseId: selectedKnowledgeBaseId,
          topK: 5,
          conversationId: nextThreadBeforeStream.conversationId,
          enableWebSearchFallback: enableWebSearch,
          teachingContext,
        }),
      })

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? '请先登录后使用 AI 答疑。'
            : '请求失败，请稍后重试。'
        )
      }

      if (!response.body) {
        throw new Error('Streaming not supported')
      }

      for await (const eventData of readRagEvents(response.body)) {
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
          break
        }

        if (eventType === 'error') {
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
          break
        }
      }
      if (!terminalEvent) throw new Error('Stream ended before done')
    } catch (error) {
      if (currentThreadRef.current?.threadId !== nextThreadBeforeStream.threadId) return
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed right-8 bottom-8 z-50 flex items-center gap-2 rounded-full bg-[#007AFF] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(0,122,255,0.3)] transition-all hover:bg-[#0066CC] dark:bg-[#007AFF] dark:hover:bg-[#0066CC]"
        >
          <Sparkles className="h-4 w-4" />
          <span>AI 答疑</span>
        </motion.button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-[min(1320px,96vw)]">
        <div className="flex h-[min(92vh,920px)] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <aside className="hidden w-[280px] shrink-0 flex-col border-r border-slate-200 bg-slate-50 px-5 py-5 lg:flex dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.12em] text-slate-600 uppercase dark:text-slate-400">
                  会话线程
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  当前知识库下的对话历史
                </div>
              </div>
              <Button
                size="icon"
                variant="outline"
                aria-label="创建新对话"
                onClick={handleCreateThread}
                disabled={isLoading || !selectedKnowledgeBaseId}
                className="h-9 w-9 rounded-full border-slate-200 bg-white shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
              {visibleThreads.map(thread => {
                const isActive = thread.threadId === currentThread?.threadId
                return (
                  <div
                    key={thread.threadId}
                    className={`group flex items-start gap-3 rounded-2xl border p-4 transition ${
                      isActive
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSwitchThread(thread.threadId)}
                      disabled={isLoading}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {thread.title}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                        {thread.preview}
                      </div>
                      <div className="mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-500">
                        {formatThreadTime(thread.updatedAt)}
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label="删除对话"
                      onClick={() => handleDeleteThread(thread.threadId)}
                      disabled={isLoading}
                      className="rounded-full p-2 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}

              {visibleThreads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  当前知识库下还没有会话，点击右上角按钮创建新对话。
                </div>
              ) : null}
            </div>
          </aside>

          <div className="relative flex min-w-0 flex-1 flex-col">
            <DialogHeader className="gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 text-left dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-[1.6rem] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      AI 算法导师
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-5 text-slate-600 dark:text-slate-400">
                      结合当前数组和步骤答疑；知识库引用随答案展示。
                    </DialogDescription>
                  </div>
                </div>
                <div className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 md:inline-flex dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  {algorithmName}
                </div>
              </div>

              {teachingContext && (
                <p className="text-muted-foreground text-[14px]">
                  当前演示：第 {Number(teachingContext.currentStep) || 0} /{' '}
                  {Number(teachingContext.totalSteps) || 0} 步
                </p>
              )}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-950">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex shrink-0 items-center gap-2 text-xs font-semibold tracking-[0.08em] text-slate-600 uppercase dark:text-slate-400">
                    <Database className="h-3.5 w-3.5" />
                    当前知识库
                  </div>
                  <select
                    aria-label="当前知识库"
                    value={selectedKnowledgeBaseId}
                    onChange={e => setSelectedKnowledgeBaseId(e.target.value)}
                    disabled={isKnowledgeBaseLoading || knowledgeBases.length === 0 || isLoading}
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900/40"
                  >
                    {isKnowledgeBaseLoading ? (
                      <option value="">正在加载知识库...</option>
                    ) : knowledgeBases.length === 0 ? (
                      <option value="">暂无可用知识库</option>
                    ) : (
                      knowledgeBases.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <WandSparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>新对话保留上下文，切库会自动切到最近线程，生成中会锁定切换。</span>
                </div>
              </div>

              <label className="text-sm">
                <input
                  type="checkbox"
                  checked={enableWebSearch}
                  onChange={e => setEnableWebSearch(e.target.checked)}
                  disabled={isLoading}
                />{' '}
                允许知识不足时联网搜索
              </label>
              {teachingContext && (
                <p className="text-xs">
                  将发送当前算法、数组、步骤、计数和辅助数组作为课堂上下文。
                </p>
              )}
              <div className="lg:hidden">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold tracking-[0.12em] text-slate-600 uppercase dark:text-slate-400">
                    当前会话
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateThread}
                    disabled={isLoading || !selectedKnowledgeBaseId}
                    className="rounded-full border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
                  >
                    <MessageSquarePlus className="mr-1 h-4 w-4" />
                    新对话
                  </Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {visibleThreads.map(thread => {
                    const isActive = thread.threadId === currentThread?.threadId
                    return (
                      <button
                        key={thread.threadId}
                        type="button"
                        onClick={() => handleSwitchThread(thread.threadId)}
                        disabled={isLoading}
                        className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                          isActive
                            ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200'
                            : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                        }`}
                      >
                        {thread.title}
                      </button>
                    )
                  })}
                </div>
              </div>
            </DialogHeader>

            <div
              ref={scrollRef}
              className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 flex-1 space-y-6 overflow-y-auto bg-slate-50 px-6 py-6 dark:bg-slate-900"
            >
              <AnimatePresence initial={false}>
                {currentMessages.map(msg => {
                  const cleanContent = cleanMessageContent(msg.content)

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`group relative max-w-[min(85%,760px)] px-5 py-4 text-[15px] leading-relaxed transition-all ${
                          msg.role === 'user'
                            ? 'rounded-2xl rounded-br-md bg-blue-600 text-white shadow-sm'
                            : 'rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <div className="font-medium tracking-wide">{cleanContent}</div>
                        ) : (
                          <>
                            {msg.webSearchTriggered ? (
                              <div className="mb-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
                                本次启用联网搜索兜底
                              </div>
                            ) : null}
                            {msg.interrupted && (
                              <p role="status" className="mb-3 text-sm">
                                回答未完成，已保留收到的内容。
                              </p>
                            )}
                            <div className="prose prose-slate prose-sm dark:prose-invert prose-p:my-3 prose-p:leading-[1.75] prose-pre:bg-slate-100 prose-pre:ring-1 prose-pre:ring-slate-200 dark:prose-pre:bg-slate-900 dark:prose-pre:ring-slate-700 prose-headings:mt-5 prose-headings:mb-2 prose-headings:font-semibold max-w-none text-slate-900">
                              <MarkdownRender content={cleanContent} />
                            </div>
                            {msg.webSearchTriggered &&
                              !msg.sources?.some(source =>
                                /^https?:\/\//.test(source.url || '')
                              ) && (
                                <p className="mt-3 text-sm">
                                  联网服务未提供可核验的网页来源，请核对答案；检索不足的原因不作为引用。
                                </p>
                              )}
                            {!!msg.sources?.length && (
                              <details className="mt-4 text-sm">
                                <summary>查看引用（{msg.sources.length}）</summary>
                                {msg.sources.map((source, index) => (
                                  <article key={index} className="mt-3">
                                    <p>
                                      {source.documentName || '来源'} ·{' '}
                                      {source.sectionTitle || '未标注章节'} · 版本{' '}
                                      {source.version || '未标注'}
                                    </p>
                                    <p className="break-all">片段：{source.chunkId || '未提供'}</p>
                                    {source.content && (
                                      <blockquote className="mt-2 whitespace-pre-wrap">
                                        {source.content}
                                      </blockquote>
                                    )}
                                    {source.url && /^https?:\/\//.test(source.url) ? (
                                      <a
                                        className="text-primary hover:underline"
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        打开原文
                                      </a>
                                    ) : source.sourceType === 'web_search' ? (
                                      <p>模型未提供可核验网页链接，请自行核对。</p>
                                    ) : null}
                                  </article>
                                ))}
                              </details>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
                {isLoading && statusText ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex max-w-[min(85%,760px)] items-center gap-3 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {statusText}
                      </span>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
              {knowledgeBases.length === 0 && !isKnowledgeBaseLoading ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                  {kbState === 'error' ? '知识库列表加载失败。' : '暂无可用知识库。'}{' '}
                  <button className="underline" onClick={() => setKbState('idle')}>
                    重新加载
                  </button>
                </div>
              ) : null}
              {isLoading && (
                <Button
                  variant="outline"
                  className="mb-3"
                  onClick={() => streamControllerRef.current?.abort()}
                >
                  停止生成
                </Button>
              )}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="relative flex items-end gap-2">
                  <Textarea
                    aria-label="向 AI 提问"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="继续提问，Enter 发送，Shift + Enter 换行"
                    className="max-h-36 min-h-[56px] w-full resize-none rounded-xl border-0 bg-transparent px-3 py-2.5 text-[15px] text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
                    rows={1}
                  />
                  <Button
                    size="icon"
                    aria-label="发送问题"
                    onClick={handleSend}
                    disabled={
                      !input.trim() || isLoading || !selectedKnowledgeBaseId || !currentThread
                    }
                    className="mb-1 h-10 w-10 shrink-0 rounded-full bg-blue-600 text-white shadow-none transition-all hover:bg-blue-700 disabled:opacity-30"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
