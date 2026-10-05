import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    HeartHandshake,
    MapPin,
    Moon,
    RotateCcw,
    Search,
    Sparkles,
    Sun,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    berjamaah: number;
    munfarid: number;
    udzur: number;
    discipline_rate: number;
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
        filters.student_id ?? null
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
                s.company?.name.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    const activeStudent = useMemo(() => {
        return students.find((s) => s.id === selectedStudentId) || null;
    }, [students, selectedStudentId]);

    const handleSelectStudent = (studentId: number | null) => {
        setSelectedStudentId(studentId);
        router.get(
            '/teacher/prayers',
            {
                student_id: studentId ?? undefined,
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
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Berjamaah</span>
                    </span>
                );
            case 'munfarid':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Sendiri (Munfarid)</span>
                    </span>
                );
            case 'udzur':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <Moon className="h-3.5 w-3.5" />
                        <span>Udzur Syar'i</span>
                    </span>
                );
            default:
                return (
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
                        {status}
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Monitoring Ibadah Salat Siswa - Guru Pembimbing" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* 1. Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Sun className="h-4 w-4" />
                            <span>Monitoring Pembiasaan Ibadah Siswa • Guru Pembimbing</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Monitoring Salat Siswa PKL
                        </h1>
                        <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                            Pantau kedisiplinan pelaksanaan ibadah salat Dzuhur dan Ashar siswa selama masa PKL.
                        </p>
                    </div>
                </div>

                {/* 2. Statistik Ringkas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs p-4 bg-gradient-to-br from-emerald-500/10 to-transparent">
                        <div className="text-xs text-neutral-500 font-medium">Salat Berjamaah</div>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                            {stats.berjamaah}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">Siswa berjamaah di DUDI</div>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs p-4 bg-gradient-to-br from-blue-500/10 to-transparent">
                        <div className="text-xs text-neutral-500 font-medium">Salat Munfarid (Sendiri)</div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                            {stats.munfarid}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">Pelaksanaan mandiri</div>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs p-4 bg-gradient-to-br from-amber-500/10 to-transparent">
                        <div className="text-xs text-neutral-500 font-medium">Udzur Syar'i (Halangan)</div>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
                            {stats.udzur}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">Khusus siswi berhalangan</div>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs p-4">
                        <div className="text-xs text-neutral-500 font-medium">Tingkat Berjamaah</div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                            {stats.discipline_rate}%
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">Kepatuhan salat berjamaah</div>
                    </Card>
                </div>

                {/* 3. Pilihan Siswa Binaan */}
                <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Pilih Siswa Binaan:
                        </h2>
                        {students.length > 4 && (
                            <div className="w-full sm:w-64">
                                <Input
                                    placeholder="Cari nama atau NIS siswa..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {/* Option: Semua Siswa */}
                        <button
                            type="button"
                            onClick={() => handleSelectStudent(null)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition ${
                                selectedStudentId === null
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                    : 'border-neutral-200 bg-white hover:border-emerald-300 dark:border-neutral-800 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                                    selectedStudentId === null ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                }`}>
                                    <Users className="h-4 w-4" />
                                </div>
                                <div className="truncate">
                                    <div className="font-bold truncate">Semua Siswa</div>
                                    <div className={`text-[11px] truncate ${selectedStudentId === null ? 'text-emerald-100' : 'text-neutral-400'}`}>
                                        Seluruh Siswa Binaan
                                    </div>
                                </div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                selectedStudentId === null ? 'bg-white text-emerald-800' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}>
                                {stats.total_logs}
                            </span>
                        </button>

                        {/* List Siswa */}
                        {filteredStudents.map((s) => {
                            const isSelected = selectedStudentId === s.id;
                            const total = s.stats?.total_prayers ?? 0;

                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectStudent(s.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition ${
                                        isSelected
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-100 ring-2 ring-emerald-500/20 shadow-xs'
                                            : 'border-neutral-200 bg-white hover:border-emerald-300 dark:border-neutral-800 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 pr-1.5">
                                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                                            isSelected
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                                        }`}>
                                            {s.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="truncate">
                                            <div className="font-bold truncate text-neutral-900 dark:text-white">
                                                {s.name}
                                            </div>
                                            <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
                                                <Building2 className="h-3 w-3 shrink-0 text-neutral-400" />
                                                <span>{s.company?.name || 'Belum Diplot'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                            {total} Log
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Active Student Header & Filter Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
                            <Sun className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                                    Log Salat: {activeStudent ? activeStudent.name : 'Seluruh Siswa Binaan'}
                                </h3>
                                {activeStudent && (
                                    <span className="rounded-md bg-neutral-200/80 dark:bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                                        NIS: {activeStudent.nis_nip}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-neutral-500">
                                {activeStudent
                                    ? `Tempat PKL: ${activeStudent.company?.name || 'Belum diplot DUDI'} • Total: ${activeStudent.stats?.total_prayers ?? 0} Catatan Salat`
                                    : 'Menampilkan seluruh rekap pelaksanaan ibadah salat siswa'}
                            </p>
                        </div>
                    </div>

                    {/* Filter Jenis Salat */}
                    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-900">
                        <button
                            type="button"
                            onClick={() => handleFilterPrayerType('')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                                selectedPrayerType === ''
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
                            }`}
                        >
                            Semua Salat
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterPrayerType('dzuhur')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                                selectedPrayerType === 'dzuhur'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
                            }`}
                        >
                            Salat Dzuhur
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterPrayerType('ashar')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                                selectedPrayerType === 'ashar'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
                            }`}
                        >
                            Salat Ashar
                        </button>
                    </div>
                </div>

                {/* 5. Tabel Log Ibadah Salat */}
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-100/70 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3.5 px-4 w-40">Tanggal</th>
                                    {selectedStudentId === null && <th className="py-3.5 px-4 w-48">Nama Siswa</th>}
                                    <th className="py-3.5 px-4 w-36">Waktu Salat</th>
                                    <th className="py-3.5 px-4 w-40">Status Pelaksanaan</th>
                                    <th className="py-3.5 px-4 w-32">Jam Salat</th>
                                    <th className="py-3.5 px-4 min-w-[200px]">Tempat / Lokasi Salat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {prayerLogs?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={selectedStudentId === null ? 6 : 5} className="py-12 text-center text-neutral-500">
                                            <Sun className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                                            <p className="font-semibold text-sm">Belum ada catatan salat.</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">Siswa mencatat log salat setiap hari melalui menu Jadwal & Log Salat di akun masing-masing.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    prayerLogs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition">
                                            {/* Tanggal */}
                                            <td className="py-3.5 px-4 align-middle">
                                                <div className="font-semibold text-neutral-900 dark:text-white">
                                                    {log.date_formatted}
                                                </div>
                                                <div className="text-[10px] text-neutral-400 mt-0.5">
                                                    Dicatat {log.created_at}
                                                </div>
                                            </td>

                                            {/* Nama Siswa jika mode Semua */}
                                            {selectedStudentId === null && (
                                                <td className="py-3.5 px-4 align-middle">
                                                    <div className="font-bold text-neutral-900 dark:text-white">
                                                        {log.user?.name}
                                                    </div>
                                                    <div className="text-[11px] text-neutral-500">
                                                        NIS: {log.user?.nis_nip}
                                                    </div>
                                                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate max-w-[150px]">
                                                        {log.user?.company_name}
                                                    </div>
                                                </td>
                                            )}

                                            {/* Waktu Salat */}
                                            <td className="py-3.5 px-4 align-middle">
                                                <div className="flex items-center gap-1.5">
                                                    {log.prayer_type.toLowerCase() === 'dzuhur' ? (
                                                        <Sun className="h-4 w-4 text-amber-500" />
                                                    ) : (
                                                        <Moon className="h-4 w-4 text-indigo-500" />
                                                    )}
                                                    <span className="font-bold capitalize text-neutral-900 dark:text-white text-xs">
                                                        Salat {log.prayer_type}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status Pelaksanaan */}
                                            <td className="py-3.5 px-4 align-middle">
                                                {getStatusBadge(log.status)}
                                            </td>

                                            {/* Jam Salat */}
                                            <td className="py-3.5 px-4 align-middle font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                                                {log.prayer_time ? `${log.prayer_time} WIB` : '-'}
                                            </td>

                                            {/* Tempat / Lokasi */}
                                            <td className="py-3.5 px-4 align-middle text-neutral-700 dark:text-neutral-300">
                                                {log.location_name ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                                        <span>{log.location_name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400 italic text-[11px]">Tidak ada keterangan lokasi</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {prayerLogs?.links && prayerLogs.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <span className="text-xs text-neutral-500">
                                Menampilkan {prayerLogs.data.length} dari {prayerLogs.total} catatan salat
                            </span>
                            <div className="flex gap-1">
                                {prayerLogs.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="h-8 text-xs"
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
