"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  X,
  Users,
  BookOpen,
  FolderOpen,
  Newspaper,
  UserPlus,
  LogIn,
  LayoutDashboard,
  LogOut,
} from "lucide-react"
import { clearAuth, getStoredUser } from "@/lib/api"
import { getDashboardByRole, isAdminLikeRole } from "@/lib/auth"
import type { User } from "@/lib/types"

const navigation = [
  { label: "Accueil", href: "/", icon: BookOpen },
  { label: "Annuaire", href: "/annuaire", icon: FolderOpen },
  { label: "Profils", href: "/profils", icon: Users },
  { label: "Actualites", href: "/actualites", icon: Newspaper },
]

export function PublicHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [pathname])

  const dashboardPath = user ? getDashboardByRole(user.role) : "/connexion"

  const handleLogout = () => {
    clearAuth()
    setUser(null)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-foreground">
              CommunePro
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Gestion communautaire
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={dashboardPath}>
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  {isAdminLikeRole(user.role) ? "Dashboard" : "Mon espace"}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Deconnexion
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/connexion">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Connexion
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/inscription">
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  {"S'inscrire"}
                </Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex items-center justify-between pb-4">
              <span className="text-lg font-bold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fermer">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <div className="my-3 border-t border-border" />
              {user ? (
                <>
                  <Link
                    href={dashboardPath}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {isAdminLikeRole(user.role) ? "Dashboard" : "Mon espace"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout()
                      setOpen(false)
                    }}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Deconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
                  >
                    <UserPlus className="h-4 w-4" />
                    {"S'inscrire"}
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
