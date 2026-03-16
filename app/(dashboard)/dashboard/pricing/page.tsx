'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useCurrentUser } from '@/lib/use-current-user';
import { Zap, Check, Crown, Sparkles, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

type Plan = {
    id: number;
    name: string;
    price: number;
    features: string[];
    isPopular: boolean;
    isActive: boolean;
};

declare global {
    interface Window {
        snap: {
            pay: (token: string, options: {
                onSuccess: (result: any) => void;
                onPending: (result: any) => void;
                onError: (result: any) => void;
                onClose: () => void;
            }) => void;
        };
    }
}

function PricingSkeleton() {
    return (
        <div className="max-w-5xl mx-auto animate-pulse">
            <div className="mb-8 space-y-2">
                <div className="h-7 w-48 bg-slate-800 rounded" />
                <div className="h-4 w-80 bg-slate-800 rounded" />
                <div className="h-10 w-64 bg-slate-800 rounded-xl mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
                        <div className="h-5 w-24 bg-slate-800 rounded mb-2" />
                        <div className="h-4 w-32 bg-slate-800 rounded mb-6" />
                        <div className="h-10 w-32 bg-slate-800 rounded mb-6" />
                        <div className="space-y-3 mb-8">
                            {[...Array(4)].map((_, j) => (
                                <div key={j} className="h-4 w-40 bg-slate-800 rounded" />
                            ))}
                        </div>
                        <div className="h-12 w-full bg-slate-800 rounded-xl" />
                    </div>
                ))}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="h-5 w-40 bg-slate-800 rounded mb-4" />
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 w-48 bg-slate-800 rounded mb-2" />
                            <div className="h-3 w-full bg-slate-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function UserPricingPage() {
    const { data: session } = useSession();
    const { data: currentUser } = useCurrentUser();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    const userTier = currentUser?.tier || (session?.user as any)?.tier || 'FREE';
    const subscriptionStatus = currentUser?.subscriptionStatus || (session?.user as any)?.subscriptionStatus || 'NONE';

    useEffect(() => {
        fetchPlans();
    }, []);

    async function fetchPlans() {
        try {
            const res = await fetch('/api/pricing');
            if (res.ok) {
                const data = await res.json();
                setPlans(data.plans || []);
            }
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCheckout(plan: Plan) {
        if (plan.price === 0) return;
        if (userTier === plan.name && subscriptionStatus === 'ACTIVE') {
            setMessage({ type: 'info', text: `Anda sudah berlangganan paket ${plan.name}.` });
            return;
        }

        setCheckoutLoading(plan.id);
        setMessage(null);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Gagal memproses checkout.' });
                setCheckoutLoading(null);
                return;
            }

            // Open Midtrans Snap Popup
            if (window.snap) {
                window.snap.pay(data.token, {
                    onSuccess: () => {
                        setMessage({ type: 'success', text: '🎉 Pembayaran berhasil! Akun Anda sedang diupgrade...' });
                        setCheckoutLoading(null);
                        // Reload after a moment to reflect new tier
                        setTimeout(() => window.location.reload(), 2000);
                    },
                    onPending: () => {
                        setMessage({ type: 'info', text: '⏳ Pembayaran masih diproses. Status akan diperbarui otomatis.' });
                        setCheckoutLoading(null);
                    },
                    onError: (result: any) => {
                        console.error('Payment error:', result);
                        setMessage({ type: 'error', text: 'Pembayaran gagal. Silakan coba lagi.' });
                        setCheckoutLoading(null);
                    },
                    onClose: () => {
                        setCheckoutLoading(null);
                    },
                });
            } else {
                // Fallback: redirect to Midtrans page
                window.location.href = data.redirect_url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
            setCheckoutLoading(null);
        }
    }

    const formatPrice = (price: number) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
    };

    const getPlanIcon = (name: string) => {
        switch (name) {
            case 'FREE': return <Zap className="w-6 h-6" />;
            case 'PLUS': return <Sparkles className="w-6 h-6" />;
            case 'PRO': return <Crown className="w-6 h-6" />;
            default: return <Zap className="w-6 h-6" />;
        }
    };

    const getPlanGradient = (name: string, isPopular: boolean) => {
        if (isPopular) return 'from-[#135bec] to-blue-700';
        switch (name) {
            case 'FREE': return 'from-slate-600 to-slate-700';
            case 'PRO': return 'from-amber-500 to-orange-600';
            default: return 'from-slate-600 to-slate-700';
        }
    };

    const isCurrentPlan = (planName: string) => {
        return userTier === planName && (planName === 'FREE' || subscriptionStatus === 'ACTIVE');
    };

    const midtransScriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.startsWith('SB-')
        ? 'https://app.sandbox.midtrans.com/snap/snap.js'
        : 'https://app.midtrans.com/snap/snap.js';

    return (
        <>
            {/* Midtrans Snap JS */}
            <Script
                src={midtransScriptUrl}
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-white mb-2">Pilih Paket Anda</h1>
                    <p className="text-slate-400">
                        Upgrade untuk akses penuh fitur AI, unlimited PRDs, dan banyak lagi.
                    </p>
                </div>

                {/* Message Banner */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                        message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                            'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }`}>
                        {message.type === 'error' && <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        <p className="text-sm">{message.text}</p>
                    </div>
                )}

                {/* Plans Grid */}
                {loading ? (
                    <PricingSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.sort((a, b) => a.price - b.price).map((plan) => {
                            const current = isCurrentPlan(plan.name);
                            const gradient = getPlanGradient(plan.name, plan.isPopular);

                            return (
                                <div
                                    key={plan.id}
                                    className={`flex flex-col p-8 rounded-2xl relative transition-all duration-300 ${plan.isPopular
                                        ? 'bg-[#135bec]/10 border-2 border-[#135bec] hover:border-[#135bec] shadow-lg shadow-[#135bec]/10 scale-[1.02]'
                                        : 'bg-slate-800/40 border border-slate-700/50 hover:border-slate-600'
                                        } ${current ? 'ring-2 ring-green-500/50' : ''}`}
                                >
                                    {/* Popular Badge */}
                                    {plan.isPopular && !current && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#135bec] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                                            Most Popular
                                        </div>
                                    )}

                                    {/* Current Plan Indicator */}
                                    {current && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                                            Paket Aktif
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-slate-100 text-xl font-bold mb-1">{plan.name}</h3>
                                        <p className="text-slate-400 text-sm">
                                            {plan.name === 'FREE' ? 'Untuk memulai' : plan.name === 'PLUS' ? 'Paling laris' : 'Tanpa batas'}
                                        </p>
                                    </div>

                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-slate-100 text-4xl font-black whitespace-nowrap">
                                            {formatPrice(plan.price)}
                                        </span>
                                        <span className="text-slate-500 text-sm">/month</span>
                                    </div>

                                    <ul className="flex flex-col gap-3 mb-8 text-sm text-slate-400">
                                        {plan.features?.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-400 text-base" style={{ fontSize: '18px', width: '18px' }}>check_circle</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto pt-4">
                                        {/* CTA Button */}
                                        {current ? (
                                            <div className="w-full h-12 flex items-center justify-center rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold text-center">
                                                ✓ Paket Aktif Anda
                                            </div>
                                        ) : plan.price === 0 ? (
                                            <div className="w-full h-12 flex items-center justify-center rounded-xl bg-slate-800 text-slate-500 text-sm font-semibold text-center mt-auto">
                                                Paket Dasar
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleCheckout(plan)}
                                                disabled={checkoutLoading === plan.id}
                                                className={`w-full h-12 flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-200 gap-2 ${plan.isPopular
                                                    ? 'bg-[#135bec] hover:bg-[#135bec]/90 text-white shadow-lg shadow-[#135bec]/20'
                                                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {checkoutLoading === plan.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    <>
                                                        {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* FAQ / Info Section */}
                <div className="mt-12 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h3 className="text-lg font-bold text-white mb-4">Pertanyaan Umum</h3>
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="font-semibold text-slate-200 mb-1">Bagaimana cara pembayaran?</p>
                            <p className="text-slate-400">Kami menggunakan Midtrans sebagai payment gateway. Anda bisa membayar via QRIS, Transfer Bank, E-Wallet (GoPay, OVO, Dana), dan metode lainnya.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-200 mb-1">Berapa lama durasi langganan?</p>
                            <p className="text-slate-400">Setiap langganan berlaku selama 30 hari sejak pembayaran berhasil. Setelah kedaluwarsa, akun akan kembali ke paket Free.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-200 mb-1">Apakah ada auto-renewal?</p>
                            <p className="text-slate-400">Saat ini belum tersedia auto-renewal. Anda perlu membeli ulang paket secara manual setelah masa aktif habis.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
