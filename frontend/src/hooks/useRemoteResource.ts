import { useEffect, useState } from 'react'

type Resource<T> = { key: string; data: T | null; error: string; loading: boolean }
export function useRemoteResource<T>(
  key: string,
  load: () => Promise<T>,
  failure: string,
  enabled = true
) {
  const [resource, setResource] = useState<Resource<T>>({
    key: '',
    data: null,
    error: '',
    loading: true,
  })
  useEffect(() => {
    if (!enabled) return
    let active = true
    load()
      .then(data => {
        if (active) setResource({ key, data, error: '', loading: false })
      })
      .catch(() => {
        if (active) setResource({ key, data: null, error: failure, loading: false })
      })
    return () => {
      active = false
    }
  }, [key, load, failure, enabled])
  return resource.key === key ? resource : { key, data: null, error: '', loading: enabled }
}
