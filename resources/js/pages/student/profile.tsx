import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    CalendarCheck,
    Camera,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    ShieldCheck,
    Sun,
    UserCheck,
    Users,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudentProfileProps {
    student: {
        id: number;
        name: string;
        slug: string;
        nickname?: string | null;
        nis_nip: string;
        email: string;
        phone?: string | null;
        avatar_url?: string | null;
        role: string;
        company?: {
            id: number;
            name: string;
            address?: string;
            radius_meters?: number;
            check_in_start?: string;
            check_in_end?: string;
            check_out_start?: string;
        } | null;
        mentor_teacher?: {
            id: number;
            name: string;
            slug?: string;
            nis_nip?: string;
            phone?: string | null;
            email?: string;
        } | null;
        today_attendance?: {
            status: string;
            check_in_time?: string | null;
            check_out_time?: string | null;
        } | null;
        stats: {
            total_attendances: number;
            hadir: number;
            terlambat: number;
            izin: number;
            sakit: number;
            alpa: number;
            total_journals: number;
            total_prayers: number;
        };
        recent_attendances: Array<{
            id: number;
            date: string;
            date_formatted: string;
            check_in_time: string | null;
            check_out_time: string | null;
            status: string;
            selfie_url: string | null;
        }>;
        recent_journals: Array<{
            id: number;
            day_number: number;
            work_summary: string;
            obstacles: string | null;
            work_photo_url: string | null;
            mentor_notes: string | null;
        }>;
    };
}

export default function StudentProfile({ student }: StudentProfileProps) {
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

    const waUrl = formatWhatsAppUrl(student.phone);

    return (
        <>
            <Head title={`Profil Siswa - ${student.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {/* Back Link */}
                <div>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 -ml-2 rounded-xl"
                    >
                        <Link href="/teacher/students">
                            <ArrowLeft className="size-4" />
                            <span>Kembali ke Daftar Siswa</span>
                        </Link>
                    </Button>
                </div>

                {/* 1. Hero Profile Banner (Green #008953) */}
                <div className="relative overflow-hidden rounded-2xl bg-[#008953] p-6 text-white shadow-md sm:p-8">
                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            {/* Avatar */}
                            <div className="relative flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold text-white shadow-inner backdrop-blur-xs border border-white/20">
                                {student.avatar_url ? (
                                    <img
                                        src={student.avatar_url}
                                        alt={student.name}
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <span>
                                        {student.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()}
                                    </span>
                                )}
                                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-white text-[#008953] shadow-xs">
                                    <UserCheck className="size-3.5" />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold backdrop-blur-xs">
                                        <Users className="size-3.5 text-emerald-200" />
                                        Siswa PKL
                                    </span>
                                    {student.nis_nip && (
                                        <span className="inline-flex items-center rounded-full bg-black/20 px-2.5 py-0.5 text-xs font-mono font-medium backdrop-blur-xs">
                                            NIS: {student.nis_nip}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl truncate">
                                    {student.name}
                                </h1>

                                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-100">
                                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-2.5 py-1">
                                        <Building2 className="size-3.5 text-emerald-300" />
                                        <span>Tempat PKL: <strong>{student.company?.name || 'Belum Diplot'}</strong></span>
                                    </div>

                                    {student.mentor_teacher && (
                                        <Link
                                            href={`/teachers/${student.mentor_teacher.slug || student.mentor_teacher.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-2.5 py-1 transition hover:bg-black/25"
                                        >
                                            <GraduationCap className="size-3.5 text-emerald-300" />
                                            <span>Pembimbing: <strong className="underline underline-offset-2">{student.mentor_teacher.name}</strong></span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Contact Actions */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0">
                            {waUrl && (
                                <Button
                                    asChild
                                    className="gap-2 bg-white text-[#008953] hover:bg-emerald-50 font-bold shadow-sm text-xs h-9 px-4 rounded-xl cursor-pointer"
                                >
                                    <a href={waUrl} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="size-4 text-emerald-600" />
                                        <span>Hubungi WhatsApp</span>
                                    </a>
                                </Button>
                            )}

                            {student.email && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs h-9 px-4 rounded-xl backdrop-blur-xs cursor-pointer"
                                >
                                    <a href={`mailto:${student.email}`}>
                                        <Mail className="size-4" />
                                        <span>Email</span>
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Ringkasan Metrik 3 Card */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Kehadiran */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Total Presensi
                            </span>
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-[#008953]">
                                <CalendarCheck className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-slate-900">
                                {student.stats.total_attendances}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">Hari</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <span className="text-emerald-700">Hadir: {student.stats.hadir}</span>
                            <span>•</span>
                            <span className="text-amber-700">Terlambat: {student.stats.terlambat}</span>
                        </div>
                    </div>

                    {/* Jurnal */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Logbook Jurnal
                            </span>
                            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FileSpreadsheet className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-slate-900">
                                {student.stats.total_journals}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">/ 120 Hari</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">Pencatatan kegiatan harian PKL</p>
                    </div>

                    {/* Log Salat */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Log Salat Fardhu
                            </span>
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <Sun className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-slate-900">
                                {student.stats.total_prayers}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">Catatan</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">Ibadah Dzuhur & Ashar di lokasi</p>
                    </div>
                </div>

                {/* 3. Detail Tempat PKL (DUDI) */}
                {student.company && (
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-[#008953]">
                                <Building2 className="size-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Informasi Tempat PKL / DUDI</h3>
                                <p className="text-[11px] text-slate-400">Instansi mitra tempat pelaksanaan praktik kerja lapangan</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                            <div>
                                <span className="text-slate-400 block mb-1">Nama Perusahaan:</span>
                                <strong className="text-slate-900 font-bold text-sm">{student.company.name}</strong>
                            </div>

                            <div>
                                <span className="text-slate-400 block mb-1">Alamat Kantor:</span>
                                <p className="text-slate-700 font-medium leading-relaxed">{student.company.address || '-'}</p>
                            </div>

                            <div>
                                <span className="text-slate-400 block mb-1">Ketentuan Presensi:</span>
                                <div className="space-y-1 font-medium text-slate-700">
                                    <div>Jam Masuk: {student.company.check_in_start} - {student.company.check_in_end} WIB</div>
                                    <div>Radius Geofence: {student.company.radius_meters} meter</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Riwayat Jurnal Terbaru */}
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="size-4 text-[#008953]" />
                            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                Jurnal Kegiatan Terbaru Siswa
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            {student.recent_journals.length} Catatan Terakhir
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500 font-semibold">
                                    <th className="px-5 py-3.5 w-28">Hari PKL</th>
                                    <th className="px-5 py-3.5 min-w-[280px]">Kegiatan / Pekerjaan</th>
                                    <th className="px-5 py-3.5 w-44">Kendala</th>
                                    <th className="px-5 py-3.5 w-52">Catatan Pembimbing</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {student.recent_journals.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-400">
                                            Belum ada jurnal yang diisi oleh siswa ini.
                                        </td>
                                    </tr>
                                ) : (
                                    student.recent_journals.map((j) => (
                                        <tr key={j.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-3.5 align-top">
                                                <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 text-xs font-bold text-[#008953]">
                                                    Hari Ke-{j.day_number}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 align-top">
                                                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                                    {j.work_summary}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5 align-top">
                                                {j.obstacles ? (
                                                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/70 text-[11px] block">
                                                        {j.obstacles}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 align-top">
                                                {j.mentor_notes ? (
                                                    <span className="text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/70 text-[11px] block">
                                                        {j.mentor_notes}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Belum ada catatan</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
