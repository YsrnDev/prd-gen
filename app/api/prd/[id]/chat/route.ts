import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prdChatLog, prdDocument } from '@/lib/db/schema';
import { eq, asc, and } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const prdId = parseInt(id);
        if (isNaN(prdId) || prdId <= 0) {
            return NextResponse.json({ error: 'Invalid PRD ID' }, { status: 400 });
        }

        // Verify PRD ownership before returning chat logs
        const [prd] = await db
            .select({ id: prdDocument.id })
            .from(prdDocument)
            .where(and(eq(prdDocument.id, prdId), eq(prdDocument.userId, session.user.id)));

        if (!prd) return NextResponse.json({ error: 'PRD not found' }, { status: 404 });

        const chatLogs = await db
            .select()
            .from(prdChatLog)
            .where(eq(prdChatLog.prdId, prdId))
            .orderBy(asc(prdChatLog.createdAt));

        const formattedLogs = chatLogs.map(log => ({
            role: log.role as 'user' | 'ai',
            text: log.message
        }));

        if (formattedLogs.length === 0) {
            formattedLogs.push({ role: 'ai', text: 'Hi! I can help you revise your PRD. Ask me to change sections, add details, translate, or improve any part of the document.' });
        }

        return NextResponse.json({ messages: formattedLogs });
    } catch (error) {
        console.error('Error fetching chat logs:', error);
        return NextResponse.json({ error: 'Failed to fetch chat logs' }, { status: 500 });
    }
}
