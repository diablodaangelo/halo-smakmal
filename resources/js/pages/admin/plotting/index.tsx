import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Filter,
    GraduationCap,
    Layers,
    Search,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Student {
    id: number;
    name: string;
    nis_nip?: string | null;
    company_id?: number | null;
    mentor_teacher_id?: number | null;
    company?: {
        id: number;
        name: string;
    } | null;
    mentor_teacher?: {
        id: number;
        name: string;
        nis_nip?: string | null;
    } | null;
}

interface CompanyItem {
    id: number;
    name: string;
    students_count?: number;
}

interface TeacherItem {
    id: number;
    name: string;
    nis_nip?: string | null;
    students_count?: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface StudentsResponse {
    data: Student[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Stats {
    total_students: number;
    without_company: number;
    without_teacher: number;
    completed: number;
}

interface Props {
    students: StudentsResponse;
    companies: CompanyItem[];
    teachers: TeacherItem[];
    stats: Stats;
    filters: {
        status: string;
        search: string;
    };
    errors?: Record<string, string>;
}

export default function PlottingIndex({
    students,
    companies,
    teachers,
    stats,
    filters,
    errors,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    // Bulk selection controls
    const [bulkCompanyId, setBulkCompanyId] = useState<string>('');
    const [bulkTeacherId, setBulkTeacherId] = useState<string>('');

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/plotting',
            {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    const handleFilterChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        router.get(
            '/admin/plotting',
            {
                status: newStatus !== 'all' ? newStatus : undefined,
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudentIds(students.data.map((s) => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    const handleInlineCompanyChange = (studentId: number, companyId: string) => {
        router.post(
            '/admin/plotting/company',
            {
                student_ids: [studentId],
                company_id: companyId ? Number(companyId) : null,
            },
            { preserveScroll: true }
        );
    };

    const handleInlineTeacherChange = (studentId: number, teacherId: string) => {
        router.post(
            '/admin/plotting/mentor-teacher',
            {
                student_ids: [studentId],
                mentor_teacher_id: teacherId ? Number(teacherId) : null,
            },
            { preserveScroll: true }
        );
    };

    const applyBulkCompany = () => {
        if (selectedStudentIds.length === 0) return;
        router.post(
            '/admin/plotting/company',
            {
                student_ids: selectedStudentIds,
                company_id: bulkCompanyId ? Number(bulkCompanyId) : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedStudentIds([]);
                    setBulkCompanyId('');
                },
            }
        );
    };

    const applyBulkTeacher = () => {
        if (selectedStudentIds.length === 0) return;
        router.post(
            '/admin/plotting/mentor-teacher',
            {
                student_ids: selectedStudentIds,
                mentor_teacher_id: bulkTeacherId ? Number(bulkTeacherId) : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedStudentIds([]);
                    setBulkTeacherId('');
                },
            }
        );
    };

    return (
        <>
            <Head title="Plotting Penempatan Siswa" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Plotting Penempatan Siswa PKL
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Atur penempatan kantor DUDI dan pasangkan Guru Pembimbing untuk memonitor siswa PKL.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Total Siswa PKL
                            </CardTitle>
                            <Users className="h-4 w-4 text-neutral-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_students}</div>
                            <p className="text-xs text-neutral-400">Terdaftar di sistem</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-600">
                                Belum Ada DUDI
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.without_company}</div>
                            <p className="text-xs text-neutral-400">Perlu penempatan instansi</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600">
                                Belum Ada Guru
                            </CardTitle>
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.without_teacher}</div>
                            <p className="text-xs text-neutral-400">Perlu ditugaskan guru</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600">
                                Plotting Selesai
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
                            <p className="text-xs text-neutral-400">DUDI & Guru lengkap</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bulk Action Bar */}
                {selectedStudentIds.length > 0 && (
                    <div className="sticky top-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-300 bg-emerald-50/95 p-4 shadow-lg backdrop-blur dark:border-emerald-800 dark:bg-emerald-950/95">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                            <Layers className="h-5 w-5" />
                            <span>{selectedStudentIds.length} Siswa Terpilih</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Bulk Company */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={bulkCompanyId}
                                    onChange={(e) => setBulkCompanyId(e.target.value)}
                                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <option value="">-- Pilih DUDI --</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    size="sm"
                                    onClick={applyBulkCompany}
                                    disabled={!bulkCompanyId}
                                    className="h-8 text-xs"
                                >
                                    Set DUDI
                                </Button>
                            </div>

                            {/* Bulk Teacher */}
                            <div className="flex items-center gap-2 border-l border-emerald-200 pl-3 dark:border-emerald-800">
                                <select
                                    value={bulkTeacherId}
                                    onChange={(e) => setBulkTeacherId(e.target.value)}
                                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <option value="">-- Pilih Guru --</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    size="sm"
                                    onClick={applyBulkTeacher}
                                    disabled={!bulkTeacherId}
                                    className="h-8 text-xs"
                                >
                                    Set Guru
                                </Button>
                            </div>

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedStudentIds([])}
                                className="h-8 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                )}

                {/* Filter Tabs & Search */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'all', label: 'Semua Siswa' },
                            { key: 'unassigned_company', label: 'Belum Ada DUDI' },
                            { key: 'unassigned_teacher', label: 'Belum Ada Guru' },
                            { key: 'completed', label: 'Plotting Lengkap' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleFilterChange(tab.key)}
                                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                                    statusFilter === tab.key
                                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama / NIS..."
                                className="h-9 w-60 pl-8 text-xs"
                            />
                        </div>
                        <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* Students Plotting Table */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                        <CardTitle className="text-base font-semibold">
                            Daftar Siswa & Penempatan ({students.total})
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <tr>
                                    <th className="w-10 px-4 py-3.5 text-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={
                                                students.data.length > 0 &&
                                                students.data.every((s) => selectedStudentIds.includes(s.id))
                                            }
                                            className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3.5">Nama Siswa</th>
                                    <th className="px-6 py-3.5">Instansi Perusahaan (DUDI)</th>
                                    <th className="px-6 py-3.5">Guru Pembimbing (SMK)</th>
                                    <th className="px-6 py-3.5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                                            Tidak ada siswa yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((student) => {
                                        const isSelected = selectedStudentIds.includes(student.id);
                                        const isComplete = student.company_id && student.mentor_teacher_id;

                                        return (
                                            <tr
                                                key={student.id}
                                                className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 ${
                                                    isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                                                }`}
                                            >
                                                <td className="px-4 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectOne(student.id)}
                                                        className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-neutral-900 dark:text-white">
                                                        {student.name}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                        NIS: {student.nis_nip || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-64">
                                                        <select
                                                            value={student.company_id || ''}
                                                            onChange={(e) =>
                                                                handleInlineCompanyChange(student.id, e.target.value)
                                                            }
                                                            className={`w-full rounded-md border px-2.5 py-1.5 text-xs shadow-sm dark:bg-neutral-900 ${
                                                                student.company_id
                                                                    ? 'border-neutral-300 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100'
                                                                    : 'border-amber-400 bg-amber-50/50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                                                            }`}
                                                        >
                                                            <option value="">-- Belum Ditentukan --</option>
                                                            {companies.map((c) => (
                                                                <option key={c.id} value={c.id}>
                                                                    {c.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-64">
                                                        <select
                                                            value={student.mentor_teacher_id || ''}
                                                            onChange={(e) =>
                                                                handleInlineTeacherChange(student.id, e.target.value)
                                                            }
                                                            className={`w-full rounded-md border px-2.5 py-1.5 text-xs shadow-sm dark:bg-neutral-900 ${
                                                                student.mentor_teacher_id
                                                                    ? 'border-neutral-300 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100'
                                                                    : 'border-blue-400 bg-blue-50/50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
                                                            }`}
                                                        >
                                                            <option value="">-- Belum Ditentukan --</option>
                                                            {teachers.map((t) => (
                                                                <option key={t.id} value={t.id}>
                                                                    {t.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {isComplete ? (
                                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                                                            Lengkap
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-amber-400 text-amber-700 dark:border-amber-700 dark:text-amber-400">
                                                            Belum Lengkap
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {students.links && students.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                            <span className="text-xs text-neutral-500">
                                Menampilkan halaman {students.current_page} dari {students.last_page}
                            </span>
                            <div className="flex gap-1">
                                {students.links.map((link, idx) => (
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
        </>
    );
}
