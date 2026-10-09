export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '')

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${baseUrl}/${path.replace(/^\//, '')}`, {
      ...options,
      headers,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('Cannot connect to the server. Please try again.', 0)
  }

  const text = await response.text()
  let body: unknown
  if (text) {
    try { body = JSON.parse(text) } catch {
      if (response.ok) throw new ApiError('The server returned an unexpected response.', response.status)
    }
  }

  if (!response.ok) {
    const details = body && typeof body === 'object' ? body as Record<string, unknown> : {}
    const message = typeof details.error === 'string' && details.error
      ? details.error
      : typeof details.message === 'string' && details.message
        ? details.message
        : `Request failed (${response.status}).`
    throw new ApiError(message, response.status)
  }

  return body as T
}

