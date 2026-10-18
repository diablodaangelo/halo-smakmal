import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Building2,
    Calendar,
    CalendarCheck,
    Clock,
    FileText,
    GraduationCap,
    LayoutGrid,
    TrendingUp,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    today_date: string;
    stats: {
        students: {
            total: number;
            placed: number;
            unplaced: number;
            placement_rate: number;
            assigned_teachers: number;
            unassigned_teachers: number;
        };
        companies: {
            total: number;
            active: number;
        };
        teachers: {
            total: number;
            avg_students: number;
        };
        attendances: {
            today_total: number;
            today_present: number;
            today_late: number;
            today_permit: number;
            today_sick: number;
            today_alpha: number;
            today_rate: number;
            trend_7_days: Array<{
                date: string;
                day_name: string;
                date_short: string;
                hadir: number;
                terlambat: number;
                absen: number;
                total: number;
            }>;
        };
    };
    recent_attendances: Array<{
        id: number;
        date: string;
        check_in_time?: string;
        status: string;
        user?: {
            id: number;
            name: string;
            nis_nip?: string;
            class_name?: string;
            avatar?: string;
            slug?: string;
        };
        company?: {
            id: number;
            name: string;
        };
    }>;
    recent_journals: Array<{
        id: number;
        day_number: number;
        work_summary: string;
        status: string;
        date: string;
        user?: {
            id: number;
            name: string;
            class_name?: string;
            avatar?: string;
            slug?: string;
        };
    }>;
}

