"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCards } from "@/components/admin/stats-cards"
import { STATUS_LABELS } from "@/lib/types"
import { apiFetch } from "@/lib/api"
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
  const [stats, setStats] = useState({
    totalProfiles: 0,
    approvedProfiles: 0,
    pendingProfiles: 0,
    rejectedProfiles: 0,
  })
  const [secteurData, setSecteurData] = useState<Array<{ name: string; value: number }>>([])
  const [niveauData, setNiveauData] = useState<Array<{ name: string; value: number }>>([])
  const [categorieData, setCategorieData] = useState<Array<{ name: string; value: number }>>([])
  const [recentProfiles, setRecentProfiles] = useState<any[]>([])
  const [monthlyGrowth, setMonthlyGrowth] = useState<Array<{ month: string; count: number }>>([])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboard, sectors, education, categories, pending, growth] = await Promise.all([
          apiFetch<any>("/statistics/dashboard"),
          apiFetch<Array<{ name: string; value: number }>>("/statistics/by-sector"),
          apiFetch<Array<{ name: string; value: number }>>("/statistics/by-education"),
          apiFetch<Array<{ name: string; value: number }>>("/statistics/by-category"),
          apiFetch<{ data: any[] }>("/admin/profiles/pending"),
          apiFetch<Array<{ month: string; count: number }>>("/statistics/monthly-growth"),
        ])

        setStats(dashboard)
        setSecteurData(sectors)
        setNiveauData(education)
        setCategorieData(categories)
        setRecentProfiles((pending.data || []).slice(0, 5))
        setMonthlyGrowth(growth.reverse())
      } catch (error) {
        console.error(error)
      }
    }

    loadDashboard()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d{"'"}ensemble de la plateforme</p>
      </div>

      <StatsCards
        total={stats.totalProfiles}
        valides={stats.approvedProfiles}
        enAttente={stats.pendingProfiles}
        rejetes={stats.rejectedProfiles}
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
              <LineChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
                profile.status === "approved"
                  ? "bg-accent/10 text-accent border-accent/20"
                  : profile.status === "pending"
                    ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"

              const [prenom, ...nomParts] = (profile.user?.name || "Utilisateur").split(" ")
              const nom = nomParts.join(" ") || prenom

              return (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {prenom[0]}{nom[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {prenom} {nom}
                    </p>
                    <p className="text-xs text-muted-foreground">{profile.sector || "Secteur"}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {profile.category?.name || "Categorie"}
                  </Badge>
                  <Badge className={statusColor} variant="outline">
                    {STATUS_LABELS[profile.status === "approved" ? "valide" : profile.status === "pending" ? "en_attente" : "rejete"]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString("fr-FR")}
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
