import { Head, Link, router } from '@inertiajs/react';
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
    class_name?: string | null;
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
        class_name?: string | null;
        phone?: string | null;
        company_name: string;
    };
    date: string;
    date_formatted: string;
    check_in_time: string | null;
    check_out_time: string | null;
    is_missed_checkout?: boolean;
    status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';
    permission_reason?: string | null;
    permission_doc_url?: string | null;
    is_approved?: boolean | null;
    approved_by_name?: string | null;
    approved_at?: string | null;
    check_in_lat: number | null;
    check_in_long: number | null;
    check_in_distance: number | null;
    check_out_distance: number | null;
    is_in_radius: boolean;
    radius_limit: number;
    selfie_url: string | null;
}

interface PermissionItem {
    id: number;
    user_id: number;
    user_name: string;
    nis_nip: string;
    class_name?: string | null;
    company_name: string;
    date: string;
    date_formatted: string;
    status: 'izin' | 'sakit';
    permission_reason: string;
    permission_doc_url: string | null;
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
    pending_permissions_count?: number;
}

interface Props {
    attendances?: AttendanceResponse;
    students?: StudentItem[];
    pending_permissions?: PermissionItem[];
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
    pending_permissions = [],
    stats = {
        total_students: 0,
        today_present: 0,
        today_late: 0,
        today_absent: 0,
        pending_permissions_count: 0,
    },
    filters = {},
    today_date = '',
}: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        filters?.student_id ? Number(filters.student_id) : (students.length > 0 ? students[0].id : null)
    );
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [selectedDate, setSelectedDate] = useState(filters?.date || '');
    const [selectedSelfie, setSelectedSelfie] = useState<{ url: string; title: string; time?: string } | null>(null);
    const [selectedPermissionDoc, setSelectedPermissionDoc] = useState<{ url: string; title: string; reason?: string } | null>(null);
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

                {/* 1.5 Permohonan Izin / Sakit Menunggu Verifikasi */}
                {pending_permissions && pending_permissions.length > 0 && (
                    <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-xs">
                                    <Clock className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                        Permohonan Izin / Sakit Menunggu Verifikasi ({pending_permissions.length} Siswa)
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Siswa binaan Anda telah mengajukan permohonan tidak masuk PKL dan membutuhkan konfirmasi guru pembimbing.
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-lg bg-amber-200/80 px-2.5 py-1 text-xs font-bold text-amber-900">
                                Perlu Verifikasi
                            </span>
                        </div>

                        <div className="mt-3 divide-y divide-amber-200/50">
                            {pending_permissions.map((perm) => (
                                <div key={perm.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                                                {perm.user_name}
                                            </span>
                                            {perm.class_name && (
                                                <span className="rounded-md bg-emerald-100/80 px-1.5 py-0.2 text-[10px] font-bold text-[#008953]">
                                                    {perm.class_name}
                                                </span>
                                            )}
                                            <span className={`rounded-lg px-2 py-0.5 text-xs font-bold uppercase ${
                                                perm.status === 'sakit' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {perm.status}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                                • {perm.date_formatted}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-700 bg-white/80 rounded-lg p-2.5 border border-amber-200/60">
                                            <strong className="text-slate-900">Alasan:</strong> {perm.permission_reason || '-'}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                                            <span>DUDI: <strong>{perm.company_name}</strong></span>
                                            {perm.permission_doc_url && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedPermissionDoc({
                                                        url: perm.permission_doc_url!,
                                                        title: `Surat Izin / Dokter - ${perm.user_name}`,
                                                        reason: perm.permission_reason,
                                                    })}
                                                    className="inline-flex items-center gap-1 font-bold text-[#008953] hover:underline cursor-pointer"
                                                >
                                                    <FileText className="size-3.5" />
                                                    <span>Lihat Surat Lampiran</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={verifyingId === perm.id}
                                            onClick={() => handleVerifyPermission(perm.id, true)}
                                            className="bg-[#008953] hover:bg-[#007346] text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
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
                                            className="border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs h-9 px-3.5 rounded-xl cursor-pointer flex items-center gap-1.5"
                                        >
                                            <AlertCircle className="size-3.5 text-rose-600" />
                                            <span>Tolak</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter & Search Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-3.5 shadow-xs">
                    <form onSubmit={handleFilter} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Left: Filter Controls */}
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
                                Pilih Siswa:
                            </span>

                            {/* Dropdown Pilih Siswa */}
                            <select
                                value={selectedStudentId ?? ''}
                                onChange={(e) => handleSelectStudent(e.target.value ? Number(e.target.value) : null)}
                                className="h-10 px-3 py-1.5 bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition min-w-[170px] max-w-[240px] truncate"
                            >
                                <option value="">Semua Siswa Binaan ({students.length})</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.class_name ? `(${s.class_name})` : ''} - {s.company?.name || 'Belum Diplot'}
                                    </option>
                                ))}
                            </select>

                            {activeStudent && (
                                <Link
                                    href={`/students/${activeStudent.slug || activeStudent.id}`}
                                    className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs shrink-0"
                                    title="Lihat Profil Siswa"
                                >
                                    <Eye className="size-4" />
                                </Link>
                            )}

                            {/* Dropdown Status */}
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="h-10 px-3 py-1.5 bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition w-32 shrink-0"
                            >
                                <option value="">Semua Status</option>
                                <option value="hadir">Hadir</option>
                                <option value="terlambat">Terlambat</option>
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                                <option value="alpa">Alpa</option>
                            </select>

                            {/* Input Tanggal */}
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="h-10 text-xs sm:text-sm w-32 shrink-0 bg-slate-50/60 border-slate-200/80 rounded-xl shadow-none"
                            />
                        </div>

                        {/* Right: Tombol Filter & Reset di Pinggir */}
                        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                            <Button
                                type="submit"
                                size="sm"
                                className="h-10 px-4 text-xs font-bold bg-[#008953] hover:bg-[#007346] text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                                <Search className="size-3.5" />
                                <span>Filter</span>
                            </Button>

                            {(selectedStatus || selectedDate || selectedStudentId !== null) && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setSelectedDate('');
                                        setSelectedStatus('');
                                        handleSelectStudent(null);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer flex items-center gap-1.5"
                                    title="Reset filter"
                                >
                                    <RotateCcw className="size-3.5" />
                                    <span>Reset</span>
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                {/* 4. Tabel Logbook Rekap Presensi Siswa */}
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#008953] text-white">
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider rounded-tl-xl w-36">
                                        Hari & Tanggal
                                    </th>
                                    {selectedStudentId === null && (
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider w-48">
                                            Nama Siswa
                                        </th>
                                    )}
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider w-32">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider w-32">
                                        Jam Masuk
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider w-36">
                                        Jam Pulang
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider w-24 text-center">
                                        Foto Selfie
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider rounded-tr-xl min-w-[220px]">
                                        Verifikasi Geofence GPS
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
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
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-slate-900">{att.user?.name}</span>
                                                        {att.user?.class_name && (
                                                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-[#008953] border border-emerald-200">
                                                                {att.user.class_name}
                                                            </span>
                                                        )}
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
                                                <div className="flex flex-col gap-1">
                                                    {getStatusBadge(att.status)}
                                                    {(att.status === 'izin' || att.status === 'sakit') && (
                                                        att.is_approved === null ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                                                                <Clock className="size-2.5 text-amber-600" />
                                                                Menunggu
                                                            </span>
                                                        ) : att.is_approved === true ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#008953] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 w-fit">
                                                                <CheckCircle2 className="size-2.5 text-[#008953]" />
                                                                Disetujui
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 w-fit">
                                                                <AlertCircle className="size-2.5 text-rose-600" />
                                                                Ditolak
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </td>

                                            {/* 3. Jam Masuk */}
                                            <td className="px-5 py-3.5 align-middle font-mono">
                                                {att.status === 'izin' || att.status === 'sakit' ? (
                                                    <span className="text-slate-400 text-xs italic">-</span>
                                                ) : att.check_in_time ? (
                                                    <span className="font-semibold text-slate-800">{att.check_in_time} WIB</span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* 4. Jam Pulang */}
                                            <td className="px-5 py-3.5 align-middle font-mono">
                                                {att.status === 'izin' || att.status === 'sakit' ? (
                                                    <span className="text-slate-400 text-xs italic">-</span>
                                                ) : att.check_out_time ? (
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

                                            {/* 5. Foto Selfie / Lampiran Surat */}
                                            <td className="px-5 py-3.5 align-middle text-center">
                                                {att.status === 'izin' || att.status === 'sakit' ? (
                                                    att.permission_doc_url ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedPermissionDoc({
                                                                url: att.permission_doc_url!,
                                                                title: `Surat Izin / Sakit - ${att.user?.name || 'Siswa'}`,
                                                                reason: att.permission_reason || undefined,
                                                            })}
                                                            className="group relative size-11 rounded-xl overflow-hidden border border-amber-200 bg-amber-50 mx-auto flex items-center justify-center hover:opacity-90 shadow-2xs cursor-pointer"
                                                            title="Lihat lampiran surat izin/dokter"
                                                        >
                                                            <FileText className="size-5 text-amber-700" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )
                                                ) : att.selfie_url ? (
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

                                            {/* 6. Lokasi GPS & Geofence Radius / Keterangan Izin */}
                                            <td className="px-5 py-3.5 align-middle">
                                                {att.status === 'izin' || att.status === 'sakit' ? (
                                                    <div className="space-y-1.5">
                                                        <div className="text-xs text-slate-700">
                                                            <strong className="text-slate-900 font-semibold">Alasan:</strong>{' '}
                                                            <span>{att.permission_reason || '-'}</span>
                                                        </div>
                                                        {att.is_approved === null && (
                                                            <div className="flex items-center gap-1.5 pt-0.5">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    disabled={verifyingId === att.id}
                                                                    onClick={() => handleVerifyPermission(att.id, true)}
                                                                    className="h-6 px-2 text-[10px] font-bold bg-[#008953] hover:bg-[#007346] text-white rounded-md cursor-pointer"
                                                                >
                                                                    Setujui
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={verifyingId === att.id}
                                                                    onClick={() => handleVerifyPermission(att.id, false)}
                                                                    className="h-6 px-2 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 rounded-md cursor-pointer"
                                                                >
                                                                    Tolak
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
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
                                                )}
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

            {/* Permission Document Preview Modal */}
            <Dialog open={!!selectedPermissionDoc} onOpenChange={(open) => !open && setSelectedPermissionDoc(null)}>
                <DialogContent className="sm:max-w-lg rounded-2xl p-5">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="size-4 text-amber-600" />
                            <span>{selectedPermissionDoc?.title}</span>
                        </DialogTitle>
                        {selectedPermissionDoc?.reason && (
                            <DialogDescription className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-1">
                                <strong className="text-slate-800">Keterangan Siswa:</strong> {selectedPermissionDoc.reason}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                    {selectedPermissionDoc?.url && (
                        <div className="overflow-hidden rounded-xl bg-slate-100 mt-2 border border-slate-200 flex items-center justify-center min-h-[250px]">
                            {selectedPermissionDoc.url.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={selectedPermissionDoc.url} className="w-full h-[60vh] rounded-xl" title="Dokumen Lampiran" />
                            ) : (
                                <img
                                    src={selectedPermissionDoc.url}
                                    alt="Lampiran Surat Izin"
                                    className="h-auto w-full object-contain max-h-[65vh] rounded-xl"
                                />
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
