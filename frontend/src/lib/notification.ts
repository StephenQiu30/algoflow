export function notificationPreview(message: Record<string, unknown>) {
  const payload =
    message.data && typeof message.data === 'object' && !Array.isArray(message.data)
      ? (message.data as Record<string, unknown>)
      : message
  return {
    title: typeof payload.title === 'string' ? payload.title : '新通知',
    description:
      typeof payload.content === 'string'
        ? payload.content
        : typeof message.data === 'string'
          ? message.data
          : '',
  }
}

export function notificationHref(n: Record<string, unknown>, returnTo?: string) {
  const url = n.contentUrl
  let href = '/user/notifications'
  if (
    typeof url === 'string' &&
    url.startsWith('/') &&
    !url.startsWith('//') &&
    !/[\\\r\n]/.test(url)
  )
    href = url
  else if (n.relatedId && ['post', 'POST'].includes(String(n.relatedType || '')))
    href = `/blog/${n.relatedId}`
  if (returnTo && /^\/user\/notifications(?:\?|$)/.test(returnTo) && !/[\\\r\n]/.test(returnTo)) {
    const target = new URL(href, 'https://algoflow.local')
    if (/^\/blog\/[^/]+$/.test(target.pathname)) {
      target.searchParams.set('returnTo', returnTo)
      return target.pathname + target.search + target.hash
    }
  }
  return href
}
