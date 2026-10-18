import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Copy,
    Eye,
    GraduationCap,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Search,
    ShieldCheck,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GuidedStudent {
    id: number;
    name: string;
    slug?: string;
    nickname?: string | null;
    nis_nip?: string | null;
    class_name?: string | null;
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
    const [activeTab, setActiveTab] = useState<'students' | 'companies'>('students');
    const [searchStudent, setSearchStudent] = useState('');
    const [copied, setCopied] = useState(false);

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

    // Extract unique companies from guided students
    const uniqueCompanies = useMemo(() => {
        const map = new Map<number, { id: number; name: string; address?: string; studentCount: number }>();
        teacher.guided_students.forEach((s) => {
            if (s.company?.id) {
                const existing = map.get(s.company.id);
                if (existing) {
                    existing.studentCount += 1;
                } else {
                    map.set(s.company.id, {
                        id: s.company.id,
                        name: s.company.name,
                        address: s.company.address,
                        studentCount: 1,
                    });
                }
            }
        });
        return Array.from(map.values());
    }, [teacher.guided_students]);

    // Filter students by search
    const filteredStudents = useMemo(() => {
        if (!searchStudent.trim()) return teacher.guided_students;
        const q = searchStudent.toLowerCase();
        return teacher.guided_students.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                (s.class_name && s.class_name.toLowerCase().includes(q)) ||
                (s.company && s.company.name.toLowerCase().includes(q)) ||
                (s.nis_nip && s.nis_nip.includes(q))
        );
    }, [teacher.guided_students, searchStudent]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <>
            <Head title={`Profil Guru - ${teacher.name}`} />

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
                            <span>Guru Terverifikasi</span>
                        </div>
                    </div>

                    {/* Profile Information & Actions Row */}
                    <div className="px-5 sm:px-8 pb-6 pt-0 relative">
                        {/* Avatar & Quick Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
                            {/* Avatar */}
                            <div className="relative size-24 sm:size-28 rounded-3xl border-4 border-white bg-[#008953] text-white shadow-md flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 overflow-hidden ring-1 ring-slate-100">
                                {teacher.avatar_url ? (
                                    <img
                                        src={teacher.avatar_url}
                                        alt={teacher.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>{getInitials(teacher.name)}</span>
                                )}
                                <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-xs">
                                    <GraduationCap className="size-3.5 text-[#008953]" />
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

                                {teacher.email && (
                                    <a
                                        href={`mailto:${teacher.email}`}
                                        className="inline-flex items-center gap-2 h-9 sm:h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition"
                                    >
                                        <Mail className="size-4 text-slate-500 shrink-0" />
                                        <span>Email</span>
                                    </a>
                                )}

                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="inline-flex items-center justify-center size-9 sm:size-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs"
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

                        {/* Name & Title */}
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    {teacher.name}
                                </h1>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#008953] border border-emerald-200/80">
                                    <GraduationCap className="size-3" />
                                    Pembimbing PKL
                                </span>
                            </div>

                            {teacher.nis_nip && (
                                <p className="text-xs font-mono font-medium text-slate-500">
                                    NIP: {teacher.nis_nip}
                                </p>
                            )}
                        </div>

                        {/* Bio & Metadata */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Building2 className="size-3.5 text-slate-400 shrink-0" />
                                <span>SMK Amaliah 1 & 2 Ciawi, Bogor</span>
                            </div>

                            {teacher.created_at_formatted && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-3.5 text-slate-400 shrink-0" />
                                    <span>Aktif sejak {teacher.created_at_formatted}</span>
                                </div>
                            )}

                            {teacher.phone && (
                                <div className="flex items-center gap-1.5">
                                    <Phone className="size-3.5 text-slate-400 shrink-0" />
                                    <span>{teacher.phone}</span>
                                </div>
                            )}
                        </div>

                        {/* Medsos Follower-Style Stats */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-5 text-sm">
                            <button
                                type="button"
                                onClick={() => setActiveTab('students')}
                                className="group flex items-baseline gap-1.5 cursor-pointer text-left"
                            >
                                <span className="font-extrabold text-slate-900 group-hover:text-[#008953] transition">
                                    {teacher.stats.total_students}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                    Siswa Binaan
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('companies')}
                                className="group flex items-baseline gap-1.5 cursor-pointer text-left"
                            >
                                <span className="font-extrabold text-slate-900 group-hover:text-[#008953] transition">
                                    {teacher.stats.total_companies}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                    Mitra DUDI Terkait
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 bg-white px-3 py-1.5 rounded-2xl shadow-2xs">
                    <button
                        type="button"
                        onClick={() => setActiveTab('students')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                            activeTab === 'students'
                                ? 'bg-emerald-50 text-[#008953]'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        <Users className="size-4" />
                        <span>Siswa Binaan</span>
                        <span
                            className={`px-2 py-0.2 rounded-full text-[11px] font-extrabold ${
                                activeTab === 'students'
                                    ? 'bg-[#008953] text-white'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {teacher.guided_students.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('companies')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                            activeTab === 'companies'
                                ? 'bg-emerald-50 text-[#008953]'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        <Building2 className="size-4" />
                        <span>Mitra DUDI</span>
                        <span
                            className={`px-2 py-0.2 rounded-full text-[11px] font-extrabold ${
                                activeTab === 'companies'
                                    ? 'bg-[#008953] text-white'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {uniqueCompanies.length}
                        </span>
                    </button>

                </div>

                {/* Tab Content: 1. Siswa Binaan (List Style) */}
                {activeTab === 'students' && (
                    <div className="space-y-3">
                        {/* Search Filter Bar */}
                        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    placeholder="Cari siswa binaan berdasarkan nama, kelas, atau DUDI..."
                                    className="pl-9 h-9 text-xs sm:text-sm rounded-xl border-slate-200 bg-slate-50/50"
                                />
                            </div>
                            {searchStudent && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchStudent('')}
                                    className="h-9 text-xs rounded-xl text-slate-500"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>

                        {/* Students List */}
                        {filteredStudents.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center">
                                <Users className="size-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-700">
                                    Tidak ada siswa yang sesuai
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Coba ubah kata kunci pencarian siswa binaan.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden divide-y divide-slate-100 shadow-2xs">
                                {filteredStudents.map((student) => {
                                    const studentWa = formatWhatsAppUrl(student.phone);
                                    return (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-3.5 sm:px-5 sm:py-3.5 hover:bg-slate-50/70 transition-colors gap-3"
                                        >
                                            {/* Left: Avatar & Info */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#008953] font-bold text-xs ring-1 ring-emerald-600/20">
                                                    {student.avatar_url ? (
                                                        <img
                                                            src={student.avatar_url}
                                                            alt={student.name}
                                                            className="h-full w-full object-cover rounded-xl"
                                                        />
                                                    ) : (
                                                        <span>{getInitials(student.name)}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Link
                                                            href={`/students/${student.slug || student.id}`}
                                                            className="font-bold text-sm text-slate-900 hover:text-[#008953] transition truncate"
                                                        >
                                                            {student.name}
                                                        </Link>
                                                        {student.class_name && (
                                                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#008953] border border-emerald-200">
                                                                {student.class_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                                                        {student.nis_nip && (
                                                            <span className="font-mono text-slate-400">
                                                                NIS: {student.nis_nip}
                                                            </span>
                                                        )}
                                                        {student.nis_nip && student.company && (
                                                            <span className="text-slate-300">•</span>
                                                        )}
                                                        {student.company ? (
                                                            <span className="text-slate-600 font-medium flex items-center gap-1 truncate max-w-[220px]">
                                                                <Building2 className="size-3 text-slate-400 shrink-0" />
                                                                <span className="truncate">{student.company.name}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="italic text-slate-400">
                                                                Belum Ditempatkan
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Action Buttons */}
                                            <div className="flex items-center gap-1.5 shrink-0">

                                                {studentWa && (
                                                    <a
                                                        href={studentWa}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs"
                                                        title="Chat WhatsApp Siswa"
                                                    >
                                                        <MessageCircle className="size-4" />
                                                    </a>
                                                )}

                                                <Link
                                                    href={`/students/${student.slug || student.id}`}
                                                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs"
                                                    title="Lihat Profil Siswa"
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: 2. Mitra DUDI (List Style) */}
                {activeTab === 'companies' && (
                    <div className="space-y-3">
                        {uniqueCompanies.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center">
                                <Building2 className="size-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-700">
                                    Belum ada mitra DUDI terhubung
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Siswa binaan belum ditempatkan pada mitra industri.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden divide-y divide-slate-100 shadow-2xs">
                                {uniqueCompanies.map((company) => (
                                    <div
                                        key={company.id}
                                        className="flex items-center justify-between p-3.5 sm:px-5 sm:py-4 hover:bg-slate-50/70 transition-colors gap-3"
                                    >
                                        {/* Left: Icon & Info */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-600/20">
                                                <Building2 className="size-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm text-slate-900 truncate">
                                                    {company.name}
                                                </h3>
                                                {company.address && (
                                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                                                        <MapPin className="size-3 text-slate-400 shrink-0" />
                                                        <span className="truncate">{company.address}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Badge */}
                                        <div className="shrink-0">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-[#008953] text-xs font-bold border border-emerald-200">
                                                <Users className="size-3.5" />
                                                <span>{company.studentCount} Siswa Binaan</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
