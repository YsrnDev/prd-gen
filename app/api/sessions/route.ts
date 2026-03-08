import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { wizardSession } from '@/lib/db/schema';

// POST /api/sessions - Create new wizard session
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
