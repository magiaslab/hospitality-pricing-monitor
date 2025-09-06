import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@/generated/prisma"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Route pubbliche
    if (pathname.startsWith("/auth") || pathname === "/") {
      return NextResponse.next()
    }

    // Richiede autenticazione
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Route admin - solo ADMIN e SUPER_ADMIN
    if (pathname.startsWith("/admin")) {
      if (token.role !== UserRole.ADMIN && token.role !== UserRole.SUPER_ADMIN) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Route super admin - solo SUPER_ADMIN
    if (pathname.startsWith("/super-admin")) {
      if (token.role !== UserRole.SUPER_ADMIN) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Route pubbliche sempre autorizzate
        if (pathname.startsWith("/auth") || pathname === "/") {
          return true
        }

        // Altre route richiedono token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
