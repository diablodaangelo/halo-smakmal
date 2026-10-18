import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit3,
    Eye,
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
    slug?: string;
    email: string;
    nis_nip?: string | null;
    class_name?: string | null;
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
    from?: number;
    to?: number;
    links: PaginationLink[];
}

interface Props {
    students?: StudentsResponse;
    filters?: {
        search?: string;
        class_name?: string;
        company_id?: string;
        teacher_id?: string;
    };
    classes?: string[];
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
    students = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0, links: [] },
    filters = {},
    classes = [],
    companies = [],
    teachers = [],
    metrics = { total: 0, assigned_dudi: 0, unassigned_dudi: 0, unassigned_teacher: 0 },
    errors,
}: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [classFilter, setClassFilter] = useState(filters?.class_name || '');
    const [companyFilter, setCompanyFilter] = useState(filters?.company_id || '');
    const [teacherFilter, setTeacherFilter] = useState(filters?.teacher_id || '');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        nis_nip: '',
        class_name: '',
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
                class_name: classFilter || undefined,
                company_id: companyFilter || undefined,
                teacher_id: teacherFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (key: 'class' | 'company' | 'teacher', value: string) => {
        const nextClass = key === 'class' ? value : classFilter;
        const nextCompany = key === 'company' ? value : companyFilter;
        const nextTeacher = key === 'teacher' ? value : teacherFilter;

        if (key === 'class') setClassFilter(value);
        if (key === 'company') setCompanyFilter(value);
        if (key === 'teacher') setTeacherFilter(value);

        router.get(
            '/admin/students',
            {
                search: search || undefined,
                class_name: nextClass || undefined,
                company_id: nextCompany || undefined,
                teacher_id: nextTeacher || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setClassFilter('');
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
            class_name: '',
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
            class_name: student.class_name || '',
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
            class_name: form.class_name || null,
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

    const hasActiveFilters = Boolean(search || classFilter || companyFilter || teacherFilter);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

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

                {/* Filter & Search Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-3.5 shadow-xs flex flex-col xl:flex-row items-center justify-between gap-3">
                    {/* Search Field */}
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan nama siswa, email, atau NIS..."
                            className="h-10 pl-10 border-0 bg-slate-50/60 hover:bg-slate-100/80 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-none transition w-full"
                        />
                    </form>

                    {/* Clean Dropdown Filters */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
                        {/* Filter Kelas */}
                        <select
                            value={classFilter}
                            onChange={(e) => handleFilterChange('class', e.target.value)}
                            className="h-10 px-3.5 py-1.5 bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition min-w-[130px]"
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map((cls) => (
                                <option key={cls} value={cls}>
                                    {cls}
                                </option>
                            ))}
                        </select>

                        {/* Filter Perusahaan DUDI */}
                        <select
                            value={companyFilter}
                            onChange={(e) => handleFilterChange('company', e.target.value)}
                            className="h-10 px-3.5 py-1.5 bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition min-w-[150px] max-w-[210px] truncate"
                        >
                            <option value="">Semua Perusahaan DUDI</option>
                            <option value="unassigned">Belum Memiliki DUDI</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {/* Filter Guru Pembimbing */}
                        <select
                            value={teacherFilter}
                            onChange={(e) => handleFilterChange('teacher', e.target.value)}
                            className="h-10 px-3.5 py-1.5 bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition min-w-[150px] max-w-[210px] truncate"
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
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-10 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1.5"
                                title="Reset semua filter"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#008953] text-white">
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider rounded-tl-xl">
                                        Identitas Siswa
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                                        Kelas
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                                        Perusahaan DUDI
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                                        Guru Pembimbing
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-right rounded-tr-xl">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
                                {students?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <Users className="h-6 w-6" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">
                                                    Tidak ada data siswa PKL ditemukan
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {hasActiveFilters
                                                        ? 'Coba sesuaikan kata kunci pencarian atau filter status.'
                                                        : 'Silakan tambahkan akun siswa baru terlebih dahulu.'}
                                                </p>
                                                {hasActiveFilters && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleResetFilters}
                                                        className="mt-2 rounded-xl text-xs font-semibold"
                                                    >
                                                        Reset Filter
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students?.data?.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Identitas Siswa */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#008953] font-bold text-xs ring-1 ring-emerald-600/20">
                                                        {getInitials(student.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-900 leading-snug truncate">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-1.5">
                                                            {student.nis_nip && (
                                                                <span className="font-mono text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                                                    NIS: {student.nis_nip}
                                                                </span>
                                                            )}
                                                            <span className="truncate max-w-[190px]">{student.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kelas Siswa */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {student.class_name ? (
                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#008953] border border-emerald-200 shadow-2xs">
                                                        <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[#008953]" />
                                                        <span>{student.class_name}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium italic">
                                                        -
                                                    </span>
                                                )}
                                            </td>

                                            {/* Perusahaan DUDI */}
                                            <td className="px-5 py-4">
                                                {student.company ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800" title={student.company.name}>
                                                        <Building2 className="h-3.5 w-3.5 text-[#008953] shrink-0" />
                                                        <span className="truncate max-w-[200px]">{student.company.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                        <Clock className="h-3 w-3 shrink-0 text-amber-600" />
                                                        Belum Ditempatkan
                                                    </span>
                                                )}
                                            </td>

                                            {/* Guru Pembimbing */}
                                            <td className="px-5 py-4">
                                                {student.mentor_teacher ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800" title={student.mentor_teacher.name}>
                                                        <GraduationCap className="h-3.5 w-3.5 text-[#008953] shrink-0" />
                                                        <span className="truncate max-w-[180px]">{student.mentor_teacher.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                        <UserCheck className="h-3 w-3 shrink-0 text-blue-600" />
                                                        Belum Ada Guru
                                                    </span>
                                                )}
                                            </td>

                                            {/* Tindakan */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/students/${student.slug || student.id}`}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs"
                                                        title="Lihat Profil Siswa"
                                                    >
                                                        <Eye className="h-4 w-4 stroke-[2]" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openEditDialog(student)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs"
                                                        title="Edit Data Siswa"
                                                    >
                                                        <Edit3 className="h-4 w-4 stroke-[2]" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteStudent(student)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition shadow-2xs"
                                                        title="Hapus Siswa"
                                                    >
                                                        <Trash2 className="h-4 w-4 stroke-[2]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {students.total > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-medium">
                                Menampilkan{' '}
                                <strong className="font-bold text-slate-800">
                                    {students.from || (students.data.length > 0 ? 1 : 0)}
                                </strong>{' '}
                                sampai{' '}
                                <strong className="font-bold text-slate-800">
                                    {students.to || students.data.length}
                                </strong>{' '}
                                dari{' '}
                                <strong className="font-bold text-slate-800">
                                    {students.total}
                                </strong>{' '}
                                siswa PKL
                            </span>

                            {students.links && students.links.length > 3 && (
                                <div className="flex items-center gap-1">
                                    {students.links.map((link, idx) => {
                                        const isPrev = idx === 0;
                                        const isNext = idx === students.links.length - 1;

                                        return (
                                            <button
                                                key={idx}
                                                disabled={!link.url}
                                                onClick={() =>
                                                    link.url &&
                                                    router.get(
                                                        link.url,
                                                        {},
                                                        { preserveState: true, replace: true }
                                                    )
                                                }
                                                className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                                                    link.active
                                                        ? 'bg-[#008953] text-white shadow-xs'
                                                        : link.url
                                                          ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                                          : 'bg-transparent text-slate-300 cursor-not-allowed'
                                                }`}
                                            >
                                                {isPrev ? (
                                                    <ChevronLeft className="h-4 w-4" />
                                                ) : isNext ? (
                                                    <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
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
                            Lengkapi data siswa termasuk kelas, penempatan perusahaan mitra DUDI, dan guru pembimbing.
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

                        {/* Kelas & NIS/NISN Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="class_name" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Kelas Siswa *
                                </Label>
                                <Input
                                    id="class_name"
                                    value={form.class_name}
                                    onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                                    placeholder="Contoh: XII RPL 1 / XII TKJ 2"
                                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                />
                                {errors?.class_name && <p className="text-xs text-red-500">{errors.class_name}</p>}
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

                        {/* Email Field */}
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
