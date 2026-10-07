import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    MapPin,
    Moon,
    RotateCcw,
    Search,
    Sun,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StudentItem {
    id: number;
    name: string;
    nis_nip: string;
    phone?: string | null;
    company?: {
        id: number;
        name: string;
        address?: string;
    } | null;
    stats?: {
        total_prayers: number;
    };
}

interface PrayerItem {
    id: number;
    user_id: number;
    user?: {
        id: number;
        name: string;
        nis_nip: string;
        company_name: string;
    };
    date: string;
    date_formatted: string;
    prayer_type: 'dzuhur' | 'ashar' | string;
    prayer_time: string | null;
    status: 'berjamaah' | 'munfarid' | 'udzur' | string;
    location_name: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PrayerLogsResponse {
    data: PrayerItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Stats {
    total_students: number;
    total_logs: number;
}

interface Props {
    students: StudentItem[];
    prayerLogs: PrayerLogsResponse;
    stats: Stats;
    filters: {
        student_id: number | null;
        prayer_type: string | null;
    };
}

export default function TeacherPrayersIndex({
    students = [],
    prayerLogs,
    stats,
    filters,
}: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        filters.student_id ? Number(filters.student_id) : (students.length > 0 ? students[0].id : null)
    );
    const [selectedPrayerType, setSelectedPrayerType] = useState<string>(
        filters.prayer_type ?? ''
    );
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const query = searchQuery.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(query) ||
                s.nis_nip.toLowerCase().includes(query) ||
                (s.company?.name && s.company.name.toLowerCase().includes(query))
        );
    }, [students, searchQuery]);

    const activeStudent = useMemo(() => {
        return students.find((s) => s.id === selectedStudentId) || (students.length > 0 ? students[0] : null);
    }, [students, selectedStudentId]);

    const handleSelectStudent = (studentId: number) => {
        setSelectedStudentId(studentId);
        router.get(
            '/teacher/prayers',
            {
                student_id: studentId,
                prayer_type: selectedPrayerType || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterPrayerType = (type: string) => {
        setSelectedPrayerType(type);
        router.get(
            '/teacher/prayers',
            {
                student_id: selectedStudentId ?? undefined,
                prayer_type: type || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSelectedPrayerType('');
        router.get(
            '/teacher/prayers',
            {
                student_id: selectedStudentId ?? undefined,
            },
            { preserveState: true }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'berjamaah':
                return (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-bold text-[#008953]">
                        <CheckCircle2 className="size-3.5 text-[#008953]" />
                        Berjamaah
                    </span>
                );
            case 'munfarid':
                return (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-xs font-bold text-blue-700">
                        Munfarid (Sendiri)
                    </span>
                );
            case 'udzur':
                return (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-200/80 px-2.5 py-1 text-xs font-bold text-purple-700">
                        Udzur Syar'i
                    </span>
                );
            default:
                return (
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Review Salat Siswa - Guru Pembimbing" />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {/* 1. Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Review Salat Siswa
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Monitoring pelaksanaan ibadah salat fardhu (Dzuhur & Ashar) siswa binaan selama beraktivitas di lokasi PKL.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold">
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 border border-slate-200/80">
                            Total: <strong className="font-bold text-slate-900">{students.length} Siswa Binaan</strong>
                        </span>
                    </div>
                </div>

                {/* 2. Pilihan Siswa Binaan Grid (No "Semua Siswa" option) */}
                <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Pilih Siswa Binaan:
                        </h2>
                        {students.length > 3 && (
                            <div className="w-full sm:w-64">
                                <Input
                                    placeholder="Cari nama atau NIS siswa..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 text-xs rounded-xl border-slate-200"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {filteredStudents.map((s) => {
                            const isSelected = activeStudent?.id === s.id;
                            const totalPrayers = s.stats?.total_prayers ?? 0;

                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectStudent(s.id)}
                                    className={`flex items-center justify-between p-3 rounded-2xl border text-left text-xs transition cursor-pointer ${
                                        isSelected
                                            ? 'border-[#008953] bg-emerald-50/90 text-slate-900 ring-2 ring-[#008953]/30 shadow-xs'
                                            : 'border-slate-200/90 bg-white hover:border-emerald-300 text-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 pr-1.5">
                                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                                            isSelected
                                                ? 'bg-[#008953] text-white'
                                                : 'bg-emerald-50 text-[#008953] border border-emerald-200/70'
                                        }`}>
                                            {s.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="truncate">
                                            <div className="font-bold truncate text-slate-900">
                                                {s.name}
                                            </div>
                                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                                <Building2 className="size-3 shrink-0 text-slate-400" />
                                                <span className="truncate">{s.company?.name || 'Belum Diplot'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                                            isSelected ? 'bg-[#008953] text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {totalPrayers} Log
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Banner Siswa Aktif & Filter Waktu Salat (Green with White Text) */}
                {activeStudent && (
                    <div className="rounded-2xl bg-[#008953] p-4 text-white shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white font-bold text-sm">
                                    <Sun className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-bold text-sm sm:text-base text-white truncate">
                                            Log Salat: {activeStudent.name}
                                        </h3>
                                        {activeStudent.nis_nip && (
                                            <span className="rounded-md bg-black/20 px-2 py-0.5 text-[11px] font-mono text-emerald-100">
                                                NIS: {activeStudent.nis_nip}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-emerald-100 truncate mt-0.5">
                                        Tempat PKL: {activeStudent.company?.name || 'Belum diplot DUDI'}
                                    </p>
                                </div>
                            </div>

                            {/* Filter Buttons (Semua, Dzuhur, Ashar) */}
                            <div className="flex items-center gap-1.5 bg-black/15 p-1 rounded-xl shrink-0 self-start md:self-auto">
                                <button
                                    type="button"
                                    onClick={() => handleFilterPrayerType('')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                        selectedPrayerType === ''
                                            ? 'bg-white text-[#008953] shadow-xs'
                                            : 'text-emerald-100 hover:text-white'
                                    }`}
                                >
                                    Semua Salat
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterPrayerType('dzuhur')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                        selectedPrayerType === 'dzuhur'
                                            ? 'bg-white text-[#008953] shadow-xs'
                                            : 'text-emerald-100 hover:text-white'
                                    }`}
                                >
                                    <Sun className="size-3.5" />
                                    <span>Dzuhur</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterPrayerType('ashar')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                        selectedPrayerType === 'ashar'
                                            ? 'bg-white text-[#008953] shadow-xs'
                                            : 'text-emerald-100 hover:text-white'
                                    }`}
                                >
                                    <Moon className="size-3.5" />
                                    <span>Ashar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Tabel Logbook Salat Siswa */}
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="size-4 text-[#008953]" />
                            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                Rekap Riwayat Salat Siswa
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            Total: <strong className="text-slate-900">{prayerLogs?.total ?? 0} Catatan</strong>
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500 font-semibold">
                                    <th className="px-5 py-3.5 w-36">Hari & Tanggal</th>
                                    <th className="px-5 py-3.5 w-36">Waktu Salat</th>
                                    <th className="px-5 py-3.5 w-44">Status Pelaksanaan</th>
                                    <th className="px-5 py-3.5 w-32">Pukul</th>
                                    <th className="px-5 py-3.5 min-w-[200px]">Tempat / Lokasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {(!prayerLogs?.data || prayerLogs.data.length === 0) ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            <FileText className="size-8 mx-auto text-slate-300 mb-2" />
                                            <p className="font-semibold text-sm text-slate-600">Belum ada catatan log salat pada filter ini.</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Catatan akan muncul setelah siswa mencatat pelaksanaan ibadahnya.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    prayerLogs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/60 transition">
                                            {/* Tanggal */}
                                            <td className="px-5 py-3.5 align-middle">
                                                <div className="font-semibold text-slate-900">{log.date_formatted}</div>
                                                <div className="text-[11px] font-mono text-slate-400">{log.date}</div>
                                            </td>

                                            {/* Jenis Salat */}
                                            <td className="px-5 py-3.5 align-middle">
                                                {log.prayer_type === 'dzuhur' ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/70 px-2.5 py-1 text-xs font-bold text-amber-700">
                                                        <Sun className="size-3.5 text-amber-500" />
                                                        <span>Dzuhur</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200/70 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                                        <Moon className="size-3.5 text-indigo-500" />
                                                        <span>Ashar</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3.5 align-middle">
                                                {getStatusBadge(log.status)}
                                            </td>

                                            {/* Pukul */}
                                            <td className="px-5 py-3.5 align-middle font-mono">
                                                {log.prayer_time ? (
                                                    <span className="font-semibold text-slate-800">{log.prayer_time} WIB</span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* Tempat */}
                                            <td className="px-5 py-3.5 align-middle">
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <MapPin className="size-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-medium">{log.location_name || '-'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {prayerLogs?.links && prayerLogs.links.length > 3 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50 gap-3">
                            <span className="text-xs text-slate-500">
                                Menampilkan {prayerLogs?.data?.length ?? 0} dari {prayerLogs?.total ?? 0} data salat
                            </span>
                            <div className="flex gap-1 flex-wrap">
                                {prayerLogs.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`h-8 text-xs rounded-xl cursor-pointer ${
                                            link.active
                                                ? 'bg-[#008953] hover:bg-[#007346] text-white'
                                                : 'border-slate-200 text-slate-700 hover:text-[#008953]'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
