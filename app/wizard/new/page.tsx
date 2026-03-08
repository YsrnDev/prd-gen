'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';

export default function WizardNewPage() {
    const router = useRouter();

    useEffect(() => {
        const createSession = async () => {
            try {
                const res = await fetch('/api/sessions', { method: 'POST' });
                if (res.ok) {
                    const data = await res.json();
                    router.replace(`/wizard/${data.session.id}`);
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
