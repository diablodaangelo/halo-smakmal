import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Clock,
    Crosshair,
    Edit2,
    MapPin,
    Plus,
    Radio,
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

interface Company {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    check_in_start: string;
    check_in_end: string;
    check_out_start: string;
    students_count?: number;
    mentors_count?: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface CompaniesResponse {
    data: Company[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    companies: CompaniesResponse;
    filters: {
        search?: string;
    };
    errors?: Record<string, string>;
}

export default function CompaniesIndex({ companies, filters, errors }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);

    const [form, setForm] = useState({
        name: '',
        address: '',
        latitude: '-6.6631',
        longitude: '106.8580',
        radius_meters: 100,
        check_in_start: '07:00',
        check_in_end: '08:00',
        check_out_start: '16:00',
    });

    const [gettingLocation, setGettingLocation] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/companies', { search }, { preserveState: true });
    };

    const openCreateDialog = () => {
        setEditingCompany(null);
        setForm({
            name: '',
            address: '',
            latitude: '-6.6631',
            longitude: '106.8580',
            radius_meters: 100,
            check_in_start: '07:00',
            check_in_end: '08:00',
            check_out_start: '16:00',
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (company: Company) => {
        setEditingCompany(company);
        setForm({
            name: company.name,
            address: company.address,
            latitude: String(company.latitude),
            longitude: String(company.longitude),
            radius_meters: company.radius_meters,
            check_in_start: company.check_in_start.substring(0, 5),
            check_in_end: company.check_in_end.substring(0, 5),
            check_out_start: company.check_out_start.substring(0, 5),
        });
        setIsDialogOpen(true);
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Browser tidak mendukung geolokasi');
            return;
        }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm((prev) => ({
                    ...prev,
                    latitude: pos.coords.latitude.toFixed(6),
                    longitude: pos.coords.longitude.toFixed(6),
                }));
                setGettingLocation(false);
            },
            () => {
                alert('Gagal mengambil koordinat lokasi terkini.');
                setGettingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCompany) {
            router.put(`/admin/companies/${editingCompany.id}`, form, {
                onSuccess: () => setIsDialogOpen(false),
            });
        } else {
            router.post('/admin/companies', form, {
                onSuccess: () => setIsDialogOpen(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteCompany) return;
        router.delete(`/admin/companies/${deleteCompany.id}`, {
            onSuccess: () => setDeleteCompany(null),
        });
    };

    return (
        <>
            <Head title="Data Perusahaan / DUDI" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Master Perusahaan & DUDI
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola data instansi mitra PKL SMK Amaliah 1 & 2 Ciawi, koordinat GPS geofence, dan jam operasional.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Perusahaan
                    </Button>
                </div>

                {/* Error Banner */}
                {errors?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                        {errors.error}
                    </div>
                )}

                {/* Filter and Search */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama instansi atau alamat kantor..."
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table list */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">
                                Daftar Mitra DUDI ({companies.total})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <tr>
                                    <th className="px-6 py-3.5">Instansi / DUDI</th>
                                    <th className="px-6 py-3.5">Koordinat & Radius</th>
                                    <th className="px-6 py-3.5">Jam Masuk / Pulang</th>
                                    <th className="px-6 py-3.5 text-center">Siswa Aktif</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {companies.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                                            Belum ada data perusahaan / DUDI yang terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    companies.data.map((company) => (
                                        <tr key={company.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-neutral-900 dark:text-white">
                                                            {company.name}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                            <MapPin className="h-3 w-3 shrink-0" />
                                                            <span className="line-clamp-1">{company.address}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-300">
                                                    <div className="font-mono text-[11px]">
                                                        {company.latitude}, {company.longitude}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Radio className="h-3 w-3 text-emerald-600" />
                                                        <span className="font-medium">{company.radius_meters} Meter</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-300">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3 text-blue-500" />
                                                        <span>Masuk: {company.check_in_start.substring(0, 5)} - {company.check_in_end.substring(0, 5)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3 text-amber-500" />
                                                        <span>Pulang: Mulai {company.check_out_start.substring(0, 5)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>{company.students_count || 0} Siswa</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(company)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setDeleteCompany(company)}
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
                    {companies.links && companies.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                            <span className="text-xs text-neutral-500">
                                Menampilkan halaman {companies.current_page} dari {companies.last_page}
                            </span>
                            <div className="flex gap-1">
                                {companies.links.map((link, idx) => (
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
                            {editingCompany ? 'Edit Data Perusahaan DUDI' : 'Tambah Perusahaan DUDI Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Pastikan data koordinat GPS dan jam operasional absensi telah terisi dengan benar.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Instansi / Perusahaan *</Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: PT Telkom Indonesia (Persero) Tbk"
                            />
                            {errors?.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat Lengkap *</Label>
                            <Input
                                id="address"
                                required
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Contoh: Jl. Raya Puncak No. 123, Ciawi, Bogor"
                            />
                            {errors?.address && <p className="text-xs text-red-500">{errors.address}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude GPS *</Label>
                                <Input
                                    id="latitude"
                                    required
                                    type="number"
                                    step="any"
                                    value={form.latitude}
                                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude GPS *</Label>
                                <Input
                                    id="longitude"
                                    required
                                    type="number"
                                    step="any"
                                    value={form.longitude}
                                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 p-2.5 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900">
                            <span>Ingin menggunakan koordinat saat ini?</span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={getCurrentLocation}
                                disabled={gettingLocation}
                                className="h-7 text-xs"
                            >
                                <Crosshair className="mr-1 h-3.5 w-3.5" />
                                {gettingLocation ? 'Mengambil...' : 'Ambil GPS Saat Ini'}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="radius_meters">Radius Geofence (Meter) *</Label>
                            <Input
                                id="radius_meters"
                                required
                                type="number"
                                min={10}
                                max={1000}
                                value={form.radius_meters}
                                onChange={(e) => setForm({ ...form, radius_meters: Number(e.target.value) })}
                            />
                            <p className="text-[11px] text-neutral-500">
                                Batas toleransi jarak siswa dari titik koordinat kantor (disarankan 50 - 150 meter).
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="check_in_start">Mulai Masuk</Label>
                                <Input
                                    id="check_in_start"
                                    type="time"
                                    required
                                    value={form.check_in_start}
                                    onChange={(e) => setForm({ ...form, check_in_start: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="check_in_end">Batas Masuk</Label>
                                <Input
                                    id="check_in_end"
                                    type="time"
                                    required
                                    value={form.check_in_end}
                                    onChange={(e) => setForm({ ...form, check_in_end: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="check_out_start">Mulai Pulang</Label>
                                <Input
                                    id="check_out_start"
                                    type="time"
                                    required
                                    value={form.check_out_start}
                                    onChange={(e) => setForm({ ...form, check_out_start: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                {editingCompany ? 'Simpan Perubahan' : 'Tambah Perusahaan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteCompany} onOpenChange={() => setDeleteCompany(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Perusahaan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus <strong>{deleteCompany?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteCompany(null)}>
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
