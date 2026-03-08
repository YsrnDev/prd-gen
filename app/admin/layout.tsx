import { AdminSidebar } from '@/components/layout/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[var(--color-bg)]">
            <AdminSidebar />
            <main className="flex-1 min-h-screen p-4 pt-24 pb-32 md:p-8 md:pt-8 md:pb-8">
                {children}
            </main>
        </div>
    );
}
