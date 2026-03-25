"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiFetch, getStoredUser } from "@/lib/api"
import { getDocumentDownloadUrl } from "@/lib/document-links"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ROLE_LABELS } from "@/lib/types"

export default function MonEspacePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const storedUser = getStoredUser()
      if (!storedUser) {
        router.replace("/connexion")
        return
      }

      setUser(storedUser)

      try {
        const [categoriesData, myProfile] = await Promise.all([
          apiFetch("/categories"),
          apiFetch("/profiles/me").catch(() => null),
        ])

        setCategories(categoriesData || [])

        if (myProfile) {
          setProfile(myProfile)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [router])

  const selectedCategoryName = categories.find((c) => String(c.id) === String(profile?.category_id))?.name
  const profileStatusLabel = profile?.status || "Non renseigne"

  if (loading || !user) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mon espace</h1>
        <p className="mt-2 text-muted-foreground">
          Consultez vos informations, mettez a jour votre profil et vos documents.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compte connecte</CardTitle>
            <CardDescription>Informations de votre session actuelle</CardDescription>
            <div className="pt-2">
              <Button asChild>
                <Link href="/mon-espace/modifier">Modifier mon profil</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Nom</p>
              <p className="font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
            </div>

            <>
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Informations profil</p>
              </div>
              <div>
                <p className="text-muted-foreground">Categorie</p>
                <p className="font-medium text-foreground">{selectedCategoryName || "Non renseignee"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Statut</p>
                <Badge variant="outline">{profileStatusLabel}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Secteur</p>
                <p className="font-medium text-foreground">{profile?.sector || "Non renseigne"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Niveau d'etude</p>
                <p className="font-medium text-foreground">{profile?.education_level || "Non renseigne"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Experience</p>
                <p className="font-medium text-foreground">{profile?.experience || "Non renseignee"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Localisation</p>
                <p className="font-medium text-foreground">{profile?.location || "Non renseignee"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telephone</p>
                <p className="font-medium text-foreground">{profile?.phone || "Non renseigne"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Competences</p>
                <p className="font-medium text-foreground">{profile?.skills || "Non renseignees"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bio</p>
                <p className="font-medium text-foreground">{profile?.bio || "Non renseignee"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date de creation du profil</p>
                <p className="font-medium text-foreground">{profile?.created_at || "Non renseignee"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Documents</p>
                {profile?.documents?.length ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profile.documents.map((document) => (
                      <a
                        key={document.id}
                        href={getDocumentDownloadUrl(document.id, document.path, document.original_name)}
                        className="inline-flex items-center rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted"
                      >
                        {(document.type || "doc").toUpperCase()} - {document.original_name || "Telecharger"}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="font-medium text-foreground">Aucun document</p>
                )}
              </div>
            </>

            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild>
                <Link href="/profils">Voir les profils valides</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/annuaire">Explorer l'annuaire</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/actualites">Consulter les actualites</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
