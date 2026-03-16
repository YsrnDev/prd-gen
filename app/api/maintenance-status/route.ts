import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiConfig } from '@/lib/db/schema';

// GET /api/maintenance-status - public endpoint to check maintenance mode (used by middleware)
export async function GET() {
    try {
        const configs = await db.select({ maintenanceMode: aiConfig.maintenanceMode }).from(aiConfig).limit(1);
        const maintenanceMode = configs[0]?.maintenanceMode ?? false;
        return NextResponse.json({ maintenanceMode });
    } catch {
        // If DB unavailable, default to non-maintenance to not block users
        return NextResponse.json({ maintenanceMode: false });
    }
}
