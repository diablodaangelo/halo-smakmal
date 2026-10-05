import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function RegisterDisabled() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
            <Head title="Pendaftaran Ditutup" />
            <h1 className="text-xl font-bold">Pendaftaran Mandiri Tidak Tersedia</h1>
            <p className="text-sm text-neutral-500">
                Pendaftaran akun siswa dan guru PKL dikelola langsung oleh Administrator SMK Amaliah.
            </p>
            <Button asChild className="mt-2">
                <Link href="/login">Kembali ke Halaman Login</Link>
            </Button>
        </div>
    );
}

RegisterDisabled.layout = {
    title: 'Halo-Smakmal',
    description: 'Sistem Monitoring PKL SMK Amaliah',
};
