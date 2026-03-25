"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { login, persistAuth } from "@/lib/api"
import { getDashboardByRole } from "@/lib/auth"

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    try {
      setLoading(true)
      const auth = await login(email, password)
      persistAuth(auth)
      toast.success("Connexion reussie")
      router.push(getDashboardByRole(auth.user.role))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Echec de la connexion"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Connexion</h1>
          <p className="mt-2 text-muted-foreground">
            Accedez a votre espace membre
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Se connecter</CardTitle>
            <CardDescription>Entrez vos identifiants pour acceder a votre compte</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <LogIn className="mr-1.5 h-4 w-4" />
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </CardContent>
          </form>
          <CardFooter className="flex flex-col gap-3">
            <Separator />
            <p className="text-center text-sm text-muted-foreground">
              {"Pas encore inscrit ?"}{" "}
              <Link href="/inscription" className="font-medium text-primary hover:underline">
                {"Creer un compte"}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
