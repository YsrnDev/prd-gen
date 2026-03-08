import { NextRequest, NextResponse } from 'next/server';


export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that we explicitly don't need to authenticate but we still want session checks to redirect if already logged in. Except `/api/auth` to prevent infinite loops.

    // Stop middleware entirely for api/auth to prevent infinite loops or redundant checks
    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    let session = null;
    try {
        const url = new URL('/api/auth/get-session', request.url);
        const res = await fetch(url.toString(), {
            headers: { cookie: request.headers.get('cookie') || '' },
        });
        if (res.ok) {
            session = await res.json();
        }
    } catch (error) {
        console.error('Session fetch error in middleware', error);
    }

    // Protected routes - redirect to login if no session
    const protectedRoutes = ['/dashboard', '/prd', '/wizard', '/settings'];
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const userRole = (session.user as { role?: string })?.role;
        if (userRole === 'admin' && pathname === '/dashboard') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // Admin routes - redirect to dashboard if not admin
    if (pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        const userRole = (session.user as { role?: string }).role;
        if (userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Guest routes - redirect to dashboard if logged in
    const guestRoutes = ['/login', '/register'];
    if (session && guestRoutes.includes(pathname)) {
        const userRole = (session.user as { role?: string })?.role;
        return NextResponse.redirect(new URL(userRole === 'admin' ? '/admin' : '/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
