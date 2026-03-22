import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { categoriesInfo, profiles, getStats } from "@/lib/mock-data"
import { CATEGORY_LABELS } from "@/lib/types"
import {
  Users,
  UserCheck,
  Briefcase,
  Building2,
  Hammer,
  ShoppingBag,
  Rocket,
  TrendingUp,
  Wrench,
  ArrowRight,
  ChevronRight,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Wrench,
  Building2,
  Hammer,
  ShoppingBag,
  Rocket,
  TrendingUp,
}

export default function HomePage() {
  const stats = getStats()
  const recentProfiles = profiles
    .filter((p) => p.statut === "valide")
    .slice(0, 4)

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary px-4 py-20 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent-foreground border-0">
                Plateforme officielle de la commune
              </Badge>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                Recensement des cadres et operateurs economiques
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
                {"Identifiez, connectez et valorisez les forces vives de notre commune. Rejoignez notre communaute d'acteurs economiques."}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/inscription">
                    {"S'inscrire maintenant"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                  <Link href="/annuaire">
                    {"Explorer l'annuaire"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b border-border bg-card px-4 py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4 lg:px-8">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Inscrits total</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <UserCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.valides}</p>
                <p className="text-xs text-muted-foreground">Profils valides</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                <Briefcase className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{Object.keys(stats.parSecteur).length}</p>
                <p className="text-xs text-muted-foreground">Secteurs couverts</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Building2 className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {"Explorez par categorie"}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-pretty text-muted-foreground">
                {"Decouvrez les differents profils d'acteurs economiques recenses dans notre commune."}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoriesInfo.map((cat) => {
                const Icon = iconMap[cat.icon] || Briefcase
                return (
                  <Link key={cat.id} href={`/profils?categorie=${cat.id}`}>
                    <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{cat.label}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{cat.description}</p>
                          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                            {cat.count} profils
                            <ChevronRight className="h-3 w-3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Recent profiles */}
        <section className="border-t border-border bg-muted/30 px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl lg:px-8">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Profils recents</h2>
                <p className="mt-1 text-muted-foreground">Derniers membres valides de la communaute</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/profils">
                  Voir tous
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentProfiles.map((profile) => (
                <Link key={profile.id} href={`/profils/${profile.id}`}>
                  <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {profile.prenom[0]}{profile.nom[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary">
                            {profile.prenom} {profile.nom}
                          </h3>
                          <p className="text-xs text-muted-foreground">{profile.metier}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_LABELS[profile.categorie]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {profile.secteur}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {"Rejoignez la communaute economique de la commune"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
              {"Inscrivez-vous pour etre recense et beneficier de la visibilite offerte par notre plateforme. Contribuez au developpement local."}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/inscription">
                  {"Creer mon profil"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/actualites">Voir les actualites</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
