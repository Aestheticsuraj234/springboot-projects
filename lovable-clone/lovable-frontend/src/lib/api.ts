import { clearAuth, getAccessToken, getRefreshToken, saveTokens } from '@/lib/auth'
import type { AuthResponse } from '@/types/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json()
    return body.detail ?? body.title ?? response.statusText
  } catch {
    return response.statusText
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    clearAuth()
    return false
  }

  const data = (await response.json()) as AuthResponse
  saveTokens(data.accessToken, data.refreshToken)
  return true
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = getAccessToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return apiRequest<T>(path, options, false)
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function streamChat(
  projectId: string,
  content: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (message: string) => void,
): Promise<void> {
  const accessToken = getAccessToken()
  const response = await fetch(`${API_BASE}/api/projects/${projectId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response))
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Streaming is not supported in this browser')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      const lines = event.split('\n')
      let eventName = 'message'
      let data = ''

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          data += line.slice(5).trim()
        }
      }

      if (eventName === 'done') {
        onDone()
        return
      }

      if (eventName === 'error') {
        onError(data)
        return
      }

      if (data) {
        onChunk(data)
      }
    }
  }

  onDone()
}

export async function logoutRequest(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearAuth()
    return
  }

  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  } finally {
    clearAuth()
  }
}
