'use client';

import { useState, useEffect, use } from 'react';
import React from 'react';
import { Loader2, ArrowLeft, Crown, User, FileText, Clock, Calendar, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    image?: string | null;
}

interface PRDData {
    id: number;
    title: string;
    size: number;
    createdAt: string;
}

interface SessionData {
    id: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [user, setUser] = useState<UserData | null>(null);
    const [prds, setPrds] = useState<PRDData[]>([]);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch(`/api/admin/users/${resolvedParams.id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await res.json();
                setUser(data.user);
                setPrds(data.prds);
                setSessions(data.sessions);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="text-center py-20 text-red-500">
                <p>{error || 'User not found'}</p>
                <Link href="/admin/users" className="text-blue-500 hover:underline mt-4 inline-block">
                    Back to Users
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header / Back */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/users" className="p-2 hover:bg-[var(--color-accent)] rounded-lg text-[var(--color-muted-fg)] transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-[var(--color-fg)]">User Details</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className={cn(
                    'w-24 h-24 rounded-full flex flex-shrink-0 items-center justify-center text-white text-3xl font-bold overflow-hidden relative',
                    user.role === 'admin' ? 'bg-red-500' : 'primary-gradient'
                )}>
                    {user.image ? (
                        <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
                    ) : (
                        user.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                </div>
                <div className="space-y-3 w-full min-w-0">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-fg)] flex flex-wrap justify-center sm:justify-start items-center gap-2">
                            {user.name}
                            <span className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ml-2',
                                user.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                            )}>
                                {user.role === 'admin' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                {user.role}
                            </span>
                        </h2>
                        <p className="text-[var(--color-muted-fg)] truncate max-w-full">{user.email}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-6 text-sm text-[var(--color-muted-fg)] w-full">
                        <div className="flex items-center gap-2 max-w-full">
                            <Hash className="w-4 h-4 flex-shrink-0" />
                            ID: <span className="font-mono text-xs truncate">{user.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completed PRDs */}
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[var(--color-border)] bg-[#131b33]">
                        <h3 className="text-lg font-semibold text-[var(--color-fg)] flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Completed PRDs
                            <span className="bg-blue-500/10 text-blue-500 py-0.5 px-2 rounded-full text-xs font-bold ml-auto">
                                {prds.length}
                            </span>
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[500px]">
                        {prds.length === 0 ? (
                            <div className="p-8 text-center text-[var(--color-muted-fg)]">
                                <FileText className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                <p>No completed PRDs found</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[var(--color-border)]">
                                {prds.map((prd: PRDData) => (
                                    <li key={prd.id} className="p-4 hover:bg-[var(--color-accent)] transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-1 gap-1 sm:gap-0">
                                            <h4 className="font-medium text-[var(--color-fg)] line-clamp-1 break-all" title={prd.title}>
                                                {prd.title}
                                            </h4>
                                            <span className="text-xs font-mono bg-[var(--color-bg)] py-0.5 px-1.5 rounded text-[var(--color-muted-fg)] whitespace-nowrap align-self-start sm:align-self-auto">
                                                {(prd.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[var(--color-muted-fg)]">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(prd.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Hash className="w-3 h-3" />
                                                ID: {prd.id}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* AI Interactive Sessions (Drafts) */}
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[var(--color-border)] bg-[#131b33]">
                        <h3 className="text-lg font-semibold text-[var(--color-fg)] flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            Drafts / Sessions
                            <span className="bg-amber-500/10 text-amber-500 py-0.5 px-2 rounded-full text-xs font-bold ml-auto">
                                {sessions.length}
                            </span>
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[500px]">
                        {sessions.length === 0 ? (
                            <div className="p-8 text-center text-[var(--color-muted-fg)]">
                                <Clock className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                <p>No recent sessions found</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[var(--color-border)]">
                                {sessions.map((session: SessionData) => (
                                    <li key={session.id} className="p-4 hover:bg-[var(--color-accent)] transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-[var(--color-fg)] break-all">Session #{session.id}</span>
                                                <span className={cn(
                                                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap',
                                                    session.status === 'completed'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                )}>
                                                    {session.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[var(--color-muted-fg)]">
                                            <div className="flex items-center gap-1" title="Last Activity">
                                                <Clock className="w-3 h-3" />
                                                {new Date(session.updatedAt).toLocaleDateString()} {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-1" title="Created At">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center px-4">
                <div className="text-xs text-[var(--color-muted-fg)] flex items-start sm:items-center justify-center gap-2 text-left sm:text-center max-w-2xl mx-auto">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1 sm:mt-0"></span>
                    <p><strong>Privacy Notice:</strong> Access restricted to document metadata only. Content viewing is disabled for user privacy.</p>
                </div>
            </div>
        </div>
    );
}
