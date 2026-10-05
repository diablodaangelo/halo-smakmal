import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    Building2,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    Crosshair,
    FileText,
    GraduationCap,
    HeartHandshake,
    Image as ImageIcon,
    MapPin,
    Moon,
    Radio,
    Sparkles,
    Sun,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
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
import { Label } from '@/components/ui/label';

interface DashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'guru_pembimbing' | 'pembimbing_dudi' | 'siswa';
        nis_nip?: string;
        company?: {
            id: number;
            name: string;
            address: string;
            latitude: number;
            longitude: number;
            radius_meters: number;
            check_in_start: string;
            check_in_end: string;
            check_out_start: string;
        } | null;
        mentor_teacher?: {
            id: number;
            name: string;
            nis_nip?: string;
        } | null;
    };
    today_date: string;
    role: 'admin' | 'guru_pembimbing' | 'pembimbing_dudi' | 'siswa';
    stats?: Record<string, any>;
    recent_attendances?: Array<any>;
    recent_journals?: Array<any>;
    companies?: Array<any>;
    students?: Array<any>;
    guided_students?: Array<any>;
    today_attendance?: any;
    today_journal?: any;
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}

export default function Dashboard({
    user,
    today_date,
    role,
    stats = {},
    recent_attendances = [],
    recent_journals = [],
    companies = [],
    students = [],
    guided_students = [],
    today_attendance,
    today_journal,
    flash,
    errors,
}: DashboardProps) {
    // Siswa Attendance modal & capture state
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [attendanceType, setAttendanceType] = useState<'check_in' | 'check_out'>('check_in');
    const [currentLat, setCurrentLat] = useState<number | null>(null);
    const [currentLng, setCurrentLng] = useState<number | null>(null);
    const [locating, setLocating] = useState(false);
    const [locError, setLocError] = useState<string | null>(null);
    const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
    const [selfieData, setSelfieData] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Calculate Haversine distance in browser
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    const getGPSLocation = () => {
        if (!navigator.geolocation) {
            setLocError('Browser Anda tidak mendukung geolokasi.');
            return;
        }
        setLocating(true);
        setLocError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCurrentLat(lat);
                setCurrentLng(lng);
                setLocating(false);

                if (user?.company?.latitude && user?.company?.longitude) {
                    const dist = calculateDistance(
                        lat,
                        lng,
                        Number(user.company.latitude),
                        Number(user.company.longitude)
                    );
                    setDistanceMeters(dist);
                }
            },
            () => {
                setLocating(false);
                setLocError('Gagal mendeteksi lokasi GPS. Pastikan izin lokasi aktif.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const startCamera = async () => {
        setCameraError(null);
        setSelfieData(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
        } catch {
            setCameraError('Gagal mengakses kamera. Pastikan izin kamera aktif.');
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const takeSelfie = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = 360;
            canvas.height = 270;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, 360, 270);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                setSelfieData(dataUrl);
                stopCamera();
            }
        }
    };

    const openAttendanceModal = (type: 'check_in' | 'check_out') => {
        setAttendanceType(type);
        setSelfieData(null);
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setCurrentTimeStr(`${hours}:${minutes}`);
        setIsAttendanceModalOpen(true);
        getGPSLocation();
        startCamera();
    };

    const closeAttendanceModal = () => {
        stopCamera();
        setIsAttendanceModalOpen(false);
    };

    const handleAttendanceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentLat || !currentLng) {
            alert('Lokasi GPS belum terdeteksi. Silakan klik tombol perbarui GPS.');
            return;
        }
        if (!selfieData) {
            alert('Silakan ambil foto selfie kehadiran.');
            return;
        }

        const endpoint =
            attendanceType === 'check_in'
                ? '/student/attendance/check-in'
                : '/student/attendance/check-out';

        router.post(
            endpoint,
            {
                latitude: currentLat,
                longitude: currentLng,
                selfie_image: selfieData,
            },
            {
                onSuccess: () => {
                    closeAttendanceModal();
                },
            }
        );
    };

    const roleBadges: Record<string, { label: string; color: string }> = {
        admin: { label: 'Admin Sekolah (Full Control)', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
        guru_pembimbing: { label: 'Guru Pembimbing (Monitoring Binaan)', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        pembimbing_dudi: { label: 'Pembimbing DUDI (Supervisor Lapangan)', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        siswa: { label: 'Siswa PKL (Pelaksana)', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    };

    return (
        <>
            <Head title="Dashboard - Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* 1. Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
                    <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                                    <Building2 className="size-3.5" />
                                    SMK Amaliah 1 & 2 Ciawi
                                </span>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-white text-slate-900">
                                    {roleBadges[role]?.label || role}
                                </span>
                            </div>
                            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                                Halo, {user?.name || 'Pengguna'} 👋
                            </h1>
                            <p className="mt-1 text-sm text-emerald-100 sm:text-base">
                                {role === 'siswa'
                                    ? `Lokasi PKL: ${user?.company?.name || 'Belum Ditempatkan'} | Guru Pembimbing: ${user?.mentor_teacher?.name || 'Belum Ditugaskan'}`
                                    : 'Sistem Terpadu Monitoring Presensi Geofencing, Jurnal Kerja & Log Ibadah PKL.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-black/20 px-4 py-2.5 backdrop-blur-md">
                            <Calendar className="size-5 text-emerald-200" />
                            <div className="text-right text-xs sm:text-sm">
                                <div className="font-semibold text-white">{today_date}</div>
                                <div className="text-emerald-200">Tahun Ajaran 2026/2027</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Flash Banner */}
                {flash?.success && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-xs dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div>{flash.success}</div>
                    </div>
                )}

                {/* Error Banner */}
                {(flash?.error || errors?.attendance || errors?.error) && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-xs dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                        <div>{flash?.error || errors?.attendance || errors?.error}</div>
                    </div>
                )}

                {/* 2. Role: Admin Dashboard */}
                {role === 'admin' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-500">Total Siswa PKL</span>
                                    <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-500">
                                        <Users className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{stats.total_students ?? 0}</span>
                                    <span className="text-xs text-neutral-500">Siswa</span>
                                </div>
                                <div className="mt-2 text-xs text-emerald-500">
                                    ✓ {stats.placed_students ?? 0} sudah di-plot ke DUDI
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-500">Guru Pembimbing</span>
                                    <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500">
                                        <GraduationCap className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{stats.total_teachers ?? 0}</span>
                                    <span className="text-xs text-neutral-500">Guru</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-500">Mitra Kantor DUDI</span>
                                    <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-500">
                                        <Building2 className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{stats.total_companies ?? 0}</span>
                                    <span className="text-xs text-neutral-500">Instansi</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-500">Presensi Hari Ini</span>
                                    <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-500">
                                        <CheckCircle2 className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{stats.today_present ?? 0}</span>
                                    <span className="text-xs font-semibold text-purple-500">({stats.attendance_rate ?? 0}%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <div className="flex items-center justify-between border-b border-sidebar-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4 text-blue-500" />
                                        <h2 className="font-semibold">Presensi Masuk Terkini (Live)</h2>
                                    </div>
                                    <span className="text-xs text-neutral-500">GPS Radius Check</span>
                                </div>
                                <div className="mt-4 divide-y divide-sidebar-border/50">
                                    {recent_attendances.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-neutral-500">Belum ada data presensi hari ini</div>
                                    ) : (
                                        recent_attendances.map((att) => (
                                            <div key={att.id} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600">
                                                        {att.user?.name?.slice(0, 2).toUpperCase() || 'SW'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{att.user?.name}</p>
                                                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                                                            <MapPin className="size-3" /> {att.company?.name || 'DUDI'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        att.status === 'hadir' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {att.status}
                                                    </span>
                                                    <p className="mt-0.5 text-xs text-neutral-400 font-mono">{att.check_in_time}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <div className="flex items-center justify-between border-b border-sidebar-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-4 text-purple-500" />
                                        <h2 className="font-semibold">Jurnal Kerja Terbaru</h2>
                                    </div>
                                    <span className="text-xs text-neutral-500">Laporan PKL</span>
                                </div>
                                <div className="mt-4 divide-y divide-sidebar-border/50">
                                    {recent_journals.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-neutral-500">Belum ada jurnal yang dikirim</div>
                                    ) : (
                                        recent_journals.map((jrn) => (
                                            <div key={jrn.id} className="py-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold">{jrn.user?.name}</p>
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        jrn.status === 'approved'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : jrn.status === 'revision'
                                                            ? 'bg-rose-500/10 text-rose-500'
                                                            : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {jrn.status}
                                                    </span>
                                                </div>
                                                <p className="mt-1 line-clamp-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                    {jrn.work_summary}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Role: Guru Pembimbing Dashboard */}
                {role === 'guru_pembimbing' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Siswa Binaan Anda</span>
                                <div className="mt-2 text-3xl font-bold text-emerald-500">{stats.guided_students_count ?? 0}</div>
                                <div className="mt-1 text-xs text-neutral-500">Siswa dibimbing</div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Presensi Binaan Hari Ini</span>
                                <div className="mt-2 text-3xl font-bold">{stats.today_attendances ?? 0} / {stats.guided_students_count ?? 0}</div>
                                <div className="mt-1 text-xs text-emerald-500">Sudah check-in</div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Jurnal Butuh Review</span>
                                <div className="mt-2 text-3xl font-bold text-amber-500">{stats.pending_journals ?? 0}</div>
                                <div className="mt-1 text-xs text-neutral-500">Menunggu ACC</div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                                <span className="text-sm font-medium text-neutral-500">Jurnal Disetujui</span>
                                <div className="mt-2 text-3xl font-bold text-blue-500">{stats.approved_journals ?? 0}</div>
                                <div className="mt-1 text-xs text-neutral-500">Telah diverifikasi</div>
                            </div>
                        </div>

                        {/* List Siswa Binaan Guru */}
                        <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-xs">
                            <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                                <UserCheck className="size-5 text-emerald-500" />
                                Daftar Siswa Binaan Anda & Status Kehadiran Hari Ini
                            </h2>
                            <div className="divide-y divide-sidebar-border/50">
                                {guided_students.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-neutral-500">Belum ada siswa yang di-plot ke Anda oleh Admin.</div>
                                ) : (
                                    guided_students.map((std) => (
                                        <div key={std.id} className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="font-semibold text-sm">{std.name}</p>
                                                <p className="text-xs text-neutral-500">NIS: {std.nis_nip || '-'} | Kantor: {std.company?.name || 'Belum di-plot'}</p>
                                            </div>
                                            <div>
                                                {std.attendances && std.attendances.length > 0 ? (
                                                    <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-500 px-2.5 py-1 text-xs font-semibold">
                                                        Hadir ({std.attendances[0].check_in_time})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-rose-500/10 text-rose-500 px-2.5 py-1 text-xs font-semibold">
                                                        Belum Absen
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Role: SISWA DASHBOARD (ABSENSI & ANALISIS KEHADIRAN) */}
                {role === 'siswa' && (
                    <div className="space-y-6">
                        {/* Status Check-in / Check-out Banner & Live Action Card */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Live Presensi Action Widget */}
                            <Card className="border-neutral-200 dark:border-neutral-800 lg:col-span-2 shadow-sm">
                                <CardHeader className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                <Radio className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold">Presensi Kehadiran Hari Ini</CardTitle>
                                                <p className="text-xs text-neutral-500">
                                                    {user?.company ? `${user.company.name} (Radius: ${user.company.radius_meters}m)` : 'Belum ditentukan instansi DUDI'}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                            stats?.has_checked_out
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                : stats?.has_checked_in
                                                ? stats?.attendance_status === 'hadir'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                        }`}>
                                            {stats?.has_checked_out
                                                ? 'Presensi Selesai'
                                                : stats?.has_checked_in
                                                ? `Masuk: ${String(stats?.attendance_status || '').toUpperCase()}`
                                                : 'Belum Presensi'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {/* Check-In Card Status */}
                                        <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                    <Sun className="h-4 w-4 text-amber-500" />
                                                    <span>Jam Masuk (Check-In)</span>
                                                </div>
                                                <span className="text-xs text-neutral-500">
                                                    Batas: {user?.company?.check_in_end ? user.company.check_in_end.substring(0, 5) : '08:00'}
                                                </span>
                                            </div>
                                            <div className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-white">
                                                {stats?.check_in_time ? `${stats.check_in_time} WIB` : '-- : --'}
                                            </div>
                                            <div className="mt-3">
                                                {!stats?.has_checked_in ? (
                                                    <Button
                                                        onClick={() => openAttendanceModal('check_in')}
                                                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold"
                                                    >
                                                        <Camera className="h-4 w-4" />
                                                        Presensi Masuk (Check-In)
                                                    </Button>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Check-in berhasil tercatat</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Check-Out Card Status */}
                                        <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                    <Moon className="h-4 w-4 text-indigo-500" />
                                                    <span>Jam Pulang (Check-Out)</span>
                                                </div>
                                                <span className="text-xs text-neutral-500">
                                                    Mulai: {user?.company?.check_out_start ? user.company.check_out_start.substring(0, 5) : '16:00'}
                                                </span>
                                            </div>
                                            <div className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-white">
                                                {stats?.check_out_time ? `${stats.check_out_time} WIB` : '-- : --'}
                                            </div>
                                            <div className="mt-3">
                                                {stats?.has_checked_in && !stats?.has_checked_out ? (
                                                    <Button
                                                        onClick={() => openAttendanceModal('check_out')}
                                                        className="w-full gap-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold"
                                                    >
                                                        <Camera className="h-4 w-4" />
                                                        Presensi Pulang (Check-Out)
                                                    </Button>
                                                ) : stats?.has_checked_out ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Check-out selesai</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-neutral-400">
                                                        Lakukan check-in terlebih dahulu
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Navigation Shortcuts */}
                            <div className="flex flex-col gap-4">
                                <Card className="border-neutral-200 dark:border-neutral-800 p-5 hover:border-emerald-500/50 transition shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <Link
                                            href="/student/journals"
                                            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                                        >
                                            <span>Buka Jurnal</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                    <h3 className="mt-3 font-bold text-sm text-neutral-900 dark:text-white">
                                        Jurnal Harian PKL
                                    </h3>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Dokumentasikan kegiatan pekerjaan harian di DUDI serta kendala yang dihadapi.
                                    </p>
                                </Card>

                                <Card className="border-neutral-200 dark:border-neutral-800 p-5 hover:border-emerald-500/50 transition shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <Link
                                            href="/student/prayers"
                                            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                                        >
                                            <span>Buka Salat</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                    <h3 className="mt-3 font-bold text-sm text-neutral-900 dark:text-white">
                                        Jadwal & Log Salat
                                    </h3>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Catat pelaksanaan ibadah salat Dzuhur & Ashar berjamaah di lokasi PKL.
                                    </p>
                                </Card>
                            </div>
                        </div>

                        {/* Analisis & Statistik Kehadiran */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <Card className="border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-neutral-500">Total Hari Masuk</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.total_presensi ?? 0} Hari</div>
                                    <p className="text-[11px] text-neutral-400">Terekam di sistem</p>
                                </CardContent>
                            </Card>

                            <Card className="border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-emerald-600">Hadir Tepat Waktu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-600">{stats?.total_hadir ?? 0} Hari</div>
                                    <p className="text-[11px] text-neutral-400">Sebelum batas masuk</p>
                                </CardContent>
                            </Card>

                            <Card className="border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-amber-600">Terlambat Masuk</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-amber-600">{stats?.total_terlambat ?? 0} Hari</div>
                                    <p className="text-[11px] text-neutral-400">Lewat batas waktu</p>
                                </CardContent>
                            </Card>

                            <Card className="border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-blue-600">Ketepatan Waktu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">{stats?.punctuality_rate ?? 0}%</div>
                                    <p className="text-[11px] text-neutral-400">Tingkat kedisiplinan</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Riwayat Presensi Terbaru */}
                        <Card className="border-neutral-200 dark:border-neutral-800">
                            <CardHeader className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold">
                                        Riwayat Presensi Terbaru
                                    </CardTitle>
                                    <span className="text-xs text-neutral-500">7 Catatan Terakhir</span>
                                </div>
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                        <tr>
                                            <th className="px-6 py-3.5">Tanggal</th>
                                            <th className="px-6 py-3.5">Jam Masuk</th>
                                            <th className="px-6 py-3.5">Jam Pulang</th>
                                            <th className="px-6 py-3.5 text-center">Status Kehadiran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {recent_attendances.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-neutral-500">
                                                    Belum ada riwayat presensi yang terekam.
                                                </td>
                                            </tr>
                                        ) : (
                                            recent_attendances.map((att) => (
                                                <tr key={att.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                                    <td className="px-6 py-4 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                                                        {att.date}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono">
                                                        {att.check_in_time ? `${att.check_in_time} WIB` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono">
                                                        {att.check_out_time ? `${att.check_out_time} WIB` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                            att.status === 'hadir'
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                        }`}>
                                                            {att.status === 'hadir' ? 'Tepat Waktu' : 'Terlambat'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Attendance Modal (Live GPS & Selfie Webcam) */}
            <Dialog open={isAttendanceModalOpen} onOpenChange={closeAttendanceModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {attendanceType === 'check_in' ? 'Presensi Masuk (Check-In)' : 'Presensi Pulang (Check-Out)'}
                        </DialogTitle>
                        <DialogDescription>
                            Sistem akan memverifikasi lokasi GPS radius kantor DUDI dan foto selfie wajah langsung.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAttendanceSubmit} className="space-y-4 py-2">
                        {/* Status & Keterangan Real-time */}
                        {user?.company && (
                            <div className="space-y-2">
                                {/* Time Evaluation */}
                                {attendanceType === 'check_in' ? (
                                    currentTimeStr > (user.company.check_in_end?.slice(0, 5) || '08:00') ? (
                                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200 flex items-start gap-2">
                                            <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Terlambat</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Waktu saat ini ({currentTimeStr} WIB) telah melewati batas jam masuk ({user.company.check_in_end?.slice(0, 5)} WIB).
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Tepat Waktu</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Waktu saat ini ({currentTimeStr} WIB) sesuai jadwal masuk kantor ({user.company.check_in_start?.slice(0, 5)} - {user.company.check_in_end?.slice(0, 5)} WIB).
                                                </p>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    currentTimeStr < (user.company.check_out_start?.slice(0, 5) || '17:00') ? (
                                        <div className="rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Belum Jam Pulang</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Waktu saat ini ({currentTimeStr} WIB) belum mencapai jam pulang yang ditentukan ({user.company.check_out_start?.slice(0, 5)} WIB).
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Waktu Pulang Sesuai</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Waktu saat ini ({currentTimeStr} WIB) telah memasuki jam pulang ({user.company.check_out_start?.slice(0, 5)} WIB).
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}

                                {/* Location Geofence Evaluation */}
                                {distanceMeters !== null && (
                                    distanceMeters > user.company.radius_meters ? (
                                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200 flex items-start gap-2">
                                            <MapPin className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Lokasi di Luar Radius</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Jarak Anda {distanceMeters} meter dari kantor (Batas toleransi: {user.company.radius_meters} meter). Presensi tetap tercatat dengan keterangan lokasi di luar radius.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Lokasi Sesuai</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Posisi Anda berada dalam radius kantor ({distanceMeters} meter dari toleransi {user.company.radius_meters} meter).
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* GPS Location Status Box */}
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Koordinat GPS Anda:</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={getGPSLocation}
                                    disabled={locating}
                                    className="h-6 text-[11px] px-2"
                                >
                                    <Crosshair className="mr-1 h-3 w-3" />
                                    {locating ? 'Mendeteksi...' : 'Perbarui GPS'}
                                </Button>
                            </div>

                            {currentLat && currentLng ? (
                                <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
                                    <div className="font-mono text-[11px]">
                                        Lat: {currentLat.toFixed(6)}, Long: {currentLng.toFixed(6)}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    {locError || 'Mendeteksi koordinat GPS perangkat Anda...'}
                                </p>
                            )}
                        </div>

                        {/* Webcam Selfie Stream / Preview */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Foto Selfie Langsung *</Label>
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black flex items-center justify-center">
                                {!selfieData ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                                            <Button
                                                type="button"
                                                onClick={takeSelfie}
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-500 gap-1.5 shadow-lg"
                                            >
                                                <Camera className="h-4 w-4" />
                                                Ambil Foto Selfie
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src={selfieData}
                                            alt="Hasil Selfie"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={startCamera}
                                                size="sm"
                                                className="gap-1.5 text-xs shadow-lg"
                                            >
                                                <Camera className="h-3.5 w-3.5" />
                                                Ulangi Foto
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                            {cameraError && <p className="text-xs text-red-500">{cameraError}</p>}
                        </div>

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={closeAttendanceModal}>
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={!currentLat || !currentLng || !selfieData}
                                className="bg-emerald-600 hover:bg-emerald-500"
                            >
                                Kirim Presensi
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
