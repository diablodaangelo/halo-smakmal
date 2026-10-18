import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building2,
    CalendarCheck,
    Camera,
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
    date?: string | null;
    date_formatted?: string;
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
    const [selectedJournalDetail, setSelectedJournalDetail] = useState<Journal | null>(null);

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

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                {/* 1. Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            Jurnal Harian PKL
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                        {user?.company && (
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-2xs text-xs font-bold text-slate-700">
                                <Building2 className="h-4 w-4 text-[#008953]" />
                                <span className="truncate max-w-[200px]">{user.company.name}</span>
                            </div>
                        )}

                        <Button
                            onClick={() => openFormForDay(stats?.next_day || 1)}
                            className="bg-[#008953] hover:bg-[#007346] text-white font-bold text-xs h-10 px-4 gap-2 shadow-xs rounded-xl cursor-pointer"
                        >
                            <Plus className="size-4" />
                            <span>Tulis Jurnal (Hari Ke-{stats?.next_day || 1})</span>
                        </Button>
                    </div>
                </div>

                {/* 2. Top Stats Bar (Clean Style Matching Attendance History) */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-xl bg-white px-3.5 py-2 text-slate-700 border border-slate-200/80 shadow-2xs">
                        Terisi: <strong className="text-slate-900 font-bold">{stats?.total ?? 0} / 120 Hari</strong>
                    </span>
                    <span className="rounded-xl bg-emerald-50 px-3.5 py-2 text-[#008953] border border-emerald-200/80 shadow-2xs">
                        Target Berikutnya: <strong className="font-bold">Hari Ke-{stats?.next_day || 1}</strong>
                    </span>
                    <span className="rounded-xl bg-white px-3.5 py-2 text-slate-600 border border-slate-200/80 shadow-2xs">
                        Progres: <strong className="text-[#008953] font-bold">{Math.round(((stats?.total ?? 0) / 120) * 100)}%</strong>
                    </span>
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

                {/* 3. Main Journal Table (Tipis, Fit 100%, No Side Scroll, Row Clickable) */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <table className="w-full table-fixed text-left border-collapse">
                        <thead>
                            <tr className="bg-[#008953] text-white">
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-tl-xl w-[13%]">
                                    Hari PKL
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider w-[17%]">
                                    Tanggal
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider w-[32%]">
                                    Kegiatan / Pekerjaan
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider w-[16%]">
                                    Kendala
                                </th>
                                <th className="px-3 py-3.5 text-xs font-bold uppercase tracking-wider w-[10%] text-center">
                                    Foto
                                </th>
                                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-tr-xl w-[12%]">
                                    Catatan Guru
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
                            {(!journals || journals.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <FileText className="size-6" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">
                                                Belum ada catatan jurnal harian
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Klik tombol "Tulis Jurnal" untuk mencatat kegiatan PKL Hari Ke-1.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                journals.map((j) => (
                                    <tr
                                        key={j.id}
                                        onClick={() => setSelectedJournalDetail(j)}
                                        className="hover:bg-slate-50/80 cursor-pointer transition group"
                                        title="Klik baris untuk melihat detail lengkap jurnal & foto"
                                    >
                                        {/* Hari PKL */}
                                        <td className="px-4 py-3 align-middle">
                                            <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 text-[11px] font-bold text-[#008953]">
                                                Hari Ke-{j.day_number}
                                            </span>
                                        </td>

                                        {/* Tanggal */}
                                        <td className="px-4 py-3 align-middle text-slate-800 font-medium text-xs truncate">
                                            {j.date_formatted || '-'}
                                        </td>

                                        {/* Kegiatan / Pekerjaan (Truncated Tipis) */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="truncate text-xs text-slate-800 font-medium group-hover:text-[#008953] transition-colors" title={j.work_summary}>
                                                {j.work_summary}
                                            </div>
                                        </td>

                                        {/* Kendala (Truncated) */}
                                        <td className="px-4 py-3 align-middle">
                                            {j.obstacles ? (
                                                <div className="truncate text-xs text-amber-700 font-medium" title={j.obstacles}>
                                                    {j.obstacles}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>

                                        {/* Foto Dokumentasi */}
                                        <td className="px-3 py-3 align-middle text-center">
                                            {j.work_photo_url ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(j.work_photo_url);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 hover:bg-[#008953] hover:text-white hover:border-[#008953] transition shadow-2xs cursor-pointer group/btn"
                                                    title="Lihat foto kegiatan"
                                                >
                                                    <Camera className="size-3.5 text-[#008953] group-hover/btn:text-white transition-colors" />
                                                    <span>Foto</span>
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>

                                        {/* Catatan Guru Pembimbing */}
                                        <td className="px-4 py-3 align-middle">
                                            {j.mentor_notes ? (
                                                <div className="truncate text-xs text-[#008953] font-medium" title={j.mentor_notes}>
                                                    {j.mentor_notes}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Belum ada</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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

            {/* Modal Detail Jurnal Lengkap (Dibuka saat Baris Tabel Diklik) */}
            <Dialog open={!!selectedJournalDetail} onOpenChange={(open) => !open && setSelectedJournalDetail(null)}>
                <DialogContent className="sm:max-w-xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-lg bg-emerald-50 border border-emerald-200/70 text-[#008953] px-2.5 py-0.5 text-xs font-bold">
                                Hari Ke-{selectedJournalDetail?.day_number}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                                {selectedJournalDetail?.date_formatted || '-'}
                            </span>
                        </div>
                        <DialogTitle className="text-base font-bold text-slate-900 pt-1">
                            Detail Jurnal Kegiatan PKL
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            {user?.name} {user?.company?.name ? `• ${user.company.name}` : ''}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedJournalDetail && (
                        <div className="space-y-4 pt-2">
                            {/* 1. Kegiatan / Pekerjaan */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Kegiatan / Pekerjaan yang Dilakukan
                                </Label>
                                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                                    {selectedJournalDetail.work_summary}
                                </div>
                            </div>

                            {/* 2. Kendala */}
                            {selectedJournalDetail.obstacles && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                        Kendala yang Dihadapi
                                    </Label>
                                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs sm:text-sm text-amber-900 leading-relaxed whitespace-pre-line font-medium">
                                        {selectedJournalDetail.obstacles}
                                    </div>
                                </div>
                            )}

                            {/* 3. Foto Dokumentasi */}
                            {selectedJournalDetail.work_photo_url && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Foto Dokumentasi Kegiatan
                                    </Label>
                                    <div
                                        onClick={() => setPreviewImage(selectedJournalDetail.work_photo_url)}
                                        className="overflow-hidden rounded-xl border border-slate-200 aspect-16/9 bg-slate-900 cursor-pointer group relative max-h-64 flex items-center justify-center"
                                        title="Klik untuk memperbesar foto"
                                    >
                                        <img
                                            src={selectedJournalDetail.work_photo_url}
                                            alt="Foto Dokumentasi"
                                            className="h-full w-full object-cover group-hover:opacity-90 transition"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-bold gap-1.5">
                                            <Eye className="size-4" />
                                            <span>Klik untuk Perbesar</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. Catatan Pembimbing */}
                            <div className="space-y-1.5 pt-1">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Catatan Guru Pembimbing
                                </Label>
                                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                                    {selectedJournalDetail.mentor_notes ? (
                                        <p className="whitespace-pre-line">{selectedJournalDetail.mentor_notes}</p>
                                    ) : (
                                        <span className="text-slate-400 italic">Belum ada catatan feedback dari guru pembimbing.</span>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer with Primary CTA Edit Button */}
                            <DialogFooter className="pt-3 gap-2 flex-col-reverse sm:flex-row sm:justify-between border-t border-slate-100 mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSelectedJournalDetail(null)}
                                    size="sm"
                                    className="text-xs rounded-xl border-slate-200 cursor-pointer w-full sm:w-auto"
                                >
                                    Tutup
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const dayNum = selectedJournalDetail.day_number;
                                        setSelectedJournalDetail(null);
                                        openFormForDay(dayNum);
                                    }}
                                    size="sm"
                                    className="bg-[#008953] hover:bg-[#007346] text-white text-xs font-bold gap-1.5 rounded-xl cursor-pointer w-full sm:w-auto shadow-xs"
                                >
                                    <Edit2 className="size-3.5" />
                                    <span>Edit Jurnal</span>
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
