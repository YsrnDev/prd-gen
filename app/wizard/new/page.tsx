'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function WizardNewPage() {
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const createSession = async () => {
            try {
                const res = await fetch('/api/sessions', { method: 'POST' });
                const data = await res.json();

                if (res.ok) {
                    router.replace(`/wizard/${data.session.id}`);
                } else if (res.status === 403 && data.error === 'QUOTA_EXCEEDED') {
                    setError(data.message);
                } else {
                    router.replace('/dashboard');
                }
            } catch (err) {
                console.error(err);
                router.replace('/dashboard');
            }
        };
        createSession();
    }, [router]);

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Quota Exceeded</h2>
                    <p className="text-slate-400">
                        {error}
                    </p>
                    <div className="flex flex-col gap-3 pt-4">
                        <Link
                            href="/dashboard/pricing"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-slate-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
                        >
                            <Zap className="w-4 h-4 fill-current" />
                            View Upgrade Plans
                        </Link>
                        <Link
                            href="/dashboard"
                            className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl primary-gradient mb-4">
                    <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-2 justify-center text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Starting wizard...</span>
                </div>
            </div>
        </div>
    );
}
