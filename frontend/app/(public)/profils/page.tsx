"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ProfileCard } from "@/components/profiles/profile-card"
import { ProfileFilters } from "@/components/profiles/profile-filters"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { apiFetch } from "@/lib/api"
import type { Category, Profile } from "@/lib/types"
import { CATEGORY_LABELS } from "@/lib/types"
import { getCategoryFilterValueFromSlug, getCategoryFromSlug } from "@/lib/category-slugs"

const ITEMS_PER_PAGE = 9

interface ApiProfile {
  id: number
  bio?: string
  skills?: string
  experience?: string
  education_level?: string
  sector?: string
  location?: string
  phone?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  user?: {
    name: string
    email: string
    municipality_id?: number
  }
  category?: {
    slug: string
  }
}

interface ApiPaginatedProfiles {
  data: ApiProfile[]
}

interface MunicipalityOption {
  id: number
  name: string
}

type ProfileWithMunicipality = Profile & { municipalityId?: number }

const categoryValues: Category[] = [
  "cadre_administratif",
  "cadre_technique",
  "chef_entreprise",
  "artisan",
  "commercant",
  "jeune_entrepreneur",
  "investisseur",
]

function normalizeCategoryFilter(value: string): string {
  if (!value) {
    return ""
  }

  if (categoryValues.includes(value as Category)) {
    return value
  }

  return getCategoryFilterValueFromSlug(value)
}

function normalizeStatus(status: ApiProfile["status"]): Profile["statut"] {
  if (status === "approved") return "valide"
  if (status === "pending") return "en_attente"
  return "rejete"
}

function mapApiProfile(profile: ApiProfile): Profile | null {
  if (!profile.user?.name || !profile.user?.email || !profile.category?.slug) {
    return null
  }

  const category = getCategoryFromSlug(profile.category.slug)
  if (!category) {
    return null
  }

  const [prenom, ...nomParts] = profile.user.name.split(" ")
  const nom = nomParts.join(" ") || prenom

  return {
    id: String(profile.id),
    nom,
    prenom,
    email: profile.user.email,
    telephone: profile.phone || "N/A",
    categorie: category,
    secteur: profile.sector || "Non precise",
    metier: profile.sector || "Operateur economique",
    niveauEtude: profile.education_level || "Non precise",
    experience: profile.experience || "Non precise",
    bio: profile.bio || "Aucune biographie",
    competences: (profile.skills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    localisation: profile.location || "Non precise",
    statut: normalizeStatus(profile.status),
    dateInscription: profile.created_at,
    municipalityId: profile.user.municipality_id,
  }
}

export default function ProfilsPage() {
  const searchParams = useSearchParams()
  const initialCategorie = normalizeCategoryFilter(searchParams.get("categorie") || "")
  const [profiles, setProfiles] = useState<ProfileWithMunicipality[]>([])
  const [communes, setCommunes] = useState<MunicipalityOption[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [categorie, setCategorie] = useState(initialCategorie)
  const [commune, setCommune] = useState("")
  const [secteur, setSecteur] = useState("")
  const [niveauEtude, setNiveauEtude] = useState("")
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("date")
  const [page, setPage] = useState(1)

  useEffect(() => {
    setCategorie(initialCategorie)
    setPage(1)
  }, [initialCategorie])

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const [payload, municipalities] = await Promise.all([
          apiFetch<ApiPaginatedProfiles>("/profiles?per_page=200"),
          apiFetch<MunicipalityOption[]>("/municipalities/public"),
        ])

        setCommunes(municipalities || [])
        setProfiles(
          (payload.data || [])
            .map(mapApiProfile)
            .filter((profile): profile is ProfileWithMunicipality => Boolean(profile))
        )
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadProfiles()
  }, [])

  const filteredProfiles = useMemo(() => {
    let result = profiles.filter((p) => p.statut === "valide")

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          p.prenom.toLowerCase().includes(q) ||
          p.metier.toLowerCase().includes(q) ||
          p.competences.some((c) => c.toLowerCase().includes(q)) ||
          CATEGORY_LABELS[p.categorie].toLowerCase().includes(q)
      )
    }

    if (categorie && categorie !== "all") {
      if (categorie === "cadres") {
        result = result.filter(
          (p) => p.categorie === "cadre_administratif" || p.categorie === "cadre_technique"
        )
      } else {
        result = result.filter((p) => p.categorie === categorie)
      }
    }
    if (commune && commune !== "all") {
      const selectedMunicipalityId = Number(commune)
      result = result.filter((p) => p.municipalityId === selectedMunicipalityId)
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
  }, [profiles, search, categorie, commune, secteur, niveauEtude, sortBy])

  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE)
  const paginatedProfiles = filteredProfiles.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  function handleReset() {
    setCategorie("")
    setCommune("")
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
        commune={commune}
        onCommuneChange={(v) => { setCommune(v); setPage(1) }}
        communes={communes}
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

      {loading && (
        <div className="mt-6 text-sm text-muted-foreground">Chargement des profils...</div>
      )}

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
