'use client'

import { getLoginUser } from '@/api/user/userController'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { WebSocketMessageTypeEnum } from '@/enums/WebSocketMessageTypeEnum'
import store from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearLoginUser, setLoginUser } from '@/store/modules/user/userSlice'
import { isAxiosError } from 'axios'
import { notificationPreview } from '@/lib/notification'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { toast, Toaster } from 'sonner'
const AuthLoadingContext = React.createContext(true)
export function useAuthLoading() {
  return React.useContext(AuthLoadingContext)
}

function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.user)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const expire = () => {
      dispatch(clearLoginUser())
      toast.info('登录已过期，请重新登录。')
    }
    window.addEventListener('algoflow:session-expired', expire)
    return () => window.removeEventListener('algoflow:session-expired', expire)
  }, [dispatch])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await getLoginUser({
          validateStatus: (status: number) =>
            (status >= 200 && status < 300) || status === 401 || status === 403,
        })
        if (res.code === 0 && res.data) {
          dispatch(setLoginUser(res.data))
        } else {
          dispatch(clearLoginUser())
        }
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined
        // A temporarily unavailable identity service leaves public learning pages usable.
        if (status === 401 || status === 403) {
          dispatch(clearLoginUser())
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchCurrentUser()
  }, [dispatch])

  // WebSocket Connection Logic
  const socketRef = React.useRef<WebSocket | null>(null)
  const reconnectTimerRef = React.useRef<NodeJS.Timeout>(null)
  const heartbeatTimerRef = React.useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    let active = true
    const connectWebSocket = () => {
      if (!active || !user) return

      // Use the gateway origin and path; an explicit WebSocket URL can override deployment routing.
      const api = new URL(process.env.NEXT_PUBLIC_API_BASE_URL || '/api', window.location.origin)
      const endpoint = new URL(api.pathname.replace(/\/$/, '') + '/websocket', api.origin)
      endpoint.protocol = api.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || endpoint.href

      const ws = new WebSocket(wsUrl)
      socketRef.current = ws

      ws.onopen = () => {
        // Send Auth message immediately after connection
        const token = localStorage.getItem('token')
        if (token && user.id) {
          ws.send(
            JSON.stringify({
              type: WebSocketMessageTypeEnum.AUTH,
              userId: user.id,
              token: token,
            })
          )
        }

        // Start heartbeat - every 30 seconds
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current)
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: WebSocketMessageTypeEnum.HEARTBEAT }))
          }
        }, 30000)
      }

      ws.onmessage = event => {
        try {
          const message = JSON.parse(event.data)
          const type = message.type as WebSocketMessageTypeEnum

          // Handle notification messages from backend (SYSTEM_NOTICE to FOLLOW_NOTICE)
          if (
            type >= WebSocketMessageTypeEnum.SYSTEM_NOTICE &&
            type <= WebSocketMessageTypeEnum.FOLLOW_NOTICE
          ) {
            const { title, description } = notificationPreview(message)

            let showNotification = true
            try {
              showNotification =
                JSON.parse(localStorage.getItem(`algoflow:preferences:${user.id}`) || '{}')
                  .notifications !== false
            } catch {
              /* keep default */
            }
            if (showNotification && (title || description)) {
              toast.info(title, {
                description: description,
              })
            }
            window.dispatchEvent(new Event('notification-updated'))
          } else if (type === WebSocketMessageTypeEnum.AUTH && message.data === '认证成功') {
            // Auth success - can log if needed
          }
        } catch (e) {
          console.error('WebSocket message parse error', e)
        }
      }

      ws.onclose = () => {
        socketRef.current = null
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current)
          heartbeatTimerRef.current = null
        }
        // Reconnect after 5 seconds
        if (active && user) {
          reconnectTimerRef.current = setTimeout(connectWebSocket, 5000)
        }
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    if (user) {
      connectWebSocket()
    }

    return () => {
      active = false
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current)
        heartbeatTimerRef.current = null
      }
    }
  }, [user])

  return <AuthLoadingContext.Provider value={isLoading}>{children}</AuthLoadingContext.Provider>
}

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthLoader>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            visibleToasts={1}
            closeButton
            toastOptions={{ closeButtonAriaLabel: '关闭提示' }}
          />
        </ThemeProvider>
      </AuthLoader>
    </Provider>
  )
}
