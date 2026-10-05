import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CalendarCheck,
    CheckCircle2,
    Clock,
    GraduationCap,
    MapPin,
    ShieldCheck,
    Smartphone,
    Users,
} from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage<any>().props;

    return (
        <>
            <Head title="Halo-Smakmal | Sistem Monitoring & Jurnal PKL SMK Amaliah" />
            <div className="min-h-screen bg-slate-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
                {/* Header Navbar */}
                <header className="border-b border-neutral-200 bg-white/80 backdrop-blur sticky top-0 z-50 dark:border-neutral-800/80 dark:bg-neutral-900/50">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 font-bold text-white shadow-lg shadow-emerald-900/20">
                                HS
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                                    Halo-Smakmal
                                </h1>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">SMK Amaliah 1 & 2 Ciawi</p>
                            </div>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-500"
                                >
                                    <span>Buka Dashboard</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/40 transition-all hover:bg-emerald-500"
                                >
                                    <span>Masuk ke Sistem</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-medium text-emerald-400 backdrop-blur">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Platform Monitoring & Jurnal Praktik Kerja Lapangan Terintegrasi</span>
                    </div>

                    <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
                        Presensi GPS & Jurnal PKL <br />
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                            Berkarakter Islami
                        </span>
                    </h2>

                    <p className="mt-5 max-w-2xl text-base text-neutral-600 dark:text-neutral-400 sm:text-lg">
                        Mendukung pemantauan kehadiran presisi berbasis geofencing GPS, selfie real-time,
                        pencatatan jurnal harian kerja DUDI, serta monitoring kedisiplinan salat berjamaah bagi siswa SMK Amaliah.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={auth?.user ? dashboard() : login()}
                            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-500 hover:scale-[1.02]"
                        >
                            <span>{auth?.user ? 'Masuk ke Dashboard' : 'Login Sekarang'}</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-16 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 backdrop-blur">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">Geofencing & Selfie</h3>
                            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                Presensi otomatis berbasis radius kantor mitra DUDI menggunakan Haversine formula dan kamera selfie langsung.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 backdrop-blur">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-400">
                                <CalendarCheck className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">Jurnal & Log Salat</h3>
                            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                Siswa wajib mendokumentasikan kegiatan kerja harian serta mencatatkan pelaksanaan salat Dzuhur dan Ashar.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 backdrop-blur">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">Multi-Role Terpadu</h3>
                            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                Kontrol penuh Admin sekolah, monitoring real-time Guru Pembimbing, serta ACC jurnal cepat oleh Pembimbing DUDI.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500 dark:border-neutral-800/80">
                    <p>© {new Date().getFullYear()} Halo-Smakmal. SMK Amaliah 1 & 2 Ciawi, Bogor. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}
