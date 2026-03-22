import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { categoriesInfo, getStats } from "@/lib/mock-data"
import {
  Briefcase,
  Building2,
  Hammer,
  ShoppingBag,
  Rocket,
  TrendingUp,
  Wrench,
  Users,
  ChevronRight,
} from "lucide-react"

export const metadata = {
  title: "Annuaire",
  description: "Annuaire des categories d'operateurs economiques de la commune",
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Wrench,
  Building2,
  Hammer,
  ShoppingBag,
  Rocket,
  TrendingUp,
}

export default function AnnuairePage() {
  const stats = getStats()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Annuaire</h1>
        <p className="mt-2 text-muted-foreground">
          {"Parcourez les differentes categories d'acteurs economiques recenses dans la commune."}
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total inscrits</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">Secteurs</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{Object.keys(stats.parSecteur).length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-chart-3" />
            <span className="text-sm text-muted-foreground">Categories</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">7</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-chart-4" />
            <span className="text-sm text-muted-foreground">Valides</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.valides}</p>
        </div>
      </div>

      {/* Categories grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoriesInfo.map((cat) => {
          const Icon = iconMap[cat.icon] || Briefcase
          return (
            <Link key={cat.id} href={`/profils?categorie=${cat.id}`}>
              <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">{cat.label}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{cat.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="secondary">{cat.count} profils</Badge>
                        <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Voir les profils
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
