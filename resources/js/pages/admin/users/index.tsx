import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Edit2,
    GraduationCap,
    KeyRound,
    Mail,
    Phone,
    Plus,
    Search,
    Shield,
    Trash2,
    UserCheck,
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

interface UserData {
    id: number;
    name: string;
    email: string;
    nis_nip?: string | null;
    phone_number?: string | null;
    role: 'admin' | 'guru_pembimbing' | 'pembimbing_dudi' | 'siswa';
    company_id?: number | null;
    mentor_teacher_id?: number | null;
    company?: {
        id: number;
        name: string;
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

interface UsersResponse {
    data: UserData[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    users: UsersResponse;
    filters: {
        role: string;
        search: string;
    };
    companies: CompanyItem[];
    teachers: TeacherItem[];
    errors?: Record<string, string>;
}

export default function UsersIndex({ users, filters, companies, teachers, errors }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [currentRole, setCurrentRole] = useState(filters.role || 'all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deleteUser, setDeleteUser] = useState<UserData | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        nis_nip: '',
        phone_number: '',
        role: 'siswa' as 'admin' | 'guru_pembimbing' | 'pembimbing_dudi' | 'siswa',
        password: '',
        company_id: '',
        mentor_teacher_id: '',
    });

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/users',
            {
                role: currentRole !== 'all' ? currentRole : undefined,
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    const handleRoleTabChange = (role: string) => {
        setCurrentRole(role);
        router.get(
            '/admin/users',
            {
                role: role !== 'all' ? role : undefined,
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    const openCreateDialog = () => {
        setEditingUser(null);
        setForm({
            name: '',
            email: '',
            nis_nip: '',
            phone_number: '',
            role: (currentRole !== 'all' ? currentRole : 'siswa') as any,
            password: '',
            company_id: '',
            mentor_teacher_id: '',
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (user: UserData) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            nis_nip: user.nis_nip || '',
            phone_number: user.phone_number || '',
            role: user.role,
            password: '',
            company_id: user.company_id ? String(user.company_id) : '',
            mentor_teacher_id: user.mentor_teacher_id ? String(user.mentor_teacher_id) : '',
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
            role: form.role,
            company_id: form.company_id ? Number(form.company_id) : null,
            mentor_teacher_id: form.mentor_teacher_id ? Number(form.mentor_teacher_id) : null,
        };

        if (form.password) {
            payload.password = form.password;
        }

        if (editingUser) {
            router.put(`/admin/users/${editingUser.id}`, payload, {
                onSuccess: () => setIsDialogOpen(false),
            });
        } else {
            router.post('/admin/users', payload, {
                onSuccess: () => setIsDialogOpen(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteUser) return;
        router.delete(`/admin/users/${deleteUser.id}`, {
            onSuccess: () => setDeleteUser(null),
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300">Administrator</Badge>;
            case 'guru_pembimbing':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300">Guru Pembimbing</Badge>;
            case 'pembimbing_dudi':
                return <Badge className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300">Pembimbing DUDI</Badge>;
            case 'siswa':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">Siswa PKL</Badge>;
            default:
                return <Badge variant="secondary">{role}</Badge>;
        }
    };

    return (
        <>
            <Head title="Kelola Pengguna" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Kelola Akun & Pengguna
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola master akun Guru Pembimbing, Pembimbing DUDI, Siswa PKL, dan Administrator.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Pengguna
                    </Button>
                </div>

                {/* Error Banner */}
                {errors?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                        {errors.error}
                    </div>
                )}

                {/* Role Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-2 dark:border-neutral-800">
                    {[
                        { key: 'all', label: 'Semua Pengguna' },
                        { key: 'guru_pembimbing', label: 'Guru Pembimbing' },
                        { key: 'siswa', label: 'Siswa PKL' },
                        { key: 'pembimbing_dudi', label: 'Pembimbing DUDI' },
                        { key: 'admin', label: 'Administrator' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleRoleTabChange(tab.key)}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                                currentRole === tab.key
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, email, atau NIS/NIP..."
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
                            Daftar Pengguna ({users.total})
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <tr>
                                    <th className="px-6 py-3.5">Nama & Identitas</th>
                                    <th className="px-6 py-3.5">Role</th>
                                    <th className="px-6 py-3.5">Kontak</th>
                                    <th className="px-6 py-3.5">Penempatan / Pembimbing</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                                            Tidak ada data pengguna yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">
                                                        {user.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                        <span>{user.email}</span>
                                                        {user.nis_nip && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="font-mono">{user.nis_nip}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.phone_number ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                                                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                                        <span>{user.phone_number}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-xs">
                                                    {user.role === 'siswa' && (
                                                        <>
                                                            <div className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
                                                                <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                                <span className="font-medium">
                                                                    {user.company ? user.company.name : <span className="text-amber-600">Belum di-plot DUDI</span>}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-neutral-500">
                                                                <GraduationCap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                                                <span>
                                                                    {user.mentor_teacher ? user.mentor_teacher.name : <span className="text-amber-600">Belum ada Guru</span>}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {user.role === 'pembimbing_dudi' && (
                                                        <div className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
                                                            <Building2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                                                            <span>{user.company?.name || '-'}</span>
                                                        </div>
                                                    )}
                                                    {user.role === 'guru_pembimbing' && (
                                                        <span className="text-neutral-500">Guru Pembimbing SMK</span>
                                                    )}
                                                    {user.role === 'admin' && (
                                                        <span className="text-neutral-500">Admin Administrator</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(user)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setDeleteUser(user)}
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
                    {users.links && users.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                            <span className="text-xs text-neutral-500">
                                Menampilkan halaman {users.current_page} dari {users.last_page}
                            </span>
                            <div className="flex gap-1">
                                {users.links.map((link, idx) => (
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
                            {editingUser ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Pendaftaran mandiri dinonaktifkan. Seluruh akun dibuat dan dikelola oleh Admin.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Role selection */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role / Peran Pengguna *</Label>
                            <select
                                id="role"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                            >
                                <option value="siswa">Siswa PKL</option>
                                <option value="guru_pembimbing">Guru Pembimbing</option>
                                <option value="pembimbing_dudi">Pembimbing DUDI / Perusahaan</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap *</Label>
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
                                    placeholder="nama@smkamaliah.sch.id"
                                />
                                {errors?.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nis_nip">NIS / NIP / NISN</Label>
                                <Input
                                    id="nis_nip"
                                    value={form.nis_nip}
                                    onChange={(e) => setForm({ ...form, nis_nip: e.target.value })}
                                    placeholder="Contoh: 212210001"
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
                                    {editingUser ? 'Password (Kosongkan jika tidak diubah)' : 'Password *'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required={!editingUser}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder={editingUser ? '••••••••' : 'Minimal 8 karakter'}
                                />
                                {errors?.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                        </div>

                        {/* Company selector for Pembimbing DUDI */}
                        {form.role === 'pembimbing_dudi' && (
                            <div className="space-y-2 rounded-lg border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-900 dark:bg-purple-950/30">
                                <Label htmlFor="company_id" className="text-purple-900 dark:text-purple-300">
                                    Pilih Perusahaan Mitra DUDI *
                                </Label>
                                <select
                                    id="company_id"
                                    required
                                    value={form.company_id}
                                    onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <option value="">-- Pilih Perusahaan --</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors?.company_id && <p className="text-xs text-red-500">{errors.company_id}</p>}
                            </div>
                        )}

                        {/* Plotting for Siswa */}
                        {form.role === 'siswa' && (
                            <div className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                                <div className="space-y-2">
                                    <Label htmlFor="student_company" className="text-xs">
                                        Perusahaan DUDI
                                    </Label>
                                    <select
                                        id="student_company"
                                        value={form.company_id}
                                        onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                                    >
                                        <option value="">-- Belum Ditempatkan --</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="student_teacher" className="text-xs">
                                        Guru Pembimbing
                                    </Label>
                                    <select
                                        id="student_teacher"
                                        value={form.mentor_teacher_id}
                                        onChange={(e) => setForm({ ...form, mentor_teacher_id: e.target.value })}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                                    >
                                        <option value="">-- Belum Dipilihkan Guru --</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} {t.nis_nip ? `(${t.nis_nip})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                {editingUser ? 'Simpan Perubahan' : 'Buat Akun'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Pengguna</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus akun <strong>{deleteUser?.name}</strong> ({deleteUser?.role})?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>
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
