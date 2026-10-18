import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    Eye,
    FileSpreadsheet,
    GraduationCap,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    ShieldCheck,
    Sun,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface StudentProfileProps {
    student: {
        id: number;
        name: string;
        slug: string;
        nickname?: string | null;
        nis_nip: string;
        class_name?: string | null;
        email: string;
        phone?: string | null;
        avatar_url?: string | null;
        role: string;
        created_at_formatted?: string | null;
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
    const [activeTab, setActiveTab] = useState<'journals' | 'attendance' | 'company'>('journals');
    const [copied, setCopied] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

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
    const teacherWaUrl = formatWhatsAppUrl(student.mentor_teacher?.phone);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'hadir') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#008953] border border-emerald-200/80">
                    <CheckCircle2 className="size-3" />
                    Hadir
                </span>
            );
        }
        if (s === 'terlambat') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                    <Clock className="size-3 text-amber-600" />
                    Terlambat
                </span>
            );
        }
        if (s === 'izin') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/80">
                    Izin
                </span>
            );
        }
        if (s === 'sakit') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200/80">
                    Sakit
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200/80">
                Alpa
            </span>
        );
    };

    return (
        <>
            <Head title={`Profil Siswa - ${student.name}`} />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                {/* Back Button */}
                <div className="flex items-center justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 -ml-2 rounded-xl cursor-pointer"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Kembali</span>
                    </Button>
                </div>

                {/* Social Media Style Profile Header Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                    {/* Cover Banner */}
                    <div className="h-36 sm:h-48 md:h-56 bg-gradient-to-r from-[#008953] via-[#007346] to-[#064e3b] relative overflow-hidden">
                        {/* Abstract Background Accents */}
                        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                        <div className="absolute left-1/3 -bottom-10 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

                        {/* Verified Pill in Top Corner */}
                        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 flex items-center gap-1.5 bg-black/25 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/15">
                            <ShieldCheck className="size-3.5 text-emerald-300" />
                            <span>Siswa PKL Aktif</span>
                        </div>
                    </div>

                    {/* Profile Information & Actions Row */}
                    <div className="px-5 sm:px-8 pb-6 pt-0 relative">
                        {/* Avatar & Quick Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
                            {/* Avatar */}
                            <div className="relative size-24 sm:size-28 rounded-3xl border-4 border-white bg-[#008953] text-white shadow-md flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 overflow-hidden ring-1 ring-slate-100">
                                {student.avatar_url ? (
                                    <img
                                        src={student.avatar_url}
                                        alt={student.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>{getInitials(student.name)}</span>
                                )}
                                <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-xs">
                                    <UserCheck className="size-3.5 text-[#008953]" />
                                </div>
                            </div>

                            {/* Contact & Share Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                {waUrl && (
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 h-9 sm:h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-xs transition"
                                    >
                                        <MessageCircle className="size-4 shrink-0" />
                                        <span>WhatsApp</span>
                                    </a>
                                )}

                                {student.email && (
                                    <a
                                        href={`mailto:${student.email}`}
                                        className="inline-flex items-center gap-2 h-9 sm:h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition"
                                    >
                                        <Mail className="size-4 text-slate-500 shrink-0" />
                                        <span>Email</span>
                                    </a>
                                )}

                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="inline-flex items-center justify-center size-9 sm:size-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs cursor-pointer"
                                    title="Salin Tautan Profil"
                                >
                                    <Copy className="size-4" />
                                </button>
                                {copied && (
                                    <span className="text-[11px] font-semibold text-emerald-600">
                                        Tersalin!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Name & Badges */}
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    {student.name}
                                </h1>
                                {student.class_name && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#008953] border border-emerald-200/80">
                                        <GraduationCap className="size-3" />
                                        Kelas {student.class_name}
                                    </span>
                                )}
                                {student.nis_nip && (
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-slate-700 border border-slate-200">
                                        NIS: {student.nis_nip}
                                    </span>
                                )}
                            </div>

                            {student.nickname && (
                                <p className="text-xs font-semibold text-slate-500">
                                    @{student.nickname}
                                </p>
                            )}
                        </div>

                        {/* Bio & Metadata */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Building2 className="size-3.5 text-slate-400 shrink-0" />
                                <span>SMK Amaliah 1 & 2 Ciawi, Bogor</span>
                            </div>

                            {student.company && (
                                <div className="flex items-center gap-1.5 text-slate-700">
                                    <MapPin className="size-3.5 text-[#008953] shrink-0" />
                                    <span>
                                        Tempat PKL:{' '}
                                        <strong className="text-slate-900 font-bold">
                                            {student.company.name}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            {student.mentor_teacher && (
                                <div className="flex items-center gap-1.5 text-slate-700">
                                    <GraduationCap className="size-3.5 text-[#008953] shrink-0" />
                                    <span>
                                        Pembimbing:{' '}
                                        <Link
                                            href={`/teachers/${student.mentor_teacher.slug || student.mentor_teacher.id}`}
                                            className="text-[#008953] font-bold hover:underline"
                                        >
                                            {student.mentor_teacher.name}
                                        </Link>
                                    </span>
                                </div>
                            )}

                            {student.created_at_formatted && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-3.5 text-slate-400 shrink-0" />
                                    <span>Aktif sejak {student.created_at_formatted}</span>
                                </div>
                            )}
                        </div>

                        {/* Medsos Follower-Style Stats */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-5 text-sm">
                            <button
                                type="button"
                                onClick={() => setActiveTab('attendance')}
                                className="group flex items-baseline gap-1.5 cursor-pointer text-left"
                            >
                                <span className="font-extrabold text-slate-900 group-hover:text-[#008953] transition">
                                    {student.stats.total_attendances}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                    Presensi ({student.stats.hadir} Hadir)
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('journals')}
                                className="group flex items-baseline gap-1.5 cursor-pointer text-left"
                            >
                                <span className="font-extrabold text-slate-900 group-hover:text-[#008953] transition">
                                    {student.stats.total_journals}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                    Catatan Jurnal
                                </span>
                            </button>

                            <div className="flex items-baseline gap-1.5 text-left">
                                <span className="font-extrabold text-slate-900">
                                    {student.stats.total_prayers}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                    Salat Fardhu
                                </span>
                            </div>

                            {student.company && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('company')}
                                    className="group flex items-baseline gap-1.5 cursor-pointer text-left"
                                >
                                    <span className="font-extrabold text-[#008953] group-hover:underline transition">
                                        1
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                        Mitra DUDI
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 bg-white px-3 py-1.5 rounded-2xl shadow-2xs">
                    <button
                        type="button"
                        onClick={() => setActiveTab('journals')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                            activeTab === 'journals'
                                ? 'bg-emerald-50 text-[#008953]'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        <FileSpreadsheet className="size-4" />
                        <span>Jurnal Kegiatan</span>
                        <span
                            className={`px-2 py-0.2 rounded-full text-[11px] font-extrabold ${
                                activeTab === 'journals'
                                    ? 'bg-[#008953] text-white'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {student.recent_journals.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('attendance')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                            activeTab === 'attendance'
                                ? 'bg-emerald-50 text-[#008953]'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        <CalendarCheck className="size-4" />
                        <span>Riwayat Presensi</span>
                        <span
                            className={`px-2 py-0.2 rounded-full text-[11px] font-extrabold ${
                                activeTab === 'attendance'
                                    ? 'bg-[#008953] text-white'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {student.recent_attendances.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('company')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                            activeTab === 'company'
                                ? 'bg-emerald-50 text-[#008953]'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        <Building2 className="size-4" />
                        <span>Info PKL & DUDI</span>
                    </button>
                </div>

                {/* Tab Content 1: Jurnal Kegiatan (Medsos Feed / Timeline Style) */}
                {activeTab === 'journals' && (
                    <div className="space-y-4">
                        {student.recent_journals.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                                    <FileSpreadsheet className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    Belum Ada Jurnal Kegiatan
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Siswa belum mengisi catatan jurnal harian PKL.
                                </p>
                            </div>
                        ) : (
                            student.recent_journals.map((journal) => (
                                <article
                                    key={journal.id}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300"
                                >
                                    {/* Post Header */}
                                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-emerald-100 text-[#008953] font-bold text-xs flex items-center justify-center ring-1 ring-emerald-600/20 shrink-0">
                                                {getInitials(student.name)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-slate-900">
                                                        {student.name}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#008953] border border-emerald-200/70">
                                                        Hari Ke-{journal.day_number}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium">
                                                    {student.company?.name || 'Praktik Kerja Lapangan'}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-xs font-semibold text-slate-400">
                                            Jurnal Harian
                                        </span>
                                    </div>

                                    {/* Work Summary Body */}
                                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium space-y-3">
                                        <p>{journal.work_summary}</p>

                                        {/* Optional Photo Attachment */}
                                        {journal.work_photo_url && (
                                            <div className="pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewPhoto(journal.work_photo_url)}
                                                    className="group relative block overflow-hidden rounded-xl border border-slate-200 max-w-sm cursor-pointer shadow-2xs"
                                                >
                                                    <img
                                                        src={journal.work_photo_url}
                                                        alt={`Dokumentasi Hari Ke-${journal.day_number}`}
                                                        className="h-48 w-full object-cover transition group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                                        <Eye className="size-4" />
                                                        <span>Lihat Foto Penuh</span>
                                                    </div>
                                                </button>
                                            </div>
                                        )}

                                        {/* Obstacles Box if present */}
                                        {journal.obstacles && (
                                            <div className="rounded-xl border border-amber-200/90 bg-amber-50/70 p-3 text-xs flex items-start gap-2.5 text-amber-900">
                                                <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                                                <div>
                                                    <span className="font-bold block text-amber-800">
                                                        Kendala yang dihadapi:
                                                    </span>
                                                    <span className="mt-0.5 block font-medium">
                                                        {journal.obstacles}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mentor Feedback / Notes */}
                                        {journal.mentor_notes && (
                                            <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/60 p-3.5 text-xs flex items-start gap-2.5 text-emerald-950">
                                                <GraduationCap className="size-4 shrink-0 text-[#008953] mt-0.5" />
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-[#008953]">
                                                            Catatan Pembimbing
                                                        </span>
                                                        {student.mentor_teacher && (
                                                            <span className="text-[11px] text-slate-500 font-medium">
                                                                ({student.mentor_teacher.name})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-700 font-medium leading-relaxed">
                                                        {journal.mentor_notes}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                )}

                {/* Tab Content 2: Riwayat Presensi (List Style) */}
                {activeTab === 'attendance' && (
                    <div className="space-y-4">
                        {/* Attendance Summary Stat Pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                            <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs text-center">
                                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                                    Hadir
                                </span>
                                <span className="text-lg font-bold text-emerald-600">
                                    {student.stats.hadir}
                                </span>
                            </div>
                            <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs text-center">
                                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                                    Terlambat
                                </span>
                                <span className="text-lg font-bold text-amber-600">
                                    {student.stats.terlambat}
                                </span>
                            </div>
                            <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs text-center">
                                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                                    Izin
                                </span>
                                <span className="text-lg font-bold text-blue-600">
                                    {student.stats.izin}
                                </span>
                            </div>
                            <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs text-center">
                                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                                    Sakit
                                </span>
                                <span className="text-lg font-bold text-purple-600">
                                    {student.stats.sakit}
                                </span>
                            </div>
                            <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs text-center col-span-2 sm:col-span-1">
                                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                                    Alpa
                                </span>
                                <span className="text-lg font-bold text-red-600">
                                    {student.stats.alpa}
                                </span>
                            </div>
                        </div>

                        {/* Attendance List */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck className="size-4 text-[#008953]" />
                                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                        Catatan Kehadiran Terbaru
                                    </h3>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">
                                    {student.recent_attendances.length} Terakhir
                                </span>
                            </div>

                            {student.recent_attendances.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-xs">
                                    Belum ada catatan presensi siswa yang terekam.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {student.recent_attendances.map((att) => (
                                        <div
                                            key={att.id}
                                            className="p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                    <Calendar className="size-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                                                        {att.date_formatted}
                                                    </div>
                                                    <div className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-2">
                                                        <span>Tanggal: {att.date}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 self-end sm:self-auto">
                                                <div className="text-right text-xs">
                                                    <div className="font-semibold text-slate-700">
                                                        Masuk: {att.check_in_time || '-'} WIB
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        Pulang: {att.check_out_time || '-'} WIB
                                                    </div>
                                                </div>

                                                {getStatusBadge(att.status)}

                                                {att.selfie_url && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewPhoto(att.selfie_url)}
                                                        className="size-8 rounded-lg border border-slate-200 overflow-hidden shrink-0 hover:ring-2 hover:ring-[#008953] transition cursor-pointer"
                                                        title="Lihat foto selfie presensi"
                                                    >
                                                        <img
                                                            src={att.selfie_url}
                                                            alt="Selfie Presensi"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content 3: Info PKL & DUDI (Clean List / Section) */}
                {activeTab === 'company' && (
                    <div className="space-y-4">
                        {/* Company Detail Section */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="size-10 rounded-xl bg-emerald-50 text-[#008953] flex items-center justify-center">
                                        <Building2 className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Mitra Industri Tempat PKL (DUDI)
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Lokasi dan ketentuan penempatan siswa
                                        </p>
                                    </div>
                                </div>

                                {student.company && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#008953] border border-emerald-200/80">
                                        <CheckCircle2 className="size-3.5" />
                                        Terhubung
                                    </span>
                                )}
                            </div>

                            {student.company ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                                            <span className="text-slate-400 font-medium block mb-1">
                                                Nama Perusahaan / Instansi:
                                            </span>
                                            <strong className="text-sm font-extrabold text-slate-900">
                                                {student.company.name}
                                            </strong>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                                            <span className="text-slate-400 font-medium block mb-1">
                                                Alamat Kantor:
                                            </span>
                                            <p className="text-xs font-medium text-slate-700 leading-relaxed">
                                                {student.company.address || 'Alamat belum diatur'}
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                                            <span className="text-slate-400 font-medium block mb-1">
                                                Jam Kerja Presensi:
                                            </span>
                                            <p className="text-xs font-bold text-slate-800">
                                                Masuk: {student.company.check_in_start} - {student.company.check_in_end} WIB
                                                <br />
                                                Pulang: Mulai {student.company.check_out_start} WIB
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                                            <span className="text-slate-400 font-medium block mb-1">
                                                Geofence Presensi:
                                            </span>
                                            <p className="text-xs font-bold text-slate-800">
                                                Radius Maksimal: {student.company.radius_meters || 100} meter
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    Siswa ini belum ditempatkan pada perusahaan mitra DUDI manapun.
                                </div>
                            )}
                        </div>

                        {/* Mentor Teacher Section */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="size-10 rounded-xl bg-emerald-50 text-[#008953] flex items-center justify-center">
                                        <GraduationCap className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Guru Pembimbing PKL
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Pendidik penanggung jawab monitoring kegiatan siswa
                                        </p>
                                    </div>
                                </div>

                                {student.mentor_teacher && (
                                    <Link
                                        href={`/teachers/${student.mentor_teacher.slug || student.mentor_teacher.id}`}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008953] hover:underline"
                                    >
                                        <span>Lihat Profil Guru</span>
                                        <ExternalLink className="size-3.5" />
                                    </Link>
                                )}
                            </div>

                            {student.mentor_teacher ? (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="size-11 rounded-xl bg-emerald-100 text-[#008953] font-bold text-sm flex items-center justify-center ring-1 ring-emerald-600/20 shrink-0">
                                            {getInitials(student.mentor_teacher.name)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900">
                                                {student.mentor_teacher.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                                                NIP: {student.mentor_teacher.nis_nip || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                                        {teacherWaUrl && (
                                            <a
                                                href={teacherWaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] transition"
                                            >
                                                <MessageCircle className="size-3.5" />
                                                <span>WhatsApp</span>
                                            </a>
                                        )}

                                        {student.mentor_teacher.email && (
                                            <a
                                                href={`mailto:${student.mentor_teacher.email}`}
                                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                                            >
                                                <Mail className="size-3.5 text-slate-400" />
                                                <span>Email</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    Belum ada guru pembimbing yang ditugaskan untuk siswa ini.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Photo Modal Preview */}
            {previewPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
                    onClick={() => setPreviewPhoto(null)}
                >
                    <div
                        className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewPhoto(null)}
                            className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>
                        <img
                            src={previewPhoto}
                            alt="Preview Dokumentasi"
                            className="w-full max-h-[80vh] object-contain rounded-2xl"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
