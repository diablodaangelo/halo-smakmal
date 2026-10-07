import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    MapPin,
    Radio,
    ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    const [selectedSelfie, setSelectedSelfie] = useState<{ url: string; title: string; time?: string } | null>(null);

    return (
        <>
            <Head title="Riwayat Presensi Siswa - Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Riwayat Presensi PKL
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Rekap log kehadiran harian, waktu check-in & check-out, foto selfie, dan verifikasi geofence kantor.
                        </p>
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs font-semibold">
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 border border-slate-200/80">
                            Total: <strong className="font-bold text-slate-900">{stats.total_presensi} Hari</strong>
                        </span>
                        <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 border border-emerald-200/80">
                            Tepat Waktu: <strong className="font-bold">{stats.total_hadir}</strong>
                        </span>
                        {stats.total_terlambat > 0 && (
                            <span className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700 border border-amber-200/80">
                                Terlambat: <strong className="font-bold">{stats.total_terlambat}</strong>
                            </span>
                        )}
                    </div>
                </div>

                {/* Company Info Banner (Green with White Text) */}
                {company && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#008953] px-5 py-3.5 text-xs text-white shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                                <Building2 className="size-4" />
                            </div>
                            <span className="text-emerald-50 truncate">
                                Tempat PKL: <strong className="font-bold text-white">{company.name}</strong>
                                {company.address ? ` (${company.address})` : ''}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0 font-medium text-xs">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1.5 text-emerald-50">
                                <Clock className="size-3.5 text-emerald-200" />
                                <span>{company.check_in_start?.slice(0, 5)} - {company.check_in_end?.slice(0, 5)} WIB</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1.5 text-emerald-50">
                                <ShieldCheck className="size-3.5 text-emerald-200" />
                                <span>Radius {company.radius_meters}m</span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Main Attendance Table Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
                                    <th className="px-5 py-3.5">Hari & Tanggal</th>
                                    <th className="px-5 py-3.5">Jam Masuk</th>
                                    <th className="px-5 py-3.5">Jam Pulang</th>
                                    <th className="px-5 py-3.5">Status Waktu</th>
                                    <th className="px-5 py-3.5">Radius GPS</th>
                                    <th className="px-5 py-3.5 text-right">Foto Selfie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {attendances.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            Belum ada catatan presensi yang terekam.
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.data.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50/60 transition">
                                            {/* Hari & Tanggal */}
                                            <td className="px-5 py-3.5 font-medium text-slate-900">
                                                <div>{att.date_formatted}</div>
                                                <div className="text-[11px] font-mono text-slate-400">{att.date}</div>
                                            </td>

                                            {/* Jam Masuk */}
                                            <td className="px-5 py-3.5 font-mono text-slate-800">
                                                {att.check_in_time ? (
                                                    <span className="font-semibold">{att.check_in_time} WIB</span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* Jam Pulang */}
                                            <td className="px-5 py-3.5 font-mono text-slate-800">
                                                {att.check_out_time ? (
                                                    <span className="font-semibold">{att.check_out_time} WIB</span>
                                                ) : att.is_missed_checkout ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                                        <AlertCircle className="size-3" />
                                                        Tidak Check-Out
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Belum Pulang</span>
                                                )}
                                            </td>

                                            {/* Status Waktu */}
                                            <td className="px-5 py-3.5">
                                                {att.status === 'hadir' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 font-semibold text-[11px] ring-1 ring-emerald-600/20">
                                                        <CheckCircle2 className="size-3 text-emerald-600" />
                                                        Tepat Waktu
                                                    </span>
                                                ) : att.status === 'terlambat' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 font-semibold text-[11px] ring-1 ring-amber-600/20">
                                                        <Clock className="size-3 text-amber-600" />
                                                        Terlambat
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 font-semibold text-[11px]">
                                                        {att.status}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Radius GPS */}
                                            <td className="px-5 py-3.5">
                                                {att.check_in_distance !== null ? (
                                                    att.is_in_radius ? (
                                                        <span className="inline-flex items-center gap-1 text-slate-700">
                                                            <span className="size-1.5 rounded-full bg-emerald-500" />
                                                            <span>Sesuai ({att.check_in_distance}m)</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                                            <span className="size-1.5 rounded-full bg-amber-500" />
                                                            <span>Luar Radius ({att.check_in_distance}m)</span>
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* Foto Selfie */}
                                            <td className="px-5 py-3.5 text-right">
                                                {att.selfie_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedSelfie({
                                                                url: att.selfie_url!,
                                                                title: att.date_formatted,
                                                                time: att.check_in_time ? `${att.check_in_time} WIB` : undefined,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#008953] hover:text-white hover:border-[#008953] transition shadow-2xs"
                                                    >
                                                        <Camera className="size-3.5" />
                                                        <span>Lihat Foto</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {attendances.links && attendances.links.length > 3 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-medium">
                                Menampilkan {attendances.from || (attendances.data.length > 0 ? 1 : 0)} sampai{' '}
                                {attendances.to || attendances.data.length} dari {attendances.total} catatan
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
                                        className={`h-8 px-3 text-xs rounded-lg ${
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

            {/* Selfie Photo Preview Dialog */}
            <Dialog open={!!selectedSelfie} onOpenChange={(open) => !open && setSelectedSelfie(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-slate-900">
                            Foto Selfie Presensi
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            {selectedSelfie?.title} {selectedSelfie?.time ? `• ${selectedSelfie.time}` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSelfie && (
                        <div className="overflow-hidden rounded-xl bg-slate-950 aspect-video flex items-center justify-center border border-slate-200">
                            <img
                                src={selectedSelfie.url}
                                alt="Selfie Presensi"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
