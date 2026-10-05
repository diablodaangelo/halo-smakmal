import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    Crosshair,
    ExternalLink,
    Filter,
    GraduationCap,
    Image as ImageIcon,
    MapPin,
    RotateCcw,
    Search,
    ShieldAlert,
    UserX,
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface AnomalyReason {
    type: 'outside_radius' | 'late' | 'early_checkout';
    title: string;
    description: string;
    severity: 'danger' | 'warning';
}

interface AnomalyItem {
    id: number;
    user?: {
        id: number;
        name: string;
        nis_nip: string;
        company_name: string;
    };
    date: string;
    date_formatted: string;
    check_in_time: string | null;
    check_out_time: string | null;
    check_in_lat: number | null;
    check_in_long: number | null;
    check_in_distance: number | null;
    radius_limit: number;
    is_in_radius: boolean;
    is_late: boolean;
    is_early_checkout: boolean;
    selfie_url: string | null;
    anomaly_reasons: AnomalyReason[];
}

interface AbsentStudent {
    id: number;
    name: string;
    nis_nip: string;
    company_name: string;
}

interface Stats {
    total_anomalies: number;
    outside_radius_count: number;
    late_count: number;
    early_checkout_count: number;
    absent_today_count: number;
}

interface Props {
    anomalies?: AnomalyItem[];
    absentStudentsToday?: AbsentStudent[];
    students?: Array<{ id: number; name: string; nis_nip: string }>;
    stats?: Stats;
    filters?: {
        category?: string;
        student_id?: string;
        date?: string;
    };
    today_date?: string;
}

