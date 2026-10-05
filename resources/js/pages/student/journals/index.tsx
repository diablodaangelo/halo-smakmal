import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    CalendarCheck,
    CheckCircle2,
    Clock,
    Edit2,
    FileText,
    Image as ImageIcon,
    Plus,
    Send,
    Sparkles,
    UploadCloud,
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

interface AttendanceInfo {
    id: number;
    date: string;
    check_in_time: string;
    check_out_time: string | null;
    status: string;
}

interface Journal {
    id: number;
    user_id: number;
    attendance_id: number;
    date: string;
    work_summary: string;
    challenges: string | null;
    documentation_image_path: string | null;
    status: 'pending' | 'approved' | 'revision';
    mentor_notes: string | null;
    attendance?: AttendanceInfo;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface JournalsResponse {
    data: Journal[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Stats {
    total: number;
    approved: number;
    revision: number;
    pending: number;
}

interface Props {
    journals: JournalsResponse;
    todayAttendance: AttendanceInfo | null;
    todayJournal: Journal | null;
    stats: Stats;
    errors?: Record<string, string>;
}

export default function StudentJournalsIndex({
    journals,
    todayAttendance,
    todayJournal,
    stats,
    errors,
}: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [workSummary, setWorkSummary] = useState('');
    const [challenges, setChallenges] = useState('');
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docFilePreview, setDocFilePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const openCreateDialog = () => {
        setEditingJournal(null);
        setWorkSummary('');
        setChallenges('');
        setDocFile(null);
        setDocFilePreview(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (journal: Journal) => {
        setEditingJournal(journal);
        setWorkSummary(journal.work_summary);
        setChallenges(journal.challenges || '');
        setDocFile(null);
        setDocFilePreview(journal.documentation_image_path ? `/storage/${journal.documentation_image_path}` : null);
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
        formData.append('work_summary', workSummary);
        if (challenges) formData.append('challenges', challenges);
        if (docFile) formData.append('documentation_image', docFile);

        if (editingJournal) {
            router.post(`/student/journals/${editingJournal.id}`, formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setSubmitting(false);
                },
                onError: () => setSubmitting(false),
            });
        } else {
            router.post('/student/journals', formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setSubmitting(false);
                },
                onError: () => setSubmitting(false),
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">Disetujui</Badge>;
            case 'revision':
                return <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300">Perlu Revisi</Badge>;
            default:
                return <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300">Menunggu Review</Badge>;
        }
    };

    return (
        <>
            <Head title="Jurnal Harian PKL" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Jurnal Harian PKL
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Dokumentasikan pekerjaan, pembelajaran, dan kendala yang dihadapi di tempat PKL setiap hari.
                        </p>
                    </div>

                    {todayAttendance && !todayJournal && (
                        <Button onClick={openCreateDialog} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Tulis Jurnal Hari Ini
                        </Button>
                    )}
                </div>

                {/* Error Banner */}
                {errors?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                        {errors.error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-neutral-500">Total Jurnal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-[11px] text-neutral-400">Hari terdokumentasi</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-emerald-600">Disetujui (ACC)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
                            <p className="text-[11px] text-neutral-400">Diverifikasi pembimbing</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-amber-600">Menunggu Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                            <p className="text-[11px] text-neutral-400">Dalam antrean</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-red-600">Perlu Revisi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.revision}</div>
                            <p className="text-[11px] text-neutral-400">Butuh perbaikan</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Today Status Banner */}
                {!todayAttendance ? (
                    <div className="flex items-start gap-3.5 rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                        <div>
                            <div className="font-semibold text-sm">Belum Melakukan Presensi Masuk Hari Ini</div>
                            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                                Berdasarkan aturan sistem PKL, Anda harus melakukan presensi masuk di Dashboard terlebih dahulu sebelum diizinkan membuat jurnal harian.
                            </p>
                        </div>
                    </div>
                ) : todayJournal ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-800/80 dark:bg-emerald-950/30">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    <h3 className="font-bold text-neutral-900 dark:text-white">
                                        Jurnal Hari Ini Sudah Dikirim
                                    </h3>
                                    {getStatusBadge(todayJournal.status)}
                                </div>
                                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                                    "{todayJournal.work_summary}"
                                </p>
                            </div>

                            {todayJournal.status !== 'approved' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(todayJournal)}
                                    className="shrink-0 gap-1.5"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Edit Jurnal
                                </Button>
                            )}
                        </div>

                        {todayJournal.mentor_notes && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                                <strong>Catatan dari Pembimbing:</strong> {todayJournal.mentor_notes}
                            </div>
                        )}
                    </div>
                ) : null}

