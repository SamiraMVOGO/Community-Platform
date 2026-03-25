"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { getDocumentDownloadUrl } from "@/lib/document-links"
import { CATEGORY_LABELS } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react"

export default function ValidationsPage() {
  const [data, setData] = useState([])
  const [previewProfile, setPreviewProfile] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  const isAgentCandidate = (profile) => profile?.user?.role === "agent_pending"

  async function fetchPendingProfiles() {
    try {
      const payload = await apiFetch("/admin/profiles/pending")
      setData(payload.data || [])
    } catch (error) {
      toast.error("Erreur lors du chargement des profils en attente")
      console.error(error)
    }
  }

  useEffect(() => {
    fetchPendingProfiles()
  }, [])

  async function approve(profile) {
    const id = profile.id
    try {
      setProcessingId(id)
      await apiFetch(`/admin/profiles/${id}/approve`, { method: "PUT" })
      setData((prev) => prev.filter((p) => p.id !== id))
      toast.success(
        isAgentCandidate(profile)
          ? "Candidature agent municipal validee avec succes"
          : "Profil valide avec succes",
      )
    } catch (error) {
      toast.error("Erreur lors de la validation")
      console.error(error)
    } finally {
      setProcessingId(null)
    }
  }

  async function reject(profile) {
    const id = profile.id
    try {
      setProcessingId(id)
      await apiFetch(`/admin/profiles/${id}/reject`, { method: "PUT" })
      setData((prev) => prev.filter((p) => p.id !== id))
      toast.success(
        isAgentCandidate(profile)
          ? "Candidature agent municipal rejetee"
          : "Profil rejete",
      )
    } catch (error) {
      toast.error("Erreur lors du rejet")
      console.error(error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Validations</h1>
        <p className="text-muted-foreground">Profils en attente de validation par l'administration</p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-chart-3/5 p-3">
        <Clock className="h-5 w-5 text-chart-3" />
        <span className="text-sm text-foreground">
          <strong>{data.length}</strong> profil{data.length > 1 ? "s" : ""} en attente de validation
        </span>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 py-16 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-accent/50" />
          <p className="mt-4 text-lg font-medium text-foreground">Aucun profil en attente</p>
          <p className="mt-1 text-muted-foreground">Tous les profils ont ete traites</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((profile) => {
            const initials = (profile.user?.name || "U")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()

            return (
              <Card key={profile.id} className="transition-all hover:border-primary/20">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chart-3/10 text-sm font-bold text-chart-3">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{profile.user?.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.sector || "Secteur non renseigne"}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_LABELS[profile.category?.slug] || profile.category?.name || "Categorie"}
                        </Badge>
                        {isAgentCandidate(profile) && (
                          <Badge className="text-xs">Candidat agent municipal</Badge>
                        )}
                        {profile.user?.municipality?.name && (
                          <Badge variant="outline" className="text-xs">{profile.user.municipality.name}</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">En attente</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setPreviewProfile(profile)}>
                          <Eye className="mr-1.5 h-4 w-4" />
                          Voir
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>{previewProfile?.user?.name}</DialogTitle>
                          <DialogDescription>{previewProfile?.sector || "Secteur non renseigne"}</DialogDescription>
                        </DialogHeader>
                        {previewProfile && (
                          <div className="flex flex-col gap-3">
                            <dl className="grid gap-2 text-sm sm:grid-cols-2">
                              <div>
                                <dt className="text-muted-foreground">Email</dt>
                                <dd className="font-medium">{previewProfile.user?.email}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Telephone</dt>
                                <dd className="font-medium">{previewProfile.phone || "N/A"}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Niveau d'etude</dt>
                                <dd className="font-medium">{previewProfile.education_level || "N/A"}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Experience</dt>
                                <dd className="font-medium">{previewProfile.experience || "N/A"}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Localisation</dt>
                                <dd className="font-medium">{previewProfile.location || "N/A"}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Inscription</dt>
                                <dd className="font-medium">
                                  {new Date(previewProfile.created_at).toLocaleDateString("fr-FR")}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Type de demande</dt>
                                <dd className="font-medium">
                                  {isAgentCandidate(previewProfile)
                                    ? "Candidature agent municipal"
                                    : "Validation de profil utilisateur"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Commune</dt>
                                <dd className="font-medium">
                                  {previewProfile.user?.municipality?.name || "Non renseignee"}
                                </dd>
                              </div>
                            </dl>
                            <div>
                              <p className="text-sm text-muted-foreground">Bio</p>
                              <p className="text-sm text-foreground/80">{previewProfile.bio || "Aucune biographie"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Documents uploades</p>
                              {previewProfile.documents?.length ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {previewProfile.documents.map((document) => (
                                    <a
                                      key={document.id}
                                      href={getDocumentDownloadUrl(document.id, document.path, document.original_name)}
                                      className="inline-flex items-center rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted"
                                    >
                                      {(document.type || "document").toUpperCase()} - {document.original_name || "Telecharger"}
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-foreground/70">Aucun document disponible.</p>
                              )}
                            </div>
                          </div>
                        )}
                        <DialogFooter className="gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (previewProfile) reject(previewProfile)
                              setPreviewProfile(null)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="mr-1.5 h-4 w-4" />
                            Rejeter
                          </Button>
                          <Button
                            onClick={() => {
                              if (previewProfile) approve(previewProfile)
                              setPreviewProfile(null)
                            }}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                          >
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Valider
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={() => approve(profile)}
                      disabled={processingId === profile.id}
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                      {processingId === profile.id ? "Validation..." : "Valider"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => reject(profile)}
                      disabled={processingId === profile.id}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      {processingId === profile.id ? "Rejet..." : "Rejeter"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
