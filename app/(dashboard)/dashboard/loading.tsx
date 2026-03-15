export default function DashboardLoading() {
    return (
        <div className="max-w-6xl mx-auto animate-pulse">
            <div className="mb-6 md:mb-10 space-y-2">
                <div className="h-7 w-40 bg-slate-800 rounded" />
                <div className="h-4 w-64 bg-slate-800 rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                            <div className="h-4 w-24 bg-slate-800 rounded" />
                            <div className="w-9 h-9 bg-slate-800 rounded-lg" />
                        </div>
                        <div className="h-8 w-16 bg-slate-800 rounded" />
                        <div className="h-3 w-32 bg-slate-800 rounded mt-2" />
                    </div>
                ))}
            </div>

            <section className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
                    <div className="h-5 w-32 bg-slate-800 rounded" />
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-40 bg-slate-800 rounded-lg" />
                        <div className="h-8 w-36 bg-slate-800 rounded-lg" />
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="size-8 rounded bg-slate-800" />
                            <div className="flex-1 h-4 bg-slate-800 rounded" />
                            <div className="w-24 h-4 bg-slate-800 rounded" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
