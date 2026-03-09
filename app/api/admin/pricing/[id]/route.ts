import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Ensure the user is an admin
async function isAdmin(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    return (session?.user as any)?.role === 'admin';
}

// PATCH update a specific plan
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, price, features, isPopular, isActive } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = price;
        if (features !== undefined && Array.isArray(features)) updateData.features = features;
        if (isPopular !== undefined) updateData.isPopular = isPopular;
        if (isActive !== undefined) updateData.isActive = isActive;
        updateData.updatedAt = new Date();

        const updated = await db.update(schema.subscriptionPlan)
            .set(updateData)
            .where(eq(schema.subscriptionPlan.id, parseInt(params.id)))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Failed to update pricing plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE a specific plan
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const deleted = await db.delete(schema.subscriptionPlan)
            .where(eq(schema.subscriptionPlan.id, parseInt(params.id)))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id: params.id });
    } catch (error) {
        console.error('Failed to delete pricing plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
