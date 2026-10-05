import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Edit2,
    Filter,
    GraduationCap,
    Mail,
    Phone,
    Plus,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    phone_number?: string | null;
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
    students: StudentsResponse;
    filters: {
        search?: string;
        company_id?: string;
        teacher_id?: string;
    };
    companies: CompanyItem[];
    teachers: TeacherItem[];
    errors?: Record<string, string>;
}

export default function StudentsIndex({
    students,
    filters,
    companies,
    teachers,
    errors,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [companyFilter, setCompanyFilter] = useState(filters.company_id || '');
    const [teacherFilter, setTeacherFilter] = useState(filters.teacher_id || '');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        nis_nip: '',
        phone_number: '',
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
            { preserveState: true }
        );
    };

    const handleFilterChange = (key: 'company' | 'teacher', value: string) => {
        if (key === 'company') {
            setCompanyFilter(value);
            router.get(
                '/admin/students',
                {
                    search: search || undefined,
                    company_id: value || undefined,
                    teacher_id: teacherFilter || undefined,
                },
                { preserveState: true }
            );
        } else {
            setTeacherFilter(value);
            router.get(
                '/admin/students',
                {
                    search: search || undefined,
                    company_id: companyFilter || undefined,
                    teacher_id: value || undefined,
                },
                { preserveState: true }
            );
        }
    };

    const openCreateDialog = () => {
        setEditingStudent(null);
        setForm({
            name: '',
            email: '',
            nis_nip: '',
            phone_number: '',
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
            phone_number: student.phone_number || '',
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
            phone_number: form.phone_number || null,
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

    return (
        <>
            <Head title="Kelola Siswa PKL" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Kelola Siswa PKL
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola akun siswa PKL, penempatan kantor DUDI, serta penugasan Guru Pembimbing.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Siswa
                    </Button>
                </div>

                {/* Error Banner */}
                {errors?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                        {errors.error}
                    </div>
                )}

                {/* Filters and Search */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari nama siswa, NIS/NISN, atau email..."
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Cari
                                </Button>
                            </form>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* DUDI Filter */}
                                <select
                                    value={companyFilter}
                                    onChange={(e) => handleFilterChange('company', e.target.value)}
                                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <option value="">Semua Perusahaan DUDI</option>
                                    <option value="unassigned">⚠️ Belum Ada DUDI</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Teacher Filter */}
                                <select
                                    value={teacherFilter}
                                    onChange={(e) => handleFilterChange('teacher', e.target.value)}
                                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <option value="">Semua Guru Pembimbing</option>
                                    <option value="unassigned">⚠️ Belum Ada Guru</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                        <CardTitle className="text-base font-semibold">
                            Daftar Siswa PKL ({students.total})
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <tr>
                                    <th className="px-6 py-3.5">Nama & NIS/NISN</th>
                                    <th className="px-6 py-3.5">Kontak</th>
                                    <th className="px-6 py-3.5">Perusahaan DUDI</th>
                                    <th className="px-6 py-3.5">Guru Pembimbing</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                                            Belum ada data siswa PKL yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">
                                                        {student.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                        <span>{student.email}</span>
                                                        {student.nis_nip && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="font-mono">{student.nis_nip}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.phone_number ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                                                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                                        <span>{student.phone_number}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.company ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                                                        <span>{student.company.name}</span>
                                                    </div>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-amber-400 text-amber-700 dark:border-amber-700 dark:text-amber-400 text-[11px]"
                                                    >
                                                        Belum Ditentukan
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.mentor_teacher ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-neutral-800 dark:text-neutral-200">
                                                        <GraduationCap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                                        <span>{student.mentor_teacher.name}</span>
                                                    </div>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-blue-400 text-blue-700 dark:border-blue-700 dark:text-blue-400 text-[11px]"
                                                    >
                                                        Belum Ada Guru
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(student)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setDeleteStudent(student)}
                                                        className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
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
                    {students.links && students.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                            <span className="text-xs text-neutral-500">
                                Menampilkan halaman {students.current_page} dari {students.last_page}
                            </span>
                            <div className="flex gap-1">
                                {students.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="h-8 text-xs"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingStudent ? 'Edit Data Siswa PKL' : 'Tambah Siswa PKL Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Isi data siswa dan tentukan penempatan perusahaan DUDI serta Guru Pembimbingnya.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap Siswa *</Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: Muhammad Rizky Pratama"
                            />
                            {errors?.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="siswa@smkamaliah.sch.id"
                                />
                                {errors?.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nis_nip">NIS / NISN</Label>
                                <Input
                                    id="nis_nip"
                                    value={form.nis_nip}
                                    onChange={(e) => setForm({ ...form, nis_nip: e.target.value })}
                                    placeholder="212210001"
                                />
                                {errors?.nis_nip && <p className="text-xs text-red-500">{errors.nis_nip}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="phone_number">No. WhatsApp / HP</Label>
                                <Input
                                    id="phone_number"
                                    value={form.phone_number}
                                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                                    placeholder="081234567890"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {editingStudent ? 'Password (Opsional)' : 'Password *'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required={!editingStudent}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder={editingStudent ? '••••••••' : 'Min. 8 karakter'}
                                />
                                {errors?.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                        </div>

                        {/* Direct Placement Settings */}
                        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                            <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                                Penempatan PKL & Pembimbing
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="company_id" className="text-xs text-neutral-700 dark:text-neutral-300">
                                        Perusahaan / DUDI
                                    </Label>
                                    <select
                                        id="company_id"
                                        value={form.company_id}
                                        onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
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
                                    <Label htmlFor="mentor_teacher_id" className="text-xs text-neutral-700 dark:text-neutral-300">
                                        Guru Pembimbing
                                    </Label>
                                    <select
                                        id="mentor_teacher_id"
                                        value={form.mentor_teacher_id}
                                        onChange={(e) => setForm({ ...form, mentor_teacher_id: e.target.value })}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
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

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                {editingStudent ? 'Simpan Perubahan' : 'Simpan Data Siswa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Siswa</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus akun Siswa <strong>{deleteStudent?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteStudent(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
