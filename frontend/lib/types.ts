export type ProfileStatus = "valide" | "en_attente" | "rejete"

export type UserRole = "super_admin" | "admin" | "mayor" | "agent_municipal" | "user"

export type Category =
  | "cadre_administratif"
  | "cadre_technique"
  | "chef_entreprise"
  | "artisan"
  | "commercant"
  | "jeune_entrepreneur"
  | "investisseur"

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Administrateur",
  admin: "Administrateur",
  mayor: "Maire",
  agent_municipal: "Agent Municipal",
  user: "Utilisateur",
}

export const CATEGORY_LABELS: Record<Category, string> = {
  cadre_administratif: "Cadre administratif",
  cadre_technique: "Cadre technique",
  chef_entreprise: "Chef d'entreprise",
  artisan: "Artisan",
  commercant: "Commercant",
  jeune_entrepreneur: "Jeune entrepreneur",
  investisseur: "Investisseur / Partenaire",
}

export const STATUS_LABELS: Record<ProfileStatus, string> = {
  valide: "Valide",
  en_attente: "En attente",
  rejete: "Rejete",
}

export const NIVEAUX_ETUDE = [
  "Bac",
  "Bac+2",
  "Bac+3 (Licence)",
  "Bac+5 (Master)",
  "Bac+8 (Doctorat)",
  "Formation professionnelle",
  "Autodidacte",
] as const

export const SECTEURS = [
  "Agriculture",
  "Agroalimentaire",
  "Artisanat",
  "BTP",
  "Commerce",
  "Education",
  "Energie",
  "Finance",
  "Industrie",
  "Informatique",
  "Sante",
  "Services",
  "Tourisme",
  "Transport",
] as const

export interface Profile {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  categorie: Category
  secteur: string
  metier: string
  niveauEtude: string
  experience: string
  bio: string
  competences: string[]
  localisation: string
  statut: ProfileStatus
  dateInscription: string
  photo?: string
}

export interface NewsItem {
  id: string
  titre: string
  resume: string
  contenu: string
  type: "annonce" | "economie" | "evenement"
  date: string
  image?: string
}

export interface Announcement {
  id: string
  titre: string
  contenu: string
  cible: Category | "tous"
  date: string
  auteur: string
}

export interface CategoryInfo {
  id: Category
  label: string
  description: string
  icon: string
  count: number
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  municipality_id?: number
  is_active: boolean
  created_at: string
  updated_at: string
  municipality?: Municipality
}

export interface Municipality {
  id: number
  name: string
  slug: string
  description?: string
  location?: string
  mayor_id?: number
  is_active: boolean
  created_at: string
  updated_at: string
  mayor?: User
  agents?: User[]
}
