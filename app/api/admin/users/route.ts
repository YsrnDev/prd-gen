import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
    return session && (session.user as { role?: string }).role === 'admin';
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const users = await db.select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            image: user.image,
        }).from(user).orderBy(desc(user.createdAt));

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
