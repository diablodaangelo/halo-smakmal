import {
    AlertCircle,
    BarChart3,
    Bell,
    Building2,
    CalendarCheck,
    CheckCircle2,
    ChevronsUpDown,
    ClipboardCheck,
    Clock,
    FileText,
    GraduationCap,
    LayoutGrid,
    LogOut,
    Sun,
    UserCog,
    Users,
    X,
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboard } from '@/routes';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem, User } from '@/types';

interface AppSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
    const {
        auth,
        pending_permissions_count = 0,
        pending_permissions = [],
    } = usePage<{
        auth: { user: User };
        pending_permissions_count?: number;
        pending_permissions?: Array<{
            id: number;
            user_name: string;
            class_name?: string | null;
            date_formatted: string;
            status: string;
            permission_reason?: string | null;
            permission_doc_url?: string | null;
            company_name?: string;
        }>;
    }>().props;
    const user = auth?.user;
    const role = user?.role;
    const { isCurrentUrl } = useCurrentUrl();

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [selectedPermissionDoc, setSelectedPermissionDoc] = useState<{
        url: string;
        title: string;
        reason?: string;
    } | null>(null);
    const [verifyingId, setVerifyingId] = useState<number | null>(null);

    const handleVerifyPermission = (attendanceId: number, isApproved: boolean) => {
        setVerifyingId(attendanceId);
        router.post(
            `/teacher/attendances/${attendanceId}/verify-permission`,
            { is_approved: isApproved },
            {
                preserveScroll: true,
                onFinish: () => setVerifyingId(null),
            }
        );
    };
    const logoHref =
        role === 'admin'
            ? '/admin/dashboard'
            : role === 'guru_pembimbing'
            ? '/teacher/students'
            : dashboard();

    let navItems: NavItem[] = [];

    if (role === 'admin') {
        navItems = [
            {
                title: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
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
                title: 'Daftar Siswa',
                href: '/teacher/students',
                icon: Users,
            },
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
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-[#008953] text-white flex flex-col justify-between p-4 z-50 select-none overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Top: Nav Menu */}
                <div className="space-y-5 pt-2">
                    {/* Brand Logo Header & Notification Bell */}
                    <div className="flex items-center justify-between">
                        <Link
                            href={logoHref}
                            onClick={() => onClose?.()}
                            className="flex items-center gap-3 px-2 py-1 group min-w-0"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#008953] font-black text-xl shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
                                H
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-bold text-base text-white tracking-tight leading-tight truncate">
                                    Halo Smakmal
                                </h1>
                            </div>
                        </Link>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {/* Notification Bell (Khusus Guru Pembimbing) */}
                            {role === 'guru_pembimbing' && (
                                <button
                                    type="button"
                                    onClick={() => setIsNotificationOpen(true)}
                                    className="relative flex size-9 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all shadow-xs cursor-pointer group"
                                    title="Notifikasi Pengajuan Izin Siswa"
                                >
                                    <Bell className="size-4 group-hover:scale-110 transition-transform text-white" />
                                    {pending_permissions_count > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow-xs ring-2 ring-[#008953]">
                                            {pending_permissions_count}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Mobile Close Button */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="lg:hidden p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                                aria-label="Tutup menu"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                    </div>

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
                                        onClick={() => onClose?.()}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                                            active
                                                ? 'bg-white text-[#008953] font-bold shadow-md shadow-emerald-900/20 translate-x-1'
                                                : 'text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1 font-medium'
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

        {/* Modal Dialog Notifikasi & Approval Izin/Sakit Siswa */}
        <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-5">
                <DialogHeader>
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-xs">
                            <Clock className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-slate-900">
                                Permohonan Izin / Sakit Siswa
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Daftar pengajuan tidak hadir PKL yang menunggu konfirmasi guru pembimbing.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-3 space-y-3">
                    {pending_permissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-[#008953] mb-2">
                                <CheckCircle2 className="size-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">Semua Permohonan Selesai</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Tidak ada permohonan izin atau sakit siswa yang menunggu verifikasi saat ini.
                            </p>
                        </div>
                    ) : (
                        pending_permissions.map((perm) => (
                            <div
                                key={perm.id}
                                className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4 space-y-2.5 shadow-2xs"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900">
                                            {perm.user_name}
                                        </span>
                                        {perm.class_name && (
                                            <span className="rounded-md bg-emerald-100/80 px-1.5 py-0.5 text-[10px] font-bold text-[#008953]">
                                                {perm.class_name}
                                            </span>
                                        )}
                                        <span
                                            className={`rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase ${
                                                perm.status === 'sakit'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}
                                        >
                                            {perm.status}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                        {perm.date_formatted}
                                    </span>
                                </div>

                                <div className="text-xs text-slate-700 bg-white rounded-xl p-2.5 border border-slate-200/70 leading-relaxed">
                                    <strong className="text-slate-900">Alasan:</strong> {perm.permission_reason || '-'}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-slate-200/50">
                                    <div className="text-xs text-slate-500">
                                        <span>DUDI: <strong className="text-slate-700">{perm.company_name}</strong></span>
                                        {perm.permission_doc_url && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedPermissionDoc({
                                                        url: perm.permission_doc_url!,
                                                        title: `Surat Izin / Sakit - ${perm.user_name}`,
                                                        reason: perm.permission_reason || undefined,
                                                    })
                                                }
                                                className="inline-flex items-center gap-1.5 text-xs text-[#008953] hover:text-[#007346] font-semibold underline underline-offset-2 ml-3 cursor-pointer"
                                            >
                                                <FileText className="size-3.5" />
                                                <span>Lihat Bukti Surat</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={verifyingId === perm.id}
                                            onClick={() => handleVerifyPermission(perm.id, true)}
                                            className="bg-[#008953] hover:bg-[#007346] text-white font-bold text-xs h-8 px-3 rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                                        >
                                            <CheckCircle2 className="size-3.5" />
                                            <span>Setujui</span>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={verifyingId === perm.id}
                                            onClick={() => handleVerifyPermission(perm.id, false)}
                                            className="border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs h-8 px-3 rounded-xl cursor-pointer flex items-center gap-1"
                                        >
                                            <AlertCircle className="size-3.5 text-rose-600" />
                                            <span>Tolak</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Modal Preview Lampiran Surat */}
        <Dialog open={!!selectedPermissionDoc} onOpenChange={(open) => !open && setSelectedPermissionDoc(null)}>
            <DialogContent className="sm:max-w-lg rounded-2xl p-5">
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="size-4 text-amber-600" />
                        <span>{selectedPermissionDoc?.title}</span>
                    </DialogTitle>
                    {selectedPermissionDoc?.reason && (
                        <DialogDescription className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-1">
                            <strong className="text-slate-800">Keterangan:</strong> {selectedPermissionDoc.reason}
                        </DialogDescription>
                    )}
                </DialogHeader>
                {selectedPermissionDoc?.url && (
                    <div className="overflow-hidden rounded-xl bg-slate-100 mt-2 border border-slate-200 flex items-center justify-center min-h-[250px]">
                        {selectedPermissionDoc.url.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                                src={selectedPermissionDoc.url}
                                title="PDF Viewer"
                                className="w-full h-[400px] border-0"
                            />
                        ) : (
                            <img
                                src={selectedPermissionDoc.url}
                                alt="Lampiran Surat"
                                className="h-auto w-full object-contain max-h-[70vh]"
                            />
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </>
    );
}
