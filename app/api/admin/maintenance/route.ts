import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiConfig } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logEvent } from '@/lib/logger';

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
    return session && (session.user as { role?: string }).role === 'admin';
}

// GET /api/admin/maintenance - get maintenance mode status
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const configs = await db.select().from(aiConfig).limit(1);
        const maintenanceMode = configs[0]?.maintenanceMode ?? false;

        return NextResponse.json({ maintenanceMode });
    } catch (error) {
        console.error('Error fetching maintenance mode:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/maintenance - toggle maintenance mode
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { maintenanceMode } = await request.json();

        const existing = await db.select().from(aiConfig).limit(1);

        if (existing[0]) {
            await db
                .update(aiConfig)
                .set({ maintenanceMode, updatedAt: new Date(), updatedBy: session!.user.id })
                .where(eq(aiConfig.id, existing[0].id));
        } else {
            // Create row if it doesn't exist yet
            await db.insert(aiConfig).values({
                maintenanceMode,
                updatedBy: session!.user.id,
            });
        }

        await logEvent(
            'SYSTEM',
            `Maintenance mode ${maintenanceMode ? 'ENABLED' : 'DISABLED'} by admin`,
            { userId: session!.user.id, status: 'success' }
        );

        return NextResponse.json({ maintenanceMode });
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
