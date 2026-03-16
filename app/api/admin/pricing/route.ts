import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Ensure the user is an admin
async function isAdmin(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    return (session?.user as any)?.role === 'admin';
}

// GET all subscription plans
export async function GET(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const plans = await db.select().from(schema.subscriptionPlan).orderBy(schema.subscriptionPlan.id);
        return NextResponse.json(plans);
    } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST create a new subscription plan
export async function POST(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, price, features, isPopular, isActive } = body;

        if (!name || typeof price !== 'number') {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newPlan = await db.insert(schema.subscriptionPlan).values({
            name,
            price,
            features: Array.isArray(features) ? features : [],
            isPopular: isPopular || false,
            isActive: isActive !== false,
        }).returning();

        return NextResponse.json(newPlan[0]);
    } catch (error) {
        console.error('Failed to create pricing plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
