import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    Crosshair,
    GraduationCap,
    MapPin,
    Moon,
    Radio,
    RefreshCw,
    ShieldCheck,
    Sun,
    UserCheck,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
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
        nickname?: string | null;
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
            slug?: string;
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
    const [greeting, setGreeting] = useState<string>('Selamat Datang');

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
            setCameraError('Gagal mengakses kamera. Pastikan izin kamera aktif pada browser.');
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

    const displayName = user?.nickname || user?.name || 'Siswa';

    return (
        <>
            <Head title="Dashboard Siswa - Halo-Smakmal" />

            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5 lg:p-6 w-full max-w-6xl mx-auto">
                {/* 1. Header Banner & Sapaan */}
                <div className="relative rounded-2xl bg-[#008953] p-5 sm:p-6 text-white shadow-xs">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        {/* Left Side: School & Student Identity */}
                        <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-100">
                                <span>SMK Amaliah 1 & 2 Ciawi</span>
                                <span className="text-emerald-300/60">•</span>
                                <span>Siswa PKL</span>
                                {user?.nis_nip && (
                                    <>
                                        <span className="text-emerald-300/60">•</span>
                                        <span className="font-mono">NIS: {user.nis_nip}</span>
                                    </>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
                                {greeting}, {displayName}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1.5 text-emerald-50">
                                    <Building2 className="size-3.5 text-emerald-300" />
                                    <span>Tempat PKL: <strong className="font-semibold text-white">{user?.company?.name || 'Belum Ditempatkan'}</strong></span>
                                </div>

                                {user?.mentor_teacher ? (
                                    <Link
                                        href={`/teachers/${user.mentor_teacher.slug || user.mentor_teacher.id}`}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1.5 text-emerald-50 transition hover:bg-black/25 hover:text-white"
                                    >
                                        <GraduationCap className="size-3.5 text-emerald-300" />
                                        <span>Guru Pembimbing: <strong className="font-semibold text-white underline underline-offset-2">{user.mentor_teacher.name}</strong></span>
                                    </Link>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1.5 text-emerald-50">
                                        <GraduationCap className="size-3.5 text-emerald-300" />
                                        <span>Guru Pembimbing: <strong className="font-semibold text-white">Belum Ditugaskan</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Clean Modern Date Card */}
                        <div className="shrink-0 self-start md:self-center">
                            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 border border-white/15 shadow-2xs">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#008953] shadow-xs font-bold">
                                    <Calendar className="size-4" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold text-white tracking-wide">{today_date}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Flash Alerts */}
                {flash?.success && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-xs">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <div>{flash.success}</div>
                    </div>
                )}

                {(flash?.error || errors?.attendance || errors?.error) && (
                    <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 shadow-xs">
                        <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                        <div>{flash?.error || errors?.attendance || errors?.error}</div>
                    </div>
                )}

                {/* 2. LIVE PRESENSI KEHADIRAN SISWA */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
                    {/* Header: Title & Status */}
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3.5">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">Presensi Hari Ini</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {user?.company ? `${user.company.name} • Toleransi Radius: ${user.company.radius_meters}m` : 'Belum terhubung ke DUDI'}
                            </p>
                        </div>

                        <div>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                    stats?.has_checked_out
                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                                        : stats?.has_checked_in
                                        ? stats?.attendance_status === 'hadir'
                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                                        : 'bg-slate-100 text-slate-600 ring-1 ring-slate-300/60'
                                }`}
                            >
                                <span
                                    className={`size-1.5 rounded-full ${
                                        stats?.has_checked_out
                                            ? 'bg-blue-600'
                                            : stats?.has_checked_in
                                            ? 'bg-emerald-600'
                                            : 'bg-slate-400'
                                    }`}
                                />
                                {stats?.has_checked_out
                                    ? 'Presensi Selesai'
                                    : stats?.has_checked_in
                                    ? `Masuk: ${stats?.attendance_status === 'hadir' ? 'Tepat Waktu' : 'Terlambat'}`
                                    : 'Belum Presensi'}
                            </span>
                        </div>
                    </div>

                    {/* Check-In & Check-Out 2-Columns */}
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 pt-4">
                        {/* Check-In Block */}
                        <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                            <div>
                                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                        <Sun className="size-4 text-amber-500" />
                                        <span>Jam Masuk</span>
                                    </div>
                                    <span>Batas: {user?.company?.check_in_end ? user.company.check_in_end.substring(0, 5) : '08:00'} WIB</span>
                                </div>

                                <div className="mt-2.5 flex items-baseline justify-between">
                                    <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900">
                                        {stats?.check_in_time ? `${stats.check_in_time}` : '-- : --'}
                                        <span className="text-xs font-sans font-medium text-slate-400 ml-1.5">WIB</span>
                                    </div>
                                    {stats?.has_checked_in && (
                                        <span className={`text-xs font-bold ${stats?.attendance_status === 'hadir' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {stats?.attendance_status === 'hadir' ? 'Tepat Waktu' : 'Terlambat'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                {!stats?.has_checked_in ? (
                                    <Button
                                        onClick={() => openAttendanceModal('check_in')}
                                        className="w-full gap-2 bg-[#008953] hover:bg-[#007346] text-white font-semibold text-xs h-9 sm:h-10 rounded-xl shadow-xs"
                                    >
                                        <Camera className="size-4" />
                                        <span>Presensi Masuk</span>
                                    </Button>
                                ) : (
                                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-100/60 py-2 text-xs font-semibold text-emerald-800">
                                        <CheckCircle2 className="size-4 text-emerald-600" />
                                        <span>Check-In Tercatat ({stats.check_in_time} WIB)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Check-Out Block */}
                        <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                            <div>
                                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                        <Moon className="size-4 text-indigo-500" />
                                        <span>Jam Pulang</span>
                                    </div>
                                    <span>Mulai: {user?.company?.check_out_start ? user.company.check_out_start.substring(0, 5) : '17:00'} WIB</span>
                                </div>

                                <div className="mt-2.5 flex items-baseline justify-between">
                                    <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900">
                                        {stats?.check_out_time ? `${stats.check_out_time}` : '-- : --'}
                                        <span className="text-xs font-sans font-medium text-slate-400 ml-1.5">WIB</span>
                                    </div>
                                    {stats?.has_checked_out && (
                                        <span className="text-xs font-bold text-blue-600">Selesai</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                {stats?.has_checked_in && !stats?.has_checked_out ? (
                                    <Button
                                        onClick={() => openAttendanceModal('check_out')}
                                        className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 sm:h-10 rounded-xl shadow-xs"
                                    >
                                        <Camera className="size-4" />
                                        <span>Presensi Pulang</span>
                                    </Button>
                                ) : stats?.has_checked_out ? (
                                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-100/60 py-2 text-xs font-semibold text-blue-800">
                                        <CheckCircle2 className="size-4 text-blue-600" />
                                        <span>Check-Out Selesai ({stats.check_out_time} WIB)</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100/80 py-2 text-xs font-medium text-slate-400">
                                        <Clock className="size-4 text-slate-400" />
                                        <span>Menunggu Check-In</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Geofence Footer Note */}
                    {user?.company && (
                        <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-500 pt-2.5 border-t border-slate-100">
                            <MapPin className="size-3.5 text-[#008953] shrink-0" />
                            <span className="truncate">
                                {user.company.address || user.company.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Attendance Modal (Live GPS & Selfie Webcam) */}
            <Dialog open={isAttendanceModalOpen} onOpenChange={closeAttendanceModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900">
                            {attendanceType === 'check_in' ? 'Presensi Masuk (Check-In)' : 'Presensi Pulang (Check-Out)'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-500">
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
                                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 flex items-start gap-2">
                                            <Clock className="size-4 shrink-0 text-amber-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Terlambat</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Waktu saat ini ({currentTimeStr} WIB) melewati batas jam masuk ({user.company.check_in_end?.slice(0, 5)} WIB).
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 flex items-start gap-2">
                                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
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
                                        <div className="rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-900 flex items-start gap-2">
                                            <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Pulang Lebih Awal</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Waktu saat ini ({currentTimeStr} WIB) belum mencapai jam pulang yang ditentukan ({user.company.check_out_start?.slice(0, 5)} WIB).
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 flex items-start gap-2">
                                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
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
                                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 flex items-start gap-2">
                                            <MapPin className="size-4 shrink-0 text-amber-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Keterangan: Di Luar Radius</span>
                                                <p className="text-[11px] mt-0.5">
                                                    Jarak Anda {distanceMeters} meter dari kantor (Batas: {user.company.radius_meters}m). Presensi tetap tercatat dengan catatan di luar radius.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 flex items-start gap-2">
                                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
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
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-neutral-700">Koordinat GPS Anda:</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={getGPSLocation}
                                    disabled={locating}
                                    className="h-6 text-[11px] px-2 gap-1 border-neutral-300 bg-white"
                                >
                                    <Crosshair className={`size-3 ${locating ? 'animate-spin' : ''}`} />
                                    {locating ? 'Mendeteksi...' : 'Perbarui GPS'}
                                </Button>
                            </div>

                            {currentLat && currentLng ? (
                                <div className="text-xs text-neutral-600 space-y-1">
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
                            <Label className="text-xs font-semibold text-neutral-700">Foto Selfie Langsung *</Label>
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900 flex items-center justify-center border border-neutral-200">
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
                                                className="bg-[#008953] hover:bg-[#007346] text-white gap-1.5 shadow-lg text-xs"
                                            >
                                                <Camera className="size-4" />
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
                                                className="gap-1.5 text-xs shadow-lg bg-white/90 hover:bg-white text-neutral-800"
                                            >
                                                <RefreshCw className="size-3.5" />
                                                Ulangi Foto
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                            {cameraError && <p className="text-xs text-rose-500">{cameraError}</p>}
                        </div>

                        <DialogFooter className="pt-3 gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={closeAttendanceModal}>
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={!currentLat || !currentLng || !selfieData}
                                className="bg-[#008953] hover:bg-[#007346] text-white font-semibold"
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
