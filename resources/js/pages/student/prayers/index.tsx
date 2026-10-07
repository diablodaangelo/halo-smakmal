import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Info,
    MapPin,
    Moon,
    Plus,
    Sparkles,
    Sun,
} from 'lucide-react';
import React, { useState } from 'react';
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
    from: number;
    to: number;
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
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Berjamaah
                    </span>
                );
            case 'munfarid':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-semibold">
                        Munfarid (Sendiri)
                    </span>
                );
            case 'udzur':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 px-2.5 py-0.5 text-[11px] font-semibold">
                        Udzur Syar'i
                    </span>
                );
            default:
                return (
                    <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[11px] font-medium">
                        {status}
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Jadwal & Log Salat - Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {/* Header Title Section */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                        Jadwal & Log Salat
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Hari ini: <strong>{today_date}</strong>. Dokumentasikan pelaksanaan ibadah salat fardhu Dzuhur & Ashar selama beraktivitas di lokasi PKL.
                    </p>
                </div>

                {/* Today Prayer Action Cards (2 Clean Cards: Dzuhur & Ashar) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Dzuhur Card */}
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                                        <Sun className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">Salat Dzuhur</h2>
                                        <p className="text-xs text-slate-400">Estimasi: {schedule.dzuhur} WIB</p>
                                    </div>
                                </div>
                                {todayPrayers.dzuhur ? (
                                    getStatusBadge(todayPrayers.dzuhur.status)
                                ) : (
                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                                        Belum Dicatat
                                    </span>
                                )}
                            </div>

                            <div className="py-4">
                                {todayPrayers.dzuhur ? (
                                    <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 border border-slate-100 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="size-3.5 text-slate-400 shrink-0" />
                                            <span>
                                                Pukul: <strong className="font-mono font-bold text-slate-900">{todayPrayers.dzuhur.prayer_time ? todayPrayers.dzuhur.prayer_time.substring(0, 5) : '-'} WIB</strong>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="size-3.5 text-slate-400 shrink-0" />
                                            <span>
                                                Tempat: <strong className="font-semibold text-slate-800">{todayPrayers.dzuhur.location_name || '-'}</strong>
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 leading-relaxed py-1">
                                        Laksanakan salat Dzuhur tepat waktu berjamaah di musholla kantor atau masjid terdekat.
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={() => openLogDialog('dzuhur')}
                            className={`w-full gap-2 text-xs font-semibold h-10 rounded-xl shadow-xs ${
                                todayPrayers.dzuhur
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                                    : 'bg-[#008953] hover:bg-[#007346] text-white'
                            }`}
                        >
                            <CheckCircle2 className="size-4" />
                            <span>{todayPrayers.dzuhur ? 'Perbarui Log Dzuhur' : 'Catat Salat Dzuhur'}</span>
                        </Button>
                    </div>

                    {/* Ashar Card */}
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                                        <Moon className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">Salat Ashar</h2>
                                        <p className="text-xs text-slate-400">Estimasi: {schedule.ashar} WIB</p>
                                    </div>
                                </div>
                                {todayPrayers.ashar ? (
                                    getStatusBadge(todayPrayers.ashar.status)
                                ) : (
                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                                        Belum Dicatat
                                    </span>
                                )}
                            </div>

                            <div className="py-4">
                                {todayPrayers.ashar ? (
                                    <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 border border-slate-100 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="size-3.5 text-slate-400 shrink-0" />
                                            <span>
                                                Pukul: <strong className="font-mono font-bold text-slate-900">{todayPrayers.ashar.prayer_time ? todayPrayers.ashar.prayer_time.substring(0, 5) : '-'} WIB</strong>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="size-3.5 text-slate-400 shrink-0" />
                                            <span>
                                                Tempat: <strong className="font-semibold text-slate-800">{todayPrayers.ashar.location_name || '-'}</strong>
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 leading-relaxed py-1">
                                        Catat pelaksanaan salat Ashar sebelum atau sesudah jam pulang kerja PKL.
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={() => openLogDialog('ashar')}
                            className={`w-full gap-2 text-xs font-semibold h-10 rounded-xl shadow-xs ${
                                todayPrayers.ashar
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                                    : 'bg-[#008953] hover:bg-[#007346] text-white'
                            }`}
                        >
                            <CheckCircle2 className="size-4" />
                            <span>{todayPrayers.ashar ? 'Perbarui Log Ashar' : 'Catat Salat Ashar'}</span>
                        </Button>
                    </div>
                </div>

                {/* History Table Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                        <h2 className="text-sm font-bold text-slate-900">
                            Riwayat Pencatatan Salat ({prayerHistory.total})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-500 font-semibold">
                                    <th className="px-5 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5">Waktu Salat</th>
                                    <th className="px-5 py-3.5">Status Pelaksanaan</th>
                                    <th className="px-5 py-3.5">Jam Pelaksanaan</th>
                                    <th className="px-5 py-3.5">Lokasi / Tempat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {prayerHistory.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-slate-400">
                                            Belum ada log salat yang tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    prayerHistory.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-3.5 font-mono text-slate-600 font-medium">
                                                {log.date}
                                            </td>
                                            <td className="px-5 py-3.5 font-bold text-slate-900 capitalize">
                                                Salat {log.prayer_name}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {getStatusBadge(log.status)}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-slate-800">
                                                {log.prayer_time ? `${log.prayer_time.substring(0, 5)} WIB` : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-700">
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-medium">
                                Menampilkan {prayerHistory.from || (prayerHistory.data.length > 0 ? 1 : 0)} sampai{' '}
                                {prayerHistory.to || prayerHistory.data.length} dari {prayerHistory.total} catatan
                            </span>

                            <div className="flex items-center gap-1">
                                {prayerHistory.links.map((link, idx) => (
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

            {/* Prayer Log Modal Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Catat Pelaksanaan Salat {selectedPrayer.toUpperCase()}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Pilih status pelaksanaan ibadah salat hari ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700">Status Pelaksanaan *</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStatus('berjamaah')}
                                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                                        status === 'berjamaah'
                                            ? 'border-[#008953] bg-emerald-50 text-[#008953]'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    Berjamaah
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('munfarid')}
                                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                                        status === 'munfarid'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    Munfarid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('udzur')}
                                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                                        status === 'udzur'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    Udzur Syar'i
                                </button>
                            </div>
                        </div>

                        {status !== 'udzur' ? (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="prayer_time" className="text-xs font-semibold text-slate-700">Jam Pelaksanaan Salat *</Label>
                                    <Input
                                        id="prayer_time"
                                        type="time"
                                        required
                                        value={prayerTime}
                                        onChange={(e) => setPrayerTime(e.target.value)}
                                        className="h-10 text-xs rounded-xl"
                                    />
                                    {errors?.prayer_time && <p className="text-xs text-rose-500">{errors.prayer_time}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="location_name" className="text-xs font-semibold text-slate-700">Lokasi / Tempat Salat *</Label>
                                    <Input
                                        id="location_name"
                                        required
                                        value={locationName}
                                        onChange={(e) => setLocationName(e.target.value)}
                                        placeholder="Contoh: Musholla Kantor, Masjid Al-Barokah"
                                        className="h-10 text-xs rounded-xl"
                                    />
                                    {errors?.location_name && <p className="text-xs text-rose-500">{errors.location_name}</p>}
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-3 text-xs text-purple-900 flex items-start gap-2">
                                <Info className="size-4 shrink-0 text-purple-600 mt-0.5" />
                                <div>
                                    Status <strong>Udzur Syar'i</strong> khusus bagi siswi yang berhalangan syariat (haid/nifas). Jam dan lokasi tidak perlu diisi.
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-3 gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10 text-xs rounded-xl">
                                Batal
                            </Button>
                            <Button type="submit" className="bg-[#008953] hover:bg-[#007346] text-white font-semibold h-10 text-xs rounded-xl">
                                Simpan Log Salat
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
