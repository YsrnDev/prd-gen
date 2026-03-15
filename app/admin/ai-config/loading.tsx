export default function AdminAIConfigLoading() {
    return (
        <div className="w-full max-w-4xl mx-auto animate-pulse">
            <div className="flex items-center gap-2 mb-6">
                <div className="h-4 w-4 bg-slate-800 rounded" />
                <div className="h-3 w-40 bg-slate-800 rounded" />
            </div>

            <div className="mb-8 space-y-2">
                <div className="h-7 w-64 bg-slate-800 rounded" />
                <div className="h-4 w-96 bg-slate-800 rounded" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4">
                <div className="h-4 w-32 bg-slate-800 rounded mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 rounded-xl border border-slate-800 bg-slate-900" />
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-36 bg-slate-800 rounded" />
                    <div className="h-4 w-20 bg-slate-800 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">
                    <div className="space-y-2">
                        <div className="h-3 w-32 bg-slate-800 rounded" />
                        <div className="h-10 w-full bg-slate-800 rounded" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-40 bg-slate-800 rounded" />
                        <div className="h-10 w-full bg-slate-800 rounded" />
                    </div>
                </div>
                <div className="flex gap-3 mt-4">
                    <div className="h-10 w-44 bg-slate-800 rounded-lg" />
                    <div className="h-10 w-40 bg-slate-800 rounded-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="h-4 w-36 bg-slate-800 rounded mb-4" />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="h-3 w-32 bg-slate-800 rounded" />
                                <div className="h-9 w-full bg-slate-800 rounded" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-40 bg-slate-800 rounded" />
                                <div className="h-2.5 w-full bg-slate-800 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
