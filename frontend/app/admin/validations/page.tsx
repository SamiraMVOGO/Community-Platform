"use client"

import { useState } from "react"
import { toast } from "sonner"
import { profiles } from "@/lib/mock-data"
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types"
import type { Profile } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react"

export default function ValidationsPage() {
  const [data, setData] = useState<Profile[]>(
    profiles.filter((p) => p.statut === "en_attente")
  )
  const [previewProfile, setPreviewProfile] = useState<Profile | null>(null)

  function approve(id: string) {
    setData((prev) => prev.filter((p) => p.id !== id))
    toast.success("Profil valide avec succes")
  }

  function reject(id: string) {
    setData((prev) => prev.filter((p) => p.id !== id))
    toast.success("Profil rejete")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Validations</h1>
        <p className="text-muted-foreground">
          Profils en attente de validation par {"l'administration"}
        </p>
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
          {data.map((profile) => (
            <Card key={profile.id} className="transition-all hover:border-primary/20">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chart-3/10 text-sm font-bold text-chart-3">
                    {profile.prenom[0]}{profile.nom[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{profile.prenom} {profile.nom}</h3>
                    <p className="text-sm text-muted-foreground">{profile.metier}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[profile.categorie]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{profile.secteur}</Badge>
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
                        <DialogTitle>{previewProfile?.prenom} {previewProfile?.nom}</DialogTitle>
                        <DialogDescription>{previewProfile?.metier} - {previewProfile?.secteur}</DialogDescription>
                      </DialogHeader>
                      {previewProfile && (
                        <div className="flex flex-col gap-3">
                          <dl className="grid gap-2 text-sm sm:grid-cols-2">
                            <div>
                              <dt className="text-muted-foreground">Email</dt>
                              <dd className="font-medium">{previewProfile.email}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Telephone</dt>
                              <dd className="font-medium">{previewProfile.telephone}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">{"Niveau d'etude"}</dt>
                              <dd className="font-medium">{previewProfile.niveauEtude}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Experience</dt>
                              <dd className="font-medium">{previewProfile.experience}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Localisation</dt>
                              <dd className="font-medium">{previewProfile.localisation}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Inscription</dt>
                              <dd className="font-medium">
                                {new Date(previewProfile.dateInscription).toLocaleDateString("fr-FR")}
                              </dd>
                            </div>
                          </dl>
                          <div>
                            <p className="text-sm text-muted-foreground">Bio</p>
                            <p className="text-sm text-foreground/80">{previewProfile.bio}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Competences</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {previewProfile.competences.map((c) => (
                                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => { reject(previewProfile!.id); setPreviewProfile(null) }}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="mr-1.5 h-4 w-4" />
                          Rejeter
                        </Button>
                        <Button
                          onClick={() => { approve(previewProfile!.id); setPreviewProfile(null) }}
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          <CheckCircle className="mr-1.5 h-4 w-4" />
                          Valider
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <CheckCircle className="mr-1.5 h-4 w-4" />
                        Valider
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer la validation</DialogTitle>
                        <DialogDescription>
                          Valider le profil de {profile.prenom} {profile.nom} ? Ce profil sera visible dans {"l'annuaire"}.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          onClick={() => approve(profile.id)}
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          Confirmer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Rejeter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer le rejet</DialogTitle>
                        <DialogDescription>
                          Rejeter le profil de {profile.prenom} {profile.nom} ? Cette action peut etre annulee.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="destructive"
                          onClick={() => reject(profile.id)}
                        >
                          Confirmer le rejet
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
