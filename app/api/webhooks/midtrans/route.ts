import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Verifikasi Signature Key Midtrans untuk Keamanan
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const orderId = body.order_id;
        const statusCode = body.status_code;
        const grossAmount = body.gross_amount;
        const reqSignature = body.signature_key;

        const signatureStr = orderId + statusCode + grossAmount + serverKey;
        const calculatedSignature = crypto.createHash('sha512').update(signatureStr).digest('hex');

        if (calculatedSignature !== reqSignature) {
            return NextResponse.json({ error: 'Invalid Signature Key' }, { status: 401 });
        }

        // 2. Cek status order
        const transactionStatus = body.transaction_status;
        const fraudStatus = body.fraud_status;

        // Cari subscription row berdasarkan orderId
        const subscriptions = await db.select().from(schema.subscription).where(eq(schema.subscription.midtransOrderId, orderId));
        if (subscriptions.length === 0) {
            return NextResponse.json({ error: 'Order not found in subscription table' }, { status: 404 });
        }

        const subscription = subscriptions[0];

        // Hitung masa aktif (Contoh 30 hari dari sekarang)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // 30 Days langganan

        // Determine planType based on midtrans item details if possible. 
        // For simplicity now assume we stored intended plan or parse from external ID if needed.
        // Let's assume we read the name of the plan purchased from item_details 
        // to assign the correct tier ('PLUS' or 'PRO')
        let purchasedTier = 'PLUS';
        // Logic extracting Tier from the body item_details can be robustified later
        // E.g., if (body.item_details?.[0]?.name?.includes('PRO')) purchasedTier = 'PRO'

        /* Handle Status Pembayaran Midtrans */
        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'challenge') {
                // Jangan kasih akses penuh dulu
                await db.update(schema.subscription)
                    .set({ status: 'NONE' })
                    .where(eq(schema.subscription.midtransOrderId, orderId));
            } else if (fraudStatus === 'accept' || !fraudStatus) {
                // Pembayaran Berhasil
                await db.update(schema.subscription)
                    .set({
                        planType: purchasedTier,
                        status: 'ACTIVE',
                        activeUntil: expirationDate
                    })
                    .where(eq(schema.subscription.midtransOrderId, orderId));

                // Update tabel User
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
            // Rollback to Free
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

    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
