import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword?: boolean;
};

export default function Login({ status }: Props) {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0c4e28] via-[#126b38] to-[#178547] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 selection:bg-emerald-500 selection:text-white">
            <Head title="Masuk - Halo Smakmal" />

            {/* Main Auth Card */}
            <div className="w-full max-w-4xl lg:max-w-5xl bg-white rounded-[2.25rem] shadow-2xl shadow-emerald-950/30 p-5 sm:p-7 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch">
                
                {/* Left Side: Photo Banner */}
                <div className="relative rounded-2xl md:rounded-[1.75rem] overflow-hidden min-h-[380px] sm:min-h-[440px] md:min-h-[490px] flex flex-col justify-end p-6 md:p-8 bg-neutral-900 shadow-inner">
                    <img
                        src="/images/login-banner.jpg"
                        alt="Siswa SMK Amaliah"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />

                    {/* Dark gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Text overlay on image (Clean Paragraph) */}
                    <div className="relative z-10 text-white">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                            Halo Smakmal
                        </h2>
                        <p className="mt-2 text-sm text-neutral-200 font-normal leading-relaxed drop-shadow">
                            Platform monitoring kehadiran berbasis GPS, jurnal kegiatan harian PKL, dan pemantauan ibadah bagi siswa SMK Amaliah 1 & 2 Ciawi.
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex flex-col justify-center px-1 sm:px-3 md:px-4 py-2">
                    {/* Header Logo */}
                    <div>
                        <img
                            src="/images/auth-logo.png"
                            alt="Logo Halo Smakmal"
                            className="w-14 h-14 object-contain drop-shadow-xs"
                        />

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-4 tracking-tight">
                            Ayo Masuk!
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Selamat datang di portal Halo Smakmal.
                        </p>
                    </div>

                    <div className="w-full h-px bg-neutral-200 my-5" />

                    {status && (
                        <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800 border border-emerald-200">
                            {status}
                        </div>
                    )}

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col"
                    >
                        {({ processing, errors }) => (
                            <div className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="email"
                                        className="text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                                    >
                                        Your Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@smkamaliah.sch.id"
                                        className="h-11 bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200/80 rounded-xl px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 shadow-none transition-all"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                                    >
                                        Password
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan password Anda"
                                        className="h-11 bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200/80 rounded-xl px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 shadow-none transition-all"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="h-12 w-full mt-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-700/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
                                    tabIndex={3}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    Login
                                </Button>

                                {/* Footer Information */}
                                <div className="pt-2 text-center space-y-1">
                                    <p className="text-xs text-neutral-500">
                                        Kalo belum ada akun segera hubungi admin sekolah.
                                    </p>
                                </div>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
}
