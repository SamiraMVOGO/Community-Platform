"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Municipality, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Users } from "lucide-react"

interface MunicipalityFormData {
  name: string
  description: string
  location: string
}

interface MayorFormData {
  name: string
  email: string
  password: string
}

interface AgentFormData {
  name: string
  email: string
  password: string
}

export default function MunicipalitiesPage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [loading, setLoading] = useState(true)
  const [openNewMunicipality, setOpenNewMunicipality] = useState(false)
  const [openAddMayor, setOpenAddMayor] = useState(false)
  const [openAddAgent, setOpenAddAgent] = useState(false)
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null)
  const [formData, setFormData] = useState<MunicipalityFormData>({
    name: "",
    description: "",
    location: "",
  })
  const [mayorFormData, setMayorFormData] = useState<MayorFormData>({
    name: "",
    email: "",
    password: "",
  })
  const [agentFormData, setAgentFormData] = useState<AgentFormData>({
    name: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    fetchMunicipalities()
  }, [])

  const fetchMunicipalities = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/municipalities", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMunicipalities(data.data || [])
      } else {
        toast.error("Erreur lors de la récupération des mairies")
      }
    } catch (error) {
      toast.error("Erreur de connexion")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMunicipality = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom de la mairie est requis")
      return
    }

    try {
      const response = await fetch("/api/municipalities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Mairie créée avec succès")
        setFormData({ name: "", description: "", location: "" })
        setOpenNewMunicipality(false)
        fetchMunicipalities()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erreur lors de la création")
      }
    } catch (error) {
      toast.error("Erreur de connexion")
      console.error(error)
    }
  }

  const handleCreateMayor = async () => {
    if (!mayorFormData.name || !mayorFormData.email || !mayorFormData.password) {
      toast.error("Tous les champs sont requis")
      return
    }

    if (!selectedMunicipality) {
      toast.error("Aucune mairie sélectionnée")
      return
    }

    try {
      const response = await fetch(`/api/municipalities/${selectedMunicipality.id}/mayor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(mayorFormData),
      })

      if (response.ok) {
        toast.success("Maire créé avec succès")
        setMayorFormData({ name: "", email: "", password: "" })
        setOpenAddMayor(false)
        fetchMunicipalities()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erreur lors de la création")
      }
    } catch (error) {
      toast.error("Erreur de connexion")
      console.error(error)
    }
  }

  const handleCreateAgent = async () => {
    if (!agentFormData.name || !agentFormData.email || !agentFormData.password) {
      toast.error("Tous les champs sont requis")
      return
    }

    if (!selectedMunicipality) {
      toast.error("Aucune mairie sélectionnée")
      return
    }

    try {
      const response = await fetch(`/api/municipalities/${selectedMunicipality.id}/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(agentFormData),
      })

      if (response.ok) {
        toast.success("Agent municipal créé avec succès")
        setAgentFormData({ name: "", email: "", password: "" })
        setOpenAddAgent(false)
        fetchMunicipalities()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erreur lors de la création")
      }
    } catch (error) {
      toast.error("Erreur de connexion")
      console.error(error)
    }
  }

  const handleDeleteMunicipality = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette mairie ?")) {
      return
    }

    try {
      const response = await fetch(`/api/municipalities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        toast.success("Mairie supprimée avec succès")
        fetchMunicipalities()
      } else {
        toast.error("Erreur lors de la suppression")
      }
    } catch (error) {
      toast.error("Erreur de connexion")
      console.error(error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Mairies</h1>
        <Dialog open={openNewMunicipality} onOpenChange={setOpenNewMunicipality}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Mairie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle mairie</DialogTitle>
              <DialogDescription>
                Remplissez les informations de la nouvelle mairie
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom de la mairie</label>
                <Input
                  placeholder="Ex: Mairie de Yaoundé"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  placeholder="Description de la mairie"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Localisation</label>
                <Input
                  placeholder="Localisation"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenNewMunicipality(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleCreateMunicipality}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {municipalities.map((municipality) => (
          <Card key={municipality.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{municipality.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">{municipality.description}</p>
                  <p className="text-sm text-muted-foreground">{municipality.location}</p>
                </div>
                <Badge variant={municipality.is_active ? "default" : "secondary"}>
                  {municipality.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Maire</p>
                  {municipality.mayor ? (
                    <p className="text-sm">{municipality.mayor.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun maire assigné</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Agents municipaux</p>
                  <p className="text-sm">{municipality.agents?.length || 0} agent(s)</p>
                </div>
              </div>

              <div className="flex gap-2">
                {!municipality.mayor ? (
                  <Dialog open={openAddMayor && selectedMunicipality?.id === municipality.id} onOpenChange={setOpenAddMayor}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMunicipality(municipality)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un Maire
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un maire</DialogTitle>
                        <DialogDescription>
                          Créez un compte pour le maire de {municipality.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nom</label>
                          <Input
                            placeholder="Nom du maire"
                            value={mayorFormData.name}
                            onChange={(e) => setMayorFormData({ ...mayorFormData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email</label>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            value={mayorFormData.email}
                            onChange={(e) => setMayorFormData({ ...mayorFormData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Mot de passe</label>
                          <Input
                            type="password"
                            placeholder="Mot de passe"
                            value={mayorFormData.password}
                            onChange={(e) => setMayorFormData({ ...mayorFormData, password: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenAddMayor(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCreateMayor}>Créer Maire</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : null}

                <Dialog open={openAddAgent && selectedMunicipality?.id === municipality.id} onOpenChange={setOpenAddAgent}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMunicipality(municipality)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Ajouter un Agent
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un agent municipal</DialogTitle>
                      <DialogDescription>
                        Créez un compte pour un agent de {municipality.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nom</label>
                        <Input
                          placeholder="Nom de l'agent"
                          value={agentFormData.name}
                          onChange={(e) => setAgentFormData({ ...agentFormData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={agentFormData.email}
                          onChange={(e) => setAgentFormData({ ...agentFormData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Mot de passe</label>
                        <Input
                          type="password"
                          placeholder="Mot de passe"
                          value={agentFormData.password}
                          onChange={(e) => setAgentFormData({ ...agentFormData, password: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenAddAgent(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateAgent}>Créer Agent</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteMunicipality(municipality.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {municipalities.length === 0 && (
        <Card>
          <CardContent className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Aucune mairie trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
