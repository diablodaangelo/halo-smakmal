import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit3,
    Eye,
    GraduationCap,
    Mail,
    Phone,
    Plus,
    RotateCcw,
    Search,
    Trash2,
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

interface Teacher {
    id: number;
    name: string;
    slug?: string;
    email: string;
    nis_nip?: string | null;
    phone?: string | null;
    phone_number?: string | null;
    students_count?: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface TeachersResponse {
    data: Teacher[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
    from?: number;
    to?: number;
}

interface Props {
    teachers?: TeachersResponse;
    filters?: {
        search?: string;
        status?: string;
    };
    errors?: Record<string, string>;
}

export default function TeachersIndex({
    teachers = { data: [], current_page: 1, last_page: 1, total: 0, links: [] },
    filters = {},
    errors,
}: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [deleteTeacher, setDeleteTeacher] = useState<Teacher | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        nis_nip: '',
        phone_number: '',
        password: '',
    });

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/teachers',
            {
                search: search || undefined,
                status: statusFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        router.get(
            '/admin/teachers',
            {
                search: search || undefined,
                status: value || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        router.get('/admin/teachers', {}, { preserveState: true, replace: true });
    };

    const openCreateDialog = () => {
        setEditingTeacher(null);
        setForm({
            name: '',
            email: '',
            nis_nip: '',
            phone_number: '',
            password: '',
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setForm({
            name: teacher.name,
            email: teacher.email,
            nis_nip: teacher.nis_nip || '',
            phone_number: teacher.phone_number || teacher.phone || '',
            password: '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Record<string, any> = {
            name: form.name,
            email: form.email,
            nis_nip: form.nis_nip || null,
            phone_number: form.phone_number || null,
        };

        if (form.password) {
            payload.password = form.password;
        }

        if (editingTeacher) {
            router.put(`/admin/teachers/${editingTeacher.id}`, payload, {
                onSuccess: () => setIsDialogOpen(false),
            });
        } else {
            router.post('/admin/teachers', payload, {
                onSuccess: () => setIsDialogOpen(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTeacher) return;
        router.delete(`/admin/teachers/${deleteTeacher.id}`, {
            onSuccess: () => setDeleteTeacher(null),
        });
    };

    const hasActiveFilters = Boolean(search || statusFilter);

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
            <Head title="Kelola Guru Pembimbing" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d8f2e5] text-[#008953] shadow-xs ring-1 ring-[#008953]/10">
                            <GraduationCap className="h-6 w-6 stroke-[2.2]" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                                Kelola Guru Pembimbing
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Kelola data master Guru Pembimbing SMK Amaliah yang mendampingi dan memonitor siswa PKL.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="bg-[#008953] hover:bg-[#007346] active:bg-[#00623a] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-5 shadow-sm shadow-emerald-900/10 transition-all flex items-center gap-2 self-start sm:self-auto hover:translate-y-[-1px]"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        <span>Tambah Guru Baru</span>
                    </Button>
                </div>

                {/* Error Banner */}
                {errors?.error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs font-semibold text-red-700 flex items-center gap-2.5 shadow-2xs">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                        <span>{errors.error}</span>
                    </div>
                )}

                {/* Filter & Search Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Search Field */}
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan nama guru, email, atau NIP..."
                            className="h-10 pl-10 border-0 bg-slate-50/60 hover:bg-slate-100/80 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-none transition"
                        />
                    </form>

                    {/* Dropdown Filters without Emojis */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="h-10 px-3.5 py-1.5 bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition min-w-[190px]"
                        >
                            <option value="">Semua Status Pembimbing</option>
                            <option value="assigned">Aktif Membimbing Siswa</option>
                            <option value="unassigned">Belum Ada Siswa Binaan</option>
                        </select>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-10 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1.5"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#008953] text-white">
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider rounded-tl-xl">
                                        Guru Pembimbing
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                                        Email & Kontak
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-center">
                                        Siswa Binaan
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-right rounded-tr-xl">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
                                {teachers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <GraduationCap className="h-6 w-6" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">
                                                    Tidak ada data guru pembimbing ditemukan
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {hasActiveFilters
                                                        ? 'Coba sesuaikan kata kunci pencarian atau filter status.'
                                                        : 'Silakan tambahkan akun guru pembimbing baru terlebih dahulu.'}
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
                                    teachers.data.map((teacher) => {
                                        const phoneNum = teacher.phone_number || teacher.phone;
                                        const count = teacher.students_count || 0;

                                        return (
                                            <tr
                                                key={teacher.id}
                                                className="hover:bg-slate-50/70 transition-colors"
                                            >
                                                {/* Guru Info */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#008953] font-bold text-xs ring-1 ring-emerald-600/20">
                                                            {getInitials(teacher.name)}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/teachers/${teacher.slug || teacher.id}`}
                                                                className="font-bold text-slate-900 hover:text-[#008953] hover:underline"
                                                            >
                                                                {teacher.name}
                                                            </Link>
                                                            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                                                                NIP: {teacher.nis_nip || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact & Email */}
                                                <td className="px-5 py-4">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                            <span className="text-xs font-medium">{teacher.email}</span>
                                                        </div>
                                                        {phoneNum ? (
                                                            <div className="flex items-center gap-2 text-slate-600">
                                                                <Phone className="h-3.5 w-3.5 text-[#008953] shrink-0" />
                                                                <a
                                                                    href={`https://wa.me/${phoneNum.replace(/[^0-9]/g, '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs font-semibold text-[#008953] hover:underline"
                                                                >
                                                                    {phoneNum}
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                                                <span>No. HP belum diisi</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Siswa Binaan */}
                                                <td className="px-5 py-4 text-center">
                                                    {count > 0 ? (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#008953] text-xs font-bold border border-emerald-200/80 shadow-2xs">
                                                            <Users className="h-3.5 w-3.5 shrink-0" />
                                                            <span>{count} Siswa Dibimbing</span>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200/80 shadow-2xs">
                                                            <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                                            <span>Belum Ada Siswa</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Action Buttons */}
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={`/teachers/${teacher.slug || teacher.id}`}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs"
                                                            title="Lihat Profil Guru"
                                                        >
                                                            <Eye className="h-4 w-4 stroke-[2]" />
                                                        </Link>
                                                        <button
                                                            onClick={() => openEditDialog(teacher)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs"
                                                            title="Edit Guru"
                                                        >
                                                            <Edit3 className="h-4 w-4 stroke-[2]" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTeacher(teacher)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition shadow-2xs"
                                                            title="Hapus Guru"
                                                        >
                                                            <Trash2 className="h-4 w-4 stroke-[2]" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {teachers.total > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-medium">
                                Menampilkan{' '}
                                <strong className="font-bold text-slate-800">
                                    {teachers.from || (teachers.data.length > 0 ? 1 : 0)}
                                </strong>{' '}
                                sampai{' '}
                                <strong className="font-bold text-slate-800">
                                    {teachers.to || teachers.data.length}
                                </strong>{' '}
                                dari{' '}
                                <strong className="font-bold text-slate-800">
                                    {teachers.total}
                                </strong>{' '}
                                guru pembimbing
                            </span>

                            {teachers.links && teachers.links.length > 3 && (
                                <div className="flex items-center gap-1">
                                    {teachers.links.map((link, idx) => {
                                        const isPrev = idx === 0;
                                        const isNext = idx === teachers.links.length - 1;

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

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md max-h-[88vh] overflow-y-auto p-4 sm:p-6 rounded-2xl bg-white border border-slate-200">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8f2e5] text-[#008953]">
                                <GraduationCap className="h-5 w-5 stroke-[2.5]" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                                    {editingTeacher
                                        ? 'Edit Data Guru Pembimbing'
                                        : 'Tambah Guru Pembimbing Baru'}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 font-medium">
                                    Lengkapi informasi akun Guru Pembimbing SMK Amaliah.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Nama Guru */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                                Nama Lengkap & Gelar *
                            </Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: Drs. H. Ahmad Sanusi, M.Pd."
                                className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                            />
                            {errors?.name && (
                                <p className="text-[11px] font-semibold text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Email & NIP */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                                    Email Akun *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="guru@smkamaliah.sch.id"
                                    className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                />
                                {errors?.email && (
                                    <p className="text-[11px] font-semibold text-red-500">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="nis_nip" className="text-xs font-bold text-slate-700">
                                    NIP / Kode Guru
                                </Label>
                                <Input
                                    id="nis_nip"
                                    value={form.nis_nip}
                                    onChange={(e) => setForm({ ...form, nis_nip: e.target.value })}
                                    placeholder="198501012010011001"
                                    className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                />
                                {errors?.nis_nip && (
                                    <p className="text-[11px] font-semibold text-red-500">{errors.nis_nip}</p>
                                )}
                            </div>
                        </div>

                        {/* Phone & Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="phone_number" className="text-xs font-bold text-slate-700">
                                    No. WhatsApp / HP
                                </Label>
                                <Input
                                    id="phone_number"
                                    value={form.phone_number}
                                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                                    placeholder="081234567890"
                                    className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                />
                                {errors?.phone_number && (
                                    <p className="text-[11px] font-semibold text-red-500">{errors.phone_number}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                                    {editingTeacher ? 'Password (Opsional)' : 'Password *'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required={!editingTeacher}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder={editingTeacher ? 'Kosongkan jika tetap' : 'Min. 8 karakter'}
                                    className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                />
                                {errors?.password && (
                                    <p className="text-[11px] font-semibold text-red-500">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="h-10 rounded-xl text-slate-600 font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="h-10 rounded-xl bg-[#008953] hover:bg-[#007346] font-bold text-white shadow-xs"
                            >
                                {editingTeacher ? 'Simpan Perubahan' : 'Simpan Data Guru'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTeacher} onOpenChange={() => setDeleteTeacher(null)}>
                <DialogContent className="sm:max-w-md p-5 rounded-2xl bg-white border border-slate-200">
                    <DialogHeader className="gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Hapus Akun Guru Pembimbing
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                            Apakah Anda yakin ingin menghapus akun Guru <strong>{deleteTeacher?.name}</strong>? Tindakan ini hanya dapat dilakukan bila guru tidak sedang mendampingi siswa aktif.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTeacher(null)}
                            className="h-10 rounded-xl text-slate-600 font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700"
                        >
                            Ya, Hapus Guru
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
