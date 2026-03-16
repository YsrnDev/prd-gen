import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
    return session && (session.user as { role?: string }).role === 'admin';
}

const USERS_CACHE_TTL_MS = 5000;
let usersCache: { data: unknown; fetchedAt: number } | null = null;

// GET /api/admin/users
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const now = Date.now();
        if (usersCache && now - usersCache.fetchedAt < USERS_CACHE_TTL_MS) {
            return NextResponse.json(usersCache.data);
        }

        const users = await db.select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tier: user.tier,
            subscriptionStatus: user.subscriptionStatus,
            createdAt: user.createdAt,
            image: user.image,
        }).from(user).orderBy(desc(user.createdAt));

        const payload = { users };
        usersCache = { data: payload, fetchedAt: now };
        return NextResponse.json(payload);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
