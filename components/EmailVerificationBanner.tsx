'use client';
import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { authClient } from '@/lib/auth-client';
import { AlertTriangle, Mail } from 'lucide-react';

export function EmailVerificationBanner() {
    const { data: session } = useSession();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!session?.user) return null;
    if ((session.user as any).role === 'admin') return null; // Admin doesn't strictly need it for UI blocking usually, but let's just bypass
    if (session.user.emailVerified) return null;

    const handleSendVerification = async () => {
        setSending(true);
        setErrorMsg('');
        try {
            const { error } = await authClient.sendVerificationEmail({
                email: session.user.email,
                callbackURL: window.location.origin + '/dashboard',
            });
            if (error) {
                setErrorMsg(error.message || 'Failed to send verification email');
            } else {
                setSent(true);
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Something went wrong');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-4 rounded-xl mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-sm">Please verify your email address</h4>
                    <p className="text-xs text-amber-500/80 mt-0.5">
                        You need to verify your email address to create new PRDs and unlock full features.
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <button
                    onClick={handleSendVerification}
                    disabled={sending || sent}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    <Mail className="w-3.5 h-3.5" />
                    {sending ? 'Sending...' : sent ? 'Verification Sent!' : 'Resend Verification'}
                </button>
                {errorMsg && <p className="text-[10px] text-red-500 mt-1">{errorMsg}</p>}
                {sent && <p className="text-[10px] text-amber-500 mt-1">Check your inbox/spam folder.</p>}
            </div>
        </div>
    );
}
