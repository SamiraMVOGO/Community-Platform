"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCards } from "@/components/admin/stats-cards"
import { getStats, profiles } from "@/lib/mock-data"
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from "recharts"

const COLORS = [
  "oklch(0.35 0.12 250)",
  "oklch(0.55 0.16 160)",
  "oklch(0.65 0.15 45)",
  "oklch(0.6 0.12 280)",
  "oklch(0.55 0.1 200)",
  "oklch(0.7 0.12 30)",
  "oklch(0.5 0.14 320)",
]

export default function AdminDashboardPage() {
  const stats = getStats()

  const secteurData = Object.entries(stats.parSecteur).map(([name, value]) => ({
    name,
    value,
  }))

  const niveauData = Object.entries(stats.parNiveauEtude).map(([name, value]) => ({
    name,
    value,
  }))

  const categorieData = Object.entries(stats.parCategorie).map(([key, value]) => ({
    name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] || key,
    value,
  }))

  const recentProfiles = profiles
    .sort((a, b) => new Date(b.dateInscription).getTime() - new Date(a.dateInscription).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d{"'"}ensemble de la plateforme</p>
      </div>

      <StatsCards
        total={stats.total}
        valides={stats.valides}
        enAttente={stats.enAttente}
        rejetes={stats.rejetes}
      />

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie chart - Secteurs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repartition par secteur</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={secteurData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                  fontSize={11}
                >
                  {secteurData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar chart - Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profils par categorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categorieData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={130} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.35 0.12 250)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line chart - Inscriptions par mois */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inscriptions par mois</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.inscriptionsParMois}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="oklch(0.55 0.16 160)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.55 0.16 160)", r: 4 }}
                  name="Inscriptions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar chart - Niveaux d'etude */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{"Repartition par niveau d'etude"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={niveauData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.65 0.15 45)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent inscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dernieres inscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {recentProfiles.map((profile) => {
              const statusColor =
                profile.statut === "valide"
                  ? "bg-accent/10 text-accent border-accent/20"
                  : profile.statut === "en_attente"
                    ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"

              return (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {profile.prenom[0]}{profile.nom[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {profile.prenom} {profile.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">{profile.metier}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[profile.categorie]}
                  </Badge>
                  <Badge className={statusColor} variant="outline">
                    {STATUS_LABELS[profile.statut]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(profile.dateInscription).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
