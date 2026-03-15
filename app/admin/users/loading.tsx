export default function AdminUsersLoading() {
    return (
        <div className="w-full max-w-7xl mx-auto animate-pulse">
            <div className="mb-8 space-y-2">
                <div className="h-6 w-56 bg-slate-800 rounded" />
                <div className="h-4 w-36 bg-slate-800 rounded" />
            </div>

            <div className="h-10 w-full bg-slate-800 rounded-lg mb-4" />

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="h-12 bg-slate-800/60" />
                <div className="divide-y divide-slate-800">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="px-6 py-4 flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-48 bg-slate-800 rounded" />
                                <div className="h-3 w-32 bg-slate-800 rounded" />
                            </div>
                            <div className="h-6 w-16 bg-slate-800 rounded-full" />
                            <div className="h-4 w-20 bg-slate-800 rounded" />
                            <div className="h-8 w-16 bg-slate-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
