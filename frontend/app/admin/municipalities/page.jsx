"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Users } from "lucide-react"

export default function MunicipalitiesPage() {
  const [municipalities, setMunicipalities] = useState([])
  const [loading, setLoading] = useState(true)

  const [openNewMunicipality, setOpenNewMunicipality] = useState(false)
  const [openAddMayor, setOpenAddMayor] = useState(false)
  const [openAddAgent, setOpenAddAgent] = useState(false)
  const [selectedMunicipality, setSelectedMunicipality] = useState(null)

  const [formData, setFormData] = useState({ name: "", description: "", location: "" })
  const [mayorFormData, setMayorFormData] = useState({ name: "", email: "", password: "" })
  const [agentFormData, setAgentFormData] = useState({ name: "", email: "", password: "" })

  useEffect(() => {
    fetchMunicipalities()
  }, [])

  async function fetchMunicipalities() {
    try {
      setLoading(true)
      const data = await apiFetch("/municipalities")
      setMunicipalities(data.data || [])
    } catch (error) {
      toast.error("Erreur de connexion")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateMunicipality() {
    if (!formData.name.trim()) {
      toast.error("Le nom de la mairie est requis")
      return
    }

    try {
      await apiFetch("/municipalities", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      toast.success("Mairie creee avec succes")
      setFormData({ name: "", description: "", location: "" })
      setOpenNewMunicipality(false)
      fetchMunicipalities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion")
    }
  }

  async function handleCreateMayor() {
    if (!selectedMunicipality) return

    try {
      await apiFetch(`/municipalities/${selectedMunicipality.id}/mayor`, {
        method: "POST",
        body: JSON.stringify(mayorFormData),
      })
      toast.success("Maire cree avec succes")
      setMayorFormData({ name: "", email: "", password: "" })
      setOpenAddMayor(false)
      fetchMunicipalities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion")
    }
  }

  async function handleCreateAgent() {
    if (!selectedMunicipality) return

    try {
      await apiFetch(`/municipalities/${selectedMunicipality.id}/agents`, {
        method: "POST",
        body: JSON.stringify(agentFormData),
      })
      toast.success("Agent municipal cree avec succes")
      setAgentFormData({ name: "", email: "", password: "" })
      setOpenAddAgent(false)
      fetchMunicipalities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion")
    }
  }

  async function handleDeleteMunicipality(id) {
    if (!confirm("Etes-vous sur de vouloir supprimer cette mairie ?")) {
      return
    }

    try {
      await apiFetch(`/municipalities/${id}`, { method: "DELETE" })
      toast.success("Mairie supprimee avec succes")
      fetchMunicipalities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion")
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Mairies</h1>
        <Dialog open={openNewMunicipality} onOpenChange={setOpenNewMunicipality}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nouvelle Mairie</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Creer une nouvelle mairie</DialogTitle>
              <DialogDescription>Renseignez les informations de la mairie</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="location">Localisation</Label>
                <Input id="location" value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenNewMunicipality(false)}>Annuler</Button>
              <Button onClick={handleCreateMunicipality}>Creer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {municipalities.map((municipality) => (
          <Card key={municipality.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{municipality.name}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">{municipality.description || "Aucune description"}</p>
                  <p className="text-sm text-muted-foreground">{municipality.location || "Localisation non renseignee"}</p>
                </div>
                <Badge variant={municipality.is_active ? "default" : "secondary"}>{municipality.is_active ? "Active" : "Inactive"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Maire</p>
                  <p className="text-sm text-muted-foreground">{municipality.mayor?.name || "Aucun maire assigne"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Agents municipaux</p>
                  <p className="text-sm text-muted-foreground">{municipality.agents?.length || 0} agent(s)</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!municipality.mayor && (
                  <Dialog open={openAddMayor && selectedMunicipality?.id === municipality.id} onOpenChange={setOpenAddMayor}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedMunicipality(municipality)}>
                        <Plus className="mr-2 h-4 w-4" />Ajouter un Maire
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un maire</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Input placeholder="Nom" value={mayorFormData.name} onChange={(e) => setMayorFormData((p) => ({ ...p, name: e.target.value }))} />
                        <Input type="email" placeholder="Email" value={mayorFormData.email} onChange={(e) => setMayorFormData((p) => ({ ...p, email: e.target.value }))} />
                        <Input type="password" placeholder="Mot de passe" value={mayorFormData.password} onChange={(e) => setMayorFormData((p) => ({ ...p, password: e.target.value }))} />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenAddMayor(false)}>Annuler</Button>
                        <Button onClick={handleCreateMayor}>Creer Maire</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                <Dialog open={openAddAgent && selectedMunicipality?.id === municipality.id} onOpenChange={setOpenAddAgent}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedMunicipality(municipality)}>
                      <Users className="mr-2 h-4 w-4" />Ajouter un Agent
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un agent municipal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input placeholder="Nom" value={agentFormData.name} onChange={(e) => setAgentFormData((p) => ({ ...p, name: e.target.value }))} />
                      <Input type="email" placeholder="Email" value={agentFormData.email} onChange={(e) => setAgentFormData((p) => ({ ...p, email: e.target.value }))} />
                      <Input type="password" placeholder="Mot de passe" value={agentFormData.password} onChange={(e) => setAgentFormData((p) => ({ ...p, password: e.target.value }))} />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenAddAgent(false)}>Annuler</Button>
                      <Button onClick={handleCreateAgent}>Creer Agent</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="destructive" size="sm" onClick={() => handleDeleteMunicipality(municipality.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
