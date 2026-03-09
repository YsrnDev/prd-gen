import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Public endpoint: returns only active plans (no auth required)
export async function GET() {
    try {
        const plans = await db
            .select()
            .from(schema.subscriptionPlan)
            .where(eq(schema.subscriptionPlan.isActive, true))
            .orderBy(schema.subscriptionPlan.id);

        return NextResponse.json({ plans });
    } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
