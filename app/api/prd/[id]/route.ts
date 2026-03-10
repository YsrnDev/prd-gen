import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prdDocument } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const updatePrdSchema = z.object({
    title: z.string().max(200).optional(),
    content: z.string().min(1).max(500000).optional(),
});

function parseId(id: string): number | null {
    const num = parseInt(id);
    return isNaN(num) || num <= 0 ? null : num;
}

// GET /api/prd/[id]
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const prdId = parseId(id);
        if (!prdId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const [doc] = await db
            .select()
            .from(prdDocument)
            .where(and(eq(prdDocument.id, prdId), eq(prdDocument.userId, session.user.id)));

        if (!doc) return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
        return NextResponse.json({ document: doc });
    } catch (error) {
        console.error('Error fetching PRD:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/prd/[id] - Update PRD
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const prdId = parseId(id);
        if (!prdId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const body = await request.json();
        const parsed = updatePrdSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const [updated] = await db
            .update(prdDocument)
            .set({ ...parsed.data, updatedAt: new Date() })
            .where(and(eq(prdDocument.id, prdId), eq(prdDocument.userId, session.user.id)))
            .returning();

        if (!updated) return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
        return NextResponse.json({ document: updated });
    } catch (error) {
        console.error('Error updating PRD:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/prd/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const prdId = parseId(id);
        if (!prdId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        await db
            .delete(prdDocument)
            .where(and(eq(prdDocument.id, prdId), eq(prdDocument.userId, session.user.id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting PRD:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
