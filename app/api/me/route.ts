import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [userData] = await db.select({
        tier: user.tier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionUntil: user.subscriptionUntil,
    }).from(user).where(eq(user.id, session.user.id)).limit(1);

    if (!userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userData, {
        headers: { 'Cache-Control': 'no-store' },
    });
}
