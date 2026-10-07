import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    GraduationCap,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    ShieldCheck,
    UserCheck,
    Users,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GuidedStudent {
    id: number;
    name: string;
    slug?: string;
    nickname?: string | null;
    nis_nip?: string | null;
    phone?: string | null;
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
}

interface TeacherProfileProps {
    teacher: {
        id: number;
        name: string;
        slug: string;
        nickname?: string | null;
        email: string;
        nis_nip?: string | null;
        phone?: string | null;
        avatar_url?: string | null;
        role: string;
        created_at_formatted?: string | null;
        stats: {
            total_students: number;
            total_companies: number;
            today_present: number;
        };
        guided_students: GuidedStudent[];
    };
}

export default function TeacherProfile({ teacher }: TeacherProfileProps) {
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

    const waUrl = formatWhatsAppUrl(teacher.phone);

    return (
        <>
            <Head title={`Profil Guru - ${teacher.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Back Button */}
                <div className="flex items-center justify-between">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                        <Link href="/dashboard">
                            <ArrowLeft className="size-4" />
                            <span>Kembali ke Dashboard</span>
                        </Link>
                    </Button>
                </div>

                {/* Hero Profile Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#008953] via-[#007346] to-[#0b5134] p-6 text-white shadow-lg sm:p-8">
                    {/* Background decorations */}
                    <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-12 right-48 h-48 w-48 rounded-full bg-emerald-400/10 blur-xl" />

                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            {/* Avatar */}
                            <div className="relative flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold text-white shadow-inner backdrop-blur-md border border-white/20">
                                {teacher.avatar_url ? (
                                    <img
                                        src={teacher.avatar_url}
                                        alt={teacher.name}
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <span>
                                        {teacher.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()}
                                    </span>
                                )}
                                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#008953] border-2 border-white text-white">
                                    <GraduationCap className="size-3.5" />
                                </div>
                            </div>

                            {/* Name & Details */}
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold backdrop-blur-md">
                                        <GraduationCap className="size-3.5" />
                                        Guru Pembimbing PKL
                                    </span>
                                    {teacher.nis_nip && (
                                        <span className="inline-flex items-center rounded-full bg-black/20 px-2.5 py-0.5 text-xs font-mono font-medium backdrop-blur-md">
                                            NIP: {teacher.nis_nip}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    {teacher.name}
                                </h1>

                                <p className="text-sm text-emerald-100/90 flex items-center gap-2">
                                    <Building2 className="size-4 shrink-0 text-emerald-300" />
                                    <span>SMK Amaliah 1 & 2 Ciawi, Bogor</span>
                                </p>
                            </div>
                        </div>

                        {/* Quick Contact Actions */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0">
                            {waUrl && (
                                <Button
                                    asChild
                                    className="gap-2 bg-white text-[#008953] hover:bg-emerald-50 font-semibold shadow-sm text-xs h-10 px-4"
                                >
                                    <a href={waUrl} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="size-4 text-emerald-600" />
                                        <span>Hubungi WhatsApp</span>
                                    </a>
                                </Button>
                            )}

                            {teacher.email && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs h-10 px-4 backdrop-blur-md"
                                >
                                    <a href={`mailto:${teacher.email}`}>
                                        <Mail className="size-4" />
                                        <span>Kirim Email</span>
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3 Metric Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Total Siswa Binaan */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                Total Siswa Binaan
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#008953]">
                                <Users className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-neutral-900">
                                {teacher.stats.total_students}
                            </span>
                            <span className="text-xs font-semibold text-neutral-500">Siswa Aktif</span>
                        </div>
                        <p className="mt-2 text-xs text-neutral-500">Dibimbing secara langsung</p>
                    </div>

                    {/* Tempat PKL / DUDI Mitra */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                Mitra DUDI Terkait
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Building2 className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-neutral-900">
                                {teacher.stats.total_companies}
                            </span>
                            <span className="text-xs font-semibold text-neutral-500">Instansi</span>
                        </div>
                        <p className="mt-2 text-xs text-neutral-500">Lokasi penempatan siswa binaan</p>
                    </div>

                    {/* Presensi Hari Ini */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                Kehadiran Hari Ini
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-neutral-900">
                                {teacher.stats.today_present} / {teacher.stats.total_students}
                            </span>
                            <span className="text-xs font-semibold text-purple-600">
                                ({teacher.stats.total_students > 0 ? Math.round((teacher.stats.today_present / teacher.stats.total_students) * 100) : 0}%)
                            </span>
                        </div>
                        <p className="mt-2 text-xs text-neutral-500">Siswa telah presensi masuk</p>
                    </div>
                </div>

                {/* Daftar Siswa Binaan */}
                <Card className="border border-neutral-200/80 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-4 text-[#008953]" />
                                <CardTitle className="text-sm font-bold text-neutral-900">
                                    Daftar Siswa Binaan ({teacher.guided_students.length})
                                </CardTitle>
                            </div>
                            <span className="text-xs text-neutral-500">Monitoring Lapangan</span>
                        </div>
                    </CardHeader>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/30 text-neutral-500 font-semibold">
                                    <th className="px-6 py-3">Siswa</th>
                                    <th className="px-6 py-3">NIS</th>
                                    <th className="px-6 py-3">Tempat PKL / DUDI</th>
                                    <th className="px-6 py-3">Kehadiran Hari Ini</th>
                                    <th className="px-6 py-3 text-right">Kontak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-neutral-700">
                                {teacher.guided_students.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-neutral-400">
                                            Belum ada siswa yang ditugaskan ke guru pembimbing ini.
                                        </td>
                                    </tr>
                                ) : (
                                    teacher.guided_students.map((student) => {
                                        const studentWa = formatWhatsAppUrl(student.phone);
                                        return (
                                            <tr key={student.id} className="hover:bg-neutral-50/70 transition">
                                                <td className="px-6 py-3.5 font-medium text-neutral-900">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                                            {student.name
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .slice(0, 2)
                                                                .join('')
                                                                .toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/students/${student.slug || student.id}`}
                                                                className="font-semibold text-neutral-900 hover:text-[#008953] transition-colors"
                                                            >
                                                                {student.name}
                                                            </Link>
                                                            {student.nickname && (
                                                                <div className="text-[11px] text-neutral-400">({student.nickname})</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 font-mono text-neutral-600">
                                                    {student.nis_nip || '-'}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    {student.company ? (
                                                        <div className="flex items-center gap-1.5 text-neutral-800">
                                                            <Building2 className="size-3.5 text-neutral-400 shrink-0" />
                                                            <span className="font-medium">{student.company.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400 italic">Belum Ditempatkan</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    {student.today_attendance ? (
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                                student.today_attendance.status === 'hadir'
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            }`}
                                                        >
                                                            <span className="size-1.5 rounded-full bg-current" />
                                                            {student.today_attendance.status === 'hadir' ? 'Hadir' : 'Terlambat'} ({student.today_attendance.check_in_time})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-500 px-2.5 py-0.5 text-[11px] font-medium border border-neutral-200">
                                                            Belum Presensi
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    {studentWa ? (
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 gap-1 px-2.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                                        >
                                                            <a href={studentWa} target="_blank" rel="noopener noreferrer">
                                                                <MessageCircle className="size-3 text-emerald-600" />
                                                                <span>WA</span>
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-neutral-400 text-[11px]">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </>
    );
}
