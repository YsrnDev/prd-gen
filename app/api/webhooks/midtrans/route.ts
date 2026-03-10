import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Verify Midtrans Signature Key
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const orderId = body.order_id;
        const statusCode = body.status_code;
        const grossAmount = body.gross_amount;
        const reqSignature = body.signature_key;

        if (!orderId || !statusCode || !grossAmount || !reqSignature) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const signatureStr = orderId + statusCode + grossAmount + serverKey;
        const calculatedSignature = crypto.createHash('sha512').update(signatureStr).digest('hex');

        if (calculatedSignature !== reqSignature) {
            return NextResponse.json({ error: 'Invalid Signature Key' }, { status: 401 });
        }

        // 2. Find subscription by orderId
        const subscriptions = await db.select().from(schema.subscription).where(eq(schema.subscription.midtransOrderId, orderId));
        if (subscriptions.length === 0) {
            return NextResponse.json({ error: 'Order not found in subscription table' }, { status: 404 });
        }

        const subscription = subscriptions[0];

        // 3. Replay protection: skip if already processed successfully
        if (subscription.status === 'ACTIVE') {
            return NextResponse.json({ status: 'OK', message: 'Already processed' });
        }

        // 4. Determine purchased tier from item_details or DB lookup
        let purchasedTier = 'PLUS';
        try {
            const itemName = body.item_details?.[0]?.name || '';
            const itemId = body.item_details?.[0]?.id;

            if (itemId) {
                const [plan] = await db.select().from(schema.subscriptionPlan).where(eq(schema.subscriptionPlan.id, parseInt(itemId)));
                if (plan) {
                    purchasedTier = plan.name;
                }
            } else if (itemName.toUpperCase().includes('PRO')) {
                purchasedTier = 'PRO';
            }
        } catch {
            // Fallback to PLUS if tier detection fails
        }

        const transactionStatus = body.transaction_status;
        const fraudStatus = body.fraud_status;

        // 5. Calculate expiration (30 days)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        // 6. Handle payment status
        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'challenge') {
                await db.update(schema.subscription)
                    .set({ status: 'NONE' })
                    .where(eq(schema.subscription.midtransOrderId, orderId));
            } else if (fraudStatus === 'accept' || !fraudStatus) {
                await db.update(schema.subscription)
                    .set({
                        planType: purchasedTier,
                        status: 'ACTIVE',
                        activeUntil: expirationDate
                    })
                    .where(eq(schema.subscription.midtransOrderId, orderId));

                await db.update(schema.user)
                    .set({
                        tier: purchasedTier,
                        subscriptionStatus: 'ACTIVE',
                        subscriptionUntil: expirationDate
                    })
                    .where(eq(schema.user.id, subscription.userId!));
            }
        } else if (transactionStatus === 'cancel' ||
            transactionStatus === 'deny' ||
            transactionStatus === 'expire') {
            await db.update(schema.subscription)
                .set({
                    planType: 'FREE',
                    status: 'EXPIRED'
                })
                .where(eq(schema.subscription.midtransOrderId, orderId));

            await db.update(schema.user)
                .set({
                    tier: 'FREE',
                    subscriptionStatus: 'EXPIRED'
                })
                .where(eq(schema.user.id, subscription.userId!));
        }

        return NextResponse.json({ status: 'OK' });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
