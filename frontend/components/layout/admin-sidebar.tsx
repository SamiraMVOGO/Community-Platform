"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  FolderOpen,
  Megaphone,
  ArrowLeft,
  Users as UsersIcon,
  Building,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { clearAuth, getStoredUser } from "@/lib/api"
import type { UserRole } from "@/lib/types"

const adminNav = [
  {
    label: "Tableau de bord",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["super_admin", "admin", "mayor", "agent_municipal"],
  },
  {
    label: "Mairies",
    href: "/admin/municipalities",
    icon: Building,
    roles: ["super_admin"],
  },
  {
    label: "Utilisateurs enregistres",
    href: "/admin/utilisateurs",
    icon: Users,
    roles: ["super_admin", "admin", "mayor", "agent_municipal"],
  },
  {
    label: "Validations",
    href: "/admin/validations",
    icon: CheckCircle,
    roles: ["super_admin", "admin", "mayor", "agent_municipal"],
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderOpen,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Communication",
    href: "/admin/communication",
    icon: Megaphone,
    roles: ["super_admin", "admin", "mayor"],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const userRole = (getStoredUser()?.role || "agent_municipal") as UserRole
  const navItems = adminNav.filter((item) => item.roles.includes(userRole))

  function handleLogout() {
    clearAuth()
    router.replace("/connexion")
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <UsersIcon className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">CommunePro</span>
            <span className="text-xs text-sidebar-foreground/60">Administration</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="mb-3 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au site
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
