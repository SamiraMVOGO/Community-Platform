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
import { Pencil, Plus, Trash2 } from "lucide-react"

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  async function fetchCategories() {
    try {
      const data = await apiFetch("/categories")
      setCategories(data || [])
    } catch (error) {
      toast.error("Erreur lors du chargement des categories")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  function resetForm() {
    setName("")
    setDescription("")
    setEditing(null)
  }

  async function createCategory() {
    if (!name.trim()) {
      toast.error("Le nom est requis")
      return
    }

    try {
      setSubmitting(true)
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      })
      toast.success("Categorie creee")
      setOpenCreate(false)
      resetForm()
      fetchCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la creation")
    } finally {
      setSubmitting(false)
    }
  }

  async function updateCategory() {
    if (!editing || !name.trim()) {
      toast.error("Le nom est requis")
      return
    }

    try {
      setSubmitting(true)
      await apiFetch(`/categories/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      })
      toast.success("Categorie mise a jour")
      resetForm()
      fetchCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise a jour")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteCategory(id) {
    if (!confirm("Supprimer cette categorie ?")) {
      return
    }

    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" })
      toast.success("Categorie supprimee")
      fetchCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-muted-foreground">Gerer les categories du repertoire communal</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nouvelle categorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Creer une categorie</DialogTitle>
              <DialogDescription>Cette categorie sera disponible dans les formulaires d'inscription.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Annuler</Button>
              <Button onClick={createCategory} disabled={submitting}>{submitting ? "Creation..." : "Creer"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement des categories...</p>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{category.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">/{category.slug}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">{category.description || "Aucune description"}</p>
                <div className="flex items-center gap-2">
                  <Dialog
                    open={editing?.id === category.id}
                    onOpenChange={(open) => {
                      if (!open) resetForm()
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(category)
                          setName(category.name)
                          setDescription(category.description || "")
                        }}
                      >
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier la categorie</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-name">Nom</Label>
                          <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Annuler</Button>
                        <Button onClick={updateCategory} disabled={submitting}>{submitting ? "Mise a jour..." : "Enregistrer"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="destructive" size="sm" onClick={() => deleteCategory(category.id)}>
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune categorie pour le moment.</p>
          )}
        </div>
      )}
    </div>
  )
}
