const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface OpcionesRequest extends RequestInit {
  body?: unknown
}

async function request<T>(endpoint: string, options: OpcionesRequest = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const mensajeError = await response.text()
    throw new Error(mensajeError || 'Error en la petición al servidor')
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}