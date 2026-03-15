export default function AdminPricingLoading() {
    return (
        <div className="w-full max-w-7xl mx-auto animate-pulse">
            <div className="mb-8 space-y-2">
                <div className="h-6 w-40 bg-slate-800 rounded" />
                <div className="h-4 w-64 bg-slate-800 rounded" />
            </div>

            <div className="h-10 w-40 bg-slate-800 rounded-lg mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
                        <div className="h-4 w-24 bg-slate-800 rounded" />
                        <div className="h-8 w-32 bg-slate-800 rounded" />
                        <div className="h-3 w-40 bg-slate-800 rounded" />
                        <div className="h-10 w-full bg-slate-800 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
