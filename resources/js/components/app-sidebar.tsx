import {
    Building2,
    CalendarCheck,
    ChevronsUpDown,
    ClipboardCheck,
    GraduationCap,
    LayoutGrid,
    LogOut,
    Sun,
    UserCog,
    Users,
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboard } from '@/routes';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem, User } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth?.user;
    const role = user?.role;
    const { isCurrentUrl } = useCurrentUrl();

    const logoHref =
        role === 'admin'
            ? '/admin/students'
            : role === 'guru_pembimbing'
            ? '/teacher/attendances'
            : dashboard();

    let navItems: NavItem[] = [];

    if (role === 'admin') {
        navItems = [
            {
                title: 'Kelola Siswa',
                href: '/admin/students',
                icon: Users,
            },
            {
                title: 'Kelola Guru',
                href: '/admin/teachers',
                icon: GraduationCap,
            },
            {
                title: 'Master DUDI',
                href: '/admin/companies',
                icon: Building2,
            },
        ];
    } else if (role === 'guru_pembimbing') {
        navItems = [
            {
                title: 'Presensi Siswa',
                href: '/teacher/attendances',
                icon: CalendarCheck,
            },
            {
                title: 'Review Jurnal',
                href: '/teacher/journals',
                icon: ClipboardCheck,
            },
            {
                title: 'Review Salat',
                href: '/teacher/prayers',
                icon: Sun,
            },
        ];
    } else if (role === 'pembimbing_dudi') {
        navItems = [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Review Jurnal Siswa',
                href: '/dashboard',
                icon: ClipboardCheck,
            },
        ];
    } else if (role === 'siswa') {
        navItems = [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Riwayat Presensi',
                href: '/student/attendances',
                icon: CalendarCheck,
            },
            {
                title: 'Jurnal Harian PKL',
                href: '/student/journals',
                icon: ClipboardCheck,
            },
            {
                title: 'Jadwal & Log Salat',
                href: '/student/prayers',
                icon: Sun,
            },
        ];
    }

    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
        : 'AD';

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-[#008953] text-white flex flex-col justify-between p-4 z-40 select-none overflow-y-auto shadow-lg">
            {/* Top: Logo & Nav */}
            <div className="space-y-6">
                {/* Brand Logo Header */}
                <Link href={logoHref} className="flex items-center gap-3 px-2 py-2 group">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#008953] font-black text-xl shadow-md">
                        H
                    </div>
                    <div>
                        <h1 className="font-bold text-base text-white tracking-tight leading-tight">
                            Halo Smakmal
                        </h1>
                        <p className="text-xs text-emerald-100/80 font-medium">
                            {role === 'admin' ? 'Admin Portal' : 'Portal PKL'}
                        </p>
                    </div>
                </Link>

                {/* Nav Section */}
                <div className="space-y-2">
                    <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-100/60">
                        MENU UTAMA
                    </div>
                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const active = isCurrentUrl(item.href);
                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    prefetch
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                                        active
                                            ? 'bg-white text-[#008953] font-bold shadow-md shadow-emerald-900/20 translate-x-1'
                                            : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
                                    }`}
                                >
                                    {active ? (
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-[#008953]" />
                                            <span className="h-2 w-2 rounded-full bg-[#008953]/50 -ml-0.5" />
                                        </span>
                                    ) : null}
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Bottom: User Profile Dropdown */}
            <div className="pt-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="w-full flex items-center gap-3 bg-white text-slate-800 rounded-2xl p-3 shadow-md hover:bg-slate-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#008953] text-white font-bold text-xs shadow-2xs">
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                    {user?.name || 'Administrator'}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                    {user?.email || 'admin@smkamaliah.sch.id'}
                                </p>
                            </div>
                            <ChevronsUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side="top"
                        align="start"
                        sideOffset={10}
                        className="w-56 p-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xl shadow-emerald-950/20 z-50 animate-in fade-in zoom-in-95 space-y-1"
                    >
                        {/* Header User Info */}
                        <div className="px-2.5 py-2 mb-1">
                            <div className="flex items-center justify-between gap-1.5">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                    {user?.name || 'Administrator'}
                                </p>
                                <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-50 text-[#008953] border border-emerald-200/60 shrink-0">
                                    {role === 'admin'
                                        ? 'Admin'
                                        : role === 'guru_pembimbing'
                                        ? 'Guru'
                                        : role === 'pembimbing_dudi'
                                        ? 'DUDI'
                                        : 'Siswa'}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                {user?.email || 'admin@smkamaliah.sch.id'}
                            </p>
                        </div>

                        <div className="h-px bg-slate-100 -mx-1 my-1" />

                        {/* Pengaturan Akun */}
                        <DropdownMenuItem asChild className="focus:bg-emerald-50/70 rounded-xl cursor-pointer p-0">
                            <Link
                                href="/settings/profile"
                                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#008953] w-full rounded-xl transition-colors"
                            >
                                <UserCog className="h-4 w-4 text-[#008953] shrink-0" />
                                <span>Pengaturan Akun</span>
                            </Link>
                        </DropdownMenuItem>

                        {/* Logout */}
                        <DropdownMenuItem asChild className="focus:bg-red-50 rounded-xl cursor-pointer p-0">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 w-full rounded-xl transition-colors"
                            >
                                <LogOut className="h-4 w-4 text-red-500 shrink-0" />
                                <span>Keluar (Logout)</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}
