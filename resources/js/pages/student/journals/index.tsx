import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building2,
    CheckCircle2,
    Clock,
    Edit2,
    Eye,
    FileSpreadsheet,
    FileText,
    Image as ImageIcon,
    Plus,
    Send,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

interface Journal {
    id: number;
    day_number: number;
    work_summary: string;
    obstacles: string | null;
    work_photo_url: string | null;
    mentor_notes: string | null;
}

interface Stats {
    total: number;
    max_day: number;
    next_day: number;
}

interface Props {
    journals: Journal[];
    stats: Stats;
    user?: {
        name: string;
        company?: {
            name: string;
        } | null;
    };
    errors?: Record<string, string>;
}

export default function StudentJournalsIndex({
    journals = [],
    stats,
    user,
    errors,
}: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Form states
    const [selectedDayNumber, setSelectedDayNumber] = useState<number>(stats?.next_day || 1);
    const [workSummary, setWorkSummary] = useState('');
    const [obstacles, setObstacles] = useState('');
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docFilePreview, setDocFilePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Map of journals by day_number for quick lookup
    const journalsMap = useMemo(() => {
        const map = new Map<number, Journal>();
        (journals || []).forEach((j) => {
            map.set(Number(j.day_number), j);
        });
        return map;
    }, [journals]);

    // Check if the selected day number is already filled
    const isSelectedDayFilled = useMemo(() => {
        return journalsMap.has(Number(selectedDayNumber));
    }, [journalsMap, selectedDayNumber]);

    // When student selects a day number, populate form with existing data if present
    const handleSelectDay = (dayNum: number) => {
        setSelectedDayNumber(dayNum);
        const existing = journalsMap.get(Number(dayNum));
        if (existing) {
            setWorkSummary(existing.work_summary);
            setObstacles(existing.obstacles || '');
            setDocFile(null);
            setDocFilePreview(existing.work_photo_url);
        } else {
            setWorkSummary('');
            setObstacles('');
            setDocFile(null);
            setDocFilePreview(null);
        }
    };

    // Open modal to add or edit a specific day
    const openFormForDay = (dayNum: number) => {
        handleSelectDay(dayNum);
        setIsDialogOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setDocFile(file);
            setDocFilePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('day_number', String(selectedDayNumber));
        formData.append('work_summary', workSummary);
        if (obstacles) formData.append('obstacles', obstacles);
        if (docFile) formData.append('work_photo', docFile);

        router.post('/student/journals', formData, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Buku Jurnal PKL - Siswa" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <BookOpen className="h-4 w-4" />
                            <span>Buku Jurnal Harian PKL • Siswa</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Logbook Jurnal PKL
                        </h1>
                        <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                            Pengisian jurnal berdasarkan hari PKL (Hari Ke-1 s/d Hari Ke-120).
                        </p>
                    </div>

                    <div>
                        <Button
                            onClick={() => openFormForDay(stats?.next_day || 1)}
                            className="bg-emerald-600 hover:bg-emerald-500 font-bold text-xs h-9 gap-1.5 shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Tulis Jurnal (Hari Ke-{stats?.next_day || 1})</span>
                        </Button>
                    </div>
                </div>

                {/* Error Banner */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300 flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                        <div>
                            <div className="font-bold">Perhatian:</div>
                            <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs sm:col-span-2 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-base shadow-sm">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                                        Logbook: {user?.name}
                                    </h3>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                                        <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Tempat DUDI: <strong>{user?.company?.name || 'Belum diplot'}</strong></span>
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                    {stats?.total ?? 0} <span className="text-sm font-normal text-neutral-500">/ 120</span>
                                </div>
                                <div className="text-[11px] text-neutral-400">Hari Terisi</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs p-5 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-neutral-500">Hari Selanjutnya Untuk Diisi</span>
                        <div className="text-sm font-bold mt-1 text-emerald-600 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Hari Ke-{stats?.next_day || 1}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                            Maksimal PKL adalah 120 hari kerja (4 bulan).
                        </p>
                    </Card>
                </div>

                {/* Logbook Table */}
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/60 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                                <FileSpreadsheet className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                                    Daftar Jurnal PKL Per Hari
                                </h3>
                                <p className="text-[11px] text-neutral-500">
                                    Tabel urutan logbook kegiatan per hari PKL
                                </p>
                            </div>
                        </div>

                        <span className="text-xs text-neutral-500">
                            Total: <strong>{journals?.length ?? 0} Hari</strong>
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-100/70 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3.5 px-4 w-32">Hari PKL</th>
                                    <th className="py-3.5 px-4 min-w-[320px]">Kegiatan / Pekerjaan di DUDI</th>
                                    <th className="py-3.5 px-4 w-52">Kendala</th>
                                    <th className="py-3.5 px-4 w-24 text-center">Foto</th>
                                    <th className="py-3.5 px-4 w-52">Catatan Pembimbing</th>
                                    <th className="py-3.5 px-4 w-20 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {(!journals || journals.length === 0) ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                                            <FileText className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                                            <p className="font-semibold text-sm">Belum ada jurnal yang diisi.</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                Klik tombol "Tulis Jurnal" untuk mengisi kegiatan PKL Hari Ke-1.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    journals.map((j) => (
                                        <tr key={j.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition">
                                            {/* Hari Ke- */}
                                            <td className="py-3.5 px-4 align-top">
                                                <span className="inline-flex items-center rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                    Hari Ke-{j.day_number}
                                                </span>
                                            </td>

                                            {/* Ringkasan Pekerjaan */}
                                            <td className="py-3.5 px-4 align-top">
                                                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
                                                    {j.work_summary}
                                                </p>
                                            </td>

                                            {/* Kendala */}
                                            <td className="py-3.5 px-4 align-top">
                                                {j.obstacles ? (
                                                    <div className="rounded-lg bg-amber-50/70 p-2 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/50 leading-relaxed">
                                                        {j.obstacles}
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400 text-[11px] italic">-</span>
                                                )}
                                            </td>

                                            {/* Foto Dokumentasi */}
                                            <td className="py-3.5 px-4 align-top text-center">
                                                {j.work_photo_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImage(j.work_photo_url)}
                                                        className="group relative size-12 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 mx-auto block hover:opacity-90"
                                                        title="Lihat foto"
                                                    >
                                                        <img
                                                            src={j.work_photo_url}
                                                            alt="Dokumentasi"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                            <Eye className="h-3.5 w-3.5 text-white" />
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-neutral-400">-</span>
                                                )}
                                            </td>

                                            {/* Catatan Pembimbing */}
                                            <td className="py-3.5 px-4 align-top">
                                                {j.mentor_notes ? (
                                                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-[11px] text-emerald-900 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-900 leading-relaxed">
                                                        {j.mentor_notes}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-neutral-400 italic">-</span>
                                                )}
                                            </td>

                                            {/* Aksi Edit */}
                                            <td className="py-3.5 px-4 align-top text-right">
                                                <Button
                                                    onClick={() => openFormForDay(j.day_number)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1 px-2.5"
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                    <span>Edit</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form Input / Edit Jurnal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-md bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold dark:bg-emerald-950 dark:text-emerald-300">
                                Hari Ke-{selectedDayNumber}
                            </span>
                            <DialogTitle className="text-base font-bold">
                                {isSelectedDayFilled
                                    ? `Edit Jurnal Hari Ke-${selectedDayNumber}`
                                    : `Isi Jurnal Hari Ke-${selectedDayNumber}`}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs">
                            Pilih hari ke berapa PKL yang ingin diisi atau diedit.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Pilihan Hari PKL */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">Pilih Hari PKL *</Label>
                                {isSelectedDayFilled && (
                                    <span className="text-[11px] text-amber-600 font-semibold dark:text-amber-400">
                                        (Sudah pernah diisi - Mode Edit)
                                    </span>
                                )}
                            </div>
                            <select
                                value={selectedDayNumber}
                                onChange={(e) => handleSelectDay(Number(e.target.value))}
                                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                {Array.from({ length: 120 }, (_, i) => i + 1).map((day) => {
                                    const journalItem = journalsMap.get(day);
                                    return (
                                        <option key={day} value={day}>
                                            Hari Ke-{day}{' '}
                                            {journalItem
                                                ? `✓ (Sudah Diisi)`
                                                : `(Belum Diisi)`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Kegiatan / Pekerjaan */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Kegiatan / Pekerjaan di DUDI *
                            </Label>
                            <textarea
                                required
                                value={workSummary}
                                onChange={(e) => setWorkSummary(e.target.value)}
                                rows={4}
                                placeholder="Jelaskan apa saja kegiatan atau pekerjaan yang kamu lakukan di tempat PKL..."
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 leading-relaxed"
                            />
                        </div>

                        {/* Kendala */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Kendala yang Dihadapi (Opsional)
                            </Label>
                            <textarea
                                value={obstacles}
                                onChange={(e) => setObstacles(e.target.value)}
                                rows={2}
                                placeholder="Tuliskan jika ada kendala..."
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 leading-relaxed"
                            />
                        </div>

                        {/* Foto Dokumentasi */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Foto Dokumentasi (Opsional)
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="h-9 text-xs"
                            />
                            {docFilePreview && (
                                <div className="mt-2 relative size-20 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                    <img src={docFilePreview} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                size="sm"
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold gap-1.5"
                            >
                                <Send className="h-3.5 w-3.5" />
                                <span>{submitting ? 'Menyimpan...' : `Simpan Jurnal Hari Ke-${selectedDayNumber}`}</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Preview Foto */}
            <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">Foto Dokumentasi Kegiatan</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="overflow-hidden rounded-xl bg-black">
                            <img src={previewImage} alt="Dokumentasi" className="h-auto w-full object-cover" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
