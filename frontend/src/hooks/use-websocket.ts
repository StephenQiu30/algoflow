import { useCallback, useEffect, useRef, useState } from 'react'
interface UseWebSocketOptions {
  url?: string
  onMessage?: (data: unknown) => void
  reconnectInterval?: number
  heartbeatInterval?: number
}
export function useWebSocket({
  url,
  onMessage,
  reconnectInterval = 5000,
  heartbeatInterval = 30000,
}: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null),
    handler = useRef(onMessage)
  const [isConnected, setIsConnected] = useState(false)
  useEffect(() => {
    handler.current = onMessage
  }, [onMessage])
  useEffect(() => {
    if (!url) return
    let active = true,
      retry: ReturnType<typeof setTimeout> | undefined,
      heartbeat: ReturnType<typeof setInterval> | undefined
    const stopHeartbeat = () => {
      if (heartbeat) clearInterval(heartbeat)
      heartbeat = undefined
    }
    function connect() {
      if (!active) return
      const socket = new WebSocket(url!)
      ws.current = socket
      socket.onopen = () => {
        if (!active) {
          socket.close()
          return
        }
        setIsConnected(true)
        stopHeartbeat()
        heartbeat = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }))
        }, heartbeatInterval)
      }
      socket.onclose = () => {
        stopHeartbeat()
        if (!active) return
        setIsConnected(false)
        retry = setTimeout(connect, reconnectInterval)
      }
      socket.onerror = () => socket.close()
      socket.onmessage = event => {
        if (!active) return
        try {
          const data: unknown = JSON.parse(event.data)
          handler.current?.(data)
        } catch {
          console.error('Failed to parse WebSocket message')
        }
      }
    }
    const start = setTimeout(connect, 0)
    return () => {
      active = false
      clearTimeout(start)
      if (retry) clearTimeout(retry)
      stopHeartbeat()
      ws.current?.close()
      ws.current = null
    }
  }, [url, reconnectInterval, heartbeatInterval])
  const sendMessage = useCallback((data: unknown) => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(data))
  }, [])
  return { isConnected, sendMessage }
}
