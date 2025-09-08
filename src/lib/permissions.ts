import { UserRole, AccessLevel } from "@/generated/prisma"
import { Session } from "next-auth"
import { prisma } from "@/lib/prisma"

export function hasRole(session: Session | null, requiredRole: UserRole): boolean {
  if (!session?.user) return false
  
  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    OWNER: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  }
  
  return roleHierarchy[session.user.role] >= roleHierarchy[requiredRole]
}

export function isSuperAdmin(session: Session | null): boolean {
  return session?.user?.role === UserRole.SUPER_ADMIN
}

export function isAdmin(session: Session | null): boolean {
  return hasRole(session, UserRole.ADMIN)
}

export function isOwner(session: Session | null): boolean {
  return hasRole(session, UserRole.OWNER)
}

export async function hasPropertyAccess(
  userId: string,
  propertyId: string,
  requiredLevel: AccessLevel = AccessLevel.VIEWER
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedProperties: {
        where: { id: propertyId }
      },
      propertyAccesses: {
        where: { propertyId }
      }
    }
  })

  if (!user) return false

  // Super admin ha accesso a tutto
  if (user.role === UserRole.SUPER_ADMIN) return true

  // Owner della property ha sempre accesso
  if (user.ownedProperties.length > 0) return true

  // Controlla accesso tramite ACL
  const access = user.propertyAccesses[0]
  if (!access) return false

  const levelHierarchy: Record<AccessLevel, number> = {
    VIEWER: 1,
    OWNER: 2,
    ADMIN: 3,
  }

  return levelHierarchy[access.level] >= levelHierarchy[requiredLevel]
}

export async function getUserProperties(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedProperties: true,
      propertyAccesses: {
        include: {
          property: true
        }
      }
    }
  })

  if (!user) return []

  // Super admin vede tutte le properties
  if (user.role === UserRole.SUPER_ADMIN) {
    return await prisma.property.findMany({
      include: {
        owner: true,
        _count: {
          select: {
            competitors: true,
            roomTypes: true
          }
        }
      }
    })
  }

  // Ottieni gli ID delle properties a cui ha accesso
  const ownedPropertyIds = user.ownedProperties.map(p => p.id)
  const accessPropertyIds = user.propertyAccesses.map(access => access.property.id)
  const allPropertyIds = [...new Set([...ownedPropertyIds, ...accessPropertyIds])]

  // Fetch complete property data con count
  return await prisma.property.findMany({
    where: {
      id: { in: allPropertyIds }
    },
    include: {
      owner: true,
      _count: {
        select: {
          competitors: true,
          roomTypes: true
        }
      }
    }
  })
}

export async function canManageProperty(userId: string, propertyId: string): Promise<boolean> {
  return await hasPropertyAccess(userId, propertyId, AccessLevel.ADMIN)
}

export async function canViewProperty(userId: string, propertyId: string): Promise<boolean> {
  return await hasPropertyAccess(userId, propertyId, AccessLevel.VIEWER)
}
