import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Calendar,
    CalendarCheck,
    Camera,
    CheckCircle2,
    Clock,
    Crosshair,
    Eye,
    FileSpreadsheet,
    FileText,
    Filter,
    GraduationCap,
    Image as ImageIcon,
    MapPin,
    RotateCcw,
    Search,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
        radius_meters?: number;
    } | null;
    stats?: {
        total_attendances: number;
        hadir: number;
        terlambat: number;
        izin: number;
        sakit: number;
        alpa: number;
    };
}

interface AttendanceItem {
    id: number;
    user_id: number;
    day_number: number;
    user?: {
        id: number;
        name: string;
        nis_nip: string;
        phone?: string | null;
        company_name: string;
    };
    date: string;
    date_formatted: string;
    check_in_time: string | null;
    check_out_time: string | null;
    is_missed_checkout?: boolean;
    status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';
    check_in_lat: number | null;
    check_in_long: number | null;
    check_in_distance: number | null;
    check_out_distance: number | null;
    is_in_radius: boolean;
    radius_limit: number;
    selfie_url: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AttendanceResponse {
    data: AttendanceItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Stats {
    total_students: number;
    today_present: number;
    today_late: number;
    today_absent: number;
}

interface Props {
    attendances?: AttendanceResponse;
    students?: StudentItem[];
    stats?: Stats;
    filters?: {
        date?: string;
        student_id?: number | string | null;
        status?: string;
    };
    today_date?: string;
}

export default function TeacherAttendancesIndex({
    attendances = { data: [], current_page: 1, last_page: 1, total: 0, links: [] },
    students = [],
    stats = {
        total_students: 0,
        today_present: 0,
        today_late: 0,
        today_absent: 0,
    },
    filters = {},
    today_date = '',
}: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        filters?.student_id ? Number(filters.student_id) : (students.length > 0 ? students[0].id : null)
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [selectedDate, setSelectedDate] = useState(filters?.date || '');
    const [selectedSelfie, setSelectedSelfie] = useState<{ url: string; title: string } | null>(null);

    // Filter students by name / nis / company
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const q = searchQuery.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                (s.nis_nip && s.nis_nip.toLowerCase().includes(q)) ||
                (s.company?.name && s.company.name.toLowerCase().includes(q))
        );
    }, [students, searchQuery]);

    // Currently selected student object
    const activeStudent = useMemo(() => {
        return students.find((s) => s.id === selectedStudentId) || null;
    }, [students, selectedStudentId]);

    const handleSelectStudent = (studentId: number | null) => {
        setSelectedStudentId(studentId);
        router.get(
            '/teacher/attendances',
            {
                student_id: studentId ?? undefined,
                status: selectedStatus || undefined,
                date: selectedDate || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/teacher/attendances',
            {
                student_id: selectedStudentId ?? undefined,
                date: selectedDate || undefined,
                status: selectedStatus || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSelectedDate('');
        setSelectedStatus('');
        router.get(
            '/teacher/attendances',
            {
                student_id: selectedStudentId ?? undefined,
            },
            { preserveState: true }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'hadir':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Hadir
                    </span>
                );
            case 'terlambat':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <Clock className="h-3 w-3" />
                        Terlambat
                    </span>
                );
            case 'izin':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        Izin
                    </span>
                );
            case 'sakit':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        Sakit
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Alpa
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Presensi Siswa Binaan - Guru Pembimbing" />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* 1. Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <GraduationCap className="h-4 w-4" />
                            <span>Monitoring Kehadiran Siswa Binaan PKL</span>
                        </div>
                        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Rekap Presensi Siswa
                        </h1>
                        <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                            Pilih siswa binaan di bawah untuk melihat rekap riwayat presensi harian, jam masuk/pulang, foto selfie, dan verifikasi GPS kantor DUDI.
                        </p>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300">
                            <span className="font-bold">{stats.today_present}</span> Hadir Hari Ini
                        </div>
                        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-300">
                            <span className="font-bold">{stats.today_late}</span> Terlambat
                        </div>
                        <div className="rounded-lg bg-neutral-100 border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                            <span className="font-bold">{students.length}</span> Total Siswa Binaan
                        </div>
                    </div>
                </div>

                {/* 2. Pilihan Siswa Binaan (Horizontal Grid Selector) */}
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

                    {/* Horizontal Student Cards */}
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
                                        Feed Seluruh Presensi
                                    </div>
                                </div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                selectedStudentId === null ? 'bg-white text-emerald-800' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}>
                                {students.length} Siswa
                            </span>
                        </button>

                        {/* List Siswa */}
                        {filteredStudents.map((s) => {
                            const isSelected = selectedStudentId === s.id;
                            const totalHadir = (s.stats?.hadir ?? 0) + (s.stats?.terlambat ?? 0);
                            const totalCount = s.stats?.total_attendances ?? 0;

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
                                            {totalHadir} Hari
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Baris Header Siswa Aktif & Toolbar Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
                            <CalendarCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                                    Presensi: {activeStudent ? activeStudent.name : 'Seluruh Siswa Binaan'}
                                </h3>
                                {activeStudent && (
                                    <span className="rounded-md bg-neutral-200/80 dark:bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                                        NIS: {activeStudent.nis_nip}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-neutral-500">
                                {activeStudent
                                    ? `Tempat PKL: ${activeStudent.company?.name || 'Belum diplot DUDI'} | Hadir: ${activeStudent.stats?.hadir ?? 0} | Terlambat: ${activeStudent.stats?.terlambat ?? 0} | Izin: ${activeStudent.stats?.izin ?? 0} | Sakit: ${activeStudent.stats?.sakit ?? 0}`
                                    : 'Menampilkan gabungan logbook presensi seluruh siswa binaan'}
                            </p>
                        </div>
                    </div>

                    {/* Filter Status & Tanggal */}
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-8 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <option value="">Semua Status</option>
                            <option value="hadir">Hadir Tepat Waktu</option>
                            <option value="terlambat">Terlambat</option>
                            <option value="izin">Izin</option>
                            <option value="sakit">Sakit</option>
                            <option value="alpa">Alpa</option>
                        </select>

                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="h-8 text-xs w-36"
                        />

                        <Button type="submit" size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500">
                            <Search className="h-3 w-3 mr-1" />
                            Filter
                        </Button>

                        {(selectedStatus || selectedDate) && (
                            <Button
                                type="button"
                                onClick={handleReset}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                            >
                                <RotateCcw className="h-3 w-3" />
                            </Button>
                        )}
                    </form>
                </div>

                {/* 4. Tabel Logbook Rekap Presensi Siswa */}
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-100/70 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3.5 px-4 w-36">Hari / Tanggal</th>
                                    {selectedStudentId === null && <th className="py-3.5 px-4 w-44">Nama Siswa</th>}
                                    <th className="py-3.5 px-4 w-32">Status Kehadiran</th>
                                    <th className="py-3.5 px-4 w-32">Jam Masuk</th>
                                    <th className="py-3.5 px-4 w-32">Jam Pulang</th>
                                    <th className="py-3.5 px-4 w-28 text-center">Foto Selfie</th>
                                    <th className="py-3.5 px-4 min-w-[220px]">Verifikasi Lokasi & Radius Geofence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {attendances?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={selectedStudentId === null ? 7 : 6} className="py-12 text-center text-neutral-500">
                                            <CalendarCheck className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                                            <p className="font-semibold text-sm">Belum ada rekaman presensi pada filter ini.</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">Presensi siswa akan otomatis tercatat saat siswa melakukan check-in.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.data.map((att) => (
                                        <tr key={att.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition">
                                            {/* 1. Hari & Tanggal */}
                                            <td className="py-3.5 px-4 align-middle">
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex w-fit items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        Hari Ke-{att.day_number}
                                                    </span>
                                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                                        {att.date_formatted}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 1b. Nama Siswa jika mode Semua */}
                                            {selectedStudentId === null && (
                                                <td className="py-3.5 px-4 align-middle">
                                                    <div className="font-bold text-neutral-900 dark:text-white">
                                                        {att.user?.name}
                                                    </div>
                                                    <div className="text-[11px] text-neutral-500">
                                                        NIS: {att.user?.nis_nip}
                                                    </div>
                                                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate max-w-[150px]">
                                                        {att.user?.company_name}
                                                    </div>
                                                </td>
                                            )}

                                            {/* 2. Status Kehadiran */}
                                            <td className="py-3.5 px-4 align-middle">
                                                {getStatusBadge(att.status)}
                                            </td>

                                            {/* 3. Jam Masuk */}
                                            <td className="py-3.5 px-4 align-middle">
                                                {att.check_in_time ? (
                                                    <div className="font-mono font-bold text-neutral-900 dark:text-white text-xs">
                                                        {att.check_in_time} WIB
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400 text-xs">-</span>
                                                )}
                                            </td>

                                            {/* 4. Jam Pulang */}
                                            <td className="py-3.5 px-4 align-middle">
                                                {att.check_out_time ? (
                                                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                                                        {att.check_out_time} WIB
                                                    </div>
                                                ) : att.is_missed_checkout ? (
                                                    <span
                                                        className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                                        title="Siswa check-in masuk tetapi tidak melakukan presensi pulang hingga hari berakhir"
                                                    >
                                                        <AlertCircle className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                                                        Tidak Absen Pulang
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-400 text-xs italic">Belum check-out</span>
                                                )}
                                            </td>

                                            {/* 5. Foto Selfie */}
                                            <td className="py-3.5 px-4 align-middle text-center">
                                                {att.selfie_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedSelfie({ url: att.selfie_url!, title: `${att.user?.name} - ${att.date_formatted}` })}
                                                        className="group relative size-12 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 mx-auto block hover:opacity-90"
                                                        title="Klik untuk memperbesar selfie"
                                                    >
                                                        <img
                                                            src={att.selfie_url}
                                                            alt="Selfie Presensi"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                            <Eye className="h-4 w-4 text-white" />
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">-</span>
                                                )}
                                            </td>

                                            {/* 6. Lokasi GPS & Geofence Radius */}
                                            <td className="py-3.5 px-4 align-middle">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                                            att.is_in_radius
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                        }`}>
                                                            <MapPin className="h-3 w-3" />
                                                            {att.is_in_radius ? 'Di Dalam Radius Kantor' : 'Di Luar Radius Kantor'}
                                                        </span>
                                                        {att.check_in_distance !== null && (
                                                            <span className="text-[11px] text-neutral-500 font-mono">
                                                                ({att.check_in_distance}m dari titik kantor)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-neutral-500">
                                                        Batas radius kantor: <strong>{att.radius_limit} meter</strong>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {attendances?.links && attendances.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <span className="text-xs text-neutral-500">
                                Menampilkan {attendances?.data?.length ?? 0} dari {attendances?.total ?? 0} data presensi
                            </span>
                            <div className="flex gap-1">
                                {attendances.links.map((link, idx) => (
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

            {/* Selfie Preview Modal */}
            <Dialog open={!!selectedSelfie} onOpenChange={(open) => !open && setSelectedSelfie(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">Foto Selfie Presensi</DialogTitle>
                        <DialogDescription className="text-xs">{selectedSelfie?.title}</DialogDescription>
                    </DialogHeader>
                    {selectedSelfie && (
                        <div className="overflow-hidden rounded-xl bg-black">
                            <img src={selectedSelfie.url} alt="Selfie" className="h-auto w-full object-cover" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
