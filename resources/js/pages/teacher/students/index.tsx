import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    Building2,
    CalendarCheck,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    MessageCircle,
    Phone,
    Search,
    ShieldCheck,
    Sun,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StudentItem {
    id: number;
    name: string;
    slug: string;
    nickname?: string | null;
    nis_nip: string;
    class_name?: string | null;
    phone?: string | null;
    email: string;
    avatar_url?: string | null;
    company?: {
        id: number;
        name: string;
        address?: string;
    } | null;
    today_attendance?: {
        status: string;
        check_in_time?: string | null;
        check_out_time?: string | null;
    } | null;
    stats: {
        total_attendances: number;
        total_journals: number;
        total_prayers: number;
    };
}

interface Props {
    students: StudentItem[];
    stats: {
        total_students: number;
        today_present: number;
        today_late: number;
    };
    filters: {
        search?: string;
    };
}

export default function TeacherStudentsIndex({
    students = [],
    stats,
    filters,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/teacher/students',
            { search: searchQuery || undefined },
            { preserveState: true }
        );
    };

    const formatWhatsAppUrl = (phone?: string | null) => {
        if (!phone) return null;
        let clean = phone.replace(/[^0-9]/g, '');
        if (clean.startsWith('0')) {
            clean = '62' + clean.slice(1);
        } else if (!clean.startsWith('62')) {
            clean = '62' + clean;
        }
        return `https://wa.me/${clean}`;
    };

    const getAttendanceStatusBadge = (todayAtt?: StudentItem['today_attendance']) => {
        if (!todayAtt) {
            return (
                <span className="text-xs font-medium text-slate-400">
                    Belum Presensi
                </span>
            );
        }

        if (todayAtt.status === 'hadir') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#008953]">
                    <span>Hadir ({todayAtt.check_in_time} WIB)</span>
                    <CheckCircle2 className="size-3.5 text-[#008953]" />
                </span>
            );
        }

        if (todayAtt.status === 'terlambat') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                    <span>Terlambat ({todayAtt.check_in_time} WIB)</span>
                    <Clock className="size-3.5 text-amber-500" />
                </span>
            );
        }

        if (todayAtt.status === 'izin') {
            return (
                <span className="text-xs font-bold text-blue-600">
                    Izin
                </span>
            );
        }

        if (todayAtt.status === 'sakit') {
            return (
                <span className="text-xs font-bold text-purple-600">
                    Sakit
                </span>
            );
        }

        return (
            <span className="text-xs font-bold text-rose-600">
                Alpa
            </span>
        );
    };

    return (
        <>
            <Head title="Daftar Siswa Binaan - Guru Pembimbing" />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {/* 1. Header Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Daftar Siswa Binaan
                        </h1>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs font-semibold">
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 border border-slate-200/80">
                            Total: <strong className="font-bold text-slate-900">{stats.total_students} Siswa</strong>
                        </span>
                        <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 border border-emerald-200/80">
                            Hadir Hari Ini: <strong className="font-bold">{stats.today_present}</strong>
                        </span>
                    </div>
                </div>

                {/* 2. Toolbar Pencarian */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Cari nama, NIS, atau tempat DUDI..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-xs rounded-xl border-slate-200 bg-white"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            className="h-9 px-3.5 bg-[#008953] hover:bg-[#007346] text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                            Cari
                        </Button>
                    </form>
                </div>

                {/* 3. Tabel Siswa Binaan (Clean, Simple, Cakep) */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#008953] text-white">
                                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider rounded-tl-xl min-w-[240px]">
                                        Siswa
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider min-w-[200px]">
                                        Tempat DUDI
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider min-w-[180px]">
                                        Presensi Hari Ini
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider min-w-[160px]">
                                        Rekap Aktivitas
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right rounded-tr-xl w-32">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            <Users className="size-8 mx-auto text-slate-300 mb-2" />
                                            <p className="font-semibold text-sm text-slate-600">Tidak ada siswa binaan yang ditemukan.</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Siswa binaan akan muncul setelah ditugaskan oleh Admin.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => {
                                        const waUrl = formatWhatsAppUrl(student.phone);
                                        const profileHref = `/students/${student.slug || student.id}`;

                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/70 transition">
                                                {/* Siswa */}
                                                <td className="px-5 py-3.5 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#008953] font-bold text-xs border border-emerald-200/80 shadow-2xs">
                                                            {student.avatar_url ? (
                                                                <img
                                                                    src={student.avatar_url}
                                                                    alt={student.name}
                                                                    className="h-full w-full rounded-xl object-cover"
                                                                />
                                                            ) : (
                                                                student.name
                                                                    .split(' ')
                                                                    .map((n) => n[0])
                                                                    .slice(0, 2)
                                                                    .join('')
                                                                    .toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <Link
                                                                href={profileHref}
                                                                className="font-bold text-slate-900 hover:text-[#008953] transition-colors truncate block text-xs sm:text-sm"
                                                            >
                                                                {student.name}
                                                            </Link>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                {student.class_name && (
                                                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-[#008953] border border-emerald-200">
                                                                        {student.class_name}
                                                                    </span>
                                                                )}
                                                                <span className="text-[11px] font-mono text-slate-400">
                                                                    NIS: {student.nis_nip || '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Tempat DUDI */}
                                                <td className="px-5 py-3.5 align-middle">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                                        <Building2 className="size-3.5 text-slate-400 shrink-0" />
                                                        <span className="font-semibold truncate max-w-[200px]">
                                                            {student.company?.name || (
                                                                <span className="italic text-slate-400 font-normal">Belum Ditempatkan</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Presensi Hari Ini */}
                                                <td className="px-5 py-3.5 align-middle">
                                                    {getAttendanceStatusBadge(student.today_attendance)}
                                                </td>

                                                {/* Rekap Log */}
                                                <td className="px-5 py-3.5 align-middle">
                                                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                                        <span>Presensi: <strong className="text-slate-900 font-bold">{student.stats.total_attendances}</strong></span>
                                                        <span className="text-slate-300">•</span>
                                                        <span>Jurnal: <strong className="text-slate-900 font-bold">{student.stats.total_journals}</strong></span>
                                                    </div>
                                                </td>

                                                {/* Aksi & Kontak */}
                                                <td className="px-5 py-3.5 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {waUrl && (
                                                            <a
                                                                href={waUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="size-8 inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-[#008953] hover:text-white transition shadow-2xs"
                                                                title={`Chat WhatsApp ${student.name}`}
                                                            >
                                                                <MessageCircle className="size-3.5" />
                                                            </a>
                                                        )}
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="h-8 px-3 bg-[#008953] hover:bg-[#007346] text-white text-xs font-bold rounded-xl cursor-pointer"
                                                        >
                                                            <Link href={profileHref}>
                                                                Profil
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
