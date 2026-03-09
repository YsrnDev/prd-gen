'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
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

export default function UserPricingPage() {
    const { data: session } = useSession();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    const userTier = (session?.user as any)?.tier || 'FREE';
    const subscriptionStatus = (session?.user as any)?.subscriptionStatus || 'NONE';

    useEffect(() => {
        fetchPlans();
    }, []);

    async function fetchPlans() {
        try {
            const res = await fetch('/api/admin/pricing');
            if (res.ok) {
                const data = await res.json();
                setPlans(data.plans.filter((p: Plan) => p.isActive));
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
                    <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Pilih Paket Anda</h1>
                    <p className="text-slate-400">
                        Upgrade untuk akses penuh fitur AI, unlimited PRDs, dan banyak lagi.
                    </p>

                    {/* Current Plan Badge */}
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
                        <div className={`w-2 h-2 rounded-full ${subscriptionStatus === 'ACTIVE' ? 'bg-green-400' : 'bg-slate-500'}`} />
                        <span className="text-sm text-slate-300">
                            Paket saat ini: <strong className="text-white">{userTier}</strong>
                            {subscriptionStatus === 'ACTIVE' && <span className="text-green-400 ml-1">(Aktif)</span>}
                            {subscriptionStatus === 'EXPIRED' && <span className="text-red-400 ml-1">(Kedaluwarsa)</span>}
                        </span>
                    </div>
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
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#135bec] animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.sort((a, b) => a.price - b.price).map((plan) => {
                            const current = isCurrentPlan(plan.name);
                            const gradient = getPlanGradient(plan.name, plan.isPopular);

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${plan.isPopular
                                        ? 'border-2 border-[#135bec] shadow-xl shadow-[#135bec]/10 scale-[1.02]'
                                        : 'border border-slate-700/60'
                                        } ${current ? 'ring-2 ring-green-500/50' : ''}`}
                                >
                                    {/* Popular Badge */}
                                    {plan.isPopular && (
                                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#135bec] to-blue-500 text-center py-1.5">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                                ⭐ Paling Populer
                                            </span>
                                        </div>
                                    )}

                                    {/* Current Plan Indicator */}
                                    {current && (
                                        <div className="absolute top-0 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-b-lg">
                                            AKTIF
                                        </div>
                                    )}

                                    <div className={`p-6 ${plan.isPopular ? 'pt-10' : ''}`}>
                                        {/* Plan Icon & Name */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
                                                {getPlanIcon(plan.name)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                                <p className="text-xs text-slate-400">
                                                    {plan.name === 'FREE' ? 'Untuk memulai' : plan.name === 'PLUS' ? 'Paling laris' : 'Tanpa batas'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <div className="flex items-end gap-1">
                                                <span className="text-3xl font-black text-white whitespace-nowrap">{formatPrice(plan.price)}</span>
                                                <span className="text-sm text-slate-500 mb-1">/month</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-3 mb-6">
                                            {plan.features?.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-sm">
                                                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-300">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        {current ? (
                                            <div className="w-full py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold text-center">
                                                ✓ Paket Aktif Anda
                                            </div>
                                        ) : plan.price === 0 ? (
                                            <div className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 text-sm font-semibold text-center">
                                                Paket Dasar
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleCheckout(plan)}
                                                disabled={checkoutLoading === plan.id}
                                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${plan.isPopular
                                                    ? 'bg-[#135bec] hover:bg-[#104ed0] text-white shadow-lg shadow-[#135bec]/20'
                                                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {checkoutLoading === plan.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="w-4 h-4" />
                                                        Berlangganan {plan.name}
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
