import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, prdDocument, wizardSession } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
    return session && (session.user as { role?: string }).role === 'admin';
}

// GET /api/admin/users/[id] - Get user details, prds, and sessions
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { id } = await params;

        // Fetch User
        const [userData] = await db.select().from(user).where(eq(user.id, id));
        if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Fetch Completed PRDs
        const prds = await db
            .select({
                id: prdDocument.id,
                title: prdDocument.title,
                content: prdDocument.content, // To calculate size, but we won't return full content to client
                createdAt: prdDocument.createdAt,
            })
            .from(prdDocument)
            .where(eq(prdDocument.userId, id))
            .orderBy(desc(prdDocument.createdAt));

        // Fetch Wizard Sessions (Drafts)
        const sessions = await db
            .select({
                id: wizardSession.id,
                status: wizardSession.status,
                createdAt: wizardSession.createdAt,
                updatedAt: wizardSession.updatedAt,
            })
            .from(wizardSession)
            .where(eq(wizardSession.userId, id))
            .orderBy(desc(wizardSession.updatedAt));

        // Safely strip PRD content size down to metadata
        const safePrds = prds.map((prd) => ({
            id: prd.id,
            title: prd.title || 'Untitled PRD',
            createdAt: prd.createdAt,
            size: prd.content?.length || 0,
        }));

        return NextResponse.json({
            user: { id: userData.id, name: userData.name, email: userData.email, role: userData.role, createdAt: userData.createdAt, image: userData.image },
            prds: safePrds,
            sessions,
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/admin/users/[id] - Update role
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { id } = await params;
        const body = await request.json();
        const { role } = body;

        if (!['admin', 'user'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const [updated] = await db
            .update(user)
            .set({ role, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();

        if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json({ user: updated });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { id } = await params;
        await db.delete(user).where(eq(user.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
