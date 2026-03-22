"use client"

import Link from "next/link"
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

const adminNav = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Mairies", href: "/admin/municipalities", icon: Building },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Validations", href: "/admin/validations", icon: CheckCircle },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Communication", href: "/admin/communication", icon: Megaphone },
]

export function AdminSidebar() {
  const pathname = usePathname()

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
              {adminNav.map((item) => (
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
