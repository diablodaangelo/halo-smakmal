import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building2,
    CalendarCheck,
    CheckCircle2,
    Clock,
    Edit2,
    Eye,
    FileSpreadsheet,
    FileText,
    Image as ImageIcon,
    Plus,
    Send,
    UploadCloud,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
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
            address?: string;
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

    const handleRemoveFile = () => {
        setDocFile(null);
        setDocFilePreview(null);
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
            <Head title="Jurnal Harian PKL - Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Jurnal Harian PKL
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Buku log pencatatan aktivitas dan pekerjaan harian PKL (Hari Ke-1 s/d Hari Ke-120).
                        </p>
                    </div>

                    <Button
                        onClick={() => openFormForDay(stats?.next_day || 1)}
                        className="bg-[#008953] hover:bg-[#007346] text-white font-bold text-xs h-9 gap-2 shadow-xs rounded-xl self-start sm:self-auto cursor-pointer"
                    >
                        <Plus className="size-4" />
                        <span>Tulis Jurnal (Hari Ke-{stats?.next_day || 1})</span>
                    </Button>
                </div>

                {/* Company & Progress Info Banner (Green with White Text) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#008953] px-5 py-3.5 text-xs text-white shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                            <Building2 className="size-4" />
                        </div>
                        <span className="text-emerald-50 truncate">
                            Tempat PKL: <strong className="font-bold text-white">{user?.company?.name || 'Belum diplot'}</strong>
                            {user?.company?.address ? ` (${user.company.address})` : ''}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 font-medium text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1.5 text-emerald-50">
                            <CalendarCheck className="size-3.5 text-emerald-200" />
                            <span>Terisi: <strong className="font-bold text-white">{stats?.total ?? 0}</strong> / 120 Hari</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1.5 text-emerald-50">
                            <CheckCircle2 className="size-3.5 text-emerald-200" />
                            <span>Target: <strong className="font-bold text-white">Hari Ke-{stats?.next_day || 1}</strong></span>
                        </span>
                    </div>
                </div>

                {/* Error Banner */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-start gap-2.5">
                        <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
                        <div>
                            <div className="font-bold">Terjadi Kesalahan:</div>
                            <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Main Table Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="size-4 text-[#008953]" />
                            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                Daftar Riwayat Jurnal Kegiatan
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            Total: <strong className="text-slate-900">{journals?.length ?? 0} Hari</strong>
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500 font-semibold">
                                    <th className="px-5 py-3.5 w-28">Hari PKL</th>
                                    <th className="px-5 py-3.5 min-w-[280px]">Kegiatan / Pekerjaan</th>
                                    <th className="px-5 py-3.5 w-48">Kendala</th>
                                    <th className="px-5 py-3.5 w-24 text-center">Foto</th>
                                    <th className="px-5 py-3.5 w-52">Catatan Guru</th>
                                    <th className="px-5 py-3.5 w-20 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {(!journals || journals.length === 0) ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <FileText className="size-8 mx-auto text-slate-300 mb-2" />
                                            <p className="font-semibold text-sm text-slate-600">Belum ada jurnal yang diisi.</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Klik tombol "Tulis Jurnal" untuk mencatat kegiatan PKL Hari Ke-1.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    journals.map((j) => (
                                        <tr key={j.id} className="hover:bg-slate-50/60 transition">
                                            {/* Hari Ke- */}
                                            <td className="px-5 py-3.5 align-top">
                                                <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 text-xs font-bold text-[#008953]">
                                                    Hari Ke-{j.day_number}
                                                </span>
                                            </td>

                                            {/* Ringkasan Pekerjaan */}
                                            <td className="px-5 py-3.5 align-top">
                                                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                                                    {j.work_summary}
                                                </p>
                                            </td>

                                            {/* Kendala */}
                                            <td className="px-5 py-3.5 align-top">
                                                {j.obstacles ? (
                                                    <div className="rounded-xl bg-amber-50/80 p-2.5 text-[11px] text-amber-900 border border-amber-200/70 leading-relaxed font-medium">
                                                        {j.obstacles}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">-</span>
                                                )}
                                            </td>

                                            {/* Foto Dokumentasi */}
                                            <td className="px-5 py-3.5 align-top text-center">
                                                {j.work_photo_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImage(j.work_photo_url)}
                                                        className="group relative size-11 rounded-xl overflow-hidden border border-slate-200 mx-auto block hover:opacity-90 shadow-2xs cursor-pointer"
                                                        title="Lihat foto kegiatan"
                                                    >
                                                        <img
                                                            src={j.work_photo_url}
                                                            alt="Dokumentasi"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                            <Eye className="size-3.5 text-white" />
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">-</span>
                                                )}
                                            </td>

                                            {/* Catatan Guru Pembimbing */}
                                            <td className="px-5 py-3.5 align-top">
                                                {j.mentor_notes ? (
                                                    <div className="rounded-xl bg-emerald-50/80 p-2.5 text-[11px] text-emerald-950 border border-emerald-200/70 leading-relaxed font-medium">
                                                        {j.mentor_notes}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">-</span>
                                                )}
                                            </td>

                                            {/* Aksi Edit */}
                                            <td className="px-5 py-3.5 align-top text-right">
                                                <Button
                                                    onClick={() => openFormForDay(j.day_number)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1 px-2.5 rounded-lg border-slate-200 text-slate-700 hover:text-[#008953] hover:border-emerald-300 cursor-pointer"
                                                >
                                                    <Edit2 className="size-3" />
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
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-lg bg-emerald-50 border border-emerald-200/70 text-[#008953] px-2.5 py-0.5 text-xs font-bold">
                                Hari Ke-{selectedDayNumber}
                            </span>
                            <DialogTitle className="text-base font-bold text-slate-900">
                                {isSelectedDayFilled
                                    ? `Edit Jurnal Hari Ke-${selectedDayNumber}`
                                    : `Tulis Jurnal Hari Ke-${selectedDayNumber}`}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-slate-500">
                            Pilih hari ke berapa PKL yang ingin dicatat atau diperbarui.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Pilihan Hari PKL */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-slate-700">Pilih Hari PKL</Label>
                                {isSelectedDayFilled && (
                                    <span className="text-[11px] text-amber-600 font-semibold">
                                        (Sudah pernah diisi - Mode Edit)
                                    </span>
                                )}
                            </div>
                            <select
                                value={selectedDayNumber}
                                onChange={(e) => handleSelectDay(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#008953] focus:outline-none focus:ring-1 focus:ring-[#008953]"
                            >
                                {Array.from({ length: 120 }, (_, i) => i + 1).map((day) => {
                                    const journalItem = journalsMap.get(day);
                                    return (
                                        <option key={day} value={day}>
                                            Hari Ke-{day}{' '}
                                            {journalItem
                                                ? `(Sudah Diisi)`
                                                : `(Belum Diisi)`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Kegiatan / Pekerjaan */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">
                                Kegiatan / Pekerjaan di DUDI *
                            </Label>
                            <textarea
                                required
                                value={workSummary}
                                onChange={(e) => setWorkSummary(e.target.value)}
                                rows={4}
                                placeholder="Jelaskan secara rinci kegiatan, modul, atau pekerjaan yang kamu kerjakan di tempat PKL hari ini..."
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-[#008953] focus:outline-none focus:ring-1 focus:ring-[#008953] leading-relaxed"
                            />
                        </div>

                        {/* Kendala */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">
                                Kendala yang Dihadapi (Opsional)
                            </Label>
                            <textarea
                                value={obstacles}
                                onChange={(e) => setObstacles(e.target.value)}
                                rows={2}
                                placeholder="Tuliskan kendala teknis atau operasional jika ada..."
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-[#008953] focus:outline-none focus:ring-1 focus:ring-[#008953] leading-relaxed"
                            />
                        </div>

                        {/* Foto Dokumentasi */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">
                                Foto Dokumentasi Kegiatan (Opsional)
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="h-9 text-xs rounded-xl border-slate-200"
                            />
                            {docFilePreview && (
                                <div className="mt-2 relative size-20 rounded-xl overflow-hidden border border-slate-200 group">
                                    <img src={docFilePreview} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition"
                                        title="Hapus foto"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-3 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                size="sm"
                                className="text-xs rounded-xl border-slate-200 cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                size="sm"
                                className="bg-[#008953] hover:bg-[#007346] text-white text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
                            >
                                <Send className="size-3.5" />
                                <span>{submitting ? 'Menyimpan...' : `Simpan Jurnal Hari Ke-${selectedDayNumber}`}</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Preview Foto */}
            <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="sm:max-w-lg rounded-2xl p-4">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-slate-900">Foto Dokumentasi Kegiatan</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="overflow-hidden rounded-xl bg-slate-900 mt-2">
                            <img src={previewImage} alt="Dokumentasi" className="h-auto w-full object-cover max-h-[70vh]" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
