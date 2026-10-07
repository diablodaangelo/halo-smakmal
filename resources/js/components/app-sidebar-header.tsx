import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    onToggleMobileSidebar,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    onToggleMobileSidebar?: () => void;
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
        if (url.startsWith('/student/attendances')) return 'Riwayat Presensi';
        if (url.startsWith('/student/journals')) return 'Jurnal Harian PKL';
        if (url.startsWith('/student/prayers')) return 'Jadwal & Log Salat';
        if (url.startsWith('/teacher/students')) return 'Daftar Siswa Binaan';
        if (url.startsWith('/teacher/attendances')) return 'Presensi Siswa Binaan';
        if (url.startsWith('/teacher/journals')) return 'Review Jurnal PKL';
        if (url.startsWith('/teacher/prayers')) return 'Review Salat Siswa';
        if (url.startsWith('/teachers/')) return 'Profil Guru Pembimbing';
        if (url.startsWith('/students/')) return 'Profil Siswa PKL';
        if (url.startsWith('/dashboard')) return 'Dashboard';
        return 'Portal PKL';
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent">
            {/* Left: Hamburger & Breadcrumbs */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-slate-400 min-w-0">
                <button
                    type="button"
                    onClick={onToggleMobileSidebar}
                    className="lg:hidden -ml-1 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer shrink-0"
                    aria-label="Buka menu navigasi"
                >
                    <Menu className="size-5" />
                </button>

                <div className="flex items-center gap-2 min-w-0">
                    <Link href="/dashboard" className="hover:text-slate-700 transition hidden sm:inline">
                        Dashboard
                    </Link>
                    <span className="hidden sm:inline">/</span>
                    <span className="bg-emerald-50 text-[#008953] font-bold px-2.5 py-0.5 rounded-lg border border-emerald-100 text-xs truncate">
                        {getPageTitle()}
                    </span>
                </div>
            </div>
        </header>
    );
}
