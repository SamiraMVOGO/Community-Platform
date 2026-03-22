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
import { LogIn, LayoutDashboard, UserPlus } from "lucide-react"

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    toast.success("Connexion simulee avec succes !")
    router.push("/profils")
  }

  function goToAdmin() {
    toast.success("Acces administration (mode demo)")
    router.push("/admin")
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
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full">
                <LogIn className="mr-1.5 h-4 w-4" />
                Se connecter
              </Button>
            </CardContent>
          </form>
          <CardFooter className="flex flex-col gap-3">
            <Separator />
            <Button
              variant="outline"
              className="w-full"
              onClick={goToAdmin}
            >
              <LayoutDashboard className="mr-1.5 h-4 w-4" />
              Acceder a {"l'administration"} (demo)
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {"Pas encore inscrit ?"}{" "}
              <Link href="/inscription" className="font-medium text-primary hover:underline">
                {"Creer un compte"}
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3">
          <p className="text-center text-xs text-muted-foreground">
            {"Mode demonstration : l'authentification est simulee. Cliquez sur \"Administration\" pour acceder au tableau de bord admin."}
          </p>
        </div>
      </div>
    </div>
  )
}
