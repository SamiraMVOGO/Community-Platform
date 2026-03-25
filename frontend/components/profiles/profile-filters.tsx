"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORY_LABELS, SECTEURS, NIVEAUX_ETUDE } from "@/lib/types"
import { Search, X, LayoutGrid, List, SlidersHorizontal } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"

interface ProfileFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  categorie: string
  onCategorieChange: (v: string) => void
  commune: string
  onCommuneChange: (v: string) => void
  communes: Array<{ id: number; name: string }>
  secteur: string
  onSecteurChange: (v: string) => void
  niveauEtude: string
  onNiveauEtudeChange: (v: string) => void
  layout: "grid" | "list"
  onLayoutChange: (v: "grid" | "list") => void
  sortBy: string
  onSortChange: (v: string) => void
  onReset: () => void
}

export function ProfileFilters({
  search,
  onSearchChange,
  categorie,
  onCategorieChange,
  commune,
  onCommuneChange,
  communes,
  secteur,
  onSecteurChange,
  niveauEtude,
  onNiveauEtudeChange,
  layout,
  onLayoutChange,
  sortBy,
  onSortChange,
  onReset,
}: ProfileFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const hasFilters = categorie || commune || secteur || niveauEtude

  return (
    <div className="flex flex-col gap-4">
      {/* Search + layout toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, metier, competence..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center rounded-md border border-border">
          <Button
            variant={layout === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => onLayoutChange("grid")}
            aria-label="Vue grille"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => onLayoutChange("list")}
            aria-label="Vue liste"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-1.5 h-4 w-4" />
              Filtres avances
              {hasFilters && (
                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {[categorie, commune, secteur, niveauEtude].filter(Boolean).length}
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nom">Nom (A-Z)</SelectItem>
                <SelectItem value="nom_desc">Nom (Z-A)</SelectItem>
                <SelectItem value="date">Date (recent)</SelectItem>
                <SelectItem value="date_asc">Date (ancien)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CollapsibleContent className="mt-3">
          <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Categorie</Label>
              <Select value={categorie} onValueChange={onCategorieChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les categories</SelectItem>
                  <SelectItem value="cadres">Cadres (administratifs + techniques)</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Commune</Label>
              <Select value={commune} onValueChange={onCommuneChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les communes</SelectItem>
                  {communes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Secteur</Label>
              <Select value={secteur} onValueChange={onSecteurChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  {SECTEURS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{"Niveau d'etude"}</Label>
              <Select value={niveauEtude} onValueChange={onNiveauEtudeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  {NIVEAUX_ETUDE.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="mt-2" onClick={onReset}>
              <X className="mr-1.5 h-3 w-3" />
              Reinitialiser les filtres
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
