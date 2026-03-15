import { NextRequest, NextResponse } from 'next/server';

const MAINTENANCE_TTL_MS = 5000;
const SESSION_TTL_MS = 2000;
let maintenanceCache: { value: boolean | null; fetchedAt: number } = {
    value: null,
    fetchedAt: 0,
};
const sessionCache = new Map<string, { value: { user?: { role?: string } } | null; fetchedAt: number }>();

async function getMaintenanceStatus(request: NextRequest): Promise<boolean> {
    const now = Date.now();
    if (maintenanceCache.value !== null && now - maintenanceCache.fetchedAt < MAINTENANCE_TTL_MS) {
        return maintenanceCache.value;
    }

    try {
        const maintenanceUrl = new URL('/api/maintenance-status', request.url);
        const maintenanceRes = await fetch(maintenanceUrl.toString());
        if (maintenanceRes.ok) {
            const { maintenanceMode } = await maintenanceRes.json();
            maintenanceCache = { value: !!maintenanceMode, fetchedAt: now };
            return !!maintenanceMode;
        }
    } catch {
        // Fail-closed below
    }

    return true;
}

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

    // CORS protection for API routes (skip session work for APIs)
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

        return NextResponse.next();
    }

    const protectedRoutes = ['/dashboard', '/prd', '/wizard', '/settings'];
    const guestRoutes = ['/login', '/register'];
    const isAdminRoute = pathname.startsWith('/admin');
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
    const isGuestRoute = guestRoutes.includes(pathname);

    // Public routes: skip session/maintenance checks entirely
    if (!isAdminRoute && !isProtected && !isGuestRoute) {
        return NextResponse.next();
    }

    let session: { user?: { role?: string } } | null = null;
    const cookieHeader = request.headers.get('cookie') || '';
    if (cookieHeader) {
        const now = Date.now();
        const cached = sessionCache.get(cookieHeader);
        if (cached && now - cached.fetchedAt < SESSION_TTL_MS) {
            session = cached.value;
        } else {
            try {
                const url = new URL('/api/auth/get-session', request.url);
                const res = await fetch(url.toString(), {
                    headers: { cookie: cookieHeader },
                });
                if (res.ok) {
                    session = await res.json();
                }
                sessionCache.set(cookieHeader, { value: session, fetchedAt: now });
            } catch (error) {
                console.error('Session fetch error in middleware', error);
            }
        }
    }

    const userRole = session?.user?.role;
    const isAdmin = userRole === 'admin';

    // Admin routes - redirect to login if not authenticated, redirect if not admin
    if (isAdminRoute) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Protected routes - redirect to login if no session
    if (isProtected) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (isAdmin && pathname === '/dashboard') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        // Maintenance check for non-admin users only
        if (!isAdmin) {
            const maintenanceMode = await getMaintenanceStatus(request);
            if (maintenanceMode) {
                return NextResponse.redirect(new URL('/maintenance', request.url));
            }
        }
    }

    // Guest routes - redirect to dashboard if logged in
    if (session && isGuestRoute) {
        return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
