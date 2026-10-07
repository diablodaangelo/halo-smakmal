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
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200">
                    Belum Presensi
                </span>
            );
        }

        if (todayAtt.status === 'hadir') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#008953] border border-emerald-200/80">
                    <CheckCircle2 className="size-3 text-[#008953]" />
                    Hadir ({todayAtt.check_in_time} WIB)
                </span>
            );
        }

        if (todayAtt.status === 'terlambat') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200/80">
                    <Clock className="size-3 text-amber-600" />
                    Terlambat ({todayAtt.check_in_time} WIB)
                </span>
            );
        }

        if (todayAtt.status === 'izin') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/80">
                    Izin
                </span>
            );
        }

        if (todayAtt.status === 'sakit') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200/80">
                    Sakit
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200/80">
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
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Daftar seluruh siswa PKL yang Anda bimbing. Klik nama atau kartu siswa untuk melihat profil lengkap.
                        </p>
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

                {/* 3. Grid Kartu Siswa Binaan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-slate-200/90 bg-white p-12 text-center text-slate-400">
                            <Users className="size-8 mx-auto text-slate-300 mb-2" />
                            <p className="font-semibold text-sm text-slate-600">Tidak ada siswa binaan yang ditemukan.</p>
                            <p className="text-xs text-slate-400 mt-0.5">Siswa binaan akan muncul setelah ditugaskan oleh Admin.</p>
                        </div>
                    ) : (
                        students.map((student) => {
                            const waUrl = formatWhatsAppUrl(student.phone);
                            const profileHref = `/students/${student.slug || student.id}`;

                            return (
                                <div
                                    key={student.id}
                                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all"
                                >
                                    {/* Top: Avatar, Name, NIS */}
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Avatar */}
                                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#008953] font-bold text-sm border border-emerald-200/80 shadow-2xs group-hover:bg-[#008953] group-hover:text-white transition-colors">
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

                                                {/* Name & NIS */}
                                                <div className="min-w-0">
                                                    <Link
                                                        href={profileHref}
                                                        className="font-bold text-sm text-slate-900 group-hover:text-[#008953] transition-colors truncate block"
                                                    >
                                                        {student.name}
                                                    </Link>
                                                    <p className="text-[11px] font-mono text-slate-400">
                                                        NIS: {student.nis_nip || '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Link arrow */}
                                            <Link
                                                href={profileHref}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#008953] hover:bg-emerald-50 transition"
                                                title="Lihat Profil"
                                            >
                                                <ArrowUpRight className="size-4" />
                                            </Link>
                                        </div>

                                        {/* Company Placement */}
                                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                                            <Building2 className="size-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">
                                                {student.company?.name ? (
                                                    <strong>{student.company.name}</strong>
                                                ) : (
                                                    <span className="italic text-slate-400">Belum Ditempatkan</span>
                                                )}
                                            </span>
                                        </div>

                                        {/* Today Status Badge */}
                                        <div className="mt-2.5">
                                            {getAttendanceStatusBadge(student.today_attendance)}
                                        </div>
                                    </div>

                                    {/* Bottom: Metrics & Action Buttons */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                                            <span>Presensi: <strong>{student.stats.total_attendances}</strong></span>
                                            <span>•</span>
                                            <span>Jurnal: <strong>{student.stats.total_journals}</strong></span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {waUrl && (
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border-emerald-200 rounded-lg cursor-pointer"
                                                >
                                                    <a href={waUrl} target="_blank" rel="noopener noreferrer" title="Chat WhatsApp">
                                                        <MessageCircle className="size-3 text-emerald-600" />
                                                        <span className="hidden sm:inline">WA</span>
                                                    </a>
                                                </Button>
                                            )}

                                            <Button
                                                asChild
                                                size="sm"
                                                className="h-7 px-2.5 bg-[#008953] hover:bg-[#007346] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                                            >
                                                <Link href={profileHref}>
                                                    Profil
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
