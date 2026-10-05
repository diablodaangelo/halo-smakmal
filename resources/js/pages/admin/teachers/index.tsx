import { Head, router } from '@inertiajs/react';
import {
    Edit2,
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

interface Teacher {
    id: number;
    name: string;
    email: string;
    nis_nip?: string | null;
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
}

interface Props {
    teachers: TeachersResponse;
    filters: {
        search?: string;
    };
    errors?: Record<string, string>;
}

export default function TeachersIndex({ teachers, filters, errors }: Props) {
    const [search, setSearch] = useState(filters.search || '');
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/teachers', { search }, { preserveState: true });
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
            phone_number: teacher.phone_number || '',
            password: '',
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

    return (
        <>
            <Head title="Kelola Guru Pembimbing" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Kelola Guru Pembimbing
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola data master Guru Pembimbing SMK Amaliah 1 & 2 Ciawi yang memonitor siswa PKL.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Guru
                    </Button>
                </div>

                {/* Error Banner */}
                {errors?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                        {errors.error}
                    </div>
                )}

                {/* Search */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama guru, NIP, atau email..."
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                        <CardTitle className="text-base font-semibold">
                            Daftar Guru Pembimbing ({teachers.total})
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <tr>
                                    <th className="px-6 py-3.5">Nama & NIP</th>
                                    <th className="px-6 py-3.5">Email</th>
                                    <th className="px-6 py-3.5">No. WhatsApp / HP</th>
                                    <th className="px-6 py-3.5 text-center">Siswa Binaan</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {teachers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                                            Belum ada data guru pembimbing yang terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    teachers.data.map((teacher) => (
                                        <tr
                                            key={teacher.id}
                                            className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                                        <GraduationCap className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-neutral-900 dark:text-white">
                                                            {teacher.name}
                                                        </div>
                                                        <div className="text-xs text-neutral-500">
                                                            NIP: {teacher.nis_nip || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-neutral-600 dark:text-neutral-300">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5 text-neutral-400" />
                                                    <span>{teacher.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {teacher.phone_number ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                                                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                                        <span>{teacher.phone_number}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>{teacher.students_count || 0} Siswa Dibimbing</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(teacher)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setDeleteTeacher(teacher)}
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
                    {teachers.links && teachers.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                            <span className="text-xs text-neutral-500">
                                Menampilkan halaman {teachers.current_page} dari {teachers.last_page}
                            </span>
                            <div className="flex gap-1">
                                {teachers.links.map((link, idx) => (
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTeacher ? 'Edit Data Guru Pembimbing' : 'Tambah Guru Pembimbing Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Lengkapi data akun Guru Pembimbing SMK Amaliah.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap & Gelar *</Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: Drs. H. Ahmad Sanusi, M.Pd."
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
                                    placeholder="guru@smkamaliah.sch.id"
                                />
                                {errors?.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nis_nip">NIP / Kode Guru</Label>
                                <Input
                                    id="nis_nip"
                                    value={form.nis_nip}
                                    onChange={(e) => setForm({ ...form, nis_nip: e.target.value })}
                                    placeholder="198501012010011001"
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
                                    {editingTeacher ? 'Password (Opsional)' : 'Password *'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required={!editingTeacher}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder={editingTeacher ? '••••••••' : 'Min. 8 karakter'}
                                />
                                {errors?.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                {editingTeacher ? 'Simpan Perubahan' : 'Simpan Data Guru'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTeacher} onOpenChange={() => setDeleteTeacher(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Guru</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus akun Guru <strong>{deleteTeacher?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteTeacher(null)}>
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
