import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    Clock,
    Crosshair,
    Eye,
    FileSpreadsheet,
    FileText,
    Filter,
    GraduationCap,
    MapPin,
    RotateCcw,
    Search,
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
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
    const [selectedSelfie, setSelectedSelfie] = useState<{ url: string; title: string; time?: string } | null>(null);

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
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-bold text-[#008953]">
                        <CheckCircle2 className="size-3.5 text-[#008953]" />
                        Hadir
                    </span>
                );
            case 'terlambat':
                return (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-bold text-amber-700">
                        <Clock className="size-3.5 text-amber-600" />
                        Terlambat
                    </span>
                );
            case 'izin':
                return (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-xs font-bold text-blue-700">
                        Izin
                    </span>
                );
            case 'sakit':
                return (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-200/80 px-2.5 py-1 text-xs font-bold text-purple-700">
                        Sakit
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200/80 px-2.5 py-1 text-xs font-bold text-rose-700">
                        Alpa
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Presensi Siswa Binaan - Guru Pembimbing" />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {/* 1. Header Page Title & Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Presensi Siswa Binaan
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Monitoring rekap presensi harian, ketepatan waktu, foto selfie, dan verifikasi geofence kantor DUDI.
                        </p>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs font-semibold">
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 border border-slate-200/80">
                            Total: <strong className="font-bold text-slate-900">{students.length} Siswa</strong>
                        </span>
                        <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 border border-emerald-200/80">
                            Hadir Hari Ini: <strong className="font-bold">{stats.today_present}</strong>
                        </span>
                        {stats.today_late > 0 && (
                            <span className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700 border border-amber-200/80">
                                Terlambat: <strong className="font-bold">{stats.today_late}</strong>
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. Pilihan Siswa Binaan Selector Cards */}
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

                    {/* Student Selector Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {/* Option: Semua Siswa */}
                        <button
                            type="button"
                            onClick={() => handleSelectStudent(null)}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-left text-xs transition cursor-pointer ${
                                selectedStudentId === null
                                    ? 'border-[#008953] bg-[#008953] text-white shadow-xs'
                                    : 'border-slate-200/90 bg-white hover:border-emerald-300 text-slate-800'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                                    selectedStudentId === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                                }`}>
                                    <Users className="size-4" />
                                </div>
                                <div className="truncate">
                                    <div className="font-bold truncate">Semua Siswa</div>
                                    <div className={`text-[11px] truncate ${selectedStudentId === null ? 'text-emerald-100' : 'text-slate-400'}`}>
                                        Seluruh Log Presensi
                                    </div>
                                </div>
                            </div>
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                                selectedStudentId === null ? 'bg-white text-[#008953]' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {students.length} Siswa
                            </span>
                        </button>

                        {/* List Siswa Binaan */}
                        {filteredStudents.map((s) => {
                            const isSelected = selectedStudentId === s.id;
                            const totalHadir = (s.stats?.hadir ?? 0) + (s.stats?.terlambat ?? 0);

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
                                            {totalHadir} Hari
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Banner Siswa Aktif & Toolbar Filter (Green Theme) */}
                <div className="rounded-2xl bg-[#008953] p-4 text-white shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white font-bold text-sm">
                                <CalendarCheck className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-sm sm:text-base text-white truncate">
                                        {activeStudent ? activeStudent.name : 'Seluruh Siswa Binaan'}
                                    </h3>
                                    {activeStudent?.nis_nip && (
                                        <span className="rounded-md bg-black/20 px-2 py-0.5 text-[11px] font-mono text-emerald-100">
                                            NIS: {activeStudent.nis_nip}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-emerald-100 truncate mt-0.5">
                                    {activeStudent
                                        ? `Tempat PKL: ${activeStudent.company?.name || 'Belum diplot DUDI'}`
                                        : 'Menampilkan gabungan seluruh rekaman presensi siswa binaan'}
                                </p>
                            </div>
                        </div>

                        {/* Filter Toolbar */}
                        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="h-8 rounded-xl bg-white text-slate-800 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
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
                                className="h-8 text-xs w-36 bg-white text-slate-800 rounded-xl"
                            />

                            <Button
                                type="submit"
                                size="sm"
                                className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl cursor-pointer"
                            >
                                <Search className="size-3.5 mr-1" />
                                <span>Filter</span>
                            </Button>

                            {(selectedStatus || selectedDate) && (
                                <Button
                                    type="button"
                                    onClick={handleReset}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl cursor-pointer"
                                    title="Reset filter"
                                >
                                    <RotateCcw className="size-3.5" />
                                </Button>
                            )}
                        </form>
                    </div>
                </div>

                {/* 4. Tabel Logbook Rekap Presensi Siswa */}
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="size-4 text-[#008953]" />
                            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                Logbook Rekap Presensi
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            Total: <strong className="text-slate-900">{attendances?.total ?? 0} Catatan</strong>
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500 font-semibold">
                                    <th className="px-5 py-3.5 w-36">Hari & Tanggal</th>
                                    {selectedStudentId === null && <th className="px-5 py-3.5 w-48">Nama Siswa</th>}
                                    <th className="px-5 py-3.5 w-32">Status</th>
                                    <th className="px-5 py-3.5 w-32">Jam Masuk</th>
                                    <th className="px-5 py-3.5 w-36">Jam Pulang</th>
                                    <th className="px-5 py-3.5 w-24 text-center">Foto Selfie</th>
                                    <th className="px-5 py-3.5 min-w-[220px]">Verifikasi Geofence GPS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {attendances?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={selectedStudentId === null ? 7 : 6} className="py-12 text-center text-slate-400">
                                            <CalendarCheck className="size-8 mx-auto text-slate-300 mb-2" />
                                            <p className="font-semibold text-sm text-slate-600">Belum ada rekaman presensi pada filter ini.</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Presensi siswa akan otomatis tercatat saat siswa melakukan check-in.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.data.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50/60 transition">
                                            {/* 1. Hari & Tanggal */}
                                            <td className="px-5 py-3.5 align-middle">
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex w-fit items-center rounded-lg bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 text-[11px] font-bold text-[#008953]">
                                                        Hari Ke-{att.day_number}
                                                    </span>
                                                    <span className="font-semibold text-slate-900">
                                                        {att.date_formatted}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 1b. Nama Siswa jika mode Semua */}
                                            {selectedStudentId === null && (
                                                <td className="px-5 py-3.5 align-middle">
                                                    <div className="font-bold text-slate-900">
                                                        {att.user?.name}
                                                    </div>
                                                    <div className="text-[11px] font-mono text-slate-400">
                                                        NIS: {att.user?.nis_nip}
                                                    </div>
                                                    <div className="text-[11px] text-emerald-700 truncate max-w-[160px] mt-0.5">
                                                        {att.user?.company_name}
                                                    </div>
                                                </td>
                                            )}

                                            {/* 2. Status Kehadiran */}
                                            <td className="px-5 py-3.5 align-middle">
                                                {getStatusBadge(att.status)}
                                            </td>

                                            {/* 3. Jam Masuk */}
                                            <td className="px-5 py-3.5 align-middle font-mono">
                                                {att.check_in_time ? (
                                                    <span className="font-semibold text-slate-800">{att.check_in_time} WIB</span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* 4. Jam Pulang */}
                                            <td className="px-5 py-3.5 align-middle font-mono">
                                                {att.check_out_time ? (
                                                    <span className="font-semibold text-slate-800">{att.check_out_time} WIB</span>
                                                ) : att.is_missed_checkout ? (
                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                                        <AlertCircle className="size-3 text-amber-600" />
                                                        Tidak Check-Out
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Belum Pulang</span>
                                                )}
                                            </td>

                                            {/* 5. Foto Selfie */}
                                            <td className="px-5 py-3.5 align-middle text-center">
                                                {att.selfie_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedSelfie({
                                                            url: att.selfie_url!,
                                                            title: `${att.user?.name || 'Siswa'} - ${att.date_formatted}`,
                                                            time: att.check_in_time ? `${att.check_in_time} WIB` : undefined,
                                                        })}
                                                        className="group relative size-11 rounded-xl overflow-hidden border border-slate-200 mx-auto block hover:opacity-90 shadow-2xs cursor-pointer"
                                                        title="Lihat foto selfie"
                                                    >
                                                        <img
                                                            src={att.selfie_url}
                                                            alt="Selfie Presensi"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                            <Eye className="size-3.5 text-white" />
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* 6. Lokasi GPS & Geofence Radius */}
                                            <td className="px-5 py-3.5 align-middle">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                                            att.is_in_radius
                                                                ? 'bg-emerald-50 border border-emerald-200/70 text-[#008953]'
                                                                : 'bg-rose-50 border border-rose-200/70 text-rose-700'
                                                        }`}>
                                                            {att.is_in_radius ? (
                                                                <ShieldCheck className="size-3 text-[#008953]" />
                                                            ) : (
                                                                <ShieldAlert className="size-3 text-rose-600" />
                                                            )}
                                                            {att.is_in_radius ? 'Di Dalam Radius' : 'Di Luar Radius'}
                                                        </span>
                                                        {att.check_in_distance !== null && (
                                                            <span className="text-[11px] text-slate-500 font-mono">
                                                                ({att.check_in_distance}m dari titik kantor)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        Batas radius: <strong>{att.radius_limit}m</strong>
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
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50 gap-3">
                            <span className="text-xs text-slate-500">
                                Menampilkan {attendances?.data?.length ?? 0} dari {attendances?.total ?? 0} data presensi
                            </span>
                            <div className="flex gap-1 flex-wrap">
                                {attendances.links.map((link, idx) => (
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

            {/* Selfie Preview Modal */}
            <Dialog open={!!selectedSelfie} onOpenChange={(open) => !open && setSelectedSelfie(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl p-5">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-slate-900">Foto Selfie Presensi</DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            {selectedSelfie?.title} {selectedSelfie?.time ? `• ${selectedSelfie.time}` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSelfie && (
                        <div className="overflow-hidden rounded-xl bg-slate-900 mt-2">
                            <img src={selectedSelfie.url} alt="Selfie" className="h-auto w-full object-cover max-h-[70vh]" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
