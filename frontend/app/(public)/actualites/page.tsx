import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { newsItems } from "@/lib/mock-data"
import { Calendar, Newspaper, TrendingUp, CalendarDays } from "lucide-react"

export const metadata = {
  title: "Actualites",
  description: "Actualites et annonces de la commune",
}

const typeLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  annonce: { label: "Annonce", variant: "default" },
  economie: { label: "Economie", variant: "secondary" },
  evenement: { label: "Evenement", variant: "outline" },
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  annonce: Newspaper,
  economie: TrendingUp,
  evenement: CalendarDays,
}

function NewsCard({ item }: { item: typeof newsItems[0] }) {
  const typeInfo = typeLabels[item.type]
  const Icon = typeIcons[item.type] || Newspaper

  return (
    <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex items-center gap-2">
          <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(item.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary">
              {item.titre}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.resume}</p>
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-sm leading-relaxed text-foreground/80">{item.contenu}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ActualitesPage() {
  const allNews = newsItems
  const annonces = newsItems.filter((n) => n.type === "annonce")
  const economie = newsItems.filter((n) => n.type === "economie")
  const evenements = newsItems.filter((n) => n.type === "evenement")

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Actualites</h1>
        <p className="mt-2 text-muted-foreground">
          Suivez les dernieres nouvelles et annonces de la commune
        </p>
      </div>

      <Tabs defaultValue="toutes" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="toutes">Toutes ({allNews.length})</TabsTrigger>
          <TabsTrigger value="annonces">Annonces ({annonces.length})</TabsTrigger>
          <TabsTrigger value="economie">Economie ({economie.length})</TabsTrigger>
          <TabsTrigger value="evenements">Evenements ({evenements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="toutes">
          <div className="grid gap-4 md:grid-cols-2">
            {allNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="annonces">
          <div className="grid gap-4 md:grid-cols-2">
            {annonces.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="economie">
          <div className="grid gap-4 md:grid-cols-2">
            {economie.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evenements">
          <div className="grid gap-4 md:grid-cols-2">
            {evenements.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
