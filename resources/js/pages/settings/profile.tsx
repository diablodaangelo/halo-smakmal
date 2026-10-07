import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Camera,
    CheckCircle2,
    Lock,
    Save,
    Upload,
    User,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

    const initials = user.name
        ? user.name
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
        : 'US';

    return (
        <>
            <Head title="Pengaturan Profil - Halo-Smakmal" />

            <div className="space-y-6">
                {/* Flash Success Message */}
                {(flash?.success || status === 'profile-updated') && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2.5 shadow-2xs">
                        <CheckCircle2 className="h-4 w-4 text-[#008953] shrink-0" />
                        <span>{flash?.success || 'Profil akun Anda berhasil diperbarui!'}</span>
                    </div>
                )}

                {/* Error Banner */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-start gap-2.5 shadow-2xs">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                        <div>
                            <div className="font-bold">Gagal memperbarui profil:</div>
                            <ul className="list-disc pl-4 mt-1 space-y-0.5 font-normal">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Clean Profile Card */}
                    <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                        <CardContent className="p-6 sm:p-8 space-y-8">
                            {/* Avatar & Basic Info Section */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
                                <div className="relative group shrink-0">
                                    <div className="size-24 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-sm bg-slate-100 flex items-center justify-center">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt={user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center font-black text-2xl text-[#008953] bg-emerald-50">
                                                {initials}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white"
                                        title="Ganti Foto Profil"
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

                                <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">
                                            {user.name}
                                        </h3>
                                        <span className="inline-flex self-center sm:self-auto rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-[#008953]">
                                            {getRoleBadge(user.role)}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
                                        <span>{user.email}</span>
                                        {user.nis_nip && (
                                            <span className="font-semibold text-slate-600">
                                                NIP/NIS: {user.nis_nip}
                                            </span>
                                        )}
                                        {user.company_name && (
                                            <span className="flex items-center gap-1 font-semibold text-emerald-700">
                                                <Building2 className="h-3.5 w-3.5" />
                                                <span>{user.company_name}</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-9 px-3.5 rounded-xl text-xs font-semibold gap-2 border-slate-200 hover:bg-slate-50 text-slate-700"
                                        >
                                            <Upload className="h-3.5 w-3.5 text-[#008953]" />
                                            <span>Unggah Foto Baru</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Form Input Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Nama Lengkap */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                                            Nama Lengkap
                                        </Label>
                                        {isSpecialRole && (
                                            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                                <Lock className="h-3 w-3" />
                                                Dikelola Administrator
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isSpecialRole}
                                        className={`h-10 rounded-xl text-xs sm:text-sm font-medium ${
                                            isSpecialRole
                                                ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
                                                : 'bg-slate-50/50 border-slate-200 focus-visible:ring-1 focus-visible:ring-emerald-500'
                                        }`}
                                    />
                                </div>

                                {/* Nama Panggilan */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="nickname" className="text-xs font-bold text-slate-700">
                                        Nama Panggilan / Alias
                                    </Label>
                                    <Input
                                        id="nickname"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="Contoh: Admin / Bpk. Guru"
                                        maxLength={50}
                                        className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                    />
                                </div>

                                {/* Nomor Telepon / WhatsApp */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                                        Nomor WhatsApp / HP
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                        className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-emerald-500"
                                    />
                                </div>

                                {/* Email Terdaftar */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                                        Alamat Email Akun
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="h-10 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200 text-xs sm:text-sm font-medium font-mono"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#008953] hover:bg-[#007346] active:bg-[#00623a] text-white font-bold text-xs sm:text-sm rounded-xl h-11 px-6 shadow-sm shadow-emerald-900/10 transition-all flex items-center gap-2"
                        >
                            <Save className="h-4 w-4 stroke-[2.5]" />
                            <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
