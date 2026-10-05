import { Head, router } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Clock,
    Crosshair,
    Edit2,
    ExternalLink,
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
        latitude: '-6.577449',
        longitude: '106.782421',
        radius_meters: 100,
        check_in_start: '07:00',
        check_in_end: '08:00',
        check_out_start: '16:00',
    });

    const [rawCoordinateInput, setRawCoordinateInput] = useState('');
    const [parsedSuccess, setParsedSuccess] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const parseCoordinates = (input: string) => {
        // Handle "-6.577449, 106.782421", "-6.577449 106.782421", or Google Maps URLs
        const regex = /(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/;
        const match = input.match(regex);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                return { lat: match[1], lng: match[2] };
            }
        }
        return null;
    };

    const handleCoordinatePaste = (val: string) => {
        setRawCoordinateInput(val);
        const parsed = parseCoordinates(val);
        if (parsed) {
            setForm((prev) => ({
                ...prev,
                latitude: parsed.lat,
                longitude: parsed.lng,
            }));
            setParsedSuccess(true);
        } else {
            setParsedSuccess(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/companies', { search }, { preserveState: true });
    };

    const openCreateDialog = () => {
        setEditingCompany(null);
        setForm({
            name: '',
            address: '',
            latitude: '-6.577449',
            longitude: '106.782421',
            radius_meters: 100,
            check_in_start: '07:00',
            check_in_end: '08:00',
            check_out_start: '16:00',
        });
        setRawCoordinateInput('-6.577449, 106.782421');
        setParsedSuccess(true);
        setIsDialogOpen(true);
    };

    const openEditDialog = (company: Company) => {
        setEditingCompany(company);
        const latStr = String(company.latitude);
        const lngStr = String(company.longitude);
        setForm({
            name: company.name,
            address: company.address,
            latitude: latStr,
            longitude: lngStr,
            radius_meters: company.radius_meters,
            check_in_start: company.check_in_start.substring(0, 5),
            check_in_end: company.check_in_end.substring(0, 5),
            check_out_start: company.check_out_start.substring(0, 5),
        });
        setRawCoordinateInput(`${latStr}, ${lngStr}`);
        setParsedSuccess(true);
        setIsDialogOpen(true);
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Browser tidak mendukung geolokasi.');
            return;
        }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                setForm((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                }));
                setRawCoordinateInput(`${lat}, ${lng}`);
                setParsedSuccess(true);
                setGettingLocation(false);
            },
            () => {
                alert('Gagal mengambil koordinat lokasi terkini.');
                setGettingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const openInGoogleMaps = () => {
        if (form.latitude && form.longitude) {
            window.open(
                `https://www.google.com/maps?q=${form.latitude},${form.longitude}`,
                '_blank'
            );
        }
    };

    const searchOnGoogleMaps = () => {
        const query = form.name || form.address || 'Bogor';
        window.open(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
            '_blank'
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
            <Head title="Master Perusahaan / DUDI - Admin" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Building2 className="h-4 w-4" />
                            <span>Master Data Instansi & DUDI • Administrator</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Master Perusahaan & DUDI
                        </h1>
                        <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola data mitra PKL, koordinat Maps (geofence), radius presensi, dan jam operasional.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-500 font-bold text-xs h-9 gap-1.5 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Tambah Perusahaan
                    </Button>
                </div>

                {/* Error Banner */}
                {errors?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                        {errors.error}
                    </div>
                )}

                {/* Search */}
                <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
                    <CardContent className="p-3.5">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama perusahaan atau alamat kantor DUDI..."
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="h-9 text-xs">
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table list */}
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/60 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                            Daftar Mitra DUDI ({companies.total})
                        </h3>
                        <span className="text-xs text-neutral-500">
                            Total: <strong>{companies.total} Mitra</strong>
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-100/70 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3.5 px-4">Instansi / DUDI</th>
                                    <th className="py-3.5 px-4">Koordinat Maps & Radius</th>
                                    <th className="py-3.5 px-4">Jam Masuk / Pulang</th>
                                    <th className="py-3.5 px-4 text-center">Siswa Aktif</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {companies.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-neutral-500">
                                            <Building2 className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                                            <p className="font-semibold text-sm">Belum ada data perusahaan DUDI.</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">Klik tombol "Tambah Perusahaan" untuk mendaftarkan mitra PKL.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    companies.data.map((company) => (
                                        <tr key={company.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-neutral-900 dark:text-white text-xs">
                                                            {company.name}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                            <MapPin className="h-3 w-3 shrink-0 text-neutral-400" />
                                                            <span className="line-clamp-1">{company.address}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <a
                                                        href={`https://www.google.com/maps?q=${company.latitude},${company.longitude}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-mono text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                                                        title="Buka di Google Maps"
                                                    >
                                                        <span>{company.latitude}, {company.longitude}</span>
                                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                                    </a>
                                                    <div className="flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                                                        <Radio className="h-3 w-3 text-emerald-600" />
                                                        <span>Radius: <strong>{company.radius_meters}m</strong></span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="space-y-0.5 text-[11px]">
                                                    <div className="text-neutral-700 dark:text-neutral-300">
                                                        Masuk: <strong>{company.check_in_start.substring(0, 5)} - {company.check_in_end.substring(0, 5)}</strong>
                                                    </div>
                                                    <div className="text-neutral-500">
                                                        Pulang: Mulai <strong>{company.check_out_start.substring(0, 5)}</strong>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                                    <Users className="h-3 w-3" />
                                                    <span>{company.students_count || 0} Siswa</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(company)}
                                                        className="h-7 text-xs px-2"
                                                    >
                                                        <Edit2 className="h-3 w-3 mr-1" />
                                                        <span>Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setDeleteCompany(company)}
                                                        className="h-7 text-xs px-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
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
                        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <span className="text-xs text-neutral-500">
                                Menampilkan {companies.data.length} dari {companies.total} mitra DUDI
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
                </div>
            </div>

            {/* Create / Edit Dialog with Google Maps Coordinate Parser */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader className="pb-1">
                        <DialogTitle className="text-base font-bold">
                            {editingCompany ? 'Edit Data Perusahaan DUDI' : 'Tambah Perusahaan DUDI Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Masukkan nama instansi, alamat, dan koordinat Google Maps untuk titik presensi siswa.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
                        {/* Nama Instansi */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">Nama Instansi / Perusahaan *</Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: PT Amaliah Digital Media"
                                className="h-9 text-xs"
                            />
                            {errors?.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        {/* Alamat */}
                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-xs font-semibold">Alamat Lengkap *</Label>
                            <Input
                                id="address"
                                required
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Contoh: Jl. Tol Ciawi No. 1, Bogor, Jawa Barat"
                                className="h-9 text-xs"
                            />
                            {errors?.address && <p className="text-xs text-red-500">{errors.address}</p>}
                        </div>

                        {/* Google Maps Smart Coordinate Box */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                    <span>Paste Koordinat Google Maps</span>
                                </Label>
                                {parsedSuccess && (
                                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Koordinat Valid</span>
                                    </span>
                                )}
                            </div>

                            <Input
                                value={rawCoordinateInput}
                                onChange={(e) => handleCoordinatePaste(e.target.value)}
                                placeholder="Paste koordinat misal: -6.577449, 106.782421 atau link Maps"
                                className="h-9 text-xs font-mono bg-white dark:bg-neutral-900 border-emerald-300 dark:border-emerald-800"
                            />
                            {(errors?.latitude || errors?.longitude) && (
                                <p className="text-[11px] font-semibold text-red-500">
                                    {errors.latitude || errors.longitude || 'Format koordinat tidak valid.'}
                                </p>
                            )}
                            <p className="text-[11px] text-neutral-500">
                                💡 <strong>Tips:</strong> Buka Google Maps, klik kanan lokasi kantor, lalu klik angka koordinat untuk menyalin (contoh: <code>-6.577449, 106.782421</code>).
                            </p>

                            {/* Tombol Aksi Maps */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={openInGoogleMaps}
                                    className="h-7 text-xs gap-1 bg-white dark:bg-neutral-900"
                                >
                                    <ExternalLink className="h-3 w-3 text-emerald-600" />
                                    <span>Cek di Google Maps</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={searchOnGoogleMaps}
                                    className="h-7 text-xs gap-1 bg-white dark:bg-neutral-900"
                                >
                                    <Search className="h-3 w-3 text-blue-600" />
                                    <span>Cari Lokasi di Maps</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={getCurrentLocation}
                                    disabled={gettingLocation}
                                    className="h-7 text-xs gap-1 bg-white dark:bg-neutral-900 ml-auto"
                                >
                                    <Crosshair className="h-3 w-3 text-neutral-600" />
                                    <span>{gettingLocation ? 'GPS...' : 'Ambil GPS Saya'}</span>
                                </Button>
                            </div>
                        </div>



                        {/* Radius Geofence */}
                        <div className="space-y-1.5">
                            <Label htmlFor="radius_meters" className="text-xs font-semibold">Radius Geofence (Meter) *</Label>
                            <Input
                                id="radius_meters"
                                required
                                type="number"
                                min={10}
                                max={1000}
                                value={form.radius_meters}
                                onChange={(e) => setForm({ ...form, radius_meters: Number(e.target.value) })}
                                className="h-9 text-xs"
                            />
                            <p className="text-[11px] text-neutral-400">
                                Jarak maksimal siswa dapat melakukan presensi dari titik kantor (disarankan 50 - 150 meter).
                            </p>
                        </div>

                        {/* Jam Operasional */}
                        <div className="grid grid-cols-3 gap-2.5">
                            <div className="space-y-1">
                                <Label htmlFor="check_in_start" className="text-[11px] font-semibold">Mulai Masuk</Label>
                                <Input
                                    id="check_in_start"
                                    type="time"
                                    required
                                    value={form.check_in_start}
                                    onChange={(e) => setForm({ ...form, check_in_start: e.target.value })}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="check_in_end" className="text-[11px] font-semibold">Batas Masuk</Label>
                                <Input
                                    id="check_in_end"
                                    type="time"
                                    required
                                    value={form.check_in_end}
                                    onChange={(e) => setForm({ ...form, check_in_end: e.target.value })}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="check_out_start" className="text-[11px] font-semibold">Mulai Pulang</Label>
                                <Input
                                    id="check_out_start"
                                    type="time"
                                    required
                                    value={form.check_out_start}
                                    onChange={(e) => setForm({ ...form, check_out_start: e.target.value })}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} className="text-xs">
                                Batal
                            </Button>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold">
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
                        <DialogTitle className="text-base font-bold">Konfirmasi Hapus Perusahaan</DialogTitle>
                        <DialogDescription className="text-xs">
                            Apakah Anda yakin ingin menghapus <strong>{deleteCompany?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2">
                        <Button variant="outline" size="sm" onClick={() => setDeleteCompany(null)} className="text-xs">
                            Batal
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} className="text-xs font-semibold">
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
