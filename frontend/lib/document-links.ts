const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "")

export function getDocumentViewUrl(path?: string): string {
  if (!path) {
    return "#"
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  return `${BACKEND_ORIGIN}/storage/${String(path).replace(/^\/+/, "")}`
}

export function getDocumentDownloadUrl(documentId?: number, path?: string, fileName?: string): string {
  if (!documentId && !path) {
    return "#"
  }

  const params = new URLSearchParams()
  if (documentId) {
    params.set("id", String(documentId))
  }
  if (path) {
    params.set("path", path)
  }
  if (fileName) {
    params.set("name", fileName)
  }

  return `/api/download-document?${params.toString()}`
}
