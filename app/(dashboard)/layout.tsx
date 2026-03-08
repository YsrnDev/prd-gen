import { Sidebar, AdminSidebar } from '@/components/layout/Sidebar';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const isAdmin = (session?.user as any)?.role === 'admin';

    return (
        <div className="flex h-screen bg-[#101622] text-slate-100">
            {isAdmin ? <AdminSidebar /> : <Sidebar />}
            <main className="flex-1 overflow-y-auto p-4 pt-24 pb-32 md:p-8 md:pt-8 md:pb-8">
                {children}
            </main>
        </div>
    );
}
