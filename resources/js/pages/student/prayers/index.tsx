import { Head, router } from '@inertiajs/react';
import {
    CalendarCheck,
    CheckCircle2,
    Clock,
    HeartHandshake,
    MapPin,
    Moon,
    Plus,
    Sparkles,
    Sun,
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

interface PrayerLogItem {
    id: number;
    user_id: number;
    date: string;
    prayer_name: 'dzuhur' | 'ashar';
    status: 'berjamaah' | 'munfarid' | 'udzur';
    prayer_time: string | null;
    location_name: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PrayerLogsResponse {
    data: PrayerLogItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Stats {
    total_logs: number;
    berjamaah: number;
    munfarid: number;
    udzur: number;
    discipline_rate: number;
}

interface Props {
    todayPrayers: Record<string, PrayerLogItem>;
    prayerHistory: PrayerLogsResponse;
    stats: Stats;
    schedule: {
        dzuhur: string;
        ashar: string;
    };
    today_date: string;
    errors?: Record<string, string>;
}

export default function StudentPrayersIndex({
    todayPrayers,
    prayerHistory,
    stats,
    schedule,
    today_date,
    errors,
}: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPrayer, setSelectedPrayer] = useState<'dzuhur' | 'ashar'>('dzuhur');
    const [status, setStatus] = useState<'berjamaah' | 'munfarid' | 'udzur'>('berjamaah');
    const [prayerTime, setPrayerTime] = useState('12:15');
    const [locationName, setLocationName] = useState('Musholla Kantor');

    const openLogDialog = (prayer: 'dzuhur' | 'ashar') => {
        setSelectedPrayer(prayer);
        const existing = todayPrayers[prayer];
        if (existing) {
            setStatus(existing.status);
            setPrayerTime(existing.prayer_time ? existing.prayer_time.substring(0, 5) : prayer === 'dzuhur' ? '12:15' : '15:30');
            setLocationName(existing.location_name || 'Musholla Kantor');
        } else {
            setStatus('berjamaah');
            setPrayerTime(prayer === 'dzuhur' ? '12:15' : '15:30');
            setLocationName('Musholla Kantor');
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/student/prayers',
            {
                prayer_name: selectedPrayer,
                status,
                prayer_time: status === 'udzur' ? null : prayerTime,
                location_name: status === 'udzur' ? null : locationName,
            },
            {
                onSuccess: () => setIsDialogOpen(false),
            }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'berjamaah':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">Berjamaah</Badge>;
            case 'munfarid':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300">Munfarid (Sendiri)</Badge>;
            case 'udzur':
                return <Badge className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300">Udzur Syar'i</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Jadwal & Log Salat" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-4 w-4" />
                        <span>Karakter & Kedisiplinan Ibadah SMK Amaliah</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Jadwal & Log Salat
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Hari ini: <strong>{today_date}</strong>. Catat pelaksanaan salat fardhu Dzuhur & Ashar selama beraktivitas di lokasi PKL.
                    </p>
                </div>

                {/* Today Prayer Action Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Dzuhur Card */}
                    <Card className="border-neutral-200 dark:border-neutral-800 relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                        <Sun className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">Salat Dzuhur</CardTitle>
                                        <p className="text-xs text-neutral-500">Estimasi waktu: {schedule.dzuhur} WIB</p>
                                    </div>
                                </div>
                                {todayPrayers.dzuhur ? (
                                    getStatusBadge(todayPrayers.dzuhur.status)
                                ) : (
                                    <Badge variant="outline" className="border-neutral-300 text-neutral-500">
                                        Belum Dicatat
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {todayPrayers.dzuhur ? (
                                <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 mb-3 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                        <span>Pukul: {todayPrayers.dzuhur.prayer_time ? todayPrayers.dzuhur.prayer_time.substring(0, 5) : '-'} WIB</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                                        <span>Tempat: {todayPrayers.dzuhur.location_name || '-'}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-500 mb-3">
                                    Laksanakan salat tepat waktu berjamaah di musholla kantor atau masjid terdekat.
                                </p>
                            )}

                            <Button
                                onClick={() => openLogDialog('dzuhur')}
                                variant={todayPrayers.dzuhur ? 'outline' : 'default'}
                                size="sm"
                                className="w-full text-xs gap-1.5"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {todayPrayers.dzuhur ? 'Perbarui Log Dzuhur' : 'Catat Salat Dzuhur'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Ashar Card */}
                    <Card className="border-neutral-200 dark:border-neutral-800 relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                                        <Moon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">Salat Ashar</CardTitle>
                                        <p className="text-xs text-neutral-500">Estimasi waktu: {schedule.ashar} WIB</p>
                                    </div>
                                </div>
                                {todayPrayers.ashar ? (
                                    getStatusBadge(todayPrayers.ashar.status)
                                ) : (
                                    <Badge variant="outline" className="border-neutral-300 text-neutral-500">
                                        Belum Dicatat
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {todayPrayers.ashar ? (
                                <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 mb-3 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                        <span>Pukul: {todayPrayers.ashar.prayer_time ? todayPrayers.ashar.prayer_time.substring(0, 5) : '-'} WIB</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                                        <span>Tempat: {todayPrayers.ashar.location_name || '-'}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-500 mb-3">
                                    Catat pelaksanaan salat Ashar sebelum atau sesudah jam pulang kerja PKL.
                                </p>
                            )}

                            <Button
                                onClick={() => openLogDialog('ashar')}
                                variant={todayPrayers.ashar ? 'outline' : 'default'}
                                size="sm"
                                className="w-full text-xs gap-1.5"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {todayPrayers.ashar ? 'Perbarui Log Ashar' : 'Catat Salat Ashar'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-neutral-500">Total Log Ibadah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_logs}</div>
                            <p className="text-[11px] text-neutral-400">Waktu tercatat</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-emerald-600">Salat Berjamaah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.berjamaah}</div>
                            <p className="text-[11px] text-neutral-400">Paling diutamakan</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-blue-600">Salat Munfarid</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.munfarid}</div>
                            <p className="text-[11px] text-neutral-400">Sendiri</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-purple-600">Kedisiplinan Berjamaah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.discipline_rate}%</div>
                            <p className="text-[11px] text-neutral-400">Tingkat konsistensi</p>
                        </CardContent>
                    </Card>
                </div>

                {/* History Table */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                        <CardTitle className="text-base font-semibold">
                            Riwayat Pencatatan Salat ({prayerHistory.total})
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <tr>
                                    <th className="px-6 py-3.5">Tanggal</th>
                                    <th className="px-6 py-3.5">Waktu Salat</th>
                                    <th className="px-6 py-3.5">Status Pelaksanaan</th>
                                    <th className="px-6 py-3.5">Jam Pelaksanaan</th>
                                    <th className="px-6 py-3.5">Lokasi / Tempat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {prayerHistory.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                                            Belum ada log salat yang tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    prayerHistory.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                            <td className="px-6 py-4 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                                                {log.date}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white capitalize">
                                                Salat {log.prayer_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(log.status)}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-neutral-600 dark:text-neutral-300">
                                                {log.prayer_time ? `${log.prayer_time.substring(0, 5)} WIB` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-neutral-600 dark:text-neutral-300">
                                                {log.location_name || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {prayerHistory.links && prayerHistory.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                            <span className="text-xs text-neutral-500">
                                Menampilkan halaman {prayerHistory.current_page} dari {prayerHistory.last_page}
                            </span>
                            <div className="flex gap-1">
                                {prayerHistory.links.map((link, idx) => (
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

            {/* Prayer Log Modal Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Catat Pelaksanaan Salat {selectedPrayer.toUpperCase()}
                        </DialogTitle>
                        <DialogDescription>
                            Pilih status pelaksanaan ibadah salat hari ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Status Pelaksanaan *</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStatus('berjamaah')}
                                    className={`rounded-lg border p-2.5 text-center text-xs font-semibold transition-all ${
                                        status === 'berjamaah'
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                            : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    Berjamaah
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('munfarid')}
                                    className={`rounded-lg border p-2.5 text-center text-xs font-semibold transition-all ${
                                        status === 'munfarid'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                            : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    Munfarid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('udzur')}
                                    className={`rounded-lg border p-2.5 text-center text-xs font-semibold transition-all ${
                                        status === 'udzur'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                            : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    Udzur Syar'i
                                </button>
                            </div>
                        </div>

                        {status !== 'udzur' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="prayer_time">Jam Pelaksanaan Salat *</Label>
                                    <Input
                                        id="prayer_time"
                                        type="time"
                                        required
                                        value={prayerTime}
                                        onChange={(e) => setPrayerTime(e.target.value)}
                                    />
                                    {errors?.prayer_time && <p className="text-xs text-red-500">{errors.prayer_time}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location_name">Lokasi / Tempat Salat *</Label>
                                    <Input
                                        id="location_name"
                                        required
                                        value={locationName}
                                        onChange={(e) => setLocationName(e.target.value)}
                                        placeholder="Contoh: Musholla Lantai 2, Masjid Al-Barokah"
                                    />
                                    {errors?.location_name && <p className="text-xs text-red-500">{errors.location_name}</p>}
                                </div>
                            </>
                        ) : (
                            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-xs text-purple-800 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300">
                                ℹ️ Status <strong>Udzur Syar'i</strong> khusus bagi siswi yang berhalangan syariat (haid/nifas). Jam dan lokasi tidak perlu diisi.
                            </div>
                        )}

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Simpan Log Salat
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
