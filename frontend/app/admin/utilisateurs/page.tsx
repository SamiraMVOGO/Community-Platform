"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { ROLE_LABELS, type User, type Municipality, type PaginatedApiData } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Eye,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { apiFetch, getStoredUser } from "@/lib/api"

const ITEMS_PER_PAGE = 10

interface Category {
  id: number
  name: string
}

interface RegisterByAgentPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone: string
  category_id: number
  sector: string
  education_level: string
  experience: string
  location: string
  skills: string
  bio: string
  municipality_id?: number
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [municipalityFilter, setMunicipalityFilter] = useState("")
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actor, setActor] = useState<User | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<RegisterByAgentPayload>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    category_id: 0,
    sector: "",
    education_level: "",
    experience: "",
    location: "",
    skills: "",
    bio: "",
  })

  useEffect(() => {
    setActor(getStoredUser())
    fetchUsers()
    fetchMunicipalities()
    fetchCategories()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<PaginatedApiData<User>>("/admin/users")
      setUsers(data.data || [])
    } catch (error) {
      toast.error("Erreur lors de la récupération des utilisateurs")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMunicipalities = async () => {
    try {
      const data = await apiFetch<PaginatedApiData<Municipality>>("/municipalities")
      setMunicipalities(data.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await apiFetch<Category[]>("/categories")
      setCategories(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const filtered = useMemo(() => {
    let result = [...users].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }
    if (roleFilter && roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter)
    }
    if (municipalityFilter && municipalityFilter !== "all") {
      result = result.filter((u) => u.municipality_id === parseInt(municipalityFilter))
    }
    return result
  }, [users, search, roleFilter, municipalityFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const toggleUserStatus = async (userId: number) => {
    try {
      await apiFetch<{ message: string }>(`/admin/users/${userId}/toggle-status`, {
        method: "PUT",
      })
      toast.success("Statut utilisateur modifié")
      fetchUsers()
    } catch (error) {
      toast.error("Erreur de connexion")
      console.error(error)
    }
  }

  const downloadExport = async (kind: "users" | "profiles") => {
    try {
      const token = localStorage.getItem("token")
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      const response = await fetch(`${baseUrl}/admin/exports/${kind}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!response.ok) {
        throw new Error(`Erreur export (${response.status})`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = kind === "users" ? "users_export.csv" : "profiles_export.csv"
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Export telecharge")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Echec de l'export")
    }
  }

  const createRegisteredUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Nom, email et mot de passe sont requis")
      return
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (!formData.category_id) {
      toast.error("Veuillez sélectionner une catégorie")
      return
    }

    try {
      setSubmitting(true)
      const payload: RegisterByAgentPayload = {
        ...formData,
      }

      if (actor && ["super_admin", "admin"].includes(actor.role) && !payload.municipality_id) {
        toast.error("Veuillez sélectionner une mairie")
        return
      }

      await apiFetch<{ message: string }>("/auth/register-by-agent", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      toast.success("Utilisateur enregistré avec succès")
      setOpenCreate(false)
      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        category_id: 0,
        sector: "",
        education_level: "",
        experience: "",
        location: "",
        skills: "",
        bio: "",
      })
      fetchUsers()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la création"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-destructive/10 text-destructive"
      case "admin":
        return "bg-purple-500/10 text-purple-600"
      case "mayor":
        return "bg-blue-500/10 text-blue-600"
      case "agent_municipal":
        return "bg-cyan-500/10 text-cyan-600"
      default:
        return "bg-green-500/10 text-green-600"
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Utilisateurs</h1>
          <p className="text-muted-foreground">Gestion des comptes inscrits sur la plateforme</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Enregistrer un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Inscription d'utilisateur par agent</DialogTitle>
              <DialogDescription>
                Créez un compte utilisateur et son profil depuis le dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password_confirmation">Confirmation</Label>
                  <Input id="password_confirmation" type="password" value={formData.password_confirmation} onChange={(e) => setFormData((p) => ({ ...p, password_confirmation: e.target.value }))} />
                </div>
              </div>

              {actor && ["super_admin", "admin"].includes(actor.role) && (
                <div className="grid gap-1.5">
                  <Label>Mairie</Label>
                  <Select value={formData.municipality_id?.toString() || ""} onValueChange={(v) => setFormData((p) => ({ ...p, municipality_id: Number(v) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une mairie" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-1.5">
                <Label>Catégorie</Label>
                <Select value={formData.category_id ? String(formData.category_id) : ""} onValueChange={(v) => setFormData((p) => ({ ...p, category_id: Number(v) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="sector">Secteur</Label>
                <Input id="sector" value={formData.sector} onChange={(e) => setFormData((p) => ({ ...p, sector: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="education_level">Niveau d'étude</Label>
                <Input id="education_level" value={formData.education_level} onChange={(e) => setFormData((p) => ({ ...p, education_level: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="experience">Expérience</Label>
                <Input id="experience" value={formData.experience} onChange={(e) => setFormData((p) => ({ ...p, experience: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="location">Localisation</Label>
                <Input id="location" value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="skills">Compétences (texte)</Label>
                <Input id="skills" value={formData.skills} onChange={(e) => setFormData((p) => ({ ...p, skills: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bio">Biographie</Label>
                <Input id="bio" value={formData.bio} onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>
                Annuler
              </Button>
              <Button onClick={createRegisteredUser} disabled={submitting}>
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => downloadExport("users")}>
            <Download className="mr-1.5 h-4 w-4" />
            Export utilisateurs
          </Button>
          <Button variant="outline" onClick={() => downloadExport("profiles")}>
            <Download className="mr-1.5 h-4 w-4" />
            Export profils
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => {
          setRoleFilter(v)
          setPage(1)
        }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="mayor">Maire</SelectItem>
            <SelectItem value="agent_municipal">Agent Municipal</SelectItem>
            <SelectItem value="user">Utilisateur</SelectItem>
          </SelectContent>
        </Select>
        <Select value={municipalityFilter} onValueChange={(v) => {
          setMunicipalityFilter(v)
          setPage(1)
        }}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Mairie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les mairies</SelectItem>
            {municipalities.map((m) => (
              <SelectItem key={m.id} value={m.id.toString()}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Rôle</TableHead>
              <TableHead className="hidden lg:table-cell">Mairie</TableHead>
              <TableHead className="hidden lg:table-cell">Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className={getRoleColor(user.role)} variant="outline">
                    {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {user.municipality?.name || "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedUser(user)}
                          aria-label="Voir le profil"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{selectedUser?.name}</DialogTitle>
                          <DialogDescription>{selectedUser?.email}</DialogDescription>
                        </DialogHeader>
                        {selectedUser && (
                          <dl className="grid gap-2 text-sm">
                            <div>
                              <dt className="text-muted-foreground">Email</dt>
                              <dd className="font-medium">{selectedUser.email}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Rôle</dt>
                              <dd>
                                <Badge className={getRoleColor(selectedUser.role)} variant="outline">
                                  {ROLE_LABELS[selectedUser.role as keyof typeof ROLE_LABELS]}
                                </Badge>
                              </dd>
                            </div>
                            {selectedUser.municipality && (
                              <div>
                                <dt className="text-muted-foreground">Mairie</dt>
                                <dd className="font-medium">{selectedUser.municipality.name}</dd>
                              </div>
                            )}
                            <div>
                              <dt className="text-muted-foreground">Statut</dt>
                              <dd>
                                <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                                  {selectedUser.is_active ? "Actif" : "Inactif"}
                                </Badge>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Date d'inscription</dt>
                              <dd className="font-medium">
                                {new Date(selectedUser.created_at).toLocaleDateString("fr-FR")}
                              </dd>
                            </div>
                          </dl>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => toggleUserStatus(user.id)}
                      aria-label="Changer le statut"
                    >
                      {user.is_active ? "✓" : "✕"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Precedent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

