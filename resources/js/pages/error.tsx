import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    GraduationCap,
    Home,
    LayoutDashboard,
    LogOut,
    ShieldAlert,
    UserCheck,
    Users,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    status?: number;
    message?: string;
}

export default function ErrorPage({ status = 403, message }: Props) {
    const { auth } = usePage<{ auth?: { user?: any } }>().props;
    const user = auth?.user;

    const roleDetails: Record<
        string,
        { label: string; dashboardUrl: string; dashboardLabel: string; icon: any }
    > = {
        admin: {
            label: 'Administrator Sistem',
            dashboardUrl: '/admin/students',
            dashboardLabel: 'Ke Dashboard Admin',
            icon: Users,
        },
        guru_pembimbing: {
            label: 'Guru Pembimbing',
            dashboardUrl: '/teacher/attendances',
            dashboardLabel: 'Ke Dashboard Guru',
            icon: GraduationCap,
        },
        pembimbing_dudi: {
            label: 'Pembimbing DUDI',
            dashboardUrl: '/dashboard',
            dashboardLabel: 'Ke Dashboard DUDI',
            icon: UserCheck,
        },
        siswa: {
            label: 'Siswa PKL',
            dashboardUrl: '/dashboard',
            dashboardLabel: 'Ke Dashboard Siswa',
            icon: LayoutDashboard,
        },
    };

    const currentRole = user?.role ? roleDetails[user.role] : null;

    const defaultTitle =
        status === 403
            ? 'Akses Ditolak'
            : status === 404
              ? 'Halaman Tidak Ditemukan'
              : status === 500
                ? 'Terjadi Kesalahan Server'
                : 'Pemberitahuan Sistem';

    const defaultMessage =
        status === 403
            ? 'Maaf, akun Anda tidak memiliki hak akses untuk membuka halaman ini. Silakan kembali ke dashboard yang sesuai dengan peran Anda.'
            : status === 404
              ? 'Halaman yang Anda tuju tidak ditemukan atau URL mungkin sudah berubah.'
              : 'Terjadi kendala pada sistem. Tim pengembang sedang menanganinya.';

    const displayMessage = message || defaultMessage;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#07381d] via-[#0c4e28] to-[#126b38] flex flex-col justify-between p-4 sm:p-6 md:p-8 selection:bg-emerald-500 selection:text-white">
            <Head title={`${status} - ${defaultTitle} | Halo Smakmal`} />

            {/* Top Branding Bar */}
            <div className="w-full max-w-4xl mx-auto flex items-center justify-between text-white/90 py-2">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center font-black text-emerald-300">
                        HS
                    </div>
                    <div>
                        <div className="text-sm font-bold tracking-tight text-white leading-tight">
                            Halo Smakmal
                        </div>
                        <div className="text-[11px] text-emerald-200/80 leading-tight">
                            SMK Amaliah 1 & 2 Ciawi
                        </div>
                    </div>
                </div>

                {user && (
                    <div className="hidden sm:flex items-center gap-2 rounded-full bg-black/25 border border-white/10 px-3.5 py-1.5 backdrop-blur-md text-xs text-emerald-100">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>
                            Login sebagai:{' '}
                            <strong className="text-white">
                                {user.nickname || user.name}
                            </strong>
                        </span>
                    </div>
                )}
            </div>

            {/* Center Content Card */}
            <div className="w-full max-w-xl mx-auto my-auto">
                <div className="relative rounded-[2rem] bg-white dark:bg-neutral-900 border border-emerald-900/10 dark:border-neutral-800 shadow-2xl shadow-black/40 overflow-hidden p-6 sm:p-8 md:p-10 text-center">
                    {/* Top ambient glow accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

                    {/* Status Badge & Icon */}
                    <div className="flex justify-center mb-5">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                                <ShieldAlert className="h-10 w-10 stroke-[2.2]" />
                            </div>
                            <span className="absolute -bottom-2 -right-2 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-black text-[11px] px-2.5 py-0.5 shadow-sm font-mono tracking-wider">
                                {status}
                            </span>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                        {defaultTitle}
                    </h1>

                    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
                        {displayMessage}
                    </p>

                    {/* Current User Session Info Box (If Logged In) */}
                    {user && (
                        <div className="mt-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 p-4 text-left">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                Informasi Sesi Akun Anda
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="truncate">
                                    <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                                        {user.name}
                                    </div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate font-mono">
                                        {user.email}
                                    </div>
                                </div>
                                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold capitalize">
                                    {currentRole?.label || user.role}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {currentRole ? (
                            <Button
                                asChild
                                className="w-full sm:w-auto h-11 px-6 bg-[#008953] hover:bg-[#007346] active:bg-[#00623a] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-900/20 gap-2 transition"
                            >
                                <Link href={currentRole.dashboardUrl}>
                                    <currentRole.icon className="h-4 w-4" />
                                    <span>{currentRole.dashboardLabel}</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                asChild
                                className="w-full sm:w-auto h-11 px-6 bg-[#008953] hover:bg-[#007346] active:bg-[#00623a] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-900/20 gap-2 transition"
                            >
                                <Link href="/login">
                                    <Home className="h-4 w-4" />
                                    <span>Masuk ke Akun (Login)</span>
                                </Link>
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto h-11 px-5 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold text-sm rounded-xl gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Kembali Sebelumnya</span>
                        </Button>
                    </div>

                    {user && (
                        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-center">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Ganti akun / Keluar (Log out)</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="w-full max-w-4xl mx-auto text-center text-xs text-emerald-100/70 py-2">
                &copy; {new Date().getFullYear()} Halo Smakmal — Sistem PKL Terpadu SMK Amaliah
            </div>
        </div>
    );
}