                {/* Journal History Table / Cards */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                        <CardTitle className="text-base font-semibold">
                            Riwayat Jurnal PKL ({journals.total})
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <tr>
                                    <th className="px-6 py-3.5">Tanggal</th>
                                    <th className="px-6 py-3.5">Ringkasan Pekerjaan</th>
                                    <th className="px-6 py-3.5">Kendala</th>
                                    <th className="px-6 py-3.5 text-center">Foto Dokumentasi</th>
                                    <th className="px-6 py-3.5 text-center">Status</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {journals.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-neutral-500">
                                            Belum ada jurnal harian yang dibuat.
                                        </td>
                                    </tr>
                                ) : (
                                    journals.data.map((journal) => (
                                        <tr key={journal.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                            <td className="px-6 py-4 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                                                {journal.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="line-clamp-2 max-w-md text-xs text-neutral-800 dark:text-neutral-200">
                                                    {journal.work_summary}
                                                </p>
                                                {journal.mentor_notes && (
                                                    <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                                                        Catatan: {journal.mentor_notes}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-neutral-500">
                                                {journal.challenges ? (
                                                    <p className="line-clamp-2 max-w-xs">{journal.challenges}</p>
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {journal.documentation_image_path ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImage(`/storage/${journal.documentation_image_path}`)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                                    >
                                                        <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                                                        <span>Lihat Foto</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">Tidak ada</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(journal.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {journal.status !== 'approved' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(journal)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
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
                    {journals.links && journals.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                            <span className="text-xs text-neutral-500">
                                Menampilkan halaman {journals.current_page} dari {journals.last_page}
                            </span>
                            <div className="flex gap-1">
                                {journals.links.map((link, idx) => (
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

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingJournal ? 'Edit Jurnal Harian' : 'Tulis Jurnal Harian PKL Hari Ini'}
                        </DialogTitle>
                        <DialogDescription>
                            Tuliskan kegiatan pekerjaan yang Anda lakukan hari ini secara jelas dan terperinci.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="work_summary">Ringkasan Pekerjaan & Aktivitas *</Label>
                            <textarea
                                id="work_summary"
                                required
                                rows={4}
                                value={workSummary}
                                onChange={(e) => setWorkSummary(e.target.value)}
                                placeholder="Jelaskan tugas atau kegiatan yang Anda kerjakan di instansi/kantor hari ini (minimal 20 karakter)..."
                                className="w-full rounded-md border border-neutral-300 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                            />
                            {errors?.work_summary && <p className="text-xs text-red-500">{errors.work_summary}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="challenges">Kendala yang Dihadapi (Opsional)</Label>
                            <textarea
                                id="challenges"
                                rows={2}
                                value={challenges}
                                onChange={(e) => setChallenges(e.target.value)}
                                placeholder="Tuliskan kendala teknis atau kendala kerja jika ada..."
                                className="w-full rounded-md border border-neutral-300 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="doc_image">Upload Foto Dokumentasi Kegiatan (Opsional)</Label>
                            <Input
                                id="doc_image"
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleFileChange}
                            />
                            {docFilePreview && (
                                <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
                                    <img
                                        src={docFilePreview}
                                        alt="Preview Dokumentasi"
                                        className="h-40 w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={submitting} className="gap-1.5">
                                <Send className="h-4 w-4" />
                                {submitting ? 'Mengirim...' : editingJournal ? 'Simpan Perubahan' : 'Kirim Jurnal'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Photo Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Foto Dokumentasi Jurnal</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="overflow-hidden rounded-lg">
                            <img src={previewImage} alt="Foto Dokumentasi Jurnal" className="w-full object-contain max-h-[70vh]" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
