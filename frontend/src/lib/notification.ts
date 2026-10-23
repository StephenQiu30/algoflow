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

export function notificationHref(n: Record<string, unknown>) {
  const url = n.contentUrl
  if (
    typeof url === 'string' &&
    url.startsWith('/') &&
    !url.startsWith('//') &&
    !/[\\\r\n]/.test(url)
  )
    return url
  if (n.relatedId && ['post', 'POST'].includes(String(n.relatedType || '')))
    return `/blog/${n.relatedId}`
  return '/user/notifications'
}
