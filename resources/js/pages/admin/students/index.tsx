import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit3,
    GraduationCap,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Student {
    id: number;
    name: string;
    email: string;
    nis_nip?: string | null;
    company_id?: number | null;
    mentor_teacher_id?: number | null;
    company?: {
        id: number;
        name: string;
        address?: string;
    } | null;
    mentor_teacher?: {
        id: number;
        name: string;
        nis_nip?: string | null;
    } | null;
}

interface CompanyItem {
    id: number;
    name: string;
    address?: string;
}

interface TeacherItem {
    id: number;
    name: string;
    nis_nip?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface StudentsResponse {
    data: Student[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    students?: StudentsResponse;
    filters?: {
        search?: string;
        company_id?: string;
        teacher_id?: string;
    };
    companies?: CompanyItem[];
    teachers?: TeacherItem[];
    metrics?: {
        total: number;
        assigned_dudi: number;
        unassigned_dudi: number;
        unassigned_teacher: number;
    };
    errors?: Record<string, string>;
}

export default function StudentsIndex({
    students = { data: [], current_page: 1, last_page: 1, total: 0, links: [] },
    filters = {},
    companies = [],
    teachers = [],
    metrics = { total: 0, assigned_dudi: 0, unassigned_dudi: 0, unassigned_teacher: 0 },
    errors,
}: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [companyFilter, setCompanyFilter] = useState(filters?.company_id || '');
    const [teacherFilter, setTeacherFilter] = useState(filters?.teacher_id || '');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        nis_nip: '',
        password: '',
        company_id: '',
        mentor_teacher_id: '',
    });

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/students',
            {
                search: search || undefined,
                company_id: companyFilter || undefined,
                teacher_id: teacherFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (key: 'company' | 'teacher', value: string) => {
        const nextCompany = key === 'company' ? value : companyFilter;
        const nextTeacher = key === 'teacher' ? value : teacherFilter;

        if (key === 'company') setCompanyFilter(value);
        if (key === 'teacher') setTeacherFilter(value);

        router.get(
            '/admin/students',
            {
                search: search || undefined,
                company_id: nextCompany || undefined,
                teacher_id: nextTeacher || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setCompanyFilter('');
        setTeacherFilter('');
        router.get('/admin/students', {}, { preserveState: true, replace: true });
    };

    const openCreateDialog = () => {
        setEditingStudent(null);
        setForm({
            name: '',
            email: '',
            nis_nip: '',
            password: '',
            company_id: '',
            mentor_teacher_id: '',
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (student: Student) => {
        setEditingStudent(student);
        setForm({
            name: student.name,
            email: student.email,
            nis_nip: student.nis_nip || '',
            password: '',
            company_id: student.company_id ? String(student.company_id) : '',
            mentor_teacher_id: student.mentor_teacher_id ? String(student.mentor_teacher_id) : '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            name: form.name,
            email: form.email,
            nis_nip: form.nis_nip || null,
            company_id: form.company_id ? Number(form.company_id) : null,
            mentor_teacher_id: form.mentor_teacher_id ? Number(form.mentor_teacher_id) : null,
        };

        if (form.password) {
            payload.password = form.password;
        }

        if (editingStudent) {
            router.put(`/admin/students/${editingStudent.id}`, payload, {
                onSuccess: () => setIsDialogOpen(false),
            });
        } else {
            router.post('/admin/students', payload, {
                onSuccess: () => setIsDialogOpen(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteStudent) return;
        router.delete(`/admin/students/${deleteStudent.id}`, {
            onSuccess: () => setDeleteStudent(null),
        });
    };

    const hasActiveFilters = Boolean(search || companyFilter || teacherFilter);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const percentageAssigned =
        metrics.total > 0
            ? Math.round((metrics.assigned_dudi / metrics.total) * 100)
            : 0;

    return (
        <>
            <Head title="Kelola Siswa PKL" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        {/* Clean Visual Icon */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d8f2e5] text-[#008953] shadow-xs ring-1 ring-[#008953]/10">
                            <Users className="h-6 w-6 stroke-[2.2]" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                                Kelola Data Siswa PKL
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Kelola akun siswa, penempatan mitra industri (DUDI), dan guru pembimbing.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="bg-[#008953] hover:bg-[#007346] active:bg-[#00623a] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-5 shadow-sm shadow-emerald-900/10 transition-all flex items-center gap-2 self-start sm:self-auto hover:translate-y-[-1px]"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        <span>Tambah Siswa Baru</span>
                    </Button>
                </div>

                {/* Error Alert */}
                {errors?.error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs font-semibold text-red-700 flex items-center gap-2.5 shadow-2xs">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                        <span>{errors.error}</span>
                    </div>
                )}

                {/* 4 Metric Cards with Refined Depth */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Siswa */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#008953] to-[#007346] text-white p-5 flex items-center justify-between shadow-xs border border-emerald-600/30">
                        <div className="relative z-10">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100/90">
                                TOTAL SISWA PKL
                            </p>
                            <h3 className="text-3xl font-black text-white mt-1 tracking-tight">
                                {metrics.total}
                            </h3>
                            <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                                Siswa terdaftar aktif
                            </p>
                        </div>
                        <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-xs ring-1 ring-white/20">
                            <CheckCircle2 className="h-5 w-5 stroke-[2.2]" />
                        </div>
                    </div>

                    {/* Card 2: Sudah Ada DUDI */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#008953] to-[#007346] text-white p-5 flex items-center justify-between shadow-xs border border-emerald-600/30">
                        <div className="relative z-10">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100/90">
                                SUDAH ADA DUDI
                            </p>
                            <h3 className="text-3xl font-black text-white mt-1 tracking-tight">
                                {metrics.assigned_dudi}
                            </h3>
                            <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                                {percentageAssigned}% telah ditempatkan
                            </p>
                        </div>
                        <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-xs ring-1 ring-white/20">
                            <Building2 className="h-5 w-5 stroke-[2.2]" />
                        </div>
                    </div>

                    {/* Card 3: Belum Ada DUDI */}
                    <div className="relative overflow-hidden rounded-2xl bg-[#c8e6d9] text-[#004f2f] p-5 flex items-center justify-between border border-emerald-300/70 shadow-xs">
                        <div className="relative z-10">
                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#006e42]">
                                BELUM ADA DUDI
                            </p>
                            <h3 className="text-3xl font-black text-[#004f2f] mt-1 tracking-tight">
                                {metrics.unassigned_dudi}
                            </h3>
                            <p className="text-xs text-[#006e42] font-semibold mt-0.5">
                                Perlu plotting mitra
                            </p>
                        </div>
                        <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#008953] text-white shadow-xs">
                            <Clock className="h-5 w-5 stroke-[2.2]" />
                        </div>
                    </div>

                    {/* Card 4: Belum Ada Guru */}
                    <div className="relative overflow-hidden rounded-2xl bg-[#c8e6d9] text-[#004f2f] p-5 flex items-center justify-between border border-emerald-300/70 shadow-xs">
                        <div className="relative z-10">
                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#006e42]">
                                BELUM ADA GURU
                            </p>
                            <h3 className="text-3xl font-black text-[#004f2f] mt-1 tracking-tight">
                                {metrics.unassigned_teacher}
                            </h3>
                            <p className="text-xs text-[#006e42] font-semibold mt-0.5">
                                Perlu guru pembimbing
                            </p>
                        </div>
                        <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#008953] text-white shadow-xs">
                            <GraduationCap className="h-5 w-5 stroke-[2.2]" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Search Field */}
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan nama siswa, email, atau NIS..."
                            className="h-10 pl-10 border-0 bg-slate-50/60 hover:bg-slate-100/80 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-none transition"
                        />
                    </form>

                    {/* Clean Dropdown Filters without Emojis */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                        <select
                            value={companyFilter}
                            onChange={(e) => handleFilterChange('company', e.target.value)}
                            className="h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                        >
                            <option value="">Semua Perusahaan DUDI</option>
                            <option value="unassigned">Belum Memiliki DUDI</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={teacherFilter}
                            onChange={(e) => handleFilterChange('teacher', e.target.value)}
                            className="h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                        >
                            <option value="">Semua Guru Pembimbing</option>
                            <option value="unassigned">Belum Ada Guru Pembimbing</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleResetFilters}
                                className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-4 flex items-center gap-1.5"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Table Title Bar */}
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                            Daftar Siswa PKL
                        </h2>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                            {students?.total ?? 0}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#008953] text-white">
                                <tr>
                                    <th className="py-3.5 px-6 font-bold text-[11px] uppercase tracking-wider text-white">
                                        IDENTITAS SISWA
                                    </th>
                                    <th className="py-3.5 px-6 font-bold text-[11px] uppercase tracking-wider text-white">
                                        PERUSAHAAN DUDI
                                    </th>
                                    <th className="py-3.5 px-6 font-bold text-[11px] uppercase tracking-wider text-white">
                                        GURU PEMBIMBING
                                    </th>
                                    <th className="py-3.5 px-6 font-bold text-[11px] uppercase tracking-wider text-right text-white">
                                        TINDAKAN
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {students?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400 text-xs font-medium">
                                            Tidak ada data siswa yang sesuai dengan filter pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    students?.data?.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Identitas Siswa */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d8f2e5] text-xs font-extrabold text-[#008953] ring-2 ring-[#008953]/10 shadow-2xs">
                                                        {getInitials(student.name)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                                                            {student.email} {student.nis_nip ? `/ NIS: ${student.nis_nip}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Perusahaan DUDI */}
                                            <td className="px-6 py-4">
                                                {student.company ? (
                                                    <div className="inline-flex flex-col bg-[#e6f7ef] border border-[#a8e6cb] px-3.5 py-1.5 rounded-xl">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#005a36]">
                                                            <Building2 className="h-3.5 w-3.5 text-[#008953] shrink-0" />
                                                            <span>{student.company.name}</span>
                                                        </div>
                                                        {student.company.address && (
                                                            <div className="text-[11px] text-slate-400 font-normal mt-0.5 max-w-xs truncate">
                                                                {student.company.address}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 bg-[#fef6e7] border border-[#fedba8] text-[#975a16] text-xs font-bold px-3.5 py-1.5 rounded-xl">
                                                        <Clock className="h-3.5 w-3.5 text-[#975a16] shrink-0" />
                                                        <span>Belum Ditempatkan</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Guru Pembimbing */}
                                            <td className="px-6 py-4">
                                                {student.mentor_teacher ? (
                                                    <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] border border-[#e2e8f0] text-slate-800 text-xs font-bold px-3.5 py-1.5 rounded-xl">
                                                        <GraduationCap className="h-3.5 w-3.5 text-[#008953] shrink-0" />
                                                        <span>{student.mentor_teacher.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 bg-[#ebf4ff] border border-[#c3ddfd] text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-xl">
                                                        <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                                        <span>Belum Ada Guru</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Tindakan */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(student)}
                                                        className="h-8.5 w-8.5 p-0 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition"
                                                        title="Edit Data Siswa"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteStudent(student)}
                                                        className="h-8.5 w-8.5 p-0 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition"
                                                        title="Hapus Siswa"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium bg-slate-50/40">
                        <div>
                            Menampilkan halaman <span className="font-bold text-slate-700">{students?.current_page || 1}</span> dari <span className="font-bold text-slate-700">{students?.last_page || 1}</span> ({students?.total || 0} total siswa)
                        </div>

                        {students?.links && students.links.length > 3 ? (
                            <div className="flex items-center gap-1.5">
                                {students.links.map((link, idx) => {
                                    const isNext = link.label.includes('Next') || link.label.includes('Berikutnya') || link.label.includes('&raquo;');
                                    const isPrev = link.label.includes('Previous') || link.label.includes('Sebelumnya') || link.label.includes('&laquo;');

                                    return (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            className={`h-8 min-w-8 px-2.5 rounded-lg text-xs font-semibold transition ${
                                                link.active
                                                    ? 'bg-[#008953] text-white border-[#008953] hover:bg-[#007547]'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            {isPrev ? (
                                                <span className="flex items-center gap-1">
                                                    <ChevronLeft className="h-3.5 w-3.5" />
                                                    <span>Sebelumnya</span>
                                                </span>
                                            ) : isNext ? (
                                                <span className="flex items-center gap-1">
                                                    <span>Berikutnya</span>
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </span>
                                            ) : (
                                                link.label
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="h-8 min-w-8 px-3 bg-[#008953] text-white font-bold rounded-lg flex items-center justify-center text-xs">
                                    1
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Dialog: Tambah / Edit Siswa */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl">
                    <DialogHeader className="pb-2 border-b border-slate-100">
                        <DialogTitle className="text-lg font-bold text-slate-900">
                            {editingStudent ? 'Edit Data Siswa PKL' : 'Tambah Siswa PKL Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Lengkapi profil siswa dan tentukan penempatan perusahaan mitra DUDI serta guru pembimbingnya.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                Nama Lengkap Siswa *
                            </Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: Muhammad Rizky Pratama"
                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors?.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        {/* Email & NIS/NISN Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Email Akun *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="siswa@smkamaliah.sch.id"
                                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                />
                                {errors?.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="nis_nip" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    NIS / NISN
                                </Label>
                                <Input
                                    id="nis_nip"
                                    value={form.nis_nip}
                                    onChange={(e) => setForm({ ...form, nis_nip: e.target.value })}
                                    placeholder="212210001"
                                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                />
                                {errors?.nis_nip && <p className="text-xs text-red-500">{errors.nis_nip}</p>}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                {editingStudent ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi Akun *'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                required={!editingStudent}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder={editingStudent ? '••••••••' : 'Minimal 8 karakter'}
                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors?.password && <p className="text-xs text-red-500">{errors.password}</p>}
                        </div>

                        {/* Placement Settings Section */}
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                                <Building2 className="h-4 w-4 text-[#008953]" />
                                <span>Penempatan Industri & Pembimbing</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="company_id" className="text-xs font-medium text-slate-700">
                                        Perusahaan Mitra (DUDI)
                                    </Label>
                                    <select
                                        id="company_id"
                                        value={form.company_id}
                                        onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium shadow-2xs focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Belum Ditentukan --</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="mentor_teacher_id" className="text-xs font-medium text-slate-700">
                                        Guru Pembimbing
                                    </Label>
                                    <select
                                        id="mentor_teacher_id"
                                        value={form.mentor_teacher_id}
                                        onChange={(e) => setForm({ ...form, mentor_teacher_id: e.target.value })}
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium shadow-2xs focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Belum Ditentukan --</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} {t.nis_nip ? `(${t.nis_nip})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="h-10 rounded-xl font-semibold text-slate-600"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="h-10 rounded-xl bg-[#008953] hover:bg-[#007346] text-white font-bold"
                            >
                                {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Dialog: Konfirmasi Hapus */}
            <Dialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Hapus Akun Siswa PKL
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                            Apakah Anda yakin ingin menghapus akun siswa <strong>{deleteStudent?.name}</strong>? Tindakan ini tidak dapat dibatalkan jika siswa belum memiliki rekaman data presensi atau jurnal.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteStudent(null)}
                            className="h-10 rounded-xl text-slate-600 font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700"
                        >
                            Ya, Hapus Siswa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
