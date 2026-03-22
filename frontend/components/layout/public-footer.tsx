import Link from "next/link"
import { Users } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">CommunePro</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Plateforme de recensement et de gestion des cadres et operateurs economiques de la commune.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Navigation</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/annuaire" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Annuaire
                </Link>
              </li>
              <li>
                <Link href="/profils" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Profils
                </Link>
              </li>
              <li>
                <Link href="/actualites" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Actualites
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Espace membre</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/inscription" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {"S'inscrire"}
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Administration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Contact</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>Mairie de la Commune</li>
              <li>BP 1234, Centre-ville</li>
              <li>Tel : +225 00 00 00 00</li>
              <li>contact@communepro.ci</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          2025 CommunePro. Tous droits reserves. Plateforme de la commune.
        </div>
      </div>
    </footer>
  )
}
