'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Plan {
    id: number;
    name: string;
    price: number;
    features: string[];
    isPopular: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function PricingManagementPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [features, setFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState('');
    const [isPopular, setIsPopular] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/pricing');
            if (!res.ok) throw new Error('Failed to fetch pricing plans');
            const data = await res.json();
            setPlans(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleOpenDialog = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setName(plan.name);
            setPrice(plan.price);
            setFeatures(plan.features || []);
            setIsPopular(plan.isPopular);
            setIsActive(plan.isActive);
        } else {
            setEditingPlan(null);
            setName('');
            setPrice(0);
            setFeatures([]);
            setIsPopular(false);
            setIsActive(true);
        }
        setIsDialogOpen(true);
        setError(null);
    };

    const handleAddFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newFeature.trim() !== '') {
            e.preventDefault();
            setFeatures([...features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (indexToRemove: number) => {
        setFeatures(features.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        const method = editingPlan ? 'PATCH' : 'POST';
        const url = editingPlan ? `/api/admin/pricing/${editingPlan.id}` : '/api/admin/pricing';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price: Number(price), features, isPopular, isActive }),
            });

            if (!res.ok) throw new Error('Failed to save plan');

            await fetchPlans();
            setIsDialogOpen(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this pricing plan?')) return;

        try {
            const res = await fetch(`/api/admin/pricing/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete plan');
            await fetchPlans();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-fg)]">Pricing Plans</h1>
                    <p className="text-sm text-[var(--color-muted-fg)]">Manage subscription plans and their features.</p>
                </div>
                <button
                    onClick={() => handleOpenDialog()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New Plan
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : error && !isDialogOpen ? (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">{error}</div>
            ) : (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] bg-[#131b33]">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-muted-fg)] uppercase tracking-wider">Plan Name</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-muted-fg)] uppercase tracking-wider">Price (IDR)</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-muted-fg)] uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-muted-fg)] uppercase tracking-wider">Popular</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--color-muted-fg)] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {plans.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center px-6 py-8 text-sm text-[var(--color-muted-fg)]">
                                            No subscription plans found.
                                        </td>
                                    </tr>
                                ) : plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-[#1a2038] transition-colors">
                                        <td className="px-6 py-3 text-sm font-medium text-[var(--color-fg)]">
                                            {plan.name}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-[var(--color-muted-fg)]">
                                            Rp {plan.price.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={cn(
                                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                                                plan.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                            )}>
                                                {plan.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {plan.isActive ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            {plan.isPopular && (
                                                <span className="bg-amber-500/10 text-amber-500 text-xs px-2.5 py-1 rounded-full font-medium inline-block">
                                                    Popular
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenDialog(plan)} className="p-1.5 text-[var(--color-muted-fg)] hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors" title="Edit Plan">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(plan.id)} className="p-1.5 text-[var(--color-muted-fg)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Delete Plan">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Dialog for Create/Edit */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-lg bg-[var(--color-card)] border-[var(--color-border)]">
                        <CardHeader>
                            <CardTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</CardTitle>
                            <CardDescription>Configure pricing and features for your subscription tier.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</div>}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-fg)]">Plan Name (e.g. PLUS, PRO)</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-fg)] uppercase"
                                    placeholder="PLUS"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-fg)]">Price in IDR (Numbers only)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-fg)]"
                                    placeholder="50000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-fg)]">Features</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        onKeyDown={handleAddFeature}
                                        className="flex-1 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-fg)] text-sm"
                                        placeholder="Type feature and press Enter"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { if (newFeature.trim()) { setFeatures([...features, newFeature.trim()]); setNewFeature(''); } }}
                                        className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                                <ul className="space-y-2">
                                    {features.map((f, i) => (
                                        <li key={i} className="flex justify-between items-center text-sm p-2 bg-[#1a2038] rounded-md border border-[var(--color-border)]">
                                            <span className="text-[var(--color-fg)] flex-1">{f}</span>
                                            <button type="button" onClick={() => handleRemoveFeature(i)} className="text-red-500 hover:text-red-400 p-1">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2 text-sm text-[var(--color-fg)] cursor-pointer">
                                    <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded border-[var(--color-border)] bg-[var(--color-bg)]" />
                                    Mark as Popular Highlight
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[var(--color-fg)] cursor-pointer">
                                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-[var(--color-border)] bg-[var(--color-bg)]" />
                                    Active (Visible)
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                                <button onClick={() => setIsDialogOpen(false)} disabled={saving} className="px-4 py-2 hover:bg-[var(--color-accent)] text-[var(--color-fg)] rounded-md transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving || !name || price < 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Saving...' : 'Save Plan'}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
