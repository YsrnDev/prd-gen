export default function DashboardPricingLoading() {
    return (
        <div className="max-w-5xl mx-auto animate-pulse">
            <div className="mb-8 space-y-2">
                <div className="h-7 w-48 bg-slate-800 rounded" />
                <div className="h-4 w-80 bg-slate-800 rounded" />
                <div className="h-10 w-64 bg-slate-800 rounded-xl mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
                        <div className="h-5 w-24 bg-slate-800 rounded mb-2" />
                        <div className="h-4 w-32 bg-slate-800 rounded mb-6" />
                        <div className="h-10 w-32 bg-slate-800 rounded mb-6" />
                        <div className="space-y-3 mb-8">
                            {[...Array(4)].map((_, j) => (
                                <div key={j} className="h-4 w-40 bg-slate-800 rounded" />
                            ))}
                        </div>
                        <div className="h-12 w-full bg-slate-800 rounded-xl" />
                    </div>
                ))}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="h-5 w-40 bg-slate-800 rounded mb-4" />
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 w-48 bg-slate-800 rounded mb-2" />
                            <div className="h-3 w-full bg-slate-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
