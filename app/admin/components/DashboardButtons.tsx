'use client';

import { Download, Loader2, AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ExportReportButton() {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/admin/export-report');
            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prdgen-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 px-4 py-2 rounded-lg primary-gradient text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
        >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Exporting...' : 'Export Report'}
        </button>
    );
}

export function MaintenanceToggleButton() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        fetch('/api/admin/maintenance')
            .then((r) => r.json())
            .then((d) => setMaintenanceMode(d.maintenanceMode ?? false))
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = async () => {
        setToggling(true);
        const next = !maintenanceMode;
        try {
            const res = await fetch('/api/admin/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maintenanceMode: next }),
            });
            if (res.ok) setMaintenanceMode(next);
        } finally {
            setToggling(false);
        }
    };

    if (loading) return null;

    return (
        <button
            onClick={handleToggle}
            disabled={toggling}
            title={maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
            className={cn(
                'flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed border',
                maintenanceMode
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            )}
        >
            {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : maintenanceMode ? (
                <X className="w-4 h-4" />
            ) : (
                <AlertTriangle className="w-4 h-4" />
            )}
            {toggling ? 'Updating...' : maintenanceMode ? 'End Maintenance' : 'Maintenance'}
        </button>
    );
}
