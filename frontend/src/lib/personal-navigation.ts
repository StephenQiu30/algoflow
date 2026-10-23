export function contentReturnTo(value: string | null) {
  if (!value || /[\\\r\n]/.test(value)) return '/user/content'
  try {
    const url = new URL(value, 'https://algoflow.local')
    return url.origin === 'https://algoflow.local' &&
      value.startsWith('/user/content') &&
      url.pathname === '/user/content'
      ? url.pathname + url.search
      : '/user/content'
  } catch {
    return '/user/content'
  }
}
