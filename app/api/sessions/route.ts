import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { wizardSession, prdDocument, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/sessions - Create new wizard session
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // PRD Quota Validation for FREE Tier
        const userData = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
        if (userData.length > 0) {
            const currentTier = userData[0].tier || 'FREE';
            if (currentTier === 'FREE') {
                const prdCount = await db.select().from(prdDocument).where(eq(prdDocument.userId, session.user.id));
                if (prdCount.length >= 1) {
                    return NextResponse.json({
                        error: 'QUOTA_EXCEEDED',
                        message: 'Free tier is limited to 1 PRD. Please upgrade to PLUS or PRO to create more.'
                    }, { status: 403 });
                }
            }
        }

        const [newSession] = await db
            .insert(wizardSession)
            .values({ userId: session.user.id, answers: {}, status: 'in_progress' })
            .returning();

        return NextResponse.json({ session: newSession }, { status: 201 });
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET /api/sessions - Get user's sessions
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const sessions = await db.query.wizardSession.findMany({
            where: (ws, { eq }) => eq(ws.userId, session.user.id),
            orderBy: (ws, { desc }) => [desc(ws.updatedAt)],
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
