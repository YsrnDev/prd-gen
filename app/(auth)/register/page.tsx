'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp, signIn } from '@/lib/auth-client';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await signUp.email({ name, email, password });
            if (result.error) {
                setError(result.error.message || 'Registration failed');
            } else {
                const user = result.data?.user as any;
                if (user?.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#135bec] mb-4 shadow-lg shadow-blue-600/20">
                    <span className="material-symbols-outlined text-white text-2xl">bolt</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Create your account</h1>
                <p className="text-sm text-slate-400 mt-1">Start generating professional PRDs with AI</p>
            </div>

            <div className="glass-card p-8">
                {/* Google login */}
                <button
                    onClick={() => signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-800 rounded-lg text-sm font-medium text-white hover:bg-slate-800 transition-colors mb-6"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Sign up with Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-[var(--color-card)] text-slate-400">or register with email</span>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-white mb-1.5">Full Name</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" style={{ fontSize: '18px', width: '18px' }}>person</span>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name" required className="input-field" style={{ paddingLeft: '38px' }} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white mb-1.5">Email</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" style={{ fontSize: '18px', width: '18px' }}>mail</span>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com" required className="input-field" style={{ paddingLeft: '38px' }} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white mb-1.5">Password</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" style={{ fontSize: '18px', width: '18px' }}>lock</span>
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimum 8 characters" required minLength={8} className="input-field" style={{ paddingLeft: '38px', paddingRight: '40px' }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 p-0 bg-transparent border-none text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" tabIndex={-1}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px', lineHeight: 1 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <>Create Account <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
                    </button>
                </form>
            </div>

            <p className="text-center mt-6 text-sm text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
            </p>
        </div>
    );
}
