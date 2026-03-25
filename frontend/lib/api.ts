import type { User } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface ApiErrorPayload {
  message?: string
  errors?: Record<string, string[]>
}

export interface AuthPayload {
  token: string
  user: User
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
}

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem("token")
}

async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) {
    return null
  }

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    return null
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  const requestUrl = `${API_BASE_URL}${path}`
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData

  if (!headers.has("Content-Type") && init.body && !isFormData) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(requestUrl, {
    ...init,
    headers,
  })

  const payload = await parseJson<T | ApiErrorPayload>(response)

  if (!response.ok) {
    const errorPayload = (payload || {}) as ApiErrorPayload
    const fallbackMessage = `API error (${response.status})`
    throw new Error(errorPayload.message || fallbackMessage)
  }

  if (payload === null) {
    throw new Error(
      `La reponse API n'est pas en JSON pour ${requestUrl}. Verifie NEXT_PUBLIC_API_URL (ex: http://localhost:8000/api).`
    )
  }

  return payload as T
}

export function persistAuth(auth: AuthPayload): void {
  localStorage.setItem("token", auth.token)
  localStorage.setItem("user", JSON.stringify(auth.user))
}

export function clearAuth(): void {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null
  }

  const rawUser = localStorage.getItem("user")
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as User
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  return apiFetch<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function logout(): Promise<void> {
  await apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
  })
}

export async function me(): Promise<User> {
  return apiFetch<User>("/auth/me")
}
