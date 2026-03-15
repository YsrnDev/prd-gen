export default function PRDsLoading() {
    return (
        <div className="max-w-6xl mx-auto animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <div className="h-7 w-40 bg-slate-800 rounded" />
                    <div className="h-4 w-24 bg-slate-800 rounded" />
                </div>
                <div className="h-10 w-32 bg-slate-800 rounded-lg" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="h-12 bg-slate-800/60" />
                <div className="divide-y divide-slate-800">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="px-6 py-5 flex items-center gap-4">
                            <div className="size-8 rounded bg-slate-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-64 bg-slate-800 rounded" />
                                <div className="h-3 w-32 bg-slate-800 rounded" />
                            </div>
                            <div className="h-4 w-20 bg-slate-800 rounded" />
                            <div className="h-4 w-16 bg-slate-800 rounded" />
                            <div className="h-8 w-24 bg-slate-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
