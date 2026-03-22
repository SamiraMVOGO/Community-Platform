import Link from "next/link"
import { notFound } from "next/navigation"
import { getProfileById } from "@/lib/mock-data"
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  Calendar,
} from "lucide-react"

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = getProfileById(id)

  if (!profile) {
    notFound()
  }

  const statusColor =
    profile.statut === "valide"
      ? "bg-accent/10 text-accent border-accent/20"
      : profile.statut === "en_attente"
        ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
        : "bg-destructive/10 text-destructive border-destructive/20"

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/profils">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Retour aux profils
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
          {profile.prenom[0]}{profile.nom[0]}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {profile.prenom} {profile.nom}
            </h1>
            <Badge className={statusColor} variant="outline">
              {STATUS_LABELS[profile.statut]}
            </Badge>
          </div>
          <p className="mt-1 text-lg text-muted-foreground">{profile.metier}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{CATEGORY_LABELS[profile.categorie]}</Badge>
            <Badge variant="outline">{profile.secteur}</Badge>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Biographie</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-foreground/80">{profile.bio}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.competences.map((comp) => (
                  <Badge key={comp} variant="secondary" className="px-3 py-1.5">
                    {comp}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parcours professionnel</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-sm text-muted-foreground">{"Secteur d'activite"}</dt>
                    <dd className="font-medium text-foreground">{profile.secteur}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-sm text-muted-foreground">{"Niveau d'etude"}</dt>
                    <dd className="font-medium text-foreground">{profile.niveauEtude}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Experience</dt>
                    <dd className="font-medium text-foreground">{profile.experience}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-sm text-muted-foreground">{"Date d'inscription"}</dt>
                    <dd className="font-medium text-foreground">
                      {new Date(profile.dateInscription).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coordonnees</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{profile.telephone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{profile.localisation}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categorie</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">
                {CATEGORY_LABELS[profile.categorie]}
              </Badge>
              <p className="mt-2 text-xs text-muted-foreground">
                {"Ce profil est enregistre dans l'annuaire communal des operateurs economiques."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
