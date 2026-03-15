export default function AdminLoading() {
    return (
        <div className="w-full max-w-7xl mx-auto animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <div className="h-6 w-48 bg-slate-800 rounded" />
                    <div className="h-4 w-64 bg-slate-800 rounded" />
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="h-10 w-36 bg-slate-800 rounded-lg" />
                    <div className="h-10 w-36 bg-slate-800 rounded-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-2">
                        <div className="h-4 w-32 bg-slate-800 rounded" />
                        <div className="h-8 w-20 bg-slate-800 rounded" />
                        <div className="h-3 w-28 bg-slate-800 rounded" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="glass-card p-6 md:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-2">
                            <div className="h-4 w-28 bg-slate-800 rounded" />
                            <div className="h-3 w-48 bg-slate-800 rounded" />
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="h-3 w-16 bg-slate-800 rounded" />
                            <div className="h-3 w-20 bg-slate-800 rounded" />
                        </div>
                    </div>
                    <div className="h-44 w-full bg-slate-800/60 rounded" />
                </div>

                <div className="glass-card p-5">
                    <div className="h-4 w-32 bg-slate-800 rounded mb-4" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="w-7 h-7 bg-slate-800 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-40 bg-slate-800 rounded" />
                                    <div className="h-3 w-28 bg-slate-800 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
