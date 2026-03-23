// Centralized fetch helpers keep headers, token usage, and error handling consistent across pages.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const parseJsonResponse = async (response) => {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload?.message || 'Request failed')
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export const apiFetch = async (
  path,
  { method = 'GET', token, body, signal, headers = {} } = {},
) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  return parseJsonResponse(response)
}
