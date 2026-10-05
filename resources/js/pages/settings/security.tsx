import { Form, Head, usePage } from '@inertiajs/react';
import { CheckCircle2, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { flash } = usePage<{ flash?: { success?: string } }>().props;

    return (
        <>
            <Head title="Keamanan & Kata Sandi - Halo-Smakmal" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Card Ubah Kata Sandi */}
                <Card className="border-neutral-200 shadow-xs dark:border-neutral-800">
                    <CardHeader className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                            <KeyRound className="h-4 w-4 text-emerald-600" />
                            <span>Ubah Kata Sandi</span>
                        </CardTitle>
                        <CardDescription className="text-xs text-neutral-500">
                            Masukkan kata sandi akun Anda saat ini untuk mengonfirmasi perubahan, lalu tentukan kata sandi baru minimal 8 karakter.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5">
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
                                        <Label htmlFor="current_password" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                            Kata Sandi Saat Ini <span className="text-red-500">*</span>
                                        </Label>
                                        <PasswordInput
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            className="h-9 text-xs"
                                            autoComplete="current-password"
                                            placeholder="Masukkan kata sandi saat ini"
                                        />
                                        <InputError message={errors.current_password} />
                                    </div>

                                    {/* 2. Kata Sandi Baru */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                            Kata Sandi Baru <span className="text-red-500">*</span>
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            className="h-9 text-xs"
                                            autoComplete="new-password"
                                            placeholder="Masukkan kata sandi baru"
                                            passwordrules={props.passwordRules}
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* 3. Konfirmasi Kata Sandi Baru */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password_confirmation" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                            Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            className="h-9 text-xs"
                                            autoComplete="new-password"
                                            placeholder="Ulangi kata sandi baru"
                                            passwordrules={props.passwordRules}
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-9 gap-2 bg-emerald-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                                            data-test="update-password-button"
                                        >
                                            <Lock className="h-3.5 w-3.5" />
                                            <span>{processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                {props.canManageTwoFactor && (
                    <ManageTwoFactor
                        canManageTwoFactor={props.canManageTwoFactor}
                        requiresConfirmation={props.requiresConfirmation}
                        twoFactorEnabled={props.twoFactorEnabled}
                    />
                )}

                {props.canManagePasskeys && (
                    <ManagePasskeys
                        canManagePasskeys={props.canManagePasskeys}
                        passkeys={props.passkeys}
                    />
                )}
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
