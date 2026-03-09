import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// One-time migration endpoint - admin only
// DELETE this file after running once!
export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        await db.execute(
            sql`ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false`
        );
        return NextResponse.json({ success: true, message: 'Column maintenance_mode added (or already exists).' });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
