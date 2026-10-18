import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpRight,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    Crosshair,
    FileText,
    MapPin,
    Moon,
    RefreshCw,
    Sun,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
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
        nickname?: string | null;
        email: string;
        role: 'admin' | 'guru_pembimbing' | 'pembimbing_dudi' | 'siswa';
        nis_nip?: string;
        class_name?: string | null;
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
            slug?: string;
            nis_nip?: string;
        } | null;
    };
    today_date: string;
    role: 'admin' | 'guru_pembimbing' | 'pembimbing_dudi' | 'siswa';
    stats?: {
        has_checked_in?: boolean;
        has_checked_out?: boolean;
        has_permission?: boolean;
        permission_status?: string | null;
        permission_reason?: string | null;
        permission_is_approved?: boolean | null;
        permission_doc_url?: string | null;
        check_in_time?: string | null;
        check_out_time?: string | null;
        attendance_status?: string | null;
        total_hadir?: number;
        total_terlambat?: number;
        total_presensi?: number;
        punctuality_rate?: number;
        total_journals?: number;
        approved_journals?: number;
        total_prayers?: number;
    };
    recent_attendances?: Array<{
        id: number;
        date_raw: string;
        date_formatted: string;
        date_short: string;
        day_name: string;
        check_in_time?: string | null;
        check_out_time?: string | null;
        status: string;
    }>;
    today_attendance?: any;
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}

