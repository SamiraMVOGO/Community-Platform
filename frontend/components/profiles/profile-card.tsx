import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types"
import type { Profile } from "@/lib/types"
import { MapPin, Briefcase, GraduationCap } from "lucide-react"

interface ProfileCardProps {
  profile: Profile
  layout?: "grid" | "list"
}

export function ProfileCard({ profile, layout = "grid" }: ProfileCardProps) {
  const statusColor =
    profile.statut === "valide"
      ? "bg-accent/10 text-accent border-accent/20"
      : profile.statut === "en_attente"
        ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
        : "bg-destructive/10 text-destructive border-destructive/20"

  if (layout === "list") {
    return (
      <Link href={`/profils/${profile.id}`}>
        <Card className="group transition-all hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {profile.prenom[0]}{profile.nom[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground group-hover:text-primary">
                  {profile.prenom} {profile.nom}
                </h3>
                <Badge className={statusColor} variant="outline">
                  {STATUS_LABELS[profile.statut]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{profile.metier}</p>
            </div>
            <div className="hidden flex-wrap gap-1.5 sm:flex">
              <Badge variant="secondary">{CATEGORY_LABELS[profile.categorie]}</Badge>
              <Badge variant="outline">{profile.secteur}</Badge>
            </div>
            <div className="hidden text-right text-xs text-muted-foreground md:block">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.localisation}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/profils/${profile.id}`}>
      <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {profile.prenom[0]}{profile.nom[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary">
                {profile.prenom} {profile.nom}
              </h3>
              <p className="text-sm text-muted-foreground">{profile.metier}</p>
            </div>
          </div>

          <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[profile.categorie]}</Badge>
            <Badge variant="outline" className="text-xs">{profile.secteur}</Badge>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {profile.localisation}
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {profile.niveauEtude}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
