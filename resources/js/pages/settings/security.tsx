import { Form, Head, usePage } from '@inertiajs/react';
import { CheckCircle2, KeyRound, Lock } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
};

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { flash } = usePage<{ flash?: { success?: string } }>().props;

    return (
        <>
            <Head title="Keamanan Kata Sandi - Halo-Smakmal" />

            <div className="space-y-6">
                {/* Flash Success */}
                {flash?.success && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-bold text-emerald-800 shadow-2xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#008953]" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Card Ubah Kata Sandi */}
                <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                        <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#008953] ring-1 ring-emerald-600/20">
                                <KeyRound className="h-5 w-5 stroke-[2.2]" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Perbarui Kata Sandi Akun
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Gunakan kata sandi yang kuat minimal 8 karakter dengan kombinasi huruf dan angka.
                                </p>
                            </div>
                        </div>

                        <Form
                            {...SecurityController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }
                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-5 max-w-xl"
                        >
                            {({ errors, processing }) => (
                                <>
                                    {/* 1. Kata Sandi Saat Ini */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="current_password" className="text-xs font-bold text-slate-700">
                                            Kata Sandi Saat Ini *
                                        </Label>
                                        <PasswordInput
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                            autoComplete="current-password"
                                            placeholder="Masukkan kata sandi saat ini"
                                        />
                                        <InputError message={errors.current_password} />
                                    </div>

                                    {/* 2. Kata Sandi Baru */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                                            Kata Sandi Baru *
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                            autoComplete="new-password"
                                            placeholder="Masukkan kata sandi baru (min. 8 karakter)"
                                            passwordrules={props.passwordRules}
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* 3. Konfirmasi Kata Sandi Baru */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password_confirmation" className="text-xs font-bold text-slate-700">
                                            Konfirmasi Kata Sandi Baru *
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                            autoComplete="new-password"
                                            placeholder="Ulangi kata sandi baru"
                                            passwordrules={props.passwordRules}
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    <div className="pt-3">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-[#008953] hover:bg-[#007346] active:bg-[#00623a] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-6 shadow-sm shadow-emerald-900/10 transition-all flex items-center gap-2"
                                            data-test="update-password-button"
                                        >
                                            <Lock className="h-4 w-4 stroke-[2.5]" />
                                            <span>{processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan & Kata Sandi',
            href: edit(),
        },
    ],
};
