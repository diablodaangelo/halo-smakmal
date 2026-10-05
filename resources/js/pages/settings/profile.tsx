import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Camera,
    CheckCircle2,
    GraduationCap,
    Lock,
    Save,
    Sparkles,
    Upload,
    User,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserData {
    id: number;
    name: string;
    nickname?: string | null;
    email: string;
    role: string;
    nis_nip?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    company_name?: string | null;
}

interface PageProps {
    user: UserData;
    status?: string;
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ProfilePage({ user, status, errors, flash }: PageProps) {
    const isSpecialRole = user.role === 'siswa' || user.role === 'guru_pembimbing' || user.role === 'pembimbing_dudi';

    const [nickname, setNickname] = useState(user.nickname || '');
    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('_method', 'PATCH');
        formData.append('nickname', nickname);
        formData.append('phone', phone);
        if (!isSpecialRole) {
            formData.append('name', name);
        }
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        router.post('/settings/profile', formData, {
            onSuccess: () => setSubmitting(false),
            onError: () => setSubmitting(false),
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'guru_pembimbing':
                return 'Guru Pembimbing';
            case 'pembimbing_dudi':
                return 'Pembimbing DUDI';
            case 'siswa':
                return 'Siswa PKL';
            default:
                return role;
        }
    };

    return (
        <>
            <Head title="Pengaturan Profil - Halo-Smakmal" />

            <div className="space-y-6">
                {/* Flash Success Message */}
                {(flash?.success || status === 'profile-updated') && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{flash?.success || 'Profil berhasil diperbarui!'}</span>
                    </div>
                )}

                {/* Error Banner */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                        <div>
                            <div className="font-bold">Gagal memperbarui profil:</div>
                            <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Foto Profil Card */}
                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
                        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Camera className="h-4 w-4 text-emerald-600" />
                                <span>Foto Profil Akun</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-6">
                            {/* Avatar Display */}
                            <div className="relative group">
                                <div className="size-24 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-sm bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center font-bold text-2xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950">
                                            {user.name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white"
                                    title="Ganti Foto"
                                >
                                    <Camera className="h-6 w-6" />
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div className="space-y-1.5 text-center sm:text-left flex-1">
                                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                                    {user.name}
                                </h3>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <span className="inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        {getRoleBadge(user.role)}
                                    </span>
                                    {user.nis_nip && (
                                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                            {user.nis_nip}
                                        </span>
                                    )}
                                    {user.company_name && (
                                        <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                                            <Building2 className="h-3 w-3 text-neutral-400" />
                                            <span>{user.company_name}</span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-1">
                                    Format: JPG, PNG, atau WEBP (Maksimal 4 MB). Klik tombol di bawah untuk memilih foto baru.
                                </p>
                                <div className="pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs h-8 gap-1.5"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>Pilih Foto Baru</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Informasi Pribadi & Nama Panggilan */}
                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
                        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-600" />
                                <span>Informasi Akun & Nama Panggilan</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            {/* Nama Panggilan (Bisa Diedit Siswa & Guru) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="nickname" className="text-xs font-bold text-neutral-900 dark:text-white">
                                        Nama Panggilan / Alias (Interaktif)
                                    </Label>
                                    <span className="text-[11px] text-emerald-600 font-semibold">
                                        ✨ Bisa kamu ubah
                                    </span>
                                </div>
                                <Input
                                    id="nickname"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="Contoh: Rizky / Dinda / Pak Guru"
                                    maxLength={50}
                                    className="h-9 text-xs"
                                />
                                <p className="text-[11px] text-neutral-400">
                                    Nama panggilan yang akan menyapa kamu di halaman dashboard (misal: <em>"Halo, {nickname || user.name.split(' ')[0]}!"</em>).
                                </p>
                            </div>

                            {/* Nama Resmi Terdaftar (Hanya Baca untuk Siswa & Guru) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="name" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                        Nama Lengkap Resmi
                                    </Label>
                                    {isSpecialRole && (
                                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                            <Lock className="h-3 w-3" />
                                            Terkunci (Dikelola Administrator)
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isSpecialRole}
                                    className={`h-9 text-xs ${isSpecialRole ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500 cursor-not-allowed' : ''}`}
                                />
                                {isSpecialRole && (
                                    <p className="text-[11px] text-neutral-400">
                                        Nama resmi digunakan untuk kelengkapan administrasi logbook dan sertifikat PKL. Hubungi Admin jika terdapat salah penulisan nama.
                                    </p>
                                )}
                            </div>

                            {/* Email & Kontak WhatsApp */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                        Email Akun
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="h-9 text-xs bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500 cursor-not-allowed font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                        Nomor WhatsApp / HP
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Contoh: 08123456789"
                                        className="h-9 text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tombol Simpan */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold gap-1.5 shadow-sm px-5 h-9"
                        >
                            <Save className="h-4 w-4" />
                            <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