export default function Dashboard({
    user,
    today_date,
    stats = {},
    recent_attendances = [],
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
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
    const [greeting, setGreeting] = useState<string>('Selamat Datang');

    // State Pengajuan Izin / Sakit
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<'izin' | 'sakit'>('izin');
    const [permissionReason, setPermissionReason] = useState('');
    const [permissionDoc, setPermissionDoc] = useState<File | null>(null);
    const [isSubmittingPermission, setIsSubmittingPermission] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Dynamic greeting based on current time
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 11) {
            setGreeting('Selamat Pagi');
        } else if (hour >= 11 && hour < 15) {
            setGreeting('Selamat Siang');
        } else if (hour >= 15 && hour < 18) {
            setGreeting('Selamat Sore');
        } else {
            setGreeting('Selamat Malam');
        }
    }, []);

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
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setCurrentLat(lat);
                setCurrentLng(lng);
                setLocating(false);

                if (user?.company) {
                    const dist = calculateDistance(
                        lat,
                        lng,
                        user.company.latitude,
                        user.company.longitude
                    );
                    setDistanceMeters(dist);
                }
            },
            (err) => {
                setLocating(false);
                setLocError(`Gagal mendapatkan koordinat GPS: ${err.message}. Pastikan izin lokasi aktif.`);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
        } catch (err: any) {
            setCameraError('Kamera tidak dapat diakses. Mohon berikan izin akses kamera.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
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

    const handlePermissionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!permissionReason.trim()) return;

        setIsSubmittingPermission(true);
        router.post(
            '/student/attendance/permission',
            {
                status: permissionStatus,
                permission_reason: permissionReason,
                permission_doc: permissionDoc,
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    setIsPermissionModalOpen(false);
                    setPermissionReason('');
                    setPermissionDoc(null);
                },
                onFinish: () => {
                    setIsSubmittingPermission(false);
                },
            }
        );
    };

    const displayName = user?.nickname || user?.name || 'Siswa';

    return (
        <>
            <Head title="Dashboard Siswa - Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                {/* 1. Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            Dashboard Siswa
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                            {greeting}, {displayName} • {user.class_name ? `${user.class_name}` : 'Siswa PKL'}{user.nis_nip ? ` (NIS: ${user.nis_nip})` : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-2xs self-start sm:self-auto">
                        <Calendar className="h-4 w-4 text-[#008953]" />
                        <span className="text-xs font-bold text-slate-700">{today_date}</span>
                    </div>
                </div>

                {/* Notification Flash Alerts */}
                {flash?.success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs sm:text-sm font-semibold text-emerald-800 shadow-2xs">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#008953]" />
                        <div>{flash.success}</div>
                    </div>
                )}

                {(flash?.error || errors?.attendance || errors?.error) && (
                    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs sm:text-sm font-semibold text-rose-800 shadow-2xs">
                        <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                        <div>{flash?.error || errors?.attendance || errors?.error}</div>
                    </div>
                )}

                {/* 2. Section Presensi Hari Ini (Live Attendance Action) */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Green Header Bar (Matching Admin Table Header Style) */}
                    <div className="bg-[#008953] px-5 py-4 text-white flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Clock className="size-5 text-white" />
                                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Presensi Kehadiran Hari Ini
                                </h2>
                            </div>
                            <p className="text-xs text-emerald-100 mt-0.5">
                                {user?.company
                                    ? `${user.company.name} • Toleransi Radius: ${user.company.radius_meters}m`
                                    : 'Belum terhubung ke instansi tempat PKL'}
                            </p>
                        </div>

                        <div>
                            {stats?.has_permission ? (
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold ${
                                        stats?.permission_is_approved === true
                                            ? 'bg-white text-[#008953] shadow-xs'
                                            : stats?.permission_is_approved === false
                                            ? 'bg-rose-500 text-white'
                                            : 'bg-amber-400 text-amber-950 shadow-xs'
                                    }`}
                                >
                                    <span
                                        className={`size-2 rounded-full ${
                                            stats?.permission_is_approved === true
                                                ? 'bg-[#008953]'
                                                : stats?.permission_is_approved === false
                                                ? 'bg-white'
                                                : 'bg-amber-950'
                                        }`}
                                    />
                                    {stats?.permission_is_approved === true
                                        ? `${stats.permission_status === 'sakit' ? 'Sakit' : 'Izin'} Disetujui`
                                        : stats?.permission_is_approved === false
                                        ? `Izin Ditolak`
                                        : `${stats.permission_status === 'sakit' ? 'Sakit' : 'Izin'} (Menunggu Persetujuan)`}
                                </span>
                            ) : (
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold ${
                                        stats?.has_checked_out
                                            ? 'bg-white text-[#008953] shadow-xs'
                                            : stats?.has_checked_in
                                            ? stats?.attendance_status === 'hadir'
                                                ? 'bg-white text-[#008953] shadow-xs'
                                                : 'bg-amber-400 text-amber-950 shadow-xs'
                                            : 'bg-white/15 text-white border border-white/20'
                                    }`}
                                >
                                    <span
                                        className={`size-2 rounded-full ${
                                            stats?.has_checked_out
                                                ? 'bg-[#008953]'
                                                : stats?.has_checked_in
                                                ? stats?.attendance_status === 'hadir'
                                                    ? 'bg-[#008953]'
                                                    : 'bg-amber-950'
                                                : 'bg-white/70'
                                        }`}
                                    />
                                    {stats?.has_checked_out
                                        ? 'Presensi Selesai'
                                        : stats?.has_checked_in
                                        ? `Check-In (${stats?.attendance_status === 'hadir' ? 'Tepat Waktu' : 'Terlambat'})`
                                        : 'Belum Presensi'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        {/* Jika Siswa Sedang Mengajukan Izin / Sakit */}
                        {stats?.has_permission ? (
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-[#008953] font-bold shrink-0">
                                            <FileText className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-900">
                                                Permohonan Tidak Masuk:{' '}
                                                <span className="uppercase text-[#008953] font-black">
                                                    {stats.permission_status}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                {stats.permission_is_approved === true
                                                    ? 'Permohonan telah diverifikasi dan disetujui Guru Pembimbing.'
                                                    : stats.permission_is_approved === false
                                                    ? 'Permohonan tidak disetujui oleh Guru Pembimbing.'
                                                    : 'Menunggu konfirmasi verifikasi dari Guru Pembimbing.'}
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold self-start sm:self-auto border ${
                                            stats.permission_is_approved === true
                                                ? 'bg-emerald-50 text-[#008953] border-emerald-200'
                                                : stats.permission_is_approved === false
                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}
                                    >
                                        {stats.permission_is_approved === true
                                            ? 'Disetujui'
                                            : stats.permission_is_approved === false
                                            ? 'Ditolak'
                                            : 'Menunggu Persetujuan'}
                                    </span>
                                </div>

                                <div className="mt-3.5 text-xs text-slate-700 space-y-2">
                                    <div>
                                        <span className="font-bold text-slate-900">Keterangan / Alasan:</span>
                                        <p className="mt-1 text-slate-600 bg-white rounded-xl p-3 border border-slate-200/80">
                                            {stats.permission_reason || '-'}
                                        </p>
                                    </div>
                                    {stats.permission_doc_url && (
                                        <div className="pt-1">
                                            <a
                                                href={stats.permission_doc_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008953] hover:text-emerald-700 transition-colors"
                                            >
                                                <FileText className="size-4" />
                                                <span>Lihat Surat Keterangan / Dokumen Lampiran</span>
                                                <ArrowUpRight className="size-3.5" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Check-In & Check-Out 2-Columns */
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Check-In Block */}
                                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                                                <Sun className="size-4 text-[#008953]" />
                                                <span>Presensi Masuk (Check-In)</span>
                                            </div>
                                            <span>Batas: {user?.company?.check_in_end ? user.company.check_in_end.substring(0, 5) : '08:00'} WIB</span>
                                        </div>

                                        <div className="mt-3 flex items-baseline justify-between">
                                            <div className="font-mono text-3xl font-black text-slate-900">
                                                {stats?.check_in_time ? `${stats.check_in_time}` : '-- : --'}
                                                <span className="text-xs font-sans font-semibold text-slate-400 ml-1.5">WIB</span>
                                            </div>
                                            {stats?.has_checked_in && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                                    stats?.attendance_status === 'hadir'
                                                        ? 'bg-emerald-50 text-[#008953] border border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {stats?.attendance_status === 'hadir' ? 'Tepat Waktu' : 'Terlambat'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        {!stats?.has_checked_in ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => openAttendanceModal('check_in')}
                                                    className="flex-1 gap-2 bg-[#008953] hover:bg-[#007346] text-white font-bold text-xs h-10 rounded-xl shadow-xs cursor-pointer transition-all"
                                                >
                                                    <Camera className="size-4" />
                                                    <span>Presensi Masuk</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsPermissionModalOpen(true)}
                                                    className="gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs h-10 px-3.5 rounded-xl shadow-xs shrink-0 cursor-pointer"
                                                    title="Ajukan izin atau sakit"
                                                >
                                                    <FileText className="size-4 text-[#008953]" />
                                                    <span>Izin / Sakit</span>
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 py-2.5 text-xs font-bold text-[#008953]">
                                                <CheckCircle2 className="size-4 text-[#008953]" />
                                                <span>Check-In Tercatat ({stats.check_in_time} WIB)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Check-Out Block */}
                                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                                                <Moon className="size-4 text-[#008953]" />
                                                <span>Presensi Pulang (Check-Out)</span>
                                            </div>
                                            <span>Mulai: {user?.company?.check_out_start ? user.company.check_out_start.substring(0, 5) : '17:00'} WIB</span>
                                        </div>

                                        <div className="mt-3 flex items-baseline justify-between">
                                            <div className="font-mono text-3xl font-black text-slate-900">
                                                {stats?.check_out_time ? `${stats.check_out_time}` : '-- : --'}
                                                <span className="text-xs font-sans font-semibold text-slate-400 ml-1.5">WIB</span>
                                            </div>
                                            {stats?.has_checked_out && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#008953] border border-emerald-200">
                                                    Selesai
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        {stats?.has_checked_in && !stats?.has_checked_out ? (
                                            <Button
                                                onClick={() => openAttendanceModal('check_out')}
                                                className="w-full gap-2 bg-[#008953] hover:bg-[#007346] text-white font-bold text-xs h-10 rounded-xl shadow-xs transition-all cursor-pointer"
                                            >
                                                <Camera className="size-4" />
                                                <span>Presensi Pulang</span>
                                            </Button>
                                        ) : stats?.has_checked_out ? (
                                            <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 py-2.5 text-xs font-bold text-[#008953]">
                                                <CheckCircle2 className="size-4 text-[#008953]" />
                                                <span>Check-Out Selesai ({stats.check_out_time} WIB)</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-400">
                                                <Clock className="size-4 text-slate-400" />
                                                <span>Menunggu Presensi Masuk</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Geofence Footer Note */}
                        {user?.company && (
                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                                <MapPin className="size-4 text-[#008953] shrink-0" />
                                <span className="truncate">
                                    {user.company.name} • {user.company.address || 'Lokasi kantor industri DUDI'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Section Riwayat Presensi Terkini */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Green Header Bar (Matching Admin Table Header Style) */}
                    <div className="bg-[#008953] px-5 py-4 text-white flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2.5">
                            <Clock className="size-5 text-white" />
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Riwayat Presensi Terkini
                                </h2>
                                <p className="text-xs text-emerald-100">
                                    Catatan presensi masuk dan kepulangan 5 hari aktif terakhir
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/student/attendances"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl border border-white/20 transition-all self-start sm:self-auto"
                        >
                            <span>Lihat Semua Riwayat</span>
                            <ArrowUpRight className="size-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    <th className="py-3 px-5">Hari & Tanggal</th>
                                    <th className="py-3 px-5">Jam Masuk</th>
                                    <th className="py-3 px-5">Jam Pulang</th>
                                    <th className="py-3 px-5 text-right">Status Kehadiran</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                {recent_attendances.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-xs text-slate-400">
                                            Belum ada catatan riwayat presensi.
                                        </td>
                                    </tr>
                                ) : (
                                    recent_attendances.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="font-bold text-slate-900">{att.day_name}</div>
                                                <div className="text-[11px] text-slate-400">{att.date_short}</div>
                                            </td>
                                            <td className="py-3.5 px-5 font-mono">
                                                {att.check_in_time ? `${att.check_in_time} WIB` : '-'}
                                            </td>
                                            <td className="py-3.5 px-5 font-mono">
                                                {att.check_out_time ? `${att.check_out_time} WIB` : '-'}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[11px] font-bold border ${
                                                    att.status === 'hadir'
                                                        ? 'bg-emerald-50 text-[#008953] border-emerald-200'
                                                        : att.status === 'terlambat'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                    {att.status === 'hadir'
                                                        ? 'Hadir Tepat'
                                                        : att.status === 'terlambat'
                                                        ? 'Terlambat'
                                                        : att.status === 'izin'
                                                        ? 'Izin'
                                                        : att.status === 'sakit'
                                                        ? 'Sakit'
                                                        : att.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Attendance Modal (Live GPS & Selfie Webcam) */}
            <Dialog open={isAttendanceModalOpen} onOpenChange={closeAttendanceModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            {attendanceType === 'check_in' ? 'Presensi Masuk (Check-In)' : 'Presensi Pulang (Check-Out)'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
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
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                                            <Clock className="size-4 shrink-0 text-amber-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Terlambat</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Waktu saat ini ({currentTimeStr} WIB) melewati batas jam masuk ({user.company.check_in_end?.slice(0, 5)} WIB).
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                                            <CheckCircle2 className="size-4 shrink-0 text-[#008953] mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Tepat Waktu</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Waktu saat ini ({currentTimeStr} WIB) sesuai jadwal ({user.company.check_in_start?.slice(0, 5)} - {user.company.check_in_end?.slice(0, 5)} WIB).
                                                </p>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    currentTimeStr < (user.company.check_out_start?.slice(0, 5) || '17:00') ? (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                                            <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Pulang Lebih Awal</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Waktu saat ini ({currentTimeStr} WIB) belum mencapai jam pulang ({user.company.check_out_start?.slice(0, 5)} WIB).
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                                            <CheckCircle2 className="size-4 shrink-0 text-[#008953] mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Jam Pulang Sesuai</span>
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
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                                            <MapPin className="size-4 shrink-0 text-amber-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Di Luar Radius</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Jarak Anda {distanceMeters} meter dari kantor (Batas: {user.company.radius_meters}m). Presensi tetap tercatat dengan catatan di luar radius.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                                            <CheckCircle2 className="size-4 shrink-0 text-[#008953] mt-0.5" />
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
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">Koordinat GPS Anda:</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={getGPSLocation}
                                    disabled={locating}
                                    className="h-7 text-xs px-2.5 gap-1 border-slate-200 bg-white"
                                >
                                    <Crosshair className={`size-3.5 text-[#008953] ${locating ? 'animate-spin' : ''}`} />
                                    <span>{locating ? 'Mendeteksi...' : 'Perbarui GPS'}</span>
                                </Button>
                            </div>

                            {currentLat && currentLng ? (
                                <div className="text-xs text-slate-600 space-y-1">
                                    <div className="font-mono text-[11px]">
                                        Lat: {currentLat.toFixed(6)}, Long: {currentLng.toFixed(6)}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-amber-600">
                                    {locError || 'Mendeteksi koordinat GPS perangkat Anda...'}
                                </p>
                            )}
                        </div>

                        {/* Webcam Selfie Stream / Preview */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700">Foto Selfie Kehadiran *</Label>
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center border border-slate-200">
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
                                                className="bg-[#008953] hover:bg-[#007346] text-white gap-1.5 shadow-lg text-xs rounded-xl"
                                            >
                                                <Camera className="size-4" />
                                                <span>Ambil Foto Selfie</span>
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
                                                className="gap-1.5 text-xs shadow-lg bg-white/90 hover:bg-white text-slate-800 rounded-xl"
                                            >
                                                <RefreshCw className="size-3.5" />
                                                <span>Ulangi Foto</span>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                            {cameraError && <p className="text-xs text-rose-500">{cameraError}</p>}
                        </div>

                        <DialogFooter className="pt-3 gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={closeAttendanceModal} className="rounded-xl">
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={!currentLat || !currentLng || !selfieData}
                                className="bg-[#008953] hover:bg-[#007346] text-white font-bold rounded-xl"
                            >
                                Kirim Presensi
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Permission Request Modal Dialog (Izin / Sakit) */}
            <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="size-5 text-[#008953]" />
                            <span>Ajukan Izin Tidak Masuk PKL</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Permohonan izin atau sakit akan langsung dikirimkan ke Guru Pembimbing Anda untuk diverifikasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handlePermissionSubmit} className="space-y-4 pt-2">
                        {/* Jenis Permohonan */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Jenis Permohonan *</Label>
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setPermissionStatus('izin')}
                                    className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                                        permissionStatus === 'izin'
                                            ? 'border-[#008953] bg-emerald-50 text-[#008953] ring-1 ring-[#008953]'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    <span>Izin Keperluan</span>
                                    {permissionStatus === 'izin' && <CheckCircle2 className="size-4 text-[#008953]" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPermissionStatus('sakit')}
                                    className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                                        permissionStatus === 'sakit'
                                            ? 'border-[#008953] bg-emerald-50 text-[#008953] ring-1 ring-[#008953]'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    <span>Sakit (Surat Dokter)</span>
                                    {permissionStatus === 'sakit' && <CheckCircle2 className="size-4 text-[#008953]" />}
                                </button>
                            </div>
                        </div>

                        {/* Alasan / Keterangan */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Alasan Lengkap *</Label>
                            <textarea
                                value={permissionReason}
                                onChange={(e) => setPermissionReason(e.target.value)}
                                rows={3}
                                required
                                placeholder="Jelaskan alasan izin / sakit secara rinci..."
                                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-[#008953] focus:ring-1 focus:ring-[#008953] outline-none"
                            />
                        </div>

                        {/* Upload Surat / Bukti */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">
                                Unggah Surat Keterangan / Bukti <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => setPermissionDoc(e.target.files?.[0] || null)}
                                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#008953] hover:file:bg-emerald-100 cursor-pointer"
                            />
                            <p className="text-[11px] text-slate-400">Format: JPG, PNG, atau PDF (Maks. 2MB)</p>
                        </div>

                        <DialogFooter className="pt-3 gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPermissionModalOpen(false)}
                                className="rounded-xl text-xs font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingPermission || !permissionReason.trim()}
                                className="bg-[#008953] hover:bg-[#007346] text-white font-bold text-xs rounded-xl"
                            >
                                {isSubmittingPermission ? 'Mengirim Permohonan...' : 'Kirim Permohonan Izin'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
