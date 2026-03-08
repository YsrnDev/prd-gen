import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { wizardSession } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

// GET /api/sessions/[id]
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const [ws] = await db
            .select()
            .from(wizardSession)
            .where(and(eq(wizardSession.id, parseInt(id)), eq(wizardSession.userId, session.user.id)));

        if (!ws) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        return NextResponse.json({ session: ws });
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/sessions/[id] - Update answers
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { answers, status } = body;

        const [updated] = await db
            .update(wizardSession)
            .set({
                ...(answers !== undefined && { answers }),
                ...(status !== undefined && { status }),
                updatedAt: new Date(),
            })
            .where(and(eq(wizardSession.id, parseInt(id)), eq(wizardSession.userId, session.user.id)))
            .returning();

        if (!updated) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        return NextResponse.json({ session: updated });
    } catch (error) {
        console.error('Error updating session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/sessions/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await db
            .delete(wizardSession)
            .where(and(eq(wizardSession.id, parseInt(id)), eq(wizardSession.userId, session.user.id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
