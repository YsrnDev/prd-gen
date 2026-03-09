import { NextRequest, NextResponse } from 'next/server';


export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always allow: auth callbacks, static assets, maintenance page itself
    if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/maintenance-status') ||
        pathname === '/maintenance'
    ) {
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

    const userRole = (session?.user as { role?: string } | undefined)?.role;
    const isAdmin = userRole === 'admin';

    // Admin routes bypass maintenance mode entirely — check auth separately below
    const isAdminRoute = pathname.startsWith('/admin');

    // Check maintenance mode for non-admin users on user-facing routes only
    if (!isAdmin && !isAdminRoute) {
        const protectedUserRoutes = ['/dashboard', '/prd', '/wizard', '/settings', '/login', '/register'];
        const isUserRoute = protectedUserRoutes.some((route) => pathname.startsWith(route));

        if (isUserRoute) {
            try {
                const maintenanceUrl = new URL('/api/maintenance-status', request.url);
                const maintenanceRes = await fetch(maintenanceUrl.toString());
                if (maintenanceRes.ok) {
                    const { maintenanceMode } = await maintenanceRes.json();
                    if (maintenanceMode) {
                        return NextResponse.redirect(new URL('/maintenance', request.url));
                    }
                }
            } catch {
                // If maintenance-status fetch fails, let users through (fail open)
            }
        }
    }

    // Protected routes - redirect to login if no session
    const protectedRoutes = ['/dashboard', '/prd', '/wizard', '/settings'];
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (isAdmin && pathname === '/dashboard') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // Admin routes - redirect to login if not authenticated, 403 if not admin
    if (isAdminRoute) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Guest routes - redirect to dashboard if logged in
    const guestRoutes = ['/login', '/register'];
    if (session && guestRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