export default function AdminDashboardIndex({
    today_date,
    stats,
    recent_attendances = [],
    recent_journals = [],
}: Props) {
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);

    // Hitung max value untuk bar chart 7 hari terakhir agar proporsional
    const maxTrendTotal = Math.max(
        ...stats.attendances.trend_7_days.map((d) => d.total || 0),
        stats.students.total > 0 ? stats.students.total : 10
    );

    return (
        <>
            <Head title="Dashboard - Admin Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d8f2e5] text-[#008953] shadow-xs ring-1 ring-[#008953]/10">
                            <LayoutGrid className="h-6 w-6 stroke-[2.2]" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                                Dashboard Administrator
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Ringkasan penempatan siswa di industri, rekapitulasi kehadiran real-time, dan aktivitas PKL harian.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-2xs self-start sm:self-auto">
                        <Calendar className="h-4 w-4 text-[#008953]" />
                        <span className="text-xs font-bold text-slate-700">{today_date}</span>
                    </div>
                </div>

                {/* 2. Top Metric Cards (4 Cards - Unified Green & White Theme) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Siswa */}
                    <Link
                        href="/admin/students"
                        className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-[#008953]/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Siswa PKL
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#008953] group-hover:bg-[#008953] group-hover:text-white transition-colors">
                                <Users className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">
                                {stats.students.total}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">Siswa</span>
                        </div>
                        <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[#008953]">Terplot: {stats.students.placed}</span>
                                <span className="text-slate-400">Belum: {stats.students.unplaced}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[#008953] transition-all duration-500"
                                    style={{ width: `${stats.students.placement_rate}%` }}
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#008953]">
                            <span>Kelola data siswa</span>
                            <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                    </Link>

                    {/* Card 2: Mitra DUDI */}
                    <Link
                        href="/admin/companies"
                        className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-[#008953]/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Mitra DUDI / Industri
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#008953] group-hover:bg-[#008953] group-hover:text-white transition-colors">
                                <Building2 className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">
                                {stats.companies.total}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">Perusahaan</span>
                        </div>
                        <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[#008953]">Aktif: {stats.companies.active}</span>
                                <span className="text-slate-400">{stats.companies.total - stats.companies.active} Siap Kuota</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[#008953] transition-all duration-500"
                                    style={{
                                        width: `${stats.companies.total > 0 ? (stats.companies.active / stats.companies.total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#008953]">
                            <span>Kelola master industri</span>
                            <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                    </Link>

                    {/* Card 3: Guru Pembimbing */}
                    <Link
                        href="/admin/teachers"
                        className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-[#008953]/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Guru Pembimbing
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#008953] group-hover:bg-[#008953] group-hover:text-white transition-colors">
                                <GraduationCap className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">
                                {stats.teachers.total}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">Guru</span>
                        </div>
                        <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[#008953]">Rata-rata Rasio</span>
                                <span className="text-slate-700 font-bold">{stats.teachers.avg_students} Siswa/Guru</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[#008953] transition-all duration-500"
                                    style={{
                                        width: `${stats.students.total > 0 ? (stats.students.assigned_teachers / stats.students.total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#008953]">
                            <span>Kelola pembimbing</span>
                            <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                    </Link>

                    {/* Card 4: Kehadiran Hari Ini */}
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Kehadiran Hari Ini
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#008953]">
                                <CalendarCheck className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">
                                {stats.attendances.today_rate}%
                            </span>
                            <span className="text-xs font-semibold text-slate-500">Tingkat Hadir</span>
                        </div>
                        <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[#008953]">Hadir: {stats.attendances.today_present}</span>
                                <span className="text-slate-500">Telat: {stats.attendances.today_late}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                                <div
                                    className="h-full bg-[#008953] transition-all duration-500"
                                    style={{
                                        width: `${stats.students.total > 0 ? (stats.attendances.today_present / stats.students.total) * 100 : 0}%`,
                                    }}
                                />
                                <div
                                    className="h-full bg-emerald-300 transition-all duration-500"
                                    style={{
                                        width: `${stats.students.total > 0 ? (stats.attendances.today_late / stats.students.total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-3 text-[11px] font-medium text-slate-500">
                            {stats.attendances.today_total} dari {stats.students.total} siswa telah check-in
                        </div>
                    </div>
                </div>

                {/* 3. Section Analisis Presensi & Kehadiran (Grid 2 Kolom) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri (2 Kolom): Bar Chart Tren 7 Hari Terakhir */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="size-5 text-[#008953]" />
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                            Tren Presensi 7 Hari Terakhir
                                        </h2>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Perbandingan jumlah siswa hadir tepat waktu, terlambat, dan absen per hari.
                                    </p>
                                </div>

                                {/* Legend */}
                                <div className="flex items-center gap-3 text-xs font-semibold">
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-full bg-[#008953]" />
                                        <span className="text-slate-600">Hadir</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-full bg-emerald-300" />
                                        <span className="text-slate-600">Terlambat</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-full bg-slate-300" />
                                        <span className="text-slate-600">Absen / Izin</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Bars */}
                            <div className="pt-6 pb-2">
                                <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48">
                                    {stats.attendances.trend_7_days.map((item, idx) => {
                                        const hadirHeight = maxTrendTotal > 0 ? (item.hadir / maxTrendTotal) * 100 : 0;
                                        const terlambatHeight = maxTrendTotal > 0 ? (item.terlambat / maxTrendTotal) * 100 : 0;
                                        const absenHeight = maxTrendTotal > 0 ? (item.absen / maxTrendTotal) * 100 : 0;

                                        return (
                                            <div
                                                key={item.date}
                                                className="flex flex-col items-center h-full justify-end group relative"
                                                onMouseEnter={() => setHoveredDay(idx)}
                                                onMouseLeave={() => setHoveredDay(null)}
                                            >
                                                {/* Tooltip on hover */}
                                                {hoveredDay === idx && (
                                                    <div className="absolute -top-12 z-20 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg pointer-events-none transition-all">
                                                        <div className="font-bold">{item.day_name}, {item.date_short}</div>
                                                        <div className="text-emerald-300">Hadir: {item.hadir} • Telat: {item.terlambat} • Absen: {item.absen}</div>
                                                    </div>
                                                )}

                                                {/* Stacked Vertical Bar */}
                                                <div className="w-full max-w-[40px] rounded-t-xl overflow-hidden bg-slate-100 flex flex-col justify-end transition-all h-full group-hover:opacity-90">
                                                    {item.absen > 0 && (
                                                        <div
                                                            className="w-full bg-slate-300 transition-all duration-500"
                                                            style={{ height: `${absenHeight}%` }}
                                                        />
                                                    )}
                                                    {item.terlambat > 0 && (
                                                        <div
                                                            className="w-full bg-emerald-300 transition-all duration-500"
                                                            style={{ height: `${terlambatHeight}%` }}
                                                        />
                                                    )}
                                                    <div
                                                        className="w-full bg-[#008953] transition-all duration-500"
                                                        style={{ height: `${hadirHeight}%` }}
                                                    />
                                                </div>

                                                {/* Day Label */}
                                                <div className="mt-2 text-center">
                                                    <div className="text-xs font-bold text-slate-800">
                                                        {item.day_name.slice(0, 3)}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        {item.date_short.split(' ')[0]}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>*Grafik dihitung berdasarkan data presensi harian siswa aktif.</span>
                            <span className="font-semibold text-[#008953]">Rata-rata kehadiran stabil</span>
                        </div>
                    </div>

                    {/* Kolom Kanan (1 Kolom): Rincian Status Hari Ini */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Clock className="size-5 text-[#008953]" />
                                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                    Status Kehadiran Hari Ini
                                </h2>
                            </div>

                            <div className="mt-5 space-y-2.5">
                                {/* Hadir */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-2.5 rounded-full bg-[#008953]" />
                                        <span className="text-xs font-bold text-slate-800">Hadir Tepat Waktu</span>
                                    </div>
                                    <span className="text-sm font-black text-[#008953]">
                                        {stats.attendances.today_present} <span className="text-[11px] font-normal text-slate-500">siswa</span>
                                    </span>
                                </div>

                                {/* Terlambat */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-2.5 rounded-full bg-emerald-400" />
                                        <span className="text-xs font-bold text-slate-800">Terlambat Masuk</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-700">
                                        {stats.attendances.today_late} <span className="text-[11px] font-normal text-slate-500">siswa</span>
                                    </span>
                                </div>

                                {/* Izin */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-2.5 rounded-full bg-slate-400" />
                                        <span className="text-xs font-bold text-slate-800">Izin Terkonfirmasi</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-700">
                                        {stats.attendances.today_permit} <span className="text-[11px] font-normal text-slate-500">siswa</span>
                                    </span>
                                </div>

                                {/* Sakit */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-2.5 rounded-full bg-slate-400" />
                                        <span className="text-xs font-bold text-slate-800">Sakit (Surat Dokter)</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-700">
                                        {stats.attendances.today_sick} <span className="text-[11px] font-normal text-slate-500">siswa</span>
                                    </span>
                                </div>

                                {/* Alpa */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-2.5 rounded-full bg-slate-300" />
                                        <span className="text-xs font-bold text-slate-800">Belum Check-In / Alpa</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-700">
                                        {stats.attendances.today_alpha} <span className="text-[11px] font-normal text-slate-500">siswa</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                            <span className="text-xs text-slate-500 font-medium">
                                Total Check-In Masuk: <strong className="text-[#008953]">{stats.attendances.today_total}</strong> siswa
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Live Activity Feed: Presensi Terkini & Jurnal Terkini (Clean Green-White) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Presensi Terkini */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                            <div className="flex items-center gap-2">
                                <Activity className="size-4 text-[#008953]" />
                                <h3 className="text-sm font-bold text-slate-900">
                                    Presensi Siswa Masuk Terkini
                                </h3>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Real-time Feed</span>
                        </div>

                        <div className="mt-4 divide-y divide-slate-100">
                            {recent_attendances.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">Belum ada rekaman presensi.</p>
                            ) : (
                                recent_attendances.map((att) => (
                                    <div key={att.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-[#008953] text-xs">
                                                {att.user?.name ? att.user.name.charAt(0).toUpperCase() : 'S'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-slate-900 truncate">
                                                        {att.user?.name}
                                                    </span>
                                                    {att.user?.class_name && (
                                                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-[#008953] border border-emerald-200">
                                                            {att.user.class_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-400 truncate">
                                                    {att.company?.name || 'Mitra DUDI'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                                att.status === 'hadir'
                                                    ? 'bg-emerald-50 text-[#008953] border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                                {att.status === 'hadir' ? 'Hadir' : att.status === 'terlambat' ? 'Terlambat' : att.status}
                                            </span>
                                            {att.check_in_time && (
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    {att.check_in_time} WIB
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Jurnal Harian Terkini */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4 text-[#008953]" />
                                <h3 className="text-sm font-bold text-slate-900">
                                    Logbook Jurnal Terkini Disubmit
                                </h3>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Bimbingan PKL</span>
                        </div>

                        <div className="mt-4 divide-y divide-slate-100">
                            {recent_journals.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">Belum ada jurnal dikirim.</p>
                            ) : (
                                recent_journals.map((journal) => (
                                    <div key={journal.id} className="py-3 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">
                                                    {journal.user?.name}
                                                </span>
                                                <span className="rounded-md bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-[#008953] border border-emerald-200">
                                                    Hari Ke-{journal.day_number}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                                                {journal.work_summary}
                                            </p>
                                        </div>

                                        <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                            journal.status === 'approved'
                                                ? 'bg-emerald-50 text-[#008953] border border-emerald-200'
                                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                                        }`}>
                                            {journal.status === 'approved' ? 'Disetujui' : 'Menunggu Review'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
