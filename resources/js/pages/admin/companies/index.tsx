import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Crosshair,
    Edit3,
    ExternalLink,
    Info,
    MapPin,
    Plus,
    Radio,
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
    from?: number;
    to?: number;
}

interface Props {
    companies?: CompaniesResponse;
    filters?: {
        search?: string;
    };
    errors?: Record<string, string>;
}

export default function CompaniesIndex({
    companies = { data: [], current_page: 1, last_page: 1, total: 0, links: [] },
    filters = {},
    errors,
}: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [detailCompany, setDetailCompany] = useState<Company | null>(null);
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

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/companies',
            { search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        router.get('/admin/companies', {}, { preserveState: true, replace: true });
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const hasActiveFilters = Boolean(search);

    return (
        <>
            <Head title="Master Tempat PKL (DUDI)" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d8f2e5] text-[#008953] shadow-xs ring-1 ring-[#008953]/10">
                            <Building2 className="h-6 w-6 stroke-[2.2]" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                                Master Tempat PKL (DUDI)
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Kelola mitra industri (DUDI), titik koordinat GPS geofence, radius presensi, dan jam operasional.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="bg-[#008953] hover:bg-[#007346] active:bg-[#00623a] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-5 shadow-sm shadow-emerald-900/10 transition-all flex items-center gap-2 self-start sm:self-auto hover:translate-y-[-1px]"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        <span>Tambah DUDI Baru</span>
                    </Button>
                </div>

                {/* Error Banner */}
                {errors?.error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs font-semibold text-red-700 flex items-center gap-2.5 shadow-2xs">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                        <span>{errors.error}</span>
                    </div>
                )}

                {/* Search Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama perusahaan, instansi, atau alamat kantor DUDI..."
                            className="h-10 pl-10 border-0 bg-slate-50/60 hover:bg-slate-100/80 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-none transition"
                        />
                    </form>

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

                {/* Data Table */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-[#008953] text-white">
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider rounded-tl-xl w-auto">
                                        Instansi / Mitra DUDI
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider hidden md:table-cell w-56 whitespace-nowrap">
                                        Jam Operasional
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-center hidden sm:table-cell w-36 whitespace-nowrap">
                                        Siswa PKL
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-right rounded-tr-xl w-36 whitespace-nowrap">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
                                {companies.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">
                                                    Tidak ada data perusahaan DUDI
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {hasActiveFilters
                                                        ? 'Coba sesuaikan kata kunci pencarian Anda.'
                                                        : 'Silakan daftarkan mitra industri tempat PKL baru terlebih dahulu.'}
                                                </p>
                                                {hasActiveFilters && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleResetFilters}
                                                        className="mt-2 rounded-xl text-xs font-semibold"
                                                    >
                                                        Reset Pencarian
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    companies.data.map((company) => {
                                        const inStart = company.check_in_start.substring(0, 5);
                                        const inEnd = company.check_in_end.substring(0, 5);
                                        const outStart = company.check_out_start.substring(0, 5);

                                        return (
                                            <tr
                                                key={company.id}
                                                className="hover:bg-slate-50/70 transition-colors"
                                            >
                                                {/* Company Name & Address */}
                                                <td className="px-5 py-4 max-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#008953] font-bold text-xs ring-1 ring-emerald-600/20">
                                                            {getInitials(company.name)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-bold text-slate-900 truncate">
                                                                {company.name}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-0.5 min-w-0">
                                                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                <span className="truncate block">{company.address}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Operational Hours */}
                                                <td className="px-5 py-4 hidden md:table-cell whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                                                        <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                        <span className="text-xs font-bold text-slate-800">
                                                            {inStart} - {outStart}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-medium border-l border-slate-200 pl-2">
                                                            Batas: {inEnd}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Students Count */}
                                                <td className="px-5 py-4 text-center hidden sm:table-cell whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#008953] text-xs font-bold border border-emerald-200/80 shadow-2xs">
                                                        <Users className="h-3.5 w-3.5 shrink-0" />
                                                        <span>{company.students_count || 0} Siswa</span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Info / Detail Button */}
                                                        <button
                                                            onClick={() => setDetailCompany(company)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs"
                                                            title="Lihat Detail & Titik Lokasi"
                                                        >
                                                            <Info className="h-4 w-4 stroke-[2]" />
                                                        </button>

                                                        {/* Edit Button */}
                                                        <button
                                                            onClick={() => openEditDialog(company)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs"
                                                            title="Edit DUDI"
                                                        >
                                                            <Edit3 className="h-4 w-4 stroke-[2]" />
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => setDeleteCompany(company)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition shadow-2xs"
                                                            title="Hapus DUDI"
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
                    {companies.total > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-medium">
                                Menampilkan{' '}
                                <strong className="font-bold text-slate-800">
                                    {companies.from || (companies.data.length > 0 ? 1 : 0)}
                                </strong>{' '}
                                sampai{' '}
                                <strong className="font-bold text-slate-800">
                                    {companies.to || companies.data.length}
                                </strong>{' '}
                                dari{' '}
                                <strong className="font-bold text-slate-800">
                                    {companies.total}
                                </strong>{' '}
                                mitra DUDI
                            </span>

                            {companies.links && companies.links.length > 3 && (
                                <div className="flex items-center gap-1">
                                    {companies.links.map((link, idx) => {
                                        const isPrev = idx === 0;
                                        const isNext = idx === companies.links.length - 1;

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

            {/* Detail Company Modal Dialog */}
            <Dialog open={!!detailCompany} onOpenChange={() => setDetailCompany(null)}>
                <DialogContent className="sm:max-w-lg p-5 sm:p-6 rounded-2xl bg-white border border-slate-200">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d8f2e5] text-[#008953] shadow-xs">
                                <Building2 className="h-6 w-6 stroke-[2.2]" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                                    {detailCompany?.name}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 font-medium">
                                    Informasi lengkap titik lokasi, geofence, dan jam kerja PKL.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {detailCompany && (
                        <div className="space-y-4 py-3">
                            {/* Alamat */}
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-[#008953]" />
                                    <span>Alamat Lengkap</span>
                                </span>
                                <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
                                    {detailCompany.address}
                                </p>
                            </div>

                            {/* GPS & Geofence Box */}
                            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#008953] flex items-center gap-1.5">
                                        <Radio className="h-4 w-4" />
                                        <span>Koordinat & Radius Presensi</span>
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#008953] text-[11px] font-bold">
                                        Radius: {detailCompany.radius_meters} Meter
                                    </span>
                                </div>

                                <div className="bg-white p-3 rounded-xl border border-emerald-200/80 font-mono text-xs font-bold text-slate-800 flex items-center justify-between">
                                    <span>{detailCompany.latitude}, {detailCompany.longitude}</span>
                                    <a
                                        href={`https://www.google.com/maps?q=${detailCompany.latitude},${detailCompany.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-sans text-[#008953] hover:underline"
                                    >
                                        <span>Buka Maps</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Jam Operasional Grid */}
                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                                    <p className="text-[11px] font-bold text-slate-500">Mulai Masuk</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                                        {detailCompany.check_in_start.substring(0, 5)} WIB
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                                    <p className="text-[11px] font-bold text-slate-500">Batas Masuk</p>
                                    <p className="text-xs sm:text-sm font-bold text-amber-600 mt-0.5">
                                        {detailCompany.check_in_end.substring(0, 5)} WIB
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                                    <p className="text-[11px] font-bold text-slate-500">Mulai Pulang</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                                        {detailCompany.check_out_start.substring(0, 5)} WIB
                                    </p>
                                </div>
                            </div>

                            {/* Info Siswa */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-[#008953]" />
                                    <span>Total Siswa PKL Ditempatkan</span>
                                </span>
                                <span className="font-bold text-xs text-[#008953] bg-emerald-100 px-3 py-1 rounded-lg">
                                    {detailCompany.students_count || 0} Siswa
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
                        <Button
                            variant="outline"
                            onClick={() => setDetailCompany(null)}
                            className="h-10 rounded-xl text-slate-600 font-semibold"
                        >
                            Tutup
                        </Button>
                        <Button
                            onClick={() => {
                                const target = detailCompany;
                                setDetailCompany(null);
                                if (target) openEditDialog(target);
                            }}
                            className="h-10 rounded-xl bg-[#008953] hover:bg-[#007346] font-bold text-white shadow-xs"
                        >
                            <Edit3 className="h-4 w-4 mr-1.5" />
                            <span>Edit Data DUDI</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto p-4 sm:p-6 rounded-2xl bg-white border border-slate-200">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8f2e5] text-[#008953]">
                                <Building2 className="h-5 w-5 stroke-[2.5]" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                                    {editingCompany
                                        ? 'Edit Data Tempat PKL (DUDI)'
                                        : 'Tambah Mitra Tempat PKL (DUDI)'}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 font-medium">
                                    Lengkapi data instansi, koordinat Google Maps geofence, dan jam kerja.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Nama Instansi */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                                Nama Instansi / Perusahaan *
                            </Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: PT Wanteknologi / PT Amaliah Digital"
                                className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                            />
                            {errors?.name && (
                                <p className="text-[11px] font-semibold text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Alamat Lengkap */}
                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-xs font-bold text-slate-700">
                                Alamat Lengkap Kantor / Lokasi PKL *
                            </Label>
                            <Input
                                id="address"
                                required
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Contoh: Jl. Tol Ciawi No. 1, Ciawi, Bogor"
                                className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                            />
                            {errors?.address && (
                                <p className="text-[11px] font-semibold text-red-500">{errors.address}</p>
                            )}
                        </div>

                        {/* Google Maps Smart Coordinate Box */}
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-[#008953]" />
                                    <span>Koordinat Google Maps</span>
                                </Label>
                                {parsedSuccess && (
                                    <span className="text-[11px] font-bold text-[#008953] flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Koordinat Valid</span>
                                    </span>
                                )}
                            </div>

                            <Input
                                value={rawCoordinateInput}
                                onChange={(e) => handleCoordinatePaste(e.target.value)}
                                placeholder="Paste koordinat misal: -6.577449, 106.782421"
                                className="h-10 rounded-xl font-mono text-xs bg-white border-emerald-300 focus-visible:ring-1 focus-visible:ring-emerald-500"
                            />
                            {(errors?.latitude || errors?.longitude) && (
                                <p className="text-[11px] font-semibold text-red-500">
                                    {errors.latitude || errors.longitude || 'Format koordinat tidak valid.'}
                                </p>
                            )}

                            <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                                <Info className="h-3.5 w-3.5 text-[#008953] shrink-0 mt-0.5" />
                                <span>
                                    Buka Google Maps, klik kanan titik lokasi kantor mitra, lalu klik angka koordinat untuk menyalin (contoh: <code>-6.577449, 106.782421</code>).
                                </span>
                            </div>

                            {/* Tombol Aksi Maps */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={openInGoogleMaps}
                                    className="h-8 rounded-lg text-xs font-semibold gap-1.5 bg-white hover:bg-emerald-50 text-slate-700"
                                >
                                    <ExternalLink className="h-3.5 w-3.5 text-[#008953]" />
                                    <span>Buka di Google Maps</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={searchOnGoogleMaps}
                                    className="h-8 rounded-lg text-xs font-semibold gap-1.5 bg-white hover:bg-slate-50 text-slate-700"
                                >
                                    <Search className="h-3.5 w-3.5 text-blue-600" />
                                    <span>Cari Lokasi di Maps</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={getCurrentLocation}
                                    disabled={gettingLocation}
                                    className="h-8 rounded-lg text-xs font-semibold gap-1.5 bg-white hover:bg-emerald-50 text-slate-700 ml-auto"
                                >
                                    <Crosshair className="h-3.5 w-3.5 text-[#008953]" />
                                    <span>{gettingLocation ? 'Mengambil GPS...' : 'Gunakan GPS Saya'}</span>
                                </Button>
                            </div>
                        </div>

                        {/* Radius Geofence */}
                        <div className="space-y-1.5">
                            <Label htmlFor="radius_meters" className="text-xs font-bold text-slate-700">
                                Radius Presensi Geofence (Meter) *
                            </Label>
                            <Input
                                id="radius_meters"
                                required
                                type="number"
                                min={10}
                                max={1000}
                                value={form.radius_meters}
                                onChange={(e) => setForm({ ...form, radius_meters: Number(e.target.value) })}
                                className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                            />
                            <p className="text-[11px] text-slate-500 font-medium">
                                Jarak maksimal siswa dapat melakukan presensi dari titik kantor (disarankan 50 - 150 meter).
                            </p>
                        </div>

                        {/* Jam Operasional */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="check_in_start" className="text-xs font-bold text-slate-700">
                                    Mulai Masuk
                                </Label>
                                <Input
                                    id="check_in_start"
                                    type="time"
                                    required
                                    value={form.check_in_start}
                                    onChange={(e) => setForm({ ...form, check_in_start: e.target.value })}
                                    className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="check_in_end" className="text-xs font-bold text-slate-700">
                                    Batas Masuk
                                </Label>
                                <Input
                                    id="check_in_end"
                                    type="time"
                                    required
                                    value={form.check_in_end}
                                    onChange={(e) => setForm({ ...form, check_in_end: e.target.value })}
                                    className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="check_out_start" className="text-xs font-bold text-slate-700">
                                    Mulai Pulang
                                </Label>
                                <Input
                                    id="check_out_start"
                                    type="time"
                                    required
                                    value={form.check_out_start}
                                    onChange={(e) => setForm({ ...form, check_out_start: e.target.value })}
                                    className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                />
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
                                {editingCompany ? 'Simpan Perubahan' : 'Tambah Tempat PKL'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteCompany} onOpenChange={() => setDeleteCompany(null)}>
                <DialogContent className="sm:max-w-md p-5 rounded-2xl bg-white border border-slate-200">
                    <DialogHeader className="gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Hapus Mitra Tempat PKL (DUDI)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                            Apakah Anda yakin ingin menghapus data mitra <strong>{deleteCompany?.name}</strong>? Tindakan ini hanya dapat dilakukan jika belum ada siswa atau pembimbing yang ditugaskan di lokasi ini.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteCompany(null)}
                            className="h-10 rounded-xl text-slate-600 font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700"
                        >
                            Ya, Hapus DUDI
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
