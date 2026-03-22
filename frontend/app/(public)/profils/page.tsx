"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { profiles } from "@/lib/mock-data"
import { ProfileCard } from "@/components/profiles/profile-card"
import { ProfileFilters } from "@/components/profiles/profile-filters"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 9

export default function ProfilsPage() {
  const searchParams = useSearchParams()
  const initialCategorie = searchParams.get("categorie") || ""

  const [search, setSearch] = useState("")
  const [categorie, setCategorie] = useState(initialCategorie)
  const [secteur, setSecteur] = useState("")
  const [niveauEtude, setNiveauEtude] = useState("")
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("nom")
  const [page, setPage] = useState(1)

  const filteredProfiles = useMemo(() => {
    let result = profiles.filter((p) => p.statut === "valide")

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          p.prenom.toLowerCase().includes(q) ||
          p.metier.toLowerCase().includes(q) ||
          p.competences.some((c) => c.toLowerCase().includes(q))
      )
    }

    if (categorie && categorie !== "all") {
      result = result.filter((p) => p.categorie === categorie)
    }
    if (secteur && secteur !== "all") {
      result = result.filter((p) => p.secteur === secteur)
    }
    if (niveauEtude && niveauEtude !== "all") {
      result = result.filter((p) => p.niveauEtude === niveauEtude)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "nom":
          return a.nom.localeCompare(b.nom)
        case "nom_desc":
          return b.nom.localeCompare(a.nom)
        case "date":
          return new Date(b.dateInscription).getTime() - new Date(a.dateInscription).getTime()
        case "date_asc":
          return new Date(a.dateInscription).getTime() - new Date(b.dateInscription).getTime()
        default:
          return 0
      }
    })

    return result
  }, [search, categorie, secteur, niveauEtude, sortBy])

  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE)
  const paginatedProfiles = filteredProfiles.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  function handleReset() {
    setCategorie("")
    setSecteur("")
    setNiveauEtude("")
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profils</h1>
        <p className="mt-2 text-muted-foreground">
          Consultez les profils des operateurs economiques valides de la commune
        </p>
      </div>

      <ProfileFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        categorie={categorie}
        onCategorieChange={(v) => { setCategorie(v); setPage(1) }}
        secteur={secteur}
        onSecteurChange={(v) => { setSecteur(v); setPage(1) }}
        niveauEtude={niveauEtude}
        onNiveauEtudeChange={(v) => { setNiveauEtude(v); setPage(1) }}
        layout={layout}
        onLayoutChange={setLayout}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleReset}
      />

      <div className="mt-4 text-sm text-muted-foreground">
        {filteredProfiles.length} profil{filteredProfiles.length > 1 ? "s" : ""} trouve{filteredProfiles.length > 1 ? "s" : ""}
      </div>

      {paginatedProfiles.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-foreground">Aucun profil trouve</p>
          <p className="mt-1 text-muted-foreground">Essayez de modifier vos criteres de recherche</p>
          <Button variant="outline" className="mt-4" onClick={handleReset}>
            Reinitialiser
          </Button>
        </div>
      ) : (
        <>
          <div
            className={
              layout === "grid"
                ? "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "mt-4 flex flex-col gap-3"
            }
          >
            {paginatedProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} layout={layout} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Precedent
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
