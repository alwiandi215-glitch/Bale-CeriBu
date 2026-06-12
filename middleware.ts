import { NextRequest, NextResponse } from "next/server"

// Proteksi rute aplikasi: tanpa cookie sesi diarahkan ke halaman login.
// Verifikasi tanda tangan JWT dilakukan penuh di server (lib/api.getAuth).
const PUBLIC_PATHS = ["/", "/api/auth/login"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/api/cron")
  const hasSession = req.cookies.has("bc_session")

  const isProtected = pathname.startsWith("/app") || pathname.startsWith("/portal")
  if (!isPublic && isProtected && !hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*", "/portal/:path*"],
}
