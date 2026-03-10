import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { account } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';

type Params = { params: Promise<{ id: string }> };

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
    return session && (session.user as { role?: string }).role === 'admin';
}

// POST /api/admin/users/[id]/reset-password
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { id } = await params;
        const body = await request.json();
        const { password } = body;

        if (!password || typeof password !== 'string' || password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        // Password complexity check
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            return NextResponse.json({
                error: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
            }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        // Update the account record directly
        const [updated] = await db
            .update(account)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where(
                and(
                    eq(account.userId, id),
                    eq(account.providerId, 'credential')
                )
            )
            .returning();

        if (!updated) {
            // It means the user might not have a credential account (e.g., Google OAuth only)
            // the admin cannot just reset their password if they don't have a credential account setup
            // or we must insert an account record if we want to allow credential login in the future
            // but keeping it simple, let's just error if they don't have a credential account
            return NextResponse.json({ error: 'User does not have an email/password account (maybe created via OAuth)' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
