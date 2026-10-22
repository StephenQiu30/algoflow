import axios, { AxiosRequestConfig, isAxiosError } from 'axios'
import JSONBig from 'json-bigint'
import { toast } from 'sonner'

const JSONBigStr = JSONBig({ storeAsString: true })

type RequestExtras = { silent?: boolean }

/**
 * 创建 Axios 实例
 */
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  transformResponse: [
    data => {
      try {
        return JSONBigStr.parse(data)
      } catch {
        return data
      }
    },
  ],
})

/**
 * 创建请求拦截器
 */
axiosInstance.interceptors.request.use(
  function (config) {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.setAuthorization(`Bearer ${token}`)
        }
      } catch {
        // Ignore storage access errors (e.g. disabled storage)
      }
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

/**
 * 创建响应拦截器
 */
axiosInstance.interceptors.response.use(
  // 2xx 响应触发
  function (response) {
    // 处理响应数据
    const { data } = response
    return data
  },
  // 非 2xx 响应触发
  function (error) {
    const config = (isAxiosError(error) ? error.config || {} : {}) as AxiosRequestConfig &
      RequestExtras
    const method = (config.method || 'get').toLowerCase()
    const status = isAxiosError(error) ? error.response?.status : undefined
    const silent = (config.silent ?? true) || method === 'get' || status === 401 || status === 403

    // 处理响应错误
    const { response } = error
    if (!silent) {
      if (response?.data?.message) {
        toast.error(response.data.message)
      } else {
        toast.error('Request failed', {
          description: error.message || 'Unknown error occurred',
        })
      }
    }

    return Promise.reject(error)
  }
)

/**
 * 封装 request 方法，支持泛型 T
 * @param url 请求地址
 * @param config 请求配置
 */
const request = <T>(
  url: string,
  config: AxiosRequestConfig & { requestType?: 'form' }
): Promise<T> => {
  const { requestType, ...axiosConfig } = config
  if (requestType === 'form') {
    // Browser supplies the multipart boundary for the generated FormData body.
    const headers =
      axiosConfig.headers instanceof axios.AxiosHeaders
        ? axiosConfig.headers.toJSON()
        : axiosConfig.headers
    axiosConfig.headers = { ...headers, 'Content-Type': undefined }
  }
  return axiosInstance(url, axiosConfig) as Promise<T>
}

export default request
