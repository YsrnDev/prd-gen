export default function SettingsLoading() {
    return (
        <div className="max-w-3xl mx-auto animate-pulse">
            <div className="mb-8 space-y-2">
                <div className="h-7 w-40 bg-slate-800 rounded" />
                <div className="h-4 w-56 bg-slate-800 rounded" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-slate-800" />
                    <div className="space-y-2">
                        <div className="h-5 w-40 bg-slate-800 rounded" />
                        <div className="h-4 w-56 bg-slate-800 rounded" />
                        <div className="h-4 w-20 bg-slate-800 rounded" />
                    </div>
                </div>

                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-800">
                            <div className="w-5 h-5 bg-slate-800 rounded" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-20 bg-slate-800 rounded" />
                                <div className="h-4 w-48 bg-slate-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-6 rounded-xl border border-slate-800 p-5 bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-800" />
                        <div className="space-y-2">
                            <div className="h-4 w-40 bg-slate-800 rounded" />
                            <div className="h-3 w-52 bg-slate-800 rounded" />
                        </div>
                    </div>
                    <div className="h-9 w-28 bg-slate-800 rounded-lg" />
                </div>
            </div>

            <div className="mt-8">
                <div className="h-12 w-full bg-slate-800 rounded-lg" />
            </div>

            <div className="mt-12 space-y-2 text-center">
                <div className="h-3 w-44 bg-slate-800 rounded mx-auto" />
                <div className="h-3 w-32 bg-slate-800 rounded mx-auto" />
            </div>
        </div>
    );
}
