import { Head, router } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Edit2,
    Eye,
    FileSpreadsheet,
    FileText,
    Image as ImageIcon,
    MessageSquare,
    Plus,
    Search,
    Send,
    Users,
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

interface StudentItem {
    id: number;
    name: string;
    nis_nip: string;
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

interface AttendanceSummary {
    check_in_time: string | null;
    check_out_time: string | null;
    status: string;
}

interface JournalItem {
    id: number;
    user_id: number;
    day_number: number;
    user?: {
        id: number;
        name: string;
        nis_nip: string;
        company_name: string;
    };
    date: string;
    date_formatted: string;
    work_summary: string;
    obstacles: string | null;
    work_photo_url: string | null;
    mentor_notes: string | null;
    attendance: AttendanceSummary | null;
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
        filters.student_id ?? null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [activeJournal, setActiveJournal] = useState<JournalItem | null>(null);
    const [mentorNotes, setMentorNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [detailJournal, setDetailJournal] = useState<JournalItem | null>(null);

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const query = searchQuery.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(query) ||
                s.nis_nip.toLowerCase().includes(query) ||
                s.company?.name.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    const activeStudent = useMemo(() => {
        return students.find((s) => s.id === selectedStudentId) || null;
    }, [students, selectedStudentId]);

    const handleSelectStudent = (studentId: number | null) => {
        setSelectedStudentId(studentId);
        router.get(
            '/teacher/journals',
            {
                student_id: studentId ?? undefined,
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
            <Head title="Buku Jurnal PKL Siswa - Guru Pembimbing" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* 1. Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <BookOpen className="h-4 w-4" />
                            <span>Rekap Logbook PKL Siswa • Guru Pembimbing</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Buku Jurnal Harian Siswa
                        </h1>
                        <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                            Rekapitulasi seluruh kegiatan kerja harian siswa di tempat PKL untuk dievaluasi pada sidang PKL.
                        </p>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300">
                            <span className="font-bold">{stats.total_journals}</span> Total Hari Jurnal Masuk
                        </div>
                        <div className="rounded-lg bg-neutral-100 border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                            <span className="font-bold">{stats.total_students}</span> Siswa Binaan
                        </div>
                    </div>
                </div>

                {/* 2. Pilihan Siswa Binaan */}
                <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Pilih Buku Jurnal Siswa:
                        </h2>
                        {students.length > 4 && (
                            <div className="w-full sm:w-64">
                                <Input
                                    placeholder="Cari nama atau NIS siswa..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {/* Option: Semua Siswa */}
                        <button
                            type="button"
                            onClick={() => handleSelectStudent(null)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition ${
                                selectedStudentId === null
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                    : 'border-neutral-200 bg-white hover:border-emerald-300 dark:border-neutral-800 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                                    selectedStudentId === null ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                }`}>
                                    <Users className="h-4 w-4" />
                                </div>
                                <div className="truncate">
                                    <div className="font-bold truncate">Semua Siswa</div>
                                    <div className={`text-[11px] truncate ${selectedStudentId === null ? 'text-emerald-100' : 'text-neutral-400'}`}>
                                        Seluruh Logbook Siswa
                                    </div>
                                </div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                selectedStudentId === null ? 'bg-white text-emerald-800' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}>
                                {stats.total_journals}
                            </span>
                        </button>

                        {/* List Siswa */}
                        {filteredStudents.map((s) => {
                            const isSelected = selectedStudentId === s.id;
                            const total = s.stats?.total_journals ?? 0;

                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectStudent(s.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition ${
                                        isSelected
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-100 ring-2 ring-emerald-500/20 shadow-xs'
                                            : 'border-neutral-200 bg-white hover:border-emerald-300 dark:border-neutral-800 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 pr-1.5">
                                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                                            isSelected
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                                        }`}>
                                            {s.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="truncate">
                                            <div className="font-bold truncate text-neutral-900 dark:text-white">
                                                {s.name}
                                            </div>
                                            <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
                                                <Building2 className="h-3 w-3 shrink-0 text-neutral-400" />
                                                <span>{s.company?.name || 'Belum Diplot'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                            {total} Hari
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Baris Header Siswa Aktif */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
                            <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                                    Buku Jurnal: {activeStudent ? activeStudent.name : 'Seluruh Siswa Binaan'}
                                </h3>
                                {activeStudent && (
                                    <span className="rounded-md bg-neutral-200/80 dark:bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                                        NIS: {activeStudent.nis_nip}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-neutral-500">
                                {activeStudent
                                    ? `Tempat PKL: ${activeStudent.company?.name || 'Belum diplot DUDI'} • Total: ${activeStudent.stats?.total_journals ?? 0} Hari Jurnal Terisi`
                                    : 'Menampilkan gabungan logbook seluruh siswa binaan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4. Format Tabel Buku Jurnal PKL (Logbook) */}
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-100/70 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3.5 px-4 w-32">Hari PKL</th>
                                    {selectedStudentId === null && <th className="py-3.5 px-4 w-44">Nama Siswa</th>}
                                    <th className="py-3.5 px-4 min-w-[300px]">Kegiatan / Pekerjaan di DUDI</th>
                                    <th className="py-3.5 px-4 w-48">Kendala</th>
                                    <th className="py-3.5 px-4 w-28 text-center">Foto</th>
                                    <th className="py-3.5 px-4 min-w-[240px]">Catatan Guru Pembimbing</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {journals?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={selectedStudentId === null ? 6 : 5} className="py-12 text-center text-neutral-500">
                                            <FileText className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                                            <p className="font-semibold text-sm">Belum ada catatan jurnal.</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">Siswa dapat mengisi jurnal harian kapan saja melalui akun masing-masing.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    journals.data.map((j) => (
                                        <tr
                                            key={j.id}
                                            className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition"
                                        >
                                            {/* 1. Hari Ke- */}
                                            <td className="py-3.5 px-4 align-top">
                                                <span className="inline-flex items-center rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                    Hari Ke-{j.day_number}
                                                </span>
                                            </td>

                                            {/* 1b. Nama Siswa jika mode Semua */}
                                            {selectedStudentId === null && (
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="font-bold text-neutral-900 dark:text-white">
                                                        {j.user?.name}
                                                    </div>
                                                    <div className="text-[11px] text-neutral-500">
                                                        NIS: {j.user?.nis_nip}
                                                    </div>
                                                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate max-w-[150px]">
                                                        {j.user?.company_name}
                                                    </div>
                                                </td>
                                            )}

                                            {/* 2. Ringkasan Pekerjaan */}
                                            <td className="py-3.5 px-4 align-top">
                                                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-3 whitespace-pre-line">
                                                    {j.work_summary}
                                                </p>
                                                {j.work_summary.length > 150 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailJournal(j)}
                                                        className="mt-1 text-[11px] font-semibold text-emerald-600 hover:underline"
                                                    >
                                                        Lihat Selengkapnya...
                                                    </button>
                                                )}
                                            </td>

                                            {/* 3. Kendala */}
                                            <td className="py-3.5 px-4 align-top">
                                                {j.obstacles ? (
                                                    <div className="rounded-lg bg-amber-50/70 p-2 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/50 leading-relaxed line-clamp-3">
                                                        {j.obstacles}
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400 text-[11px] italic">-</span>
                                                )}
                                            </td>

                                            {/* 4. Foto Dokumentasi */}
                                            <td className="py-3.5 px-4 align-top text-center">
                                                {j.work_photo_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewPhoto(j.work_photo_url)}
                                                        className="group relative size-12 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 mx-auto block hover:opacity-90"
                                                        title="Klik untuk memperbesar foto"
                                                    >
                                                        <img
                                                            src={j.work_photo_url}
                                                            alt="Dokumentasi"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                            <Eye className="h-4 w-4 text-white" />
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-neutral-400">-</span>
                                                )}
                                            </td>

                                            {/* 5. Catatan Guru Pembimbing (Inline view & Edit button) */}
                                            <td className="py-3.5 px-4 align-top">
                                                {j.mentor_notes ? (
                                                    <div className="space-y-1.5">
                                                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-[11px] text-emerald-950 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-900 leading-relaxed">
                                                            {j.mentor_notes}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openNoteModal(j)}
                                                            className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                            <span>Edit Catatan</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => openNoteModal(j)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs gap-1 border-dashed border-neutral-300 hover:border-emerald-500 font-medium"
                                                    >
                                                        <MessageSquare className="h-3 w-3 text-emerald-600" />
                                                        <span>+ Beri Catatan</span>
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {journals?.links && journals.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <span className="text-xs text-neutral-500">
                                Menampilkan {journals?.data?.length ?? 0} dari {journals?.total ?? 0} hari jurnal
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
                </div>
            </div>

            {/* Modal Catatan Bimbingan / Evaluasi Sidang */}
            <Dialog open={!!activeJournal} onOpenChange={(open) => !open && setActiveJournal(null)}>
                <DialogContent className="sm:max-w-md max-h-[88vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">
                            Catatan Bimbingan - {activeJournal?.user?.name} (Hari Ke-{activeJournal?.day_number})
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Tulis catatan masukan, evaluasi, atau catatan untuk sidang PKL.
                        </DialogDescription>
                    </DialogHeader>

                    {activeJournal && (
                        <form onSubmit={handleNoteSubmit} className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Catatan / Feedback Guru Pembimbing
                                </Label>
                                <textarea
                                    value={mentorNotes}
                                    onChange={(e) => setMentorNotes(e.target.value)}
                                    rows={5}
                                    placeholder="Tuliskan catatan bimbingan, kendala yang perlu dibahas, atau catatan evaluasi untuk sidang PKL..."
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 leading-relaxed"
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveJournal(null)}
                                    size="sm"
                                    className="text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-xs gap-1.5"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>{submitting ? 'Menyimpan...' : 'Simpan Catatan'}</span>
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal Detail Full Text */}
            <Dialog open={!!detailJournal} onOpenChange={(open) => !open && setDetailJournal(null)}>
                <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">
                            Detail Jurnal Hari Ke-{detailJournal?.day_number}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Siswa: {detailJournal?.user?.name} ({detailJournal?.user?.nis_nip})
                        </DialogDescription>
                    </DialogHeader>

                    {detailJournal && (
                        <div className="space-y-3 py-2 text-xs">
                            <div>
                                <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Kegiatan / Pekerjaan:</span>
                                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 whitespace-pre-line leading-relaxed text-sm">
                                    {detailJournal.work_summary}
                                </div>
                            </div>
                            {detailJournal.obstacles && (
                                <div>
                                    <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">Kendala / Tantangan:</span>
                                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 whitespace-pre-line">
                                        {detailJournal.obstacles}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal */}
            <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">Dokumentasi Pekerjaan Siswa</DialogTitle>
                    </DialogHeader>
                    {previewPhoto && (
                        <div className="overflow-hidden rounded-xl bg-black">
                            <img
                                src={previewPhoto}
                                alt="Dokumentasi Kerja"
                                className="h-auto w-full object-cover"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
