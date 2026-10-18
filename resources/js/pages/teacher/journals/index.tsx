import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Calendar,
    CalendarCheck,
    Camera,
    CheckCircle2,
    Clock,
    Edit2,
    Eye,
    FileSpreadsheet,
    FileText,
    MessageSquare,
    Plus,
    Search,
    Send,
    Users,
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

interface StudentItem {
    id: number;
    name: string;
    nis_nip: string;
    class_name?: string | null;
    phone?: string | null;
    company?: {
        id: number;
        name: string;
        address?: string;
    } | null;
    stats?: {
        total_journals: number;
    };
}

interface JournalItem {
    id: number;
    user_id: number;
    day_number: number;
    user?: {
        id: number;
        name: string;
        nis_nip: string;
        class_name?: string | null;
        company_name: string;
    };
    date: string;
    date_formatted: string;
    work_summary: string;
    obstacles: string | null;
    work_photo_url: string | null;
    mentor_notes: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface JournalsResponse {
    data: JournalItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Stats {
    total_journals: number;
    total_students: number;
}

interface Props {
    students: StudentItem[];
    journals: JournalsResponse;
    stats: Stats;
    filters: {
        student_id: number | null;
    };
}

export default function TeacherJournalsIndex({
    students = [],
    journals,
    stats,
    filters,
}: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        filters.student_id ? Number(filters.student_id) : (students.length > 0 ? students[0].id : null)
    );
    const [activeJournal, setActiveJournal] = useState<JournalItem | null>(null);
    const [selectedJournalDetail, setSelectedJournalDetail] = useState<JournalItem | null>(null);
    const [mentorNotes, setMentorNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

    const activeStudent = useMemo(() => {
        return students.find((s) => s.id === selectedStudentId) || (students.length > 0 ? students[0] : null);
    }, [students, selectedStudentId]);

    const handleSelectStudent = (studentId: number) => {
        setSelectedStudentId(studentId);
        router.get(
            '/teacher/journals',
            {
                student_id: studentId,
            },
            { preserveState: true, replace: true }
        );
    };

    const openNoteModal = (journal: JournalItem) => {
        setActiveJournal(journal);
        setMentorNotes(journal.mentor_notes || '');
    };

    const handleNoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeJournal) return;

        setSubmitting(true);
        router.post(
            `/teacher/journals/${activeJournal.id}/review`,
            {
                mentor_notes: mentorNotes,
            },
            {
                onSuccess: () => {
                    setActiveJournal(null);
                    setSubmitting(false);
                },
                onError: () => setSubmitting(false),
            }
        );
    };

