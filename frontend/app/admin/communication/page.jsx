"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Download, Mail, Megaphone, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"

export default function CommunicationPage() {
  const [news, setNews] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [subscribersMeta, setSubscribersMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  })
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingSubscribers, setLoadingSubscribers] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [refreshingSubscribers, setRefreshingSubscribers] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  async function fetchNews() {
    try {
      setLoadingNews(true)
      const payload = await apiFetch("/news")
      setNews(payload.data || [])
    } catch (error) {
      toast.error("Erreur lors du chargement des actualites")
      console.error(error)
    } finally {
      setLoadingNews(false)
    }
  }

  async function fetchSubscribers(page = 1, withRefreshState = false) {
    try {
      if (withRefreshState) {
        setRefreshingSubscribers(true)
      } else {
        setLoadingSubscribers(true)
      }

      const payload = await apiFetch(`/admin/newsletter/subscribers?per_page=10&page=${page}`)
      setSubscribers(payload.data || [])
      setSubscribersMeta({
        current_page: payload.current_page || page,
        last_page: payload.last_page || 1,
        total: payload.total || 0,
        per_page: payload.per_page || 10,
      })
    } catch (error) {
      toast.error("Erreur lors du chargement des abonnes newsletter")
      console.error(error)
    } finally {
      setLoadingSubscribers(false)
      setRefreshingSubscribers(false)
    }
  }

  useEffect(() => {
    fetchNews()
    fetchSubscribers(1)
  }, [])

  function resetForm() {
    setEditing(null)
    setTitle("")
    setContent("")
  }

  async function createNews() {
    if (!title.trim() || !content.trim()) {
      toast.error("Titre et contenu sont requis")
      return
    }

    try {
      setSubmitting(true)
      await apiFetch("/news", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      })
      toast.success("Actualite publiee")
      setOpenCreate(false)
      resetForm()
      fetchNews()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la publication")
    } finally {
      setSubmitting(false)
    }
  }

  async function updateNews() {
    if (!editing) return

    try {
      setSubmitting(true)
      await apiFetch(`/news/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          is_active: editing.is_active,
        }),
      })
      toast.success("Actualite mise a jour")
      resetForm()
      fetchNews()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise a jour")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteNews(id) {
    if (!confirm("Supprimer cette actualite ?")) {
      return
    }

    try {
      await apiFetch(`/news/${id}`, { method: "DELETE" })
      toast.success("Actualite supprimee")
      fetchNews()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression")
    }
  }

  async function exportSubscribersCsv() {
    try {
      const token = localStorage.getItem("token")
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      const response = await fetch(`${baseUrl}/admin/exports/newsletter-subscribers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!response.ok) {
        throw new Error(`Erreur export (${response.status})`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "newsletter_subscribers_export.csv"
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Export newsletter telecharge")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Echec de l'export newsletter")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Communication</h1>
          <p className="text-muted-foreground">Publier et administrer les actualites communales</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nouvelle actualite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publier une actualite</DialogTitle>
              <DialogDescription>Le contenu sera visible publiquement dans la section Actualites.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="content">Contenu</Label>
                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Annuler</Button>
              <Button onClick={createNews} disabled={submitting}>{submitting ? "Publication..." : "Publier"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loadingNews ? (
        <p className="text-sm text-muted-foreground">Chargement des actualites...</p>
      ) : (
        <div className="grid gap-4">
          {news.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="inline-flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    {item.title}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {new Date(item.published_at || item.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="line-clamp-3 text-sm text-muted-foreground">{item.content}</p>
                <div className="flex items-center gap-2">
                  <Dialog
                    open={editing?.id === item.id}
                    onOpenChange={(open) => {
                      if (!open) resetForm()
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(item)
                          setTitle(item.title)
                          setContent(item.content)
                        }}
                      >
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier l'actualite</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-title">Titre</Label>
                          <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-content">Contenu</Label>
                          <Textarea id="edit-content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Annuler</Button>
                        <Button onClick={updateNews} disabled={submitting}>{submitting ? "Mise a jour..." : "Enregistrer"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" size="sm" onClick={() => deleteNews(item.id)}>
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {news.length === 0 && <p className="text-sm text-muted-foreground">Aucune actualite pour le moment.</p>}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Abonnes newsletter
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSubscribers(subscribersMeta.current_page, true)}
                disabled={refreshingSubscribers}
              >
                <RefreshCw className="mr-1.5 h-4 w-4" />
                {refreshingSubscribers ? "Actualisation..." : "Actualiser"}
              </Button>
              <Button variant="outline" size="sm" onClick={exportSubscribersCsv}>
                <Download className="mr-1.5 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSubscribers ? (
            <p className="text-sm text-muted-foreground">Chargement des abonnes...</p>
          ) : subscribers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun abonne newsletter pour le moment.</p>
          ) : (
            <>
              <div className="space-y-2">
                {subscribers.map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{subscriber.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Abonne le {new Date(subscriber.subscribed_at || subscriber.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {subscriber.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {subscribersMeta.total} abonnes au total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSubscribers(subscribersMeta.current_page - 1)}
                    disabled={subscribersMeta.current_page <= 1 || loadingSubscribers || refreshingSubscribers}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Precedent
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {subscribersMeta.current_page} / {subscribersMeta.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSubscribers(subscribersMeta.current_page + 1)}
                    disabled={subscribersMeta.current_page >= subscribersMeta.last_page || loadingSubscribers || refreshingSubscribers}
                  >
                    Suivant
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
