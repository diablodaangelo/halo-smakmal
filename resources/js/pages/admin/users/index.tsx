import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Edit2,
    GraduationCap,
    Mail,
    Phone,
    Plus,
    Search,
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
    role: 'siswa' | 'guru_pembimbing';
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
    students_count?: number;
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
        role: 'siswa' | 'guru_pembimbing';
        search: string;
    };
    counts: {
        siswa: number;
        guru_pembimbing: number;
    };
    companies: CompanyItem[];
    teachers: TeacherItem[];
    errors?: Record<string, string>;
}

export default function UsersIndex({ users, filters, counts, companies, teachers, errors }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const currentRole = filters.role || 'siswa';
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deleteUser, setDeleteUser] = useState<UserData | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        nis_nip: '',
        phone_number: '',
        role: currentRole as 'siswa' | 'guru_pembimbing',
        password: '',
        company_id: '',
        mentor_teacher_id: '',
    });

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/users',
            {
                role: currentRole,
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    const handleRoleTabChange = (role: 'siswa' | 'guru_pembimbing') => {
        router.get(
            '/admin/users',
            {
                role,
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
            role: currentRole,
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
            company_id: form.role === 'siswa' && form.company_id ? Number(form.company_id) : null,
            mentor_teacher_id:
                form.role === 'siswa' && form.mentor_teacher_id ? Number(form.mentor_teacher_id) : null,
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

    return (
        <>
            <Head title={`Kelola ${currentRole === 'siswa' ? 'Siswa' : 'Guru Pembimbing'}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Kelola Akun {currentRole === 'siswa' ? 'Siswa PKL' : 'Guru Pembimbing'}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {currentRole === 'siswa'
                                ? 'Kelola akun siswa, tentukan perusahaan tempat PKL dan pasangkan Guru Pembimbing.'
                                : 'Kelola akun Guru Pembimbing SMK untuk memonitor absensi dan kegiatan siswa.'}
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah {currentRole === 'siswa' ? 'Siswa' : 'Guru Pembimbing'}
                    </Button>
                </div>

                {/* Error Banner */}
                {errors?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                        {errors.error}
                    </div>
                )}

                {/* Main Tabs (Siswa & Guru Only) */}
                <div className="flex items-center gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
                    <button
                        onClick={() => handleRoleTabChange('siswa')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                            currentRole === 'siswa'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        <span>Data Siswa PKL</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${currentRole === 'siswa' ? 'bg-emerald-700 text-emerald-100' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'}`}>
                            {counts.siswa}
                        </span>
                    </button>

                    <button
                        onClick={() => handleRoleTabChange('guru_pembimbing')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                            currentRole === 'guru_pembimbing'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                    >
                        <GraduationCap className="h-4 w-4" />
                        <span>Data Guru Pembimbing</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${currentRole === 'guru_pembimbing' ? 'bg-blue-700 text-blue-100' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'}`}>
                            {counts.guru_pembimbing}
                        </span>
                    </button>
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
                                    placeholder={
                                        currentRole === 'siswa'
                                            ? 'Cari nama siswa, NIS/NISN, atau email...'
                                            : 'Cari nama guru, NIP, atau email...'
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table View */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                        <CardTitle className="text-base font-semibold">
                            Daftar {currentRole === 'siswa' ? 'Siswa PKL' : 'Guru Pembimbing'} ({users.total})
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <tr>
                                    <th className="px-6 py-3.5">Nama & Identitas</th>
                                    <th className="px-6 py-3.5">Kontak</th>
                                    {currentRole === 'siswa' ? (
                                        <>
                                            <th className="px-6 py-3.5">Perusahaan DUDI</th>
                                            <th className="px-6 py-3.5">Guru Pembimbing</th>
                                        </>
                                    ) : (
                                        <th className="px-6 py-3.5 text-center">Jumlah Siswa Binaan</th>
                                    )}
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={currentRole === 'siswa' ? 5 : 4}
                                            className="py-8 text-center text-neutral-500"
                                        >
                                            Belum ada data {currentRole === 'siswa' ? 'siswa' : 'guru pembimbing'} yang terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50"
                                        >
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
                                                {user.phone_number ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                                                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                                        <span>{user.phone_number}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">-</span>
                                                )}
                                            </td>

                                            {/* Extra columns for Siswa */}
                                            {currentRole === 'siswa' && (
                                                <>
                                                    <td className="px-6 py-4">
                                                        {user.company ? (
                                                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                                                <span>{user.company.name}</span>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="outline" className="border-amber-400 text-amber-700 dark:border-amber-700 dark:text-amber-400 text-[11px]">
                                                                Belum DUDI
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.mentor_teacher ? (
                                                            <div className="flex items-center gap-1.5 text-xs text-neutral-800 dark:text-neutral-200">
                                                                <GraduationCap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                                                <span>{user.mentor_teacher.name}</span>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="outline" className="border-blue-400 text-blue-700 dark:border-blue-700 dark:text-blue-400 text-[11px]">
                                                                Belum Ada Guru
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {/* Extra column for Guru */}
                                            {currentRole === 'guru_pembimbing' && (
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                                        <Users className="h-3.5 w-3.5" />
                                                        <span>{user.students_count || 0} Siswa Dibimbing</span>
                                                    </div>
                                                </td>
                                            )}

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
                            {editingUser
                                ? `Edit Data ${form.role === 'siswa' ? 'Siswa' : 'Guru Pembimbing'}`
                                : `Tambah ${form.role === 'siswa' ? 'Siswa Baru' : 'Guru Pembimbing Baru'}`}
                        </DialogTitle>
                        <DialogDescription>
                            {form.role === 'siswa'
                                ? 'Lengkapi data identitas siswa serta tentukan penempatan perusahaan dan guru pembimbingnya.'
                                : 'Lengkapi data akun Guru Pembimbing SMK Amaliah.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                {form.role === 'siswa' ? 'Nama Lengkap Siswa *' : 'Nama Lengkap Guru (beserta Gelar) *'}
                            </Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder={form.role === 'siswa' ? 'Contoh: Ahmad Fauzan' : 'Contoh: Drs. Budi Santoso, M.Pd.'}
                            />
                            {errors?.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Akun *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder={form.role === 'siswa' ? 'siswa@smkamaliah.sch.id' : 'guru@smkamaliah.sch.id'}
                                />
                                {errors?.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nis_nip">
                                    {form.role === 'siswa' ? 'NIS / NISN' : 'NIP / Kode Guru'}
                                </Label>
                                <Input
                                    id="nis_nip"
                                    value={form.nis_nip}
                                    onChange={(e) => setForm({ ...form, nis_nip: e.target.value })}
                                    placeholder={form.role === 'siswa' ? '212210001' : '198501012010011001'}
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
                                    {editingUser ? 'Password (Kosongkan jika tetap)' : 'Password *'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required={!editingUser}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder={editingUser ? '••••••••' : 'Min. 8 karakter'}
                                />
                                {errors?.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                        </div>

                        {/* Direct Assignment for Siswa */}
                        {form.role === 'siswa' && (
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
                        )}

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                {editingUser ? 'Simpan Perubahan' : 'Simpan Data'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Data</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus akun <strong>{deleteUser?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
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
