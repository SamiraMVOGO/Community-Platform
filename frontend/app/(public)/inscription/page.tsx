"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABELS, NIVEAUX_ETUDE, SECTEURS } from "@/lib/types"
import type { Category } from "@/lib/types"
import { Check, ChevronLeft, ChevronRight, User, Briefcase, FileText, Eye } from "lucide-react"

const steps = [
  { id: 1, label: "Informations personnelles", icon: User },
  { id: 2, label: "Informations professionnelles", icon: Briefcase },
  { id: 3, label: "Documents", icon: FileText },
  { id: 4, label: "Recapitulatif", icon: Eye },
]

const step1Schema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  prenom: z.string().min(2, "Le prenom doit contenir au moins 2 caracteres"),
  email: z.string().email("Adresse email invalide"),
  telephone: z.string().min(8, "Numero de telephone invalide"),
})

const step2Schema = z.object({
  categorie: z.string().min(1, "Veuillez selectionner une categorie"),
  secteur: z.string().min(1, "Veuillez selectionner un secteur"),
  metier: z.string().min(2, "Veuillez indiquer votre metier"),
  niveauEtude: z.string().min(1, "Veuillez selectionner un niveau d'etude"),
  experience: z.string().min(1, "Veuillez indiquer votre experience"),
  bio: z.string().min(10, "La biographie doit contenir au moins 10 caracteres"),
  competences: z.string().min(1, "Veuillez indiquer au moins une competence"),
})

