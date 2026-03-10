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

    // CORS protection for API routes
    if (pathname.startsWith('/api/')) {
        const origin = request.headers.get('origin');
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';
        const allowedOrigin = new URL(appUrl).origin;

        // Handle preflight
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': allowedOrigin,
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        // Allow same-origin and webhook requests (no origin header)
        const isWebhook = pathname.startsWith('/api/webhooks/');
        const isPublicApi = pathname === '/api/pricing';
        if (origin && origin !== allowedOrigin && !isWebhook && !isPublicApi) {
            return NextResponse.json({ error: 'CORS not allowed' }, { status: 403 });
        }
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
        const protectedUserRoutes = ['/dashboard', '/prd', '/wizard', '/settings'];
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
                } else {
                    // Fail-closed: if status check returns non-OK, assume maintenance
                    return NextResponse.redirect(new URL('/maintenance', request.url));
                }
            } catch {
                // Fail-closed: if maintenance-status fetch fails, redirect to maintenance
                return NextResponse.redirect(new URL('/maintenance', request.url));
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

