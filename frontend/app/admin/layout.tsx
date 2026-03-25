"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { canAccessAdminPath, ensureAuthorizedAdminAccess, getDashboardByRole } from "@/lib/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const user = ensureAuthorizedAdminAccess()

    if (!user) {
      router.replace("/connexion")
      return
    }

    const roleHome = getDashboardByRole(user.role)
    if (pathname === "/admin" && roleHome !== "/admin") {
      router.replace(roleHome)
      return
    }

    if (!canAccessAdminPath(user.role, pathname)) {
      router.replace(roleHome)
      return
    }

    setAuthorized(true)
  }, [pathname, router])

  if (!authorized) {
    return null
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">Administration</span>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
