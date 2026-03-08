'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeletePrdButtonProps {
    prdId: number | string;
    prdTitle: string;
}

export function DeletePrdButton({ prdId, prdTitle }: DeletePrdButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setDeleting(true);
        try {
            const res = await fetch(`/api/prd/${prdId}`, { method: 'DELETE' });
            if (res.ok) {
                window.dispatchEvent(new CustomEvent('prd-deleted'));
                router.refresh();
            }
        } catch {
            // silent fail
        } finally {
            setDeleting(false);
            setShowModal(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Delete"
            >
                <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className="flex items-center justify-center size-12 rounded-full bg-red-500/10 mx-auto mb-4">
                            <span className="material-symbols-outlined text-red-400 text-[24px]">delete_forever</span>
                        </div>

                        <h3 className="text-lg font-bold text-white text-center mb-1">Delete PRD</h3>
                        <p className="text-sm text-slate-400 text-center mb-2">
                            Are you sure you want to delete this document?
                        </p>
                        <p className="text-sm text-white font-medium text-center bg-slate-800/50 rounded-lg px-3 py-2 mb-5 truncate">
                            {prdTitle}
                        </p>
                        <p className="text-xs text-slate-500 text-center mb-5">
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                {deleting ? (
                                    <>
                                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
