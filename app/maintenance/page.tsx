import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Under Maintenance | PRDGen AI',
    description: 'PRDGen AI is currently undergoing scheduled maintenance. We will be back shortly.',
    robots: { index: false },
};

export default function MaintenancePage() {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
            </head>
            <body style={{ margin: 0, fontFamily: "'Inter', sans-serif", backgroundColor: '#020817', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 0,
                    background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(19,91,236,0.15), transparent)',
                    pointerEvents: 'none'
                }} />

                <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '520px', width: '100%', position: 'relative', zIndex: 1 }}>
                    {/* Animated icon */}
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '20px',
                        background: 'rgba(19,91,236,0.15)', border: '1px solid rgba(19,91,236,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem',
                        boxShadow: '0 0 40px rgba(19,91,236,0.15)',
                        animation: 'pulse 2s ease-in-out infinite',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#135bec' }}>construction</span>
                    </div>

                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '999px',
                        background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)',
                        fontSize: '11px', fontWeight: 700, color: '#eab308',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        marginBottom: '1.5rem',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308', display: 'inline-block', animation: 'blink 1.2s step-end infinite' }} />
                        Scheduled Maintenance
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        We&apos;re improving<br />things for you
                    </h1>

                    <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: 1.7, margin: '0 0 2.5rem' }}>
                        PRDGen AI is currently undergoing scheduled maintenance to bring you a better experience. We&apos;ll be back online shortly. Thank you for your patience.
                    </p>

                    {/* Status card */}
                    <div style={{
                        background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,1)',
                        borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { icon: 'cloud', label: 'API Services', status: 'Maintenance', color: '#eab308' },
                                { icon: 'memory', label: 'AI Engine', status: 'Maintenance', color: '#eab308' },
                                { icon: 'database', label: 'Database', status: 'Operational', color: '#22c55e' },
                            ].map((item) => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>{item.icon}</span>
                                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 500 }}>{item.label}</span>
                                    </div>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 700, color: item.color,
                                        background: `${item.color}15`, padding: '2px 10px',
                                        borderRadius: '999px', border: `1px solid ${item.color}30`,
                                    }}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                        Questions? Contact{' '}
                        <a href="mailto:support@example.com" style={{ color: '#135bec', textDecoration: 'none' }}>support@prdgen.ai</a>
                    </p>
                </div>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { box-shadow: 0 0 40px rgba(19,91,236,0.15); }
                        50% { box-shadow: 0 0 60px rgba(19,91,236,0.35); }
                    }
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0; }
                    }
                    .material-symbols-outlined {
                        font-family: 'Material Symbols Outlined';
                        font-weight: normal;
                        font-style: normal;
                        font-size: 24px;
                        line-height: 1;
                        letter-spacing: normal;
                        text-transform: none;
                        display: inline-block;
                        white-space: nowrap;
                        word-wrap: normal;
                        -webkit-font-feature-settings: 'liga';
                        -webkit-font-smoothing: antialiased;
                    }
                `}</style>
            </body>
        </html>
    );
}
