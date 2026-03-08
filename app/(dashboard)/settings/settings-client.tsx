'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Image from 'next/image';

export default function SettingsClient() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const userRole = (session?.user as { role?: string })?.role;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Settings</h1>
                <p className="text-sm md:text-base text-slate-400">Manage your account preferences</p>
            </div>

            {/* Profile section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden relative flex-shrink-0">
                        {session?.user?.image ? (
                            <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover" />
                        ) : (
                            session?.user?.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{session?.user?.name || 'User'}</h2>
                        <p className="text-sm text-slate-400">{session?.user?.email || '—'}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${userRole === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                            {userRole || 'user'}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-800">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Name</p>
                            <p className="text-sm font-semibold text-white">{session?.user?.name || '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-800">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Email</p>
                            <p className="text-sm font-semibold text-white">{session?.user?.email || '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-800">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">shield</span>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Role</p>
                            <p className="text-sm font-semibold text-white">{userRole || 'user'}</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Sign out */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-3">Account Actions</h3>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold w-full"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sign out of PRDGen AI
                </button>
            </div>
        </div>
    );
}