export default function TeacherSuspiciousIndex({
    anomalies = [],
    absentStudentsToday = [],
    students = [],
    stats = {
        total_anomalies: 0,
        outside_radius_count: 0,
        late_count: 0,
        early_checkout_count: 0,
        absent_today_count: 0,
    },
    filters = {},
    today_date = '',
}: Props) {
    const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'all');
    const [selectedStudent, setSelectedStudent] = useState(filters?.student_id || '');
    const [selectedDate, setSelectedDate] = useState(filters?.date || '');
    const [selectedSelfie, setSelectedSelfie] = useState<{ url: string; title: string } | null>(null);

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        router.get(
            '/teacher/suspicious',
            {
                category: cat,
                student_id: selectedStudent || undefined,
                date: selectedDate || undefined,
            },
            { preserveState: true }
        );
    };

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/teacher/suspicious',
            {
                category: selectedCategory,
                student_id: selectedStudent || undefined,
                date: selectedDate || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSelectedCategory('all');
        setSelectedStudent('');
        setSelectedDate('');
        router.get('/teacher/suspicious', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Deteksi Kecurigaan Presensi - Guru Pembimbing" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                            <ShieldAlert className="h-4 w-4" />
                            <span>Sistem Peringatan & Deteksi Dini</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Deteksi Kecurigaan Presensi
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Daftar otomatis siswa binaan yang melakukan presensi di luar radius kantor DUDI, terlambat, atau pulang lebih awal.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2 text-xs font-medium">
                        <Calendar className="h-4 w-4 text-neutral-500" />
                        <span>Hari ini: {today_date}</span>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card
                        onClick={() => handleCategoryChange('outside_radius')}
                        className={`cursor-pointer transition border-neutral-200 dark:border-neutral-800 hover:border-rose-500 ${
                            selectedCategory === 'outside_radius' ? 'ring-2 ring-rose-500 bg-rose-50/20' : ''
                        }`}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-rose-600 flex items-center justify-between">
                                <span>Di Luar Radius DUDI</span>
                                <MapPin className="h-4 w-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-600">{stats?.outside_radius_count ?? 0} Log</div>
                            <p className="text-[11px] text-neutral-400">Jarak melebihi batas kantor</p>
                        </CardContent>
                    </Card>

                    <Card
                        onClick={() => handleCategoryChange('late')}
                        className={`cursor-pointer transition border-neutral-200 dark:border-neutral-800 hover:border-amber-500 ${
                            selectedCategory === 'late' ? 'ring-2 ring-amber-500 bg-amber-50/20' : ''
                        }`}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-amber-600 flex items-center justify-between">
                                <span>Terlambat Masuk</span>
                                <Clock className="h-4 w-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats?.late_count ?? 0} Log</div>
                            <p className="text-[11px] text-neutral-400">Lewat batas toleransi</p>
                        </CardContent>
                    </Card>

                    <Card
                        onClick={() => handleCategoryChange('early_checkout')}
                        className={`cursor-pointer transition border-neutral-200 dark:border-neutral-800 hover:border-purple-500 ${
                            selectedCategory === 'early_checkout' ? 'ring-2 ring-purple-500 bg-purple-50/20' : ''
                        }`}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-purple-600 flex items-center justify-between">
                                <span>Pulang Lebih Awal</span>
                                <AlertCircle className="h-4 w-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats?.early_checkout_count ?? 0} Log</div>
                            <p className="text-[11px] text-neutral-400">Sebelum jam pulang standar</p>
                        </CardContent>
                    </Card>

                    <Card
                        onClick={() => handleCategoryChange('absent_today')}
                        className={`cursor-pointer transition border-neutral-200 dark:border-neutral-800 hover:border-neutral-500 ${
                            selectedCategory === 'absent_today' ? 'ring-2 ring-neutral-500 bg-neutral-100/40 dark:bg-neutral-800/40' : ''
                        }`}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
                                <span>Belum Presensi Hari Ini</span>
                                <UserX className="h-4 w-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{stats?.absent_today_count ?? 0} Siswa</div>
                            <p className="text-[11px] text-neutral-400">Belum ada check-in hari ini</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Toolbar & Category Selector */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-100 pb-3 dark:border-neutral-800">
                            <span className="text-xs font-semibold text-neutral-500 mr-2">Kategori:</span>
                            <Button
                                type="button"
                                onClick={() => handleCategoryChange('all')}
                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-xs"
                            >
                                Semua Anomali ({stats?.total_anomalies ?? 0})
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleCategoryChange('outside_radius')}
                                variant={selectedCategory === 'outside_radius' ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-xs"
                            >
                                📍 Di Luar Radius ({stats?.outside_radius_count ?? 0})
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleCategoryChange('late')}
                                variant={selectedCategory === 'late' ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-xs"
                            >
                                ⏰ Terlambat ({stats?.late_count ?? 0})
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleCategoryChange('early_checkout')}
                                variant={selectedCategory === 'early_checkout' ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-xs"
                            >
                                ⏳ Pulang Awal ({stats?.early_checkout_count ?? 0})
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleCategoryChange('absent_today')}
                                variant={selectedCategory === 'absent_today' ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-xs"
                            >
                                🚫 Belum Presensi Hari Ini ({stats?.absent_today_count ?? 0})
                            </Button>
                        </div>

                        <form onSubmit={handleFilter} className="grid grid-cols-1 gap-3 sm:grid-cols-3 items-end pt-1">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                                    Filter Siswa Binaan
                                </label>
                                <select
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs dark:border-neutral-800 dark:bg-neutral-900"
                                >
                                    <option value="">Semua Siswa</option>
                                    {students?.map((stu) => (
                                        <option key={stu.id} value={stu.id}>
                                            {stu.name} ({stu.nis_nip})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                                    Pilih Tanggal Presensi
                                </label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" size="sm" className="h-9 text-xs gap-1.5 flex-1 bg-emerald-600 hover:bg-emerald-500">
                                    <Search className="h-3.5 w-3.5" />
                                    <span>Terapkan Filter</span>
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleReset}
                                    variant="outline"
                                    size="sm"
                                    className="h-9 text-xs"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Section A: Belum Presensi Hari Ini (if selected or on All) */}
                {(selectedCategory === 'absent_today' || (selectedCategory === 'all' && absentStudentsToday?.length > 0)) && (
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="border-b border-neutral-100 bg-rose-50/40 px-6 py-3.5 dark:border-neutral-800 dark:bg-rose-950/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                                    <UserX className="h-4 w-4" />
                                    <span>Siswa Binaan Belum Presensi Hari Ini ({absentStudentsToday?.length ?? 0})</span>
                                </div>
                                <span className="text-xs text-neutral-500">Tanggal: {today_date}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {absentStudentsToday?.length === 0 ? (
                                <p className="text-xs text-emerald-600 py-2">
                                    Alhamdulillah, seluruh siswa binaan telah melakukan presensi hari ini!
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {absentStudentsToday?.map((stu) => (
                                        <div
                                            key={stu.id}
                                            className="p-3 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                                        >
                                            <div className="font-semibold text-xs text-neutral-900 dark:text-white">
                                                {stu.name}
                                            </div>
                                            <div className="text-[11px] text-neutral-500 mt-0.5">
                                                NIS: {stu.nis_nip || '-'} | {stu.company_name || 'Belum Diplot'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Section B: Log Anomali Presensi */}
                {selectedCategory !== 'absent_today' && (
                    <div className="space-y-4">
                        {anomalies?.length === 0 ? (
                            <Card className="border-neutral-200 p-12 text-center text-neutral-500 dark:border-neutral-800">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                                <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                                    Tidak Ditemukan Anomali Presensi
                                </div>
                                <p className="text-xs text-neutral-500 mt-1">
                                    Presensi siswa binaan Anda berjalan tertib dan sesuai radius DUDI.
                                </p>
                            </Card>
                        ) : (
                            anomalies?.map((item) => (
                                <Card
                                    key={item.id}
                                    className="border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:border-rose-500/50 transition"
                                >
                                    <div className="border-b border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                                    <AlertTriangle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-neutral-900 dark:text-white">
                                                            {item.user?.name || 'Siswa'}
                                                        </span>
                                                        <span className="text-xs text-neutral-500 font-mono">
                                                            NIS: {item.user?.nis_nip || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                                        {item.user?.company_name || 'Belum Diplot'} | Tanggal: <strong>{item.date_formatted}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="p-5">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            {/* Anomaly Badges & Details */}
                                            <div className="md:col-span-2 space-y-3">
                                                <div className="space-y-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                                        Indikasi Kecurigaan / Anomali:
                                                    </span>
                                                    <div className="space-y-2">
                                                        {item.anomaly_reasons?.map((reason, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`rounded-lg p-3 text-xs flex items-start gap-2 border ${
                                                                    reason.severity === 'danger'
                                                                        ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                                                                        : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200'
                                                                }`}
                                                            >
                                                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                                <div>
                                                                    <div className="font-bold">{reason.title}</div>
                                                                    <p className="mt-0.5 text-[11px] leading-relaxed">
                                                                        {reason.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Time & GPS Info */}
                                                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                                                    <div className="rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800">
                                                        <div className="font-semibold text-neutral-600 dark:text-neutral-400">Waktu Presensi:</div>
                                                        <div className="font-mono mt-0.5">
                                                            In: {item.check_in_time ? `${item.check_in_time} WIB` : '-'} | Out: {item.check_out_time ? `${item.check_out_time} WIB` : '-'}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800">
                                                        <div className="font-semibold text-neutral-600 dark:text-neutral-400">Radius Kantor:</div>
                                                        <div className="mt-0.5">
                                                            {item.check_in_distance !== null ? `${item.check_in_distance} m (Batas: ${item.radius_limit} m)` : '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Selfie & Google Maps Link */}
                                            <div className="space-y-3">
                                                {item.selfie_url ? (
                                                    <div>
                                                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                                                            Foto Selfie Presensi:
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSelfie({ url: item.selfie_url!, title: `Foto Selfie - ${item.user?.name || 'Siswa'} (${item.date})` })}
                                                            className="group relative h-32 w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 hover:opacity-90 dark:border-neutral-800"
                                                        >
                                                            <img
                                                                src={item.selfie_url}
                                                                alt={item.user?.name || 'Siswa'}
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                                                                <span className="text-xs font-semibold text-white">Lihat Foto Selfie</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-28 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
                                                        Tidak ada foto selfie
                                                    </div>
                                                )}

                                                {item.check_in_lat && item.check_in_long && (
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-xs gap-1"
                                                    >
                                                        <a
                                                            href={`https://www.google.com/maps?q=${item.check_in_lat},${item.check_in_long}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <MapPin className="h-3.5 w-3.5 text-rose-600" />
                                                            <span>Buka di Google Maps</span>
                                                            <ExternalLink className="h-3 w-3 ml-auto text-neutral-400" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Selfie Preview Dialog */}
            <Dialog open={!!selectedSelfie} onOpenChange={(open) => !open && setSelectedSelfie(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">
                            {selectedSelfie?.title || 'Foto Selfie Presensi'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Dokumentasi visual saat siswa melakukan presensi.
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
