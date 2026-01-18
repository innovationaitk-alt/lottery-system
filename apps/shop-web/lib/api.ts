const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * API リクエストのベース関数
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `API Error: ${response.status}`)
  }

  return response.json()
}

/**
 * GET リクエスト
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, { method: 'GET' })
}

/**
 * POST リクエスト
 */
export async function apiPost<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT リクエスト
 */
export async function apiPut<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE リクエスト
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, { method: 'DELETE' })
}

export { API_BASE_URL }