export default function InscriptionPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    categorie: "",
    secteur: "",
    metier: "",
    niveauEtude: "",
    experience: "",
    bio: "",
    competences: "",
    localisation: "",
    cv: null as File | null,
    photo: null as File | null,
  })

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function validateStep(stepNum: number): boolean {
    try {
      if (stepNum === 1) {
        step1Schema.parse({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
        })
      } else if (stepNum === 2) {
        step2Schema.parse({
          categorie: formData.categorie,
          secteur: formData.secteur,
          metier: formData.metier,
          niveauEtude: formData.niveauEtude,
          experience: formData.experience,
          bio: formData.bio,
          competences: formData.competences,
        })
      }
      setErrors({})
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.errors.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0] as string] = e.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4))
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1))
  }

  function handleSubmit() {
    toast.success("Inscription soumise avec succes ! Votre profil est en attente de validation.", {
      duration: 5000,
    })
    setTimeout(() => router.push("/"), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Inscription</h1>
        <p className="mt-2 text-muted-foreground">
          {"Rejoignez la communaute des acteurs economiques de la commune"}
        </p>
      </div>

      {/* Steps indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    step > s.id
                      ? "bg-accent text-accent-foreground"
                      : step === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span className="hidden text-center text-xs font-medium text-muted-foreground sm:block">
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    step > s.id ? "bg-accent" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Renseignez vos coordonnees de base</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  placeholder="Votre nom de famille"
                  value={formData.nom}
                  onChange={(e) => updateField("nom", e.target.value)}
                />
                {errors.nom && <p className="text-xs text-destructive">{errors.nom}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prenom">Prenom *</Label>
                <Input
                  id="prenom"
                  placeholder="Votre prenom"
                  value={formData.prenom}
                  onChange={(e) => updateField("prenom", e.target.value)}
                />
                {errors.prenom && <p className="text-xs text-destructive">{errors.prenom}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Adresse email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telephone">Telephone *</Label>
              <Input
                id="telephone"
                placeholder="+225 XX XX XX XX"
                value={formData.telephone}
                onChange={(e) => updateField("telephone", e.target.value)}
              />
              {errors.telephone && <p className="text-xs text-destructive">{errors.telephone}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="localisation">Localisation</Label>
              <Input
                id="localisation"
                placeholder="Quartier, zone"
                value={formData.localisation}
                onChange={(e) => updateField("localisation", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Informations professionnelles</CardTitle>
            <CardDescription>Decrivez votre profil professionnel</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Categorie *</Label>
                <Select value={formData.categorie} onValueChange={(v) => updateField("categorie", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categorie && <p className="text-xs text-destructive">{errors.categorie}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Secteur *</Label>
                <Select value={formData.secteur} onValueChange={(v) => updateField("secteur", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTEURS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.secteur && <p className="text-xs text-destructive">{errors.secteur}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="metier">Metier / Fonction *</Label>
              <Input
                id="metier"
                placeholder="Ex: Ingenieur civil, Commercant grossiste..."
                value={formData.metier}
                onChange={(e) => updateField("metier", e.target.value)}
              />
              {errors.metier && <p className="text-xs text-destructive">{errors.metier}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>{"Niveau d'etude *"}</Label>
                <Select value={formData.niveauEtude} onValueChange={(v) => updateField("niveauEtude", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEAUX_ETUDE.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.niveauEtude && <p className="text-xs text-destructive">{errors.niveauEtude}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="experience">Experience *</Label>
                <Input
                  id="experience"
                  placeholder="Ex: 5 ans"
                  value={formData.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                />
                {errors.experience && <p className="text-xs text-destructive">{errors.experience}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio">Biographie *</Label>
              <Textarea
                id="bio"
                placeholder="Decrivez votre parcours et vos activites..."
                rows={4}
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="competences">Competences * (separees par des virgules)</Label>
              <Input
                id="competences"
                placeholder="Ex: Gestion, Marketing, Leadership"
                value={formData.competences}
                onChange={(e) => updateField("competences", e.target.value)}
              />
              {errors.competences && <p className="text-xs text-destructive">{errors.competences}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Joignez vos documents justificatifs (optionnel - simulation)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="photo">Photo de profil</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.files?.[0] || null }))}
              />
              <p className="text-xs text-muted-foreground">Formats acceptes : JPG, PNG. Taille max : 2Mo</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cv">CV / Resume</Label>
              <Input
                id="cv"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFormData((prev) => ({ ...prev, cv: e.target.files?.[0] || null }))}
              />
              <p className="text-xs text-muted-foreground">Formats acceptes : PDF, DOC. Taille max : 5Mo</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                {"Les documents sont optionnels mais aident a valider votre profil plus rapidement. Ils seront examines par l'administration."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 - Review */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Recapitulatif</CardTitle>
            <CardDescription>Verifiez vos informations avant de soumettre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Informations personnelles</h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Nom complet</dt>
                    <dd className="font-medium text-foreground">{formData.prenom} {formData.nom}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium text-foreground">{formData.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Telephone</dt>
                    <dd className="font-medium text-foreground">{formData.telephone}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Localisation</dt>
                    <dd className="font-medium text-foreground">{formData.localisation || "Non renseignee"}</dd>
                  </div>
                </dl>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Informations professionnelles</h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Categorie</dt>
                    <dd>
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[formData.categorie as Category] || formData.categorie}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Secteur</dt>
                    <dd className="font-medium text-foreground">{formData.secteur}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Metier</dt>
                    <dd className="font-medium text-foreground">{formData.metier}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{"Niveau d'etude"}</dt>
                    <dd className="font-medium text-foreground">{formData.niveauEtude}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Experience</dt>
                    <dd className="font-medium text-foreground">{formData.experience}</dd>
                  </div>
                </dl>
                <div className="mt-2">
                  <dt className="text-sm text-muted-foreground">Competences</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {formData.competences.split(",").map((c) => (
                      <Badge key={c.trim()} variant="outline" className="text-xs">
                        {c.trim()}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Documents</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.photo ? `Photo : ${formData.photo.name}` : "Pas de photo jointe"}{" / "}
                  {formData.cv ? `CV : ${formData.cv.name}` : "Pas de CV joint"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
        >
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Precedent
        </Button>
        {step < 4 ? (
          <Button onClick={nextStep}>
            Suivant
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Soumettre mon inscription
            <Check className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
