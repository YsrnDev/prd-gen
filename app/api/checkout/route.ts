import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { planId } = body;

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        // 1. Ambil data plan dari database
        const plans = await db.select().from(schema.subscriptionPlan).where(eq(schema.subscriptionPlan.id, planId));
        if (plans.length === 0) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const plan = plans[0];

        // 2. Buat Order ID unik untuk Midtrans
        const orderId = `SUBS_PRDGEN_${session.user.id}_${Date.now()}`;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: plan.price
            },
            customer_details: {
                first_name: session.user.name || '',
                email: session.user.email
            },
            item_details: [{
                id: plan.id.toString(),
                price: plan.price,
                quantity: 1,
                name: `Langganan PRDGen ${plan.name} (30 Hari)`,
            }]
        };

        // 3. Request Token Snap ke Midtrans
        const transaction = await snap.createTransaction(parameter);

        // 4. Save *intent* / status awal order di tabel subscriptions (Jika belum ada update status, bisa diskip atau disimpan sebagai 'PENDING')
        const currentSubscriptions = await db.select().from(schema.subscription).where(eq(schema.subscription.userId, session.user.id));

        if (currentSubscriptions.length > 0) {
            // Update jika sudah pernah bikin subscription row
            await db.update(schema.subscription)
                .set({
                    midtransOrderId: orderId,
                    // plan dan status akan diupdate oleh webhook kalau sukses
                })
                .where(eq(schema.subscription.userId, session.user.id));
        } else {
            await db.insert(schema.subscription).values({
                userId: session.user.id,
                planType: 'FREE', // stay free until webhook confirms
                status: 'NONE',
                midtransOrderId: orderId
            });
        }

        return NextResponse.json({
            token: transaction.token,
            redirect_url: transaction.redirect_url // Jika tidak pakai custom UI pop-up
        });

    } catch (error) {
        console.error('Midtrans Checkout Error:', error);
        return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 });
    }
}
