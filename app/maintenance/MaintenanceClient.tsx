'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const POLL_INTERVAL = 10000; // 10 seconds

export default function MaintenanceClient() {
    const router = useRouter();

    // Auto-redirect back to dashboard when maintenance is disabled
    useEffect(() => {
        let stopped = false;

        const check = async () => {
            if (stopped) return;
            try {
                const res = await fetch('/api/maintenance-status', { cache: 'no-store' });
                if (res.ok) {
                    const { maintenanceMode } = await res.json();
                    if (!maintenanceMode && !stopped) {
                        router.replace('/dashboard');
                    }
                }
            } catch {
                // Ignore network errors silently
            }
        };

        // Wait a bit before first check to avoid instant redirect on load
        const initial = setTimeout(check, 3000);
        const interval = setInterval(check, POLL_INTERVAL);

        return () => {
            stopped = true;
            clearTimeout(initial);
            clearInterval(interval);
        };
    }, [router]);

    return (
        <>
            <style>{`
                body { background-color: #020817 !important; }
                @keyframes pulseBg {
                    0%, 100% { box-shadow: 0 0 40px rgba(19,91,236,0.15); }
                    50% { box-shadow: 0 0 60px rgba(19,91,236,0.35); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .maintenance-icon { animation: pulseBg 2s ease-in-out infinite; }
                .blink-dot { animation: blink 1.2s step-end infinite; }
            `}</style>

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#020817',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                color: '#f8fafc',
                padding: '2rem',
                position: 'relative',
            }}>
                {/* Background radial gradient */}
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(19,91,236,0.15), transparent)',
                }} />

                <div style={{ textAlign: 'center', maxWidth: '520px', width: '100%', position: 'relative', zIndex: 1 }}>
                    {/* Icon */}
                    <div className="maintenance-icon" style={{
                        width: '80px', height: '80px', borderRadius: '20px',
                        background: 'rgba(19,91,236,0.15)', border: '1px solid rgba(19,91,236,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#135bec' }}>construction</span>
                    </div>

                    {/* Status badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '999px',
                        background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)',
                        fontSize: '11px', fontWeight: 700, color: '#eab308',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        marginBottom: '1.5rem',
                    }}>
                        <span className="blink-dot" style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: '#eab308', display: 'inline-block',
                        }} />
                        Scheduled Maintenance
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                        fontWeight: 800, color: '#f8fafc',
                        margin: '0 0 1rem', letterSpacing: '-0.02em', lineHeight: 1.2,
                    }}>
                        We&apos;re improving<br />things for you
                    </h1>

                    <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: 1.7, margin: '0 0 2.5rem' }}>
                        Lucky Brew is currently undergoing scheduled maintenance to bring you a better experience.
                        We&apos;ll be back online shortly. Thank you for your patience.
                    </p>

                    {/* Service status card */}
                    <div style={{
                        background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,1)',
                        borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem',
                    }}>
                        {[
                            { icon: 'cloud', label: 'API Services', status: 'Maintenance', color: '#eab308' },
                            { icon: 'memory', label: 'AI Engine', status: 'Maintenance', color: '#eab308' },
                            { icon: 'database', label: 'Database', status: 'Operational', color: '#22c55e' },
                        ].map((item, i, arr) => (
                            <div key={item.label} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 0',
                                borderBottom: i < arr.length - 1 ? '1px solid rgba(30,41,59,0.8)' : 'none',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>{item.icon}</span>
                                    <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 500 }}>{item.label}</span>
                                </div>
                                <span style={{
                                    fontSize: '11px', fontWeight: 700, color: item.color,
                                    background: `${item.color}20`, padding: '2px 10px',
                                    borderRadius: '999px', border: `1px solid ${item.color}40`,
                                }}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Auto-refresh notice */}
                    <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '0.5rem' }}>
                        This page checks automatically every 10 seconds.
                    </p>

                    <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                        Questions? Contact{' '}
                        <a href="mailto:support@luckybrew.com" style={{ color: '#135bec', textDecoration: 'none' }}>
                            support@luckybrew.com
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
