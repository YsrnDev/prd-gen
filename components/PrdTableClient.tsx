'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { DeletePrdButton } from '@/components/DeletePrdButton';

interface PRD {
    id: number | string;
    sessionId?: number | null;
    title: string;
    type?: string;
    createdAt: string;
    updatedAt: string;
}

export function PrdTableClient({ initialPrds }: { initialPrds: PRD[] }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        // Clear selection if PRDs change significantly
        setSelectedIds(new Set());
    }, [initialPrds]);

    const toggleSelectAll = () => {
        if (selectedIds.size === initialPrds.length && initialPrds.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(initialPrds.map(p => p.id)));
        }
    };

    const toggleRow = (id: string | number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.size === 0) return;
        setShowConfirmModal(true);
    };

    const confirmBulkDelete = async () => {
        setShowConfirmModal(false);
        setIsDeletingBulk(true);
        try {
            const res = await fetch('/api/prd/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });

            if (res.ok) {
                window.dispatchEvent(new CustomEvent('prd-deleted'));
                setSelectedIds(new Set());
                router.refresh();
            } else {
                console.error("Failed to delete PRDs");
            }
        } catch (error) {
            console.error('Error deleting PRDs:', error);
        } finally {
            setIsDeletingBulk(false);
        }
    };

    if (initialPrds.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center shadow-sm">
                <span className="material-symbols-outlined text-slate-500 text-5xl mb-4 block opacity-40">description</span>
                <h3 className="text-lg font-bold text-white mb-2">No PRDs yet</h3>
                <p className="text-sm text-slate-400 mb-6">Start by creating your first PRD with our AI-powered wizard.</p>
                <Link href="/wizard/new" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#135bec] text-white text-sm font-bold hover:bg-[#135bec]/90 transition-all shadow-lg shadow-[#135bec]/20">
                    <span className="material-symbols-outlined text-[20px]">add</span> Create First PRD
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {selectedIds.size > 0 && (
                <div className="bg-[#135bec]/10 border-b border-[#135bec]/20 p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#135bec]">
                        {selectedIds.size} item(s) selected
                    </span>
                    <button
                        onClick={handleBulkDeleteClick}
                        disabled={isDeletingBulk}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {isDeletingBulk ? 'sync' : 'delete'}
                        </span>
                        {isDeletingBulk ? 'Deleting...' : 'Delete Selected'}
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === initialPrds.length && initialPrds.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-slate-700 bg-slate-800 text-[#135bec] focus:ring-[#135bec] focus:ring-offset-slate-900 cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Updated</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {initialPrds.map((prd) => {
                            const isSelected = selectedIds.has(prd.id);
                            return (
                                <tr key={prd.id} className={`hover:bg-slate-800/30 transition-colors ${isSelected ? 'bg-slate-800/40' : ''}`}>
                                    <td className="px-6 py-5">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleRow(prd.id)}
                                            className="rounded border-slate-700 bg-slate-800 text-[#135bec] focus:ring-[#135bec] focus:ring-offset-slate-900 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-8 rounded ${prd.type === 'wizard' ? 'bg-amber-500/10 text-amber-500' : 'bg-[#135bec]/10 text-[#135bec]'} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-[20px]">{prd.type === 'wizard' ? 'edit_note' : 'description'}</span>
                                            </div>
                                            <Link href={prd.type === 'wizard' ? `/wizard/${prd.sessionId}` : `/prd/${prd.id}/edit`} className="font-medium text-white text-sm hover:text-[#135bec] transition-colors">
                                                {prd.title}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-slate-400">{formatDate(prd.createdAt)}</td>
                                    <td className="px-6 py-5 text-sm text-slate-400">{formatDate(prd.updatedAt)}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            {prd.type === 'wizard' ? (
                                                <Link href={`/wizard/${prd.sessionId}`} className="text-slate-400 hover:text-[#135bec] transition-colors" title="Resume Draft">
                                                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                                </Link>
                                            ) : (
                                                <>
                                                    <Link href={`/prd/${prd.id}`} className="text-slate-400 hover:text-[#135bec] transition-colors" title="View">
                                                        <span className="material-symbols-outlined">visibility</span>
                                                    </Link>
                                                    <Link href={`/prd/${prd.id}/edit`} className="text-slate-400 hover:text-[#135bec] transition-colors" title="Edit">
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </Link>
                                                </>
                                            )}
                                            <DeletePrdButton prdId={prd.id} prdTitle={prd.title} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''}?</h3>
                        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                            Are you sure you want to delete the selected documents? This action cannot be undone and these documents will be permanently removed.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors text-sm"
                            >
                                Delete {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
