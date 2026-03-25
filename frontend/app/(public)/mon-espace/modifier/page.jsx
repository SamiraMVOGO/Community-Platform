"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { apiFetch, getStoredUser } from "@/lib/api"
import { getDocumentDownloadUrl } from "@/lib/document-links"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ModifierMonEspacePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [categories, setCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    category_id: "",
    bio: "",
    skills: "",
    experience: "",
    education_level: "",
    sector: "",
    location: "",
    phone: "",
  })
  const [files, setFiles] = useState({
    cv: null,
    photo: null,
    legal_document: null,
  })

  function buildPrefillData(baseProfile, currentUser, availableCategories) {
    if (baseProfile) {
      return {
        category_id: baseProfile.category_id ? String(baseProfile.category_id) : "",
        bio: baseProfile.bio || "",
        skills: baseProfile.skills || "",
        experience: baseProfile.experience || "",
        education_level: baseProfile.education_level || "",
        sector: baseProfile.sector || "",
        location: baseProfile.location || "",
        phone: baseProfile.phone || "",
      }
    }

    return {
      category_id: availableCategories[0] ? String(availableCategories[0].id) : "",
      bio: currentUser ? `Profil de ${currentUser.name}` : "",
      skills: "Gestion de projet, Communication",
      experience: "3 ans",
      education_level: "Licence",
      sector: "Services",
      location: "Centre-ville",
      phone: "+2376XXXXXXXX",
    }
  }

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

        const nextCategories = categoriesData || []
        setCategories(nextCategories)

        if (myProfile) {
          setProfile(myProfile)
          setFormData(buildPrefillData(myProfile, storedUser, nextCategories))
        } else {
          setFormData(buildPrefillData(null, storedUser, nextCategories))
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [router])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleAutofill() {
    setFormData(buildPrefillData(profile, user, categories))
    toast.success("Champs auto-remplis")
  }

  async function handleSaveProfile() {
    if (submitting) {
      return
    }

    if (!profile && !formData.category_id) {
      toast.error("Veuillez selectionner une categorie")
      return
    }

    try {
      setSubmitting(true)
      const payload = new FormData()

      if (!profile) {
        payload.append("category_id", formData.category_id)
      }

      payload.append("bio", formData.bio)
      payload.append("skills", formData.skills)
      payload.append("experience", formData.experience)
      payload.append("education_level", formData.education_level)
      payload.append("sector", formData.sector)
      payload.append("location", formData.location)
      payload.append("phone", formData.phone)

      if (files.cv) {
        payload.append("cv", files.cv)
      }
      if (files.photo) {
        payload.append("photo", files.photo)
      }
      if (files.legal_document) {
        payload.append("legal_document", files.legal_document)
      }

      const savedProfile = profile
        ? await apiFetch(`/profiles/${profile.id}`, { method: "PUT", body: payload })
        : await apiFetch("/profiles", { method: "POST", body: payload })

      setProfile(savedProfile)
      setFormData(buildPrefillData(savedProfile, user, categories))
      setFiles({ cv: null, photo: null, legal_document: null })
      toast.success("Profil mis a jour avec succes")
      router.push("/mon-espace")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise a jour")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Modifier mon profil</h1>
          <p className="mt-2 text-muted-foreground">Mettez a jour vos informations et vos documents.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/mon-espace">Retour</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edition du profil</CardTitle>
          <CardDescription>Utilisez le bouton auto-remplir puis ajustez les valeurs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" type="button" onClick={handleAutofill}>
              Auto-remplir les champs
            </Button>
          </div>

          {!profile && (
            <div className="space-y-1.5">
              <Label>Categorie *</Label>
              <Select value={formData.category_id} onValueChange={(v) => updateField("category_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner une categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="sector">Secteur</Label>
            <Input id="sector" value={formData.sector} onChange={(e) => updateField("sector", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="education_level">Niveau d'etude</Label>
            <Input id="education_level" value={formData.education_level} onChange={(e) => updateField("education_level", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="experience">Experience</Label>
            <Input id="experience" value={formData.experience} onChange={(e) => updateField("experience", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Localisation</Label>
            <Input id="location" value={formData.location} onChange={(e) => updateField("location", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telephone</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Competences</Label>
            <Input id="skills" value={formData.skills} onChange={(e) => updateField("skills", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="cv">CV</Label>
              <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFiles((prev) => ({ ...prev, cv: e.target.files?.[0] || null }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photo">Photo</Label>
              <Input id="photo" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setFiles((prev) => ({ ...prev, photo: e.target.files?.[0] || null }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="legal_document">Document legal</Label>
              <Input id="legal_document" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setFiles((prev) => ({ ...prev, legal_document: e.target.files?.[0] || null }))} />
            </div>
          </div>

          {profile?.documents?.length ? (
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Documents actuels</p>
              <div className="flex flex-wrap gap-2">
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
            </div>
          ) : null}

          <Button onClick={handleSaveProfile} disabled={submitting}>
            {submitting ? "Enregistrement..." : "Modifier mon profil"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
