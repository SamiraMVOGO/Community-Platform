import type { User, UserRole } from "@/lib/types"
import { clearAuth, getStoredUser } from "@/lib/api"

const roleDashboardMap: Record<UserRole, string> = {
  super_admin: "/admin",
  admin: "/admin",
  mayor: "/admin",
  agent_municipal: "/admin",
  agent_pending: "/mon-espace",
  user: "/mon-espace",
}

const roleAdminRoutes: Record<Exclude<UserRole, "user" | "agent_pending">, string[]> = {
  super_admin: [
    "/admin",
    "/admin/municipalities",
    "/admin/utilisateurs",
    "/admin/validations",
    "/admin/categories",
    "/admin/communication",
  ],
  admin: [
    "/admin",
    "/admin/utilisateurs",
    "/admin/validations",
    "/admin/categories",
    "/admin/communication",
  ],
  mayor: [
    "/admin",
    "/admin/utilisateurs",
    "/admin/validations",
    "/admin/communication",
  ],
  agent_municipal: [
    "/admin",
    "/admin/utilisateurs",
    "/admin/validations",
  ],
}

export function getDashboardByRole(role: UserRole): string {
  return roleDashboardMap[role]
}

export function requireUser(): User | null {
  const user = getStoredUser()
  if (!user) {
    return null
  }

  return user
}

export function isAdminLikeRole(role: string): boolean {
  return ["super_admin", "admin", "mayor", "agent_municipal"].includes(role)
}

export function ensureAuthorizedAdminAccess(): User | null {
  const user = getStoredUser()
  if (!user || !isAdminLikeRole(user.role)) {
    clearAuth()
    return null
  }

  return user
}

export function canAccessAdminPath(role: UserRole, pathname: string): boolean {
  if (role === "user" || role === "agent_pending") {
    return false
  }

  const allowedRoutes = roleAdminRoutes[role]
  return allowedRoutes.includes(pathname)
}
