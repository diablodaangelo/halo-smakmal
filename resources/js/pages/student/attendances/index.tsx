import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CalendarCheck,
    Camera,
    CheckCircle2,
    Clock,
    Crosshair,
    ExternalLink,
    Filter,
    HelpCircle,
    Image as ImageIcon,
    MapPin,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
    const [selectedSelfie, setSelectedSelfie] = useState<{ url: string; title: string } | null>(null);

    return (
        <>
            <Head title="Riwayat Presensi - Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header Navigation & Title */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CalendarCheck className="h-4 w-4" />
                            <span>Rekapitulasi Kehadiran PKL</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Riwayat Presensi
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Monitoring lengkap status jam masuk, jam pulang, verifikasi foto selfie, dan radius GPS di lokasi DUDI.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Link href="/dashboard">
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Kembali ke Dashboard</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Company Geofence Reference Card */}
                {company && (
                    <Card className="border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-neutral-900 dark:text-white">
                                            {company.name}
                                        </div>
                                        <p className="text-xs text-neutral-500">
                                            {company.address}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 font-medium text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                                        Masuk: {company.check_in_start?.slice(0, 5)} - {company.check_in_end?.slice(0, 5)} WIB
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 font-medium text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                                        <Crosshair className="h-3.5 w-3.5 text-blue-600" />
                                        Radius Toleransi: {company.radius_meters} Meter
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-neutral-500">Total Hari Masuk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_presensi} Hari</div>
                            <p className="text-[11px] text-neutral-400">Total terekam</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-emerald-600">Hadir Tepat Waktu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.total_hadir} Hari</div>
                            <p className="text-[11px] text-neutral-400">{stats.punctuality_rate}% dari total</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-amber-600">Terlambat Masuk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.total_terlambat} Hari</div>
                            <p className="text-[11px] text-neutral-400">Lewat batas toleransi</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-teal-600">Sesuai Radius DUDI</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-teal-600">{stats.in_radius_count} Hari</div>
                            <p className="text-[11px] text-neutral-400">{stats.radius_compliance_rate}% di area kantor</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800 col-span-2 sm:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-orange-600">Di Luar Radius</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.out_radius_count} Hari</div>
                            <p className="text-[11px] text-neutral-400">Lokasi di luar toleransi</p>
                        </CardContent>
                    </Card>
                </div>

                {/* History Table */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <CardTitle className="text-base font-semibold">
                                Riwayat Log Kehadiran ({attendances.total})
                            </CardTitle>
                            <span className="text-xs text-neutral-500">
                                Diurutkan dari tanggal terbaru
                            </span>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <tr>
                                    <th className="px-6 py-3.5">Tanggal</th>
                                    <th className="px-6 py-3.5">Foto Selfie</th>
                                    <th className="px-6 py-3.5">Jam Masuk</th>
                                    <th className="px-6 py-3.5">Jam Pulang</th>
                                    <th className="px-6 py-3.5">Status Waktu</th>
                                    <th className="px-6 py-3.5">Status Lokasi Radius</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {attendances.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                                            Belum ada riwayat presensi yang terekam.
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.data.map((att) => (
                                        <tr key={att.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                            {/* Tanggal */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm">
                                                    {att.date_formatted}
                                                </div>
                                                <div className="text-xs font-mono text-neutral-500">
                                                    {att.date}
                                                </div>
                                            </td>

                                            {/* Selfie Thumbnail */}
                                            <td className="px-6 py-4">
                                                {att.selfie_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedSelfie({ url: att.selfie_url!, title: `Selfie Presensi - ${att.date_formatted}` })}
                                                        className="group relative h-12 w-12 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 hover:opacity-90 dark:border-neutral-700"
                                                    >
                                                        <img
                                                            src={att.selfie_url}
                                                            alt="Foto Selfie"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                                                            <ImageIcon className="h-4 w-4 text-white" />
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-neutral-400 italic">Tidak ada foto</span>
                                                )}
                                            </td>

                                            {/* Jam Masuk */}
                                            <td className="px-6 py-4 text-xs font-mono">
                                                {att.check_in_time ? (
                                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                                        {att.check_in_time} WIB
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </td>

                                            {/* Jam Pulang */}
                                            <td className="px-6 py-4 text-xs font-mono">
                                                {att.check_out_time ? (
                                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                                        {att.check_out_time} WIB
                                                    </span>
                                                ) : att.is_missed_checkout ? (
                                                    <span
                                                        className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                                        title="Siswa telah check-in tetapi tidak melakukan presensi pulang"
                                                    >
                                                        <AlertCircle className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                                                        Tidak Absen Pulang
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-neutral-400 italic text-xs">
                                                        <Clock className="h-3 w-3" />
                                                        Belum Check-out
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Waktu */}
                                            <td className="px-6 py-4">
                                                {att.status === 'hadir' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Tepat Waktu
                                                    </span>
                                                ) : att.status === 'terlambat' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                        <Clock className="h-3 w-3" />
                                                        Terlambat
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                        {att.status}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Lokasi Radius */}
                                            <td className="px-6 py-4">
                                                {att.check_in_distance !== null ? (
                                                    att.is_in_radius ? (
                                                        <div className="space-y-0.5">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Sesuai Radius
                                                            </span>
                                                            <div className="text-[11px] text-neutral-500">
                                                                Jarak {att.check_in_distance} m (Batas {att.radius_limit} m)
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-0.5">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                                                                <MapPin className="h-3 w-3" />
                                                                Di Luar Radius
                                                            </span>
                                                            <div className="text-[11px] font-medium text-orange-700 dark:text-orange-400">
                                                                Jarak {att.check_in_distance} m (Batas {att.radius_limit} m)
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-neutral-400">-</span>
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
                        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                            <span className="text-xs text-neutral-500">
                                Menampilkan halaman {attendances.current_page} dari {attendances.last_page}
                            </span>
                            <div className="flex gap-1">
                                {attendances.links.map((link, idx) => (
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

            {/* Selfie Photo Preview Dialog */}
            <Dialog open={!!selectedSelfie} onOpenChange={(open) => !open && setSelectedSelfie(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">
                            {selectedSelfie?.title || 'Foto Selfie Presensi'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Dokumentasi visual foto langsung saat melakukan presensi.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSelfie && (
                        <div className="overflow-hidden rounded-xl bg-black">
                            <img
                                src={selectedSelfie.url}
                                alt="Selfie Presensi"
                                className="h-auto w-full object-cover"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
