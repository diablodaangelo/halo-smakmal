import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Camera,
    CheckCircle2,
    Clock,
    MapPin,
    ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface AttendanceItem {
    id: number;
    date: string;
    date_formatted: string;
    check_in_time: string | null;
    check_out_time: string | null;
    is_missed_checkout?: boolean;
    status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';
    check_in_lat: number | null;
    check_in_long: number | null;
    check_out_lat: number | null;
    check_out_long: number | null;
    check_in_distance: number | null;
    check_out_distance: number | null;
    is_in_radius: boolean;
    radius_limit: number;
    selfie_url: string | null;
    check_out_selfie_url?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AttendanceResponse {
    data: AttendanceItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface Stats {
    total_presensi: number;
    total_hadir: number;
    total_terlambat: number;
    total_lupa_checkout?: number;
    in_radius_count: number;
    out_radius_count: number;
    punctuality_rate: number;
    radius_compliance_rate: number;
}

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
}

interface Props {
    attendances: AttendanceResponse;
    stats: Stats;
    company: Company | null;
}

export default function StudentAttendanceHistoryIndex({
    attendances,
    stats,
    company,
}: Props) {
    const [selectedSelfie, setSelectedSelfie] = useState<{
        title: string;
        checkInUrl?: string | null;
        checkInTime?: string | null;
        checkOutUrl?: string | null;
        checkOutTime?: string | null;
    } | null>(null);

    return (
        <>
            <Head title="Riwayat Presensi - Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                {/* 1. Header Section (Clean text matching admin style) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            Riwayat Presensi PKL
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                            Rekapitulasi log kehadiran harian, waktu check-in & check-out, foto selfie, dan verifikasi radius kantor.
                        </p>
                    </div>

                    {company && (
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-2xs self-start sm:self-auto text-xs font-bold text-slate-700">
                            <Building2 className="h-4 w-4 text-[#008953]" />
                            <span className="truncate max-w-[240px]">{company.name}</span>
                        </div>
                    )}
                </div>

                {/* 2. Top Stats Bar & Operational Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="rounded-xl bg-white px-3.5 py-2 text-slate-700 border border-slate-200/80 shadow-2xs">
                            Total: <strong className="text-slate-900 font-bold">{stats.total_presensi} Hari</strong>
                        </span>
                        <span className="rounded-xl bg-emerald-50 px-3.5 py-2 text-[#008953] border border-emerald-200/80">
                            Hadir Tepat: <strong className="font-bold">{stats.total_hadir}</strong>
                        </span>
                        {stats.total_terlambat > 0 && (
                            <span className="rounded-xl bg-amber-50 px-3.5 py-2 text-amber-700 border border-amber-200/80">
                                Terlambat: <strong className="font-bold">{stats.total_terlambat}</strong>
                            </span>
                        )}
                        <span className="rounded-xl bg-white px-3.5 py-2 text-slate-600 border border-slate-200/80 shadow-2xs">
                            Ketepatan: <strong className="text-[#008953] font-bold">{stats.punctuality_rate}%</strong>
                        </span>
                    </div>

                    {company && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="size-3.5 text-[#008953]" />
                                <span>Batas Masuk: <strong className="text-slate-700">{company.check_in_end?.slice(0, 5) || '08:00'} WIB</strong></span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 text-[#008953]" />
                                <span>Toleransi: <strong className="text-slate-700">{company.radius_meters}m</strong></span>
                            </span>
                        </div>
                    )}
                </div>

                {/* 3. Main Attendance Table (Exact Green Table Header like Admin, Fits Cleanly Without Side-Scroll) */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#008953] text-white">
                                    <th className="px-4 py-3.5 sm:px-5 sm:py-4 text-xs font-bold uppercase tracking-wider rounded-tl-xl">
                                        Hari & Tanggal
                                    </th>
                                    <th className="px-3 py-3.5 sm:px-4 sm:py-4 text-xs font-bold uppercase tracking-wider">
                                        Jam Masuk
                                    </th>
                                    <th className="px-3 py-3.5 sm:px-4 sm:py-4 text-xs font-bold uppercase tracking-wider">
                                        Jam Pulang
                                    </th>
                                    <th className="px-3 py-3.5 sm:px-4 sm:py-4 text-xs font-bold uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-3 py-3.5 sm:px-4 sm:py-4 text-xs font-bold uppercase tracking-wider hidden md:table-cell">
                                        Radius GPS
                                    </th>
                                    <th className="px-4 py-3.5 sm:px-5 sm:py-4 text-xs font-bold uppercase tracking-wider text-right rounded-tr-xl">
                                        Foto Selfie
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
                                {attendances.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <Clock className="size-6" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">
                                                    Belum ada catatan presensi
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Riwayat check-in dan check-out harian Anda akan ditampilkan di sini.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.data.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Hari & Tanggal */}
                                            <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                                                <div className="font-bold text-slate-900 leading-snug">
                                                    {att.date_formatted}
                                                </div>
                                                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                                    {att.date}
                                                </div>
                                            </td>

                                            {/* Jam Masuk */}
                                            <td className="px-3 py-3.5 sm:px-4 sm:py-4">
                                                {att.check_in_time ? (
                                                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                                                        {att.check_in_time} <span className="text-[10px] font-normal text-slate-400">WIB</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* Jam Pulang */}
                                            <td className="px-3 py-3.5 sm:px-4 sm:py-4">
                                                {att.check_out_time ? (
                                                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                                                        {att.check_out_time} <span className="text-[10px] font-normal text-slate-400">WIB</span>
                                                    </span>
                                                ) : att.is_missed_checkout ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                                                        <AlertCircle className="size-3.5 shrink-0" />
                                                        <span>Tidak Check-Out</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">Belum Pulang</span>
                                                )}
                                            </td>

                                            {/* Status Kehadiran */}
                                            <td className="px-3 py-3.5 sm:px-4 sm:py-4">
                                                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold border ${
                                                    att.status === 'hadir'
                                                        ? 'bg-emerald-50 text-[#008953] border-emerald-200'
                                                        : att.status === 'terlambat'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                    {att.status === 'hadir' ? (
                                                        <>
                                                            <CheckCircle2 className="size-3.5 shrink-0" />
                                                            <span>Hadir Tepat</span>
                                                        </>
                                                    ) : att.status === 'terlambat' ? (
                                                        <>
                                                            <Clock className="size-3.5 shrink-0" />
                                                            <span>Terlambat</span>
                                                        </>
                                                    ) : (
                                                        <span>{att.status === 'izin' ? 'Izin' : att.status === 'sakit' ? 'Sakit' : att.status}</span>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Radius GPS */}
                                            <td className="px-3 py-3.5 sm:px-4 sm:py-4 hidden md:table-cell">
                                                {att.check_in_distance !== null ? (
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <span className={`size-2 shrink-0 rounded-full ${att.is_in_radius ? 'bg-[#008953]' : 'bg-amber-500'}`} />
                                                        <span className={att.is_in_radius ? 'font-semibold text-slate-700' : 'font-semibold text-amber-700'}>
                                                            {att.is_in_radius ? 'Dalam Radius' : 'Luar Radius'} ({att.check_in_distance}m)
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>

                                            {/* Foto Selfie */}
                                            <td className="px-4 py-3.5 sm:px-5 sm:py-4 text-right">
                                                {att.selfie_url || att.check_out_selfie_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedSelfie({
                                                                title: att.date_formatted,
                                                                checkInUrl: att.selfie_url,
                                                                checkInTime: att.check_in_time ? `${att.check_in_time} WIB` : undefined,
                                                                checkOutUrl: att.check_out_selfie_url,
                                                                checkOutTime: att.check_out_time ? `${att.check_out_time} WIB` : undefined,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:px-3 text-xs font-bold text-slate-700 hover:bg-[#008953] hover:text-white hover:border-[#008953] transition-all shadow-2xs cursor-pointer"
                                                    >
                                                        <Camera className="size-3.5 shrink-0" />
                                                        <span>Foto</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination (Matching Admin Pagination Exactly) */}
                    {attendances.links && attendances.links.length > 3 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-medium">
                                Menampilkan {attendances.from || (attendances.data.length > 0 ? 1 : 0)} sampai{' '}
                                {attendances.to || attendances.data.length} dari {attendances.total} catatan presensi
                            </span>

                            <div className="flex items-center gap-1">
                                {attendances.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`h-8 px-3 text-xs rounded-xl font-bold cursor-pointer ${
                                            link.active
                                                ? 'bg-[#008953] hover:bg-[#007346] text-white border-[#008953]'
                                                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Selfie Photo Preview Dialog (Displays both Masuk & Pulang) */}
            <Dialog open={!!selectedSelfie} onOpenChange={(open) => !open && setSelectedSelfie(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Foto Selfie Presensi
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            {selectedSelfie?.title} • Dokumentasi foto kehadiran datang dan pulang
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSelfie && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            {/* 1. Foto Masuk / Datang */}
                            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                        <span className="size-2 rounded-full bg-[#008953]" />
                                        <span>Foto Datang (Masuk)</span>
                                    </span>
                                    <span className="font-mono text-[11px] font-bold text-[#008953] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                                        {selectedSelfie.checkInTime || '-'}
                                    </span>
                                </div>
                                <div className="overflow-hidden rounded-xl bg-slate-900 aspect-4/3 flex items-center justify-center border border-slate-200 shadow-inner">
                                    {selectedSelfie.checkInUrl ? (
                                        <img
                                            src={selectedSelfie.checkInUrl}
                                            alt="Foto Selfie Masuk"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center text-slate-400">
                                            <Camera className="size-6 text-slate-500" />
                                            <span className="text-xs font-medium">Tidak ada foto masuk</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Foto Pulang */}
                            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                        <span className="size-2 rounded-full bg-blue-600" />
                                        <span>Foto Pulang</span>
                                    </span>
                                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                                        {selectedSelfie.checkOutTime || '-'}
                                    </span>
                                </div>
                                <div className="overflow-hidden rounded-xl bg-slate-900 aspect-4/3 flex items-center justify-center border border-slate-200 shadow-inner">
                                    {selectedSelfie.checkOutUrl ? (
                                        <img
                                            src={selectedSelfie.checkOutUrl}
                                            alt="Foto Selfie Pulang"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center text-slate-400">
                                            <Camera className="size-6 text-slate-500" />
                                            <span className="text-xs font-medium">Belum ada foto pulang</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
