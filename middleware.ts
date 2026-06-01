import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('jadwalin_token')?.value;
  
  const protectedRoutes = ['/dashboard', '/schedule', '/profile'];
  const authRoutes = ['/login', '/register'];

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isAuth = authRoutes.some(r => pathname.startsWith(r));

  // Redirect ke login jika akses protected route tanpa token
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Redirect ke dashboard jika sudah login akses auth route
  if (isAuth && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};