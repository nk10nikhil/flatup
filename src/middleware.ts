import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    // Dashboard routes protection
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    // Payment routes protection
    if (pathname.startsWith('/payment')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow public routes
        if (
          pathname.startsWith('/auth') ||
          pathname.startsWith('/api/auth') ||
          pathname === '/' ||
          pathname.startsWith('/browse') ||
          pathname.startsWith('/flat') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/api/public')
        ) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/public|_next/static|_next/image|favicon.ico).*)',
  ],
};
