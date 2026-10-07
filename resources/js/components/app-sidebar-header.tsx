import { Link, usePage } from '@inertiajs/react';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { url } = usePage();

    const getPageTitle = () => {
        if (breadcrumbs.length > 0) return breadcrumbs[breadcrumbs.length - 1].title;
        if (url.startsWith('/admin/students')) return 'Kelola Siswa PKL';
        if (url.startsWith('/admin/teachers')) return 'Kelola Guru Pembimbing';
        if (url.startsWith('/admin/companies')) return 'Master Tempat PKL (DUDI)';
        if (url.startsWith('/admin/attendances')) return 'Monitoring Presensi';
        if (url.startsWith('/admin/journals')) return 'Rekap Jurnal PKL';
        if (url.startsWith('/admin/prayers')) return 'Monitoring Salat';
        if (url.startsWith('/admin/suspicious-locations')) return 'Lokasi Mencurigakan';
        if (url.startsWith('/dashboard')) return 'Dashboard Utama';
        return 'Dashboard';
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between px-6 sm:px-8 bg-transparent">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-700 transition">
                    Dashboard
                </Link>
                <span>/</span>
                <span className="bg-emerald-50 text-[#008953] font-bold px-2.5 py-0.5 rounded-lg border border-emerald-100 text-xs">
                    {getPageTitle()}
                </span>
            </div>

            {/* Right: Academic Year Pill */}
            <div className="flex items-center gap-2">
                <div className="bg-white border border-slate-200/80 text-slate-700 font-semibold px-3.5 py-1.5 rounded-xl text-xs shadow-2xs">
                    T.A 2026/2027
                </div>
            </div>
        </header>
    );
}
