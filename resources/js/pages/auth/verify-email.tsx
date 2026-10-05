import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function VerifyEmailDisabled() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
            <Head title="Verifikasi Email" />
            <h1 className="text-xl font-bold">Akun Sudah Aktif</h1>
            <p className="text-sm text-neutral-500">
                Akun Anda telah diaktifkan secara otomatis oleh Administrator sekolah.
            </p>
            <Button asChild className="mt-2">
                <Link href="/dashboard">Buka Dashboard</Link>
            </Button>
        </div>
    );
}

VerifyEmailDisabled.layout = {
    title: 'Halo-Smakmal',
    description: 'Sistem Monitoring PKL SMK Amaliah',
};
