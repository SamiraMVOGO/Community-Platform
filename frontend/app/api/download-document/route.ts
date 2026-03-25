import { NextRequest } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "")

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._()\- ]/g, "_")
}

function inferFileName(pathValue: string): string {
  const lastSegment = pathValue.split("/").pop() || "document"
  return sanitizeFileName(lastSegment)
}

function normalizePath(pathValue: string): string {
  return String(pathValue).replace(/\\/g, "/").replace(/^\/+/, "")
}

function resolveDocumentUrl(pathValue: string): URL {
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return new URL(pathValue)
  }

  const normalized = normalizePath(pathValue)
  return new URL(`${BACKEND_ORIGIN}/storage/${normalized}`)
}

function buildCandidateDocumentUrls(pathValue: string): URL[] {
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return [new URL(pathValue)]
  }

  const normalized = normalizePath(pathValue)
  const candidates = new Set<string>()

  // Common case from Laravel Storage::disk('public')->put(): profiles/.../file.pdf
  candidates.add(`/storage/${normalized}`)

  // Some payloads can already contain "public/..." or "storage/..."
  if (normalized.startsWith("public/")) {
    candidates.add(`/storage/${normalized.replace(/^public\//, "")}`)
  }

  if (normalized.startsWith("storage/")) {
    candidates.add(`/${normalized}`)
  }

  return Array.from(candidates).map((path) => new URL(`${BACKEND_ORIGIN}${path}`))
}

function isAllowedDocumentUrl(url: URL): boolean {
  const backendUrl = new URL(BACKEND_ORIGIN)
  return url.origin === backendUrl.origin && url.pathname.startsWith("/storage/")
}

export async function GET(request: NextRequest) {
  const documentId = request.nextUrl.searchParams.get("id")
  const pathValue = request.nextUrl.searchParams.get("path")
  if (!documentId && !pathValue) {
    return new Response("Missing id or path parameter", { status: 400 })
  }

  // Preferred strategy: backend endpoint by document id (independent from public/storage symlink).
  if (documentId) {
    const byIdUrl = `${API_BASE_URL}/documents/${documentId}/download`
    const byIdResponse = await fetch(byIdUrl, { cache: "no-store" })

    if (byIdResponse.ok && byIdResponse.body) {
      const requestedName = request.nextUrl.searchParams.get("name")
      const fallbackName = requestedName || `document-${documentId}`
      const fileName = sanitizeFileName(fallbackName)
      const contentType = byIdResponse.headers.get("content-type") || "application/octet-stream"

      return new Response(byIdResponse.body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "no-store",
        },
      })
    }

    if (!pathValue) {
      return new Response("Document not found", { status: 404 })
    }
  }

  if (!pathValue) {
    return new Response("Missing path parameter", { status: 400 })
  }

  let documentUrl: URL
  try {
    documentUrl = resolveDocumentUrl(pathValue)
  } catch {
    return new Response("Invalid path parameter", { status: 400 })
  }

  if (!isAllowedDocumentUrl(documentUrl)) {
    return new Response("Forbidden", { status: 403 })
  }

  const candidateUrls = buildCandidateDocumentUrls(pathValue)

  let upstream: Response | null = null
  for (const candidateUrl of candidateUrls) {
    if (!isAllowedDocumentUrl(candidateUrl)) {
      continue
    }

    const response = await fetch(candidateUrl.toString(), { cache: "no-store" })
    if (response.ok && response.body) {
      upstream = response
      break
    }
  }

  if (!upstream || !upstream.body) {
    return new Response("Document not found", { status: 404 })
  }

  const requestedName = request.nextUrl.searchParams.get("name")
  const fileName = sanitizeFileName(requestedName || inferFileName(pathValue))
  const contentType = upstream.headers.get("content-type") || "application/octet-stream"

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  })
}
