import type { Category } from "@/lib/types"

const categorySlugMap: Record<string, Category> = {
  "cadres-administratifs": "cadre_administratif",
  "cadres-techniques": "cadre_technique",
  "chefs-entreprise": "chef_entreprise",
  "chefs-d-entreprise": "chef_entreprise",
  "chef-d-entreprise": "chef_entreprise",
  artisans: "artisan",
  commercants: "commercant",
  "jeunes-entrepreneurs": "jeune_entrepreneur",
  "investisseurs-partenaires": "investisseur",
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase()
}

export function getCategoryFromSlug(slug?: string | null): Category | null {
  if (!slug) {
    return null
  }

  const normalized = normalizeSlug(slug)
  return categorySlugMap[normalized] || null
}

export function getCategoryFilterValueFromSlug(slug?: string | null): string {
  if (!slug) {
    return ""
  }

  return getCategoryFromSlug(slug) || normalizeSlug(slug)
}
