"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  Building2, 
  BarChart3, 
  Settings, 
  Users, 
  Shield, 
  Home,
  ChevronDown,
  Plus,
  Eye,
  Edit
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRole } from "@/generated/prisma"
import { signOut } from "next-auth/react"

interface Property {
  id: string
  name: string
  city?: string
  _count?: {
    competitors: number
    roomTypes: number
  }
}

interface AppSidebarProps {
  properties?: Property[]
}

export function AppSidebar({ properties = [] }: AppSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "bg-red-500"
      case UserRole.ADMIN:
        return "bg-orange-500"
      case UserRole.OWNER:
        return "bg-blue-500"
      case UserRole.VIEWER:
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "Super Admin"
      case UserRole.ADMIN:
        return "Admin"
      case UserRole.OWNER:
        return "Owner"
      case UserRole.VIEWER:
        return "Viewer"
      default:
        return "Viewer"
    }
  }

  const canCreateProperties = session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SUPER_ADMIN
  const canAccessAdmin = session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SUPER_ADMIN
  const canAccessSuperAdmin = session?.user.role === UserRole.SUPER_ADMIN

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Pricing Monitor</span>
            <span className="text-xs text-muted-foreground">Hospitality</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation principale */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Properties */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Strutture</span>
            {canCreateProperties && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/properties/new">
                  <Plus className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {properties.length === 0 ? (
                <SidebarMenuItem>
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    Nessuna struttura
                  </div>
                </SidebarMenuItem>
              ) : (
                properties.map((property) => (
                  <SidebarMenuItem key={property.id}>
                    <SidebarMenuButton asChild isActive={isActive(`/properties/${property.id}`)}>
                      <Link href={`/properties/${property.id}`}>
                        <Building2 className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="text-sm">{property.name}</span>
                          {property.city && (
                            <span className="text-xs text-muted-foreground">{property.city}</span>
                          )}
                        </div>
                        {property._count && (
                          <div className="ml-auto flex gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {property._count.competitors}
                            </Badge>
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href={`/properties/${property.id}`}>
                            <Eye className="h-3 w-3" />
                            Dashboard
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {canCreateProperties && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href={`/properties/${property.id}/edit`}>
                              <Edit className="h-3 w-3" />
                              Gestisci
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin sections */}
        {canAccessAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Amministrazione</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/properties")}>
                    <Link href="/admin/properties">
                      <Building2 className="h-4 w-4" />
                      Gestione Strutture
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/users")}>
                    <Link href="/admin/users">
                      <Users className="h-4 w-4" />
                      Gestione Utenti
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Super Admin sections */}
        {canAccessSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/super-admin/system")}>
                    <Link href="/super-admin/system">
                      <Shield className="h-4 w-4" />
                      Sistema
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/super-admin/audit")}>
                    <Link href="/super-admin/audit">
                      <Settings className="h-4 w-4" />
                      Audit Log
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 h-auto p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
                  <Badge className={`text-xs ${getRoleColor(session.user.role)}`}>
                    {getRoleLabel(session.user.role)}
                  </Badge>
                </div>
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Profilo
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
