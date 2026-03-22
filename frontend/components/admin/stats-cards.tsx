import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, Clock, XCircle } from "lucide-react"

interface StatsCardsProps {
  total: number
  valides: number
  enAttente: number
  rejetes: number
}

export function StatsCards({ total, valides, enAttente, rejetes }: StatsCardsProps) {
  const cards = [
    {
      label: "Total inscrits",
      value: total,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Profils valides",
      value: valides,
      icon: UserCheck,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "En attente",
      value: enAttente,
      icon: Clock,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "Rejetes",
      value: rejetes,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
