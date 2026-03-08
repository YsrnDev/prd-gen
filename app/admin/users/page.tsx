'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, Trash2, Crown, User, Loader2, RefreshCw, Search, Key, X, EyeOff, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

import Image from 'next/image';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    image?: string | null;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    // Reset Password States
    const [resetUser, setResetUser] = useState<{ id: string; name: string } | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/users');
        if (res.ok) {
            const data = await res.json();
            setUsers(data.users);
        }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const deleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}? This is irreversible.`)) return;
        setActionLoading(userId);
        const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
        if (res.ok) {
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        }
        setActionLoading(null);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetUser || newPassword.length < 8) {
            setResetError('Password must be at least 8 characters long');
            return;
        }

        setResetLoading(true);
        setResetError('');
        setResetSuccess('');

        try {
            const res = await fetch(`/api/admin/users/${resetUser.id}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setResetError(data.error || 'Failed to reset password');
            } else {
                setResetSuccess('Password reset successfully!');
                setTimeout(() => {
                    setResetUser(null);
                    setNewPassword('');
                    setResetSuccess('');
                }, 2000);
            }
        } catch (err) {
            setResetError('An expected error occurred');
        } finally {
            setResetLoading(false);
        }
    };



    const filtered = useMemo(() => {
        return users.filter(
            (u) =>
                u.name?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-fg)]">User Management</h1>
                    <p className="text-[var(--color-muted-fg)] mt-1">{users.length} registered users</p>
                </div>
                <button onClick={fetchUsers} className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-accent)] transition-colors self-start sm:self-auto">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-fg)]" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-fg)] placeholder:text-[var(--color-muted-fg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] bg-[#131b33]">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-muted-fg)] uppercase tracking-wider">User</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-muted-fg)] uppercase tracking-wider">Role</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-muted-fg)] uppercase tracking-wider">Joined</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--color-muted-fg)] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {filtered.map((u) => (
                                    <tr key={u.id} className="hover:bg-[#1a2038] transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden relative',
                                                    u.role === 'admin' ? 'bg-red-500' : 'primary-gradient'
                                                )}>
                                                    {u.image ? (
                                                        <Image src={u.image} alt={u.name || 'User'} fill className="object-cover" />
                                                    ) : (
                                                        u.name?.charAt(0)?.toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--color-fg)]">{u.name}</p>
                                                    <p className="text-xs text-[var(--color-muted-fg)]">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={cn(
                                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                                            )}>
                                                {u.role === 'admin' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-[var(--color-muted-fg)]">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-end gap-2">

                                                <button
                                                    onClick={() => setResetUser({ id: u.id, name: u.name })}
                                                    disabled={actionLoading === u.id}
                                                    className="p-1.5 rounded-md text-[var(--color-muted-fg)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                                                    title="Reset Password"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(u.id, u.name)}
                                                    disabled={actionLoading === u.id}
                                                    className="p-1.5 rounded-md text-[var(--color-muted-fg)] hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden flex flex-col divide-y divide-[var(--color-border)]">
                        {filtered.map((u) => (
                            <div key={u.id} className="p-4 hover:bg-[#1a2038] transition-colors flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden relative',
                                            u.role === 'admin' ? 'bg-red-500' : 'primary-gradient'
                                        )}>
                                            {u.image ? (
                                                <Image src={u.image} alt={u.name || 'User'} fill className="object-cover" />
                                            ) : (
                                                u.name?.charAt(0)?.toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <p className="text-sm font-bold text-[var(--color-fg)] truncate w-[85%]">{u.name}</p>
                                            <p className="text-xs text-[var(--color-muted-fg)] truncate w-[85%]">{u.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-[var(--color-border)]">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted-fg)]">Role</span>
                                        <span className={cn(
                                            'inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md text-[10px] font-bold',
                                            u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                                        )}>
                                            {u.role === 'admin' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {u.role}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted-fg)]">Joined</span>
                                        <span className="text-xs font-medium text-[var(--color-fg)]">{new Date(u.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--color-border)]/50 mt-1">
                                    <button
                                        onClick={() => setResetUser({ id: u.id, name: u.name })}
                                        disabled={actionLoading === u.id}
                                        className="flex-1 py-2 flex justify-center items-center gap-2 rounded-lg text-xs font-semibold text-[var(--color-muted-fg)] hover:text-amber-500 hover:bg-amber-500/10 bg-[var(--color-accent)] border border-[var(--color-border)] transition-colors disabled:opacity-50"
                                    >
                                        <Key className="w-4 h-4" /> Reset Password
                                    </button>
                                    <button
                                        onClick={() => deleteUser(u.id, u.name)}
                                        disabled={actionLoading === u.id}
                                        className="py-2 px-3 flex justify-center items-center gap-2 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
                                        title="Delete user"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-muted-fg)]">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No users found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Reset Password Modal */}
            {resetUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
                            <h3 className="font-semibold text-[var(--color-fg)]">Reset Password</h3>
                            <button
                                onClick={() => {
                                    setResetUser(null);
                                    setNewPassword('');
                                    setResetError('');
                                    setResetSuccess('');
                                }}
                                className="text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-colors p-1 rounded-md hover:bg-[var(--color-accent)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-4 space-y-4">
                            <div>
                                <p className="text-sm text-[var(--color-muted-fg)] mb-3">
                                    Set a new password for <span className="font-semibold text-[var(--color-fg)]">{resetUser.name}</span>.
                                </p>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="New Password (min 8 chars)"
                                        className="w-full pl-3 pr-10 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-fg)] placeholder:text-[var(--color-muted-fg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {resetError && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded-md border border-red-500/20">{resetError}</p>}
                            {resetSuccess && <p className="text-sm text-emerald-500 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20">{resetSuccess}</p>}

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setResetUser(null)}
                                    className="px-4 py-2 text-sm font-medium text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] bg-[var(--color-accent)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetLoading || newPassword.length < 8}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