    return (
        <>
            <Head title="Review Jurnal Siswa - Guru Pembimbing" />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {/* 1. Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Review Jurnal Siswa
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold">
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 border border-slate-200/80">
                            Total: <strong className="font-bold text-slate-900">{students.length} Siswa Binaan</strong>
                        </span>
                    </div>
                </div>

                {/* Clean Filter & Student Selector Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
                                PILIH SISWA:
                            </span>

                            {/* Dropdown Pilih Siswa */}
                            <select
                                value={selectedStudentId ?? ''}
                                onChange={(e) => handleSelectStudent(Number(e.target.value))}
                                className="h-10 px-3 py-1.5 bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition min-w-[170px] max-w-[240px] truncate shrink-0"
                            >
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.class_name ? `(${s.class_name})` : ''}
                                    </option>
                                ))}
                            </select>

                            {activeStudent && (
                                <Link
                                    href={`/students/${activeStudent.slug || activeStudent.id}`}
                                    className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs shrink-0"
                                    title="Lihat Profil Siswa"
                                >
                                    <Eye className="size-4" />
                                </Link>
                            )}
                        </div>

                        {/* Info Terisi */}
                        {activeStudent && (
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 self-start sm:self-auto shrink-0">
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-bold text-[#008953]">
                                    <CalendarCheck className="size-3.5 text-[#008953]" />
                                    <span>Jurnal Terisi: <strong>{journals?.total ?? 0}</strong> / 120 Hari</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Tabel Logbook Jurnal Siswa (Tipis, Fit 100%, No Side Scroll) */}
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
                            {(!journals?.data || journals.data.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <FileText className="size-8 mx-auto text-slate-300 mb-2" />
                                        <p className="font-semibold text-sm text-slate-600">Siswa belum mengisi jurnal PKL.</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Jurnal kegiatan akan muncul di sini setelah siswa mengisinya.</p>
                                    </td>
                                </tr>
                            ) : (
                                journals.data.map((j) => (
                                    <tr
                                        key={j.id}
                                        onClick={() => setSelectedJournalDetail(j)}
                                        className="hover:bg-slate-50/80 cursor-pointer transition group"
                                        title="Klik baris untuk melihat detail lengkap jurnal & foto"
                                    >
                                        {/* Hari Ke- */}
                                        <td className="px-4 py-3 align-middle">
                                            <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 text-[11px] font-bold text-[#008953]">
                                                Hari Ke-{j.day_number}
                                            </span>
                                        </td>

                                        {/* Tanggal */}
                                        <td className="px-4 py-3 align-middle text-slate-800 font-medium text-xs truncate">
                                            {j.date_formatted}
                                        </td>

                                        {/* Ringkasan Pekerjaan (Truncated Tipis) */}
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

                                        {/* Foto Dokumentasi (Tombol Ikon Kamera) */}
                                        <td className="px-3 py-3 align-middle text-center">
                                            {j.work_photo_url ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewPhoto(j.work_photo_url);
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

                                        {/* Catatan Pembimbing (Truncated) */}
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

                    {/* Pagination */}
                    {journals?.links && journals.links.length > 3 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50 gap-3">
                            <span className="text-xs text-slate-500">
                                Menampilkan {journals?.data?.length ?? 0} dari {journals?.total ?? 0} data jurnal
                            </span>
                            <div className="flex gap-1 flex-wrap">
                                {journals.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`h-8 text-xs rounded-xl cursor-pointer ${
                                            link.active
                                                ? 'bg-[#008953] hover:bg-[#007346] text-white'
                                                : 'border-slate-200 text-slate-700 hover:text-[#008953]'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Beri Catatan Pembimbing */}
            <Dialog open={!!activeJournal} onOpenChange={(open) => !open && setActiveJournal(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl p-5">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-lg bg-emerald-50 border border-emerald-200/70 text-[#008953] px-2.5 py-0.5 text-xs font-bold">
                                Hari Ke-{activeJournal?.day_number}
                            </span>
                            <DialogTitle className="text-base font-bold text-slate-900">
                                Catatan Guru Pembimbing
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-slate-500">
                            Berikan catatan evaluasi atau arahan untuk jurnal kegiatan siswa ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleNoteSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">Tulis Catatan / Feedback</Label>
                            <textarea
                                required
                                value={mentorNotes}
                                onChange={(e) => setMentorNotes(e.target.value)}
                                rows={4}
                                placeholder="Tuliskan apresiasi, masukan perbaikan, atau catatan untuk siswa..."
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-[#008953] focus:outline-none focus:ring-1 focus:ring-[#008953] leading-relaxed"
                            />
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveJournal(null)}
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
                                <span>{submitting ? 'Menyimpan...' : 'Simpan Catatan'}</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Preview Foto */}
            <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
                <DialogContent className="sm:max-w-lg rounded-2xl p-4">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-slate-900">Foto Dokumentasi Kegiatan Siswa</DialogTitle>
                    </DialogHeader>
                    {previewPhoto && (
                        <div className="overflow-hidden rounded-xl bg-slate-900 mt-2">
                            <img src={previewPhoto} alt="Dokumentasi" className="h-auto w-full object-cover max-h-[70vh]" />
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
                                {selectedJournalDetail?.date_formatted}
                            </span>
                        </div>
                        <DialogTitle className="text-base font-bold text-slate-900 pt-1">
                            Detail Jurnal Kegiatan PKL
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            {selectedJournalDetail?.user?.name || activeStudent?.name} • {selectedJournalDetail?.user?.company_name || activeStudent?.company?.name || 'DUDI'}
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
                                        onClick={() => setPreviewPhoto(selectedJournalDetail.work_photo_url)}
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
                                        <span className="text-slate-400 italic">Belum ada catatan feedback dari guru pembimbing. Klik tombol di bawah untuk menulis catatan.</span>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer with Primary CTA Button */}
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
                                        const j = selectedJournalDetail;
                                        setSelectedJournalDetail(null);
                                        openNoteModal(j);
                                    }}
                                    size="sm"
                                    className="bg-[#008953] hover:bg-[#007346] text-white text-xs font-bold gap-2 px-4 py-2 rounded-xl shadow-xs cursor-pointer w-full sm:w-auto flex items-center justify-center"
                                >
                                    <MessageSquare className="size-3.5" />
                                    <span>{selectedJournalDetail.mentor_notes ? 'Edit Catatan Pembimbing' : 'Tulis Catatan Pembimbing'}</span>
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
