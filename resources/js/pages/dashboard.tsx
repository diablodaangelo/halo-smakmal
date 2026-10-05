import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    HeartHandshake,
    MapPin,
    Moon,
    Sun,
    UserCheck,
    Users,
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface DashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'guru_pembimbing' | 'pembimbing_dudi' | 'siswa';
        nis_nip?: string;
        company?: {
            id: number;
            name: string;
            address: string;
            radius_meters: number;
        };
    };
    today_date: string;
    role: 'admin' | 'guru_pembimbing' | 'pembimbing_dudi' | 'siswa';
    stats?: Record<string, any>;
    recent_attendances?: Array<any>;
    recent_journals?: Array<any>;
    companies?: Array<any>;
    students?: Array<any>;
    guided_students?: Array<any>;
    today_attendance?: any;
    today_journal?: any;
}

export default function Dashboard({
    user,
    today_date,
    role,
    stats = {},
    recent_attendances = [],
    recent_journals = [],
    companies = [],
    students = [],
    guided_students = [],
    today_attendance,
    today_journal,
}: DashboardProps) {
    const roleBadges: Record<string, { label: string; color: string }> = {
        admin: { label: 'Admin Sekolah (Full Control)', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
        guru_pembimbing: { label: 'Guru Pembimbing (Monitoring Binaan)', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        pembimbing_dudi: { label: 'Pembimbing DUDI (Supervisor Lapangan)', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        siswa: { label: 'Siswa PKL (Pelaksana)', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    };

    return (
        <>
            <Head title="Dashboard - Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* 1. Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl sm:p-8">
                    <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                                    <Building2 className="size-3.5" />
                                    SMK Amaliah 1 & 2 Ciawi
                                </span>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-white text-slate-900">
                                    {roleBadges[role]?.label || role}
                                </span>
                            </div>
                            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                                Halo, {user.name} 👋
                            </h1>
                            <p className="mt-1 text-sm text-blue-100 sm:text-base">
                                Sistem Terpadu Monitoring Presensi Geofencing, Jurnal Kerja & Log Ibadah PKL.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-black/20 px-4 py-2.5 backdrop-blur-md">
                            <Calendar className="size-5 text-blue-200" />
                            <div className="text-right text-xs sm:text-sm">
                                <div className="font-semibold text-white">{today_date}</div>
                                <div className="text-blue-200">Tahun Ajaran 2026/2027</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Role: Admin Dashboard (Full Control Master Data & Plotting) */}
                {role === 'admin' && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs transition hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Siswa PKL</span>
                                    <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-500">
                                        <Users className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{stats.total_students ?? 0}</span>
                                    <span className="text-xs text-neutral-500">Siswa Terdata</span>
                                </div>
                                <div className="mt-2 text-xs text-emerald-500">
                                    ✓ {stats.placed_students ?? 0} sudah di-plot ke DUDI ({stats.unassigned_students ?? 0} unassigned)
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs transition hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Guru Pembimbing</span>
                                    <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500">
                                        <GraduationCap className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{stats.total_teachers ?? 0}</span>
                                    <span className="text-xs text-neutral-500">Guru Terdaftar</span>
                                </div>
                                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                    {stats.assigned_teacher_students ?? 0} siswa sudah memiliki pembimbing
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs transition hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Mitra Kantor DUDI</span>
                                    <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-500">
                                        <Building2 className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{stats.total_companies ?? 0}</span>
                                    <span className="text-xs text-neutral-500">Instansi Geofenced</span>
                                </div>
                                <div className="mt-2 text-xs text-indigo-400">
                                    GPS radius tracking aktif
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs transition hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Presensi Hari Ini</span>
                                    <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-500">
                                        <CheckCircle2 className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{stats.today_present ?? 0}</span>
                                    <span className="text-xs font-semibold text-purple-500">({stats.attendance_rate ?? 0}%)</span>
                                </div>
                                <div className="mt-2 text-xs text-neutral-500">
                                    {stats.today_late ?? 0} siswa terlambat masuk
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Grid */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <div className="flex items-center justify-between border-b border-sidebar-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4 text-blue-500" />
                                        <h2 className="font-semibold">Presensi Masuk Terkini (Live)</h2>
                                    </div>
                                    <span className="text-xs text-neutral-500">Validasi Radius GPS</span>
                                </div>
                                <div className="mt-4 divide-y divide-sidebar-border/50">
                                    {recent_attendances.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-neutral-500">Belum ada data presensi hari ini</div>
                                    ) : (
                                        recent_attendances.map((att) => (
                                            <div key={att.id} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600">
                                                        {att.user?.name?.slice(0, 2).toUpperCase() || 'SW'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{att.user?.name}</p>
                                                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                                                            <MapPin className="size-3" /> {att.company?.name || 'DUDI'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        att.status === 'hadir' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {att.status}
                                                    </span>
                                                    <p className="mt-0.5 text-xs text-neutral-400 font-mono">{att.check_in_time}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <div className="flex items-center justify-between border-b border-sidebar-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-4 text-purple-500" />
                                        <h2 className="font-semibold">Jurnal Kerja & Log Ibadah Terbaru</h2>
                                    </div>
                                    <span className="text-xs text-neutral-500">Monitoring Karakter</span>
                                </div>
                                <div className="mt-4 divide-y divide-sidebar-border/50">
                                    {recent_journals.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-neutral-500">Belum ada jurnal yang dikirim</div>
                                    ) : (
                                        recent_journals.map((jrn) => (
                                            <div key={jrn.id} className="py-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold">{jrn.user?.name}</p>
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        jrn.status === 'approved'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : jrn.status === 'revision'
                                                            ? 'bg-rose-500/10 text-rose-500'
                                                            : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {jrn.status}
                                                    </span>
                                                </div>
                                                <p className="mt-1 line-clamp-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                    {jrn.work_summary}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* 3. Role: Guru Pembimbing Dashboard (Monitoring Siswa Binaan Sendiri) */}
                {role === 'guru_pembimbing' && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Siswa Binaan Anda</span>
                                <div className="mt-2 text-3xl font-bold text-emerald-500">{stats.guided_students_count ?? 0}</div>
                                <div className="mt-1 text-xs text-neutral-500">Siswa di bawah bimbingan Anda</div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Presensi Binaan Hari Ini</span>
                                <div className="mt-2 text-3xl font-bold">{stats.today_attendances ?? 0} / {stats.guided_students_count ?? 0}</div>
                                <div className="mt-1 text-xs text-emerald-500">Sudah check-in di kantor DUDI</div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Jurnal Butuh Review</span>
                                <div className="mt-2 text-3xl font-bold text-amber-500">{stats.pending_journals ?? 0}</div>
                                <div className="mt-1 text-xs text-neutral-500">Laporan menunggu ditinjau</div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Jurnal Disetujui</span>
                                <div className="mt-2 text-3xl font-bold text-blue-500">{stats.approved_journals ?? 0}</div>
                                <div className="mt-1 text-xs text-neutral-500">Telah diverifikasi</div>
                            </div>
                        </div>

                        {/* List Siswa Binaan Guru */}
                        <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                            <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                                <UserCheck className="size-5 text-emerald-500" />
                                Daftar Siswa Binaan Anda & Status Kehadiran Hari Ini
                            </h2>
                            <div className="divide-y divide-sidebar-border/50">
                                {guided_students.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-neutral-500">Belum ada siswa yang di-plot ke Anda oleh Admin.</div>
                                ) : (
                                    guided_students.map((std) => (
                                        <div key={std.id} className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="font-semibold text-sm">{std.name}</p>
                                                <p className="text-xs text-neutral-500">NIS: {std.nis_nip || '-'} | Kantor: {std.company?.name || 'Belum di-plot'}</p>
                                            </div>
                                            <div>
                                                {std.attendances && std.attendances.length > 0 ? (
                                                    <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-500 px-2.5 py-1 text-xs font-semibold">
                                                        Hadir ({std.attendances[0].check_in_time})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-rose-500/10 text-rose-500 px-2.5 py-1 text-xs font-semibold">
                                                        Belum Absen Hari Ini
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* 4. Role: Pembimbing DUDI Dashboard */}
                {role === 'pembimbing_dudi' && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Instansi Anda</span>
                                <div className="mt-2 text-lg font-bold line-clamp-1">{stats.company_name}</div>
                                <div className="mt-1 text-xs text-blue-500">{stats.students_count} Siswa Magang Ditempatkan</div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Presensi Hari Ini</span>
                                <div className="mt-2 text-3xl font-bold">{stats.today_attendances ?? 0} / {stats.students_count ?? 0}</div>
                                <div className="mt-1 text-xs text-emerald-500">Sudah check-in di kantor</div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Jurnal Butuh Review</span>
                                <div className="mt-2 text-3xl font-bold text-amber-500">{stats.pending_journals ?? 0}</div>
                                <div className="mt-1 text-xs text-neutral-500">Menunggu ACC pembimbing</div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Jurnal Disetujui</span>
                                <div className="mt-2 text-3xl font-bold text-emerald-500">{stats.approved_journals ?? 0}</div>
                                <div className="mt-1 text-xs text-neutral-500">Telah diverifikasi</div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                            <h2 className="font-semibold text-base mb-4">Daftar Siswa Magang di Perusahaan Anda</h2>
                            <div className="divide-y divide-sidebar-border/50">
                                {students.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-neutral-500">Belum ada siswa yang ditempatkan di instansi ini.</div>
                                ) : (
                                    students.map((std) => (
                                        <div key={std.id} className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="font-semibold text-sm">{std.name}</p>
                                                <p className="text-xs text-neutral-500">NIS: {std.nis_nip || '-'} | Telp: {std.phone || '-'}</p>
                                            </div>
                                            <div>
                                                {std.attendances && std.attendances.length > 0 ? (
                                                    <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-500 px-2.5 py-1 text-xs font-semibold">
                                                        Sudah Absen ({std.attendances[0].check_in_time})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-rose-500/10 text-rose-500 px-2.5 py-1 text-xs font-semibold">
                                                        Belum Absen Hari Ini
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* 5. Role: Siswa Dashboard */}
                {role === 'siswa' && (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Card Status Presensi */}
                            <div className="rounded-2xl border border-sidebar-border bg-sidebar p-6 shadow-sm">
                                <div className="flex items-center justify-between border-b border-sidebar-border pb-4">
                                    <div>
                                        <h2 className="text-lg font-bold">Presensi Hari Ini</h2>
                                        <p className="text-xs text-neutral-500">{user.company?.name || 'Belum ada instansi'}</p>
                                    </div>
                                    <MapPin className="size-6 text-blue-500" />
                                </div>

                                <div className="mt-6 flex flex-col gap-4">
                                    <div className="flex items-center justify-between rounded-xl bg-neutral-100 dark:bg-neutral-800/60 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex size-10 items-center justify-center rounded-lg ${stats.has_checked_in ? 'bg-emerald-500/20 text-emerald-500' : 'bg-neutral-500/20 text-neutral-400'}`}>
                                                <Sun className="size-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral-500">Jam Masuk (Check-In)</p>
                                                <p className="text-base font-bold font-mono">
                                                    {stats.check_in_time || '-- : -- : --'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            stats.has_checked_in
                                                ? stats.attendance_status === 'hadir'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-amber-500/10 text-amber-500'
                                                : 'bg-neutral-500/10 text-neutral-400'
                                        }`}>
                                            {stats.has_checked_in ? stats.attendance_status : 'Belum Absen'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl bg-neutral-100 dark:bg-neutral-800/60 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex size-10 items-center justify-center rounded-lg ${stats.has_checked_out ? 'bg-indigo-500/20 text-indigo-500' : 'bg-neutral-500/20 text-neutral-400'}`}>
                                                <Moon className="size-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral-500">Jam Pulang (Check-Out)</p>
                                                <p className="text-base font-bold font-mono">
                                                    {stats.check_out_time || '-- : -- : --'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            stats.has_checked_out ? 'bg-indigo-500/10 text-indigo-500' : 'bg-neutral-500/10 text-neutral-400'
                                        }`}>
                                            {stats.has_checked_out ? 'Selesai' : 'Belum Check-out'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Status Jurnal & Salat */}
                            <div className="rounded-2xl border border-sidebar-border bg-sidebar p-6 shadow-sm">
                                <div className="flex items-center justify-between border-b border-sidebar-border pb-4">
                                    <div>
                                        <h2 className="text-lg font-bold">Jurnal PKL & Salat</h2>
                                        <p className="text-xs text-neutral-500">Laporan aktivitas kerja & ibadah harian</p>
                                    </div>
                                    <FileText className="size-6 text-purple-500" />
                                </div>

                                <div className="mt-6 flex flex-col gap-4">
                                    {stats.has_submitted_journal ? (
                                        <div className="rounded-xl border border-sidebar-border p-4 bg-sidebar-border/20">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-neutral-500">Status Review Jurnal:</span>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    stats.journal_status === 'approved'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : stats.journal_status === 'revision'
                                                        ? 'bg-rose-500/10 text-rose-500'
                                                        : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                    {stats.journal_status}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
                                                {today_journal?.work_summary}
                                            </p>
                                            {today_journal?.mentor_notes && (
                                                <div className="mt-2 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2 rounded">
                                                    Catatan Pembimbing: {today_journal.mentor_notes}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-sidebar-border p-6 text-center">
                                            <AlertCircle className="size-8 mx-auto text-amber-500 mb-2" />
                                            <p className="text-sm font-semibold">Jurnal Hari Ini Belum Diisi</p>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                Pastikan Anda sudah check-in sebelum mengisi jurnal kerja dan log ibadah salat.
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="rounded-xl bg-sidebar-border/30 p-3 text-center">
                                            <span className="text-xs text-neutral-500">Total Hari Masuk</span>
                                            <p className="text-xl font-bold text-emerald-500">{stats.total_hadir ?? 0}</p>
                                        </div>
                                        <div className="rounded-xl bg-sidebar-border/30 p-3 text-center">
                                            <span className="text-xs text-neutral-500">Jurnal Disetujui</span>
                                            <p className="text-xl font-bold text-blue-500">{stats.approved_journals ?? 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
