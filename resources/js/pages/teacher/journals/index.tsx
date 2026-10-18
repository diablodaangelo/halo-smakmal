import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Calendar,
    CalendarCheck,
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
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Evaluasi pencatatan aktivitas kerja harian siswa binaan dan berikan catatan bimbingan/feedback.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold">
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 border border-slate-200/80">
                            Total: <strong className="font-bold text-slate-900">{students.length} Siswa Binaan</strong>
                        </span>
                    </div>
                </div>

                {/* Clean Filter & Student Selector Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5 flex-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
                                Pilih Siswa:
                            </span>

                            {/* Dropdown Pilih Siswa */}
                            <select
                                value={selectedStudentId ?? ''}
                                onChange={(e) => handleSelectStudent(Number(e.target.value))}
                                className="h-10 px-3.5 py-1.5 bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition min-w-[240px] flex-1 sm:flex-initial"
                            >
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.class_name ? `(${s.class_name})` : ''} - {s.company?.name || 'Belum Diplot'} ({s.stats?.total_journals ?? 0} hari)
                                    </option>
                                ))}
                            </select>

                            {activeStudent && (
                                <Link
                                    href={`/students/${activeStudent.slug || activeStudent.id}`}
                                    className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-[#008953] transition shadow-2xs"
                                    title="Lihat Profil Siswa"
                                >
                                    <Eye className="size-4" />
                                </Link>
                            )}
                        </div>

                        {/* Info Terisi */}
                        {activeStudent && (
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 self-start sm:self-auto">
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-bold text-[#008953]">
                                    <CalendarCheck className="size-3.5 text-[#008953]" />
                                    <span>Jurnal Terisi: <strong>{journals?.total ?? 0}</strong> / 120 Hari</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Tabel Logbook Jurnal Siswa */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#008953] text-white">
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider rounded-tl-xl w-28">
                                        Hari PKL
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider min-w-[280px]">
                                        Kegiatan / Pekerjaan
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider w-44">
                                        Kendala
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider w-24 text-center">
                                        Foto
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider w-56">
                                        Catatan Guru Pembimbing
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-right rounded-tr-xl w-24">
                                        Aksi
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
                                                        onClick={() => setPreviewPhoto(j.work_photo_url)}
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

                                            {/* Catatan Pembimbing */}
                                            <td className="px-5 py-3.5 align-top">
                                                {j.mentor_notes ? (
                                                    <div className="rounded-xl bg-emerald-50/80 p-2.5 text-[11px] text-emerald-950 border border-emerald-200/70 leading-relaxed font-medium">
                                                        {j.mentor_notes}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Belum ada catatan</span>
                                                )}
                                            </td>

                                            {/* Tombol Beri Catatan */}
                                            <td className="px-5 py-3.5 align-top text-right">
                                                <Button
                                                    onClick={() => openNoteModal(j)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1 px-2.5 rounded-lg border-slate-200 text-slate-700 hover:text-[#008953] hover:border-emerald-300 cursor-pointer"
                                                >
                                                    <MessageSquare className="size-3" />
                                                    <span>{j.mentor_notes ? 'Edit' : 'Catatan'}</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

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
        </>
    );
}
