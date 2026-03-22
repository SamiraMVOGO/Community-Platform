"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { ROLE_LABELS, type User, type Municipality } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const ITEMS_PER_PAGE = 10

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [municipalityFilter, setMunicipalityFilter] = useState("")
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
    fetchMunicipalities()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération des utilisateurs")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMunicipalities = async () => {
    try {
      const response = await fetch("/api/municipalities", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMunicipalities(data.data || [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filtered = useMemo(() => {
    let result = users
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
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        toast.success("Statut utilisateur modifié")
        fetchUsers()
      } else {
        toast.error("Erreur lors de la modification")
      }
    } catch (error) {
      toast.error("Erreur de connexion")
      console.error(error)
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
                      onClick={() => selectedUser && toggleUserStatus(selectedUser.id)}
                      aria-label="Changer le statut"
                    >
                      {selectedUser?.is_active ? "✓" : "✕"}
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

