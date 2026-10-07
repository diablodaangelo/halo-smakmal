import { Link } from '@inertiajs/react';
import { Lock, User, UserCog } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const tabItems = [
    {
        title: 'Profil & Identitas',
        href: edit(),
        icon: User,
    },
    {
        title: 'Keamanan Kata Sandi',
        href: editSecurity(),
        icon: Lock,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d8f2e5] text-[#008953] shadow-xs ring-1 ring-[#008953]/10">
                        <UserCog className="h-6 w-6 stroke-[2.2]" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            Pengaturan Akun
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Kelola profil pengguna, foto avatar, dan keamanan kata sandi Anda.
                        </p>
                    </div>
                </div>

                {/* Clean Tab Pills */}
                <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl self-start sm:self-auto border border-slate-200/60">
                    {tabItems.map((item, index) => {
                        const active = isCurrentOrParentUrl(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={`${toUrl(item.href)}-${index}`}
                                href={item.href}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
                                    active
                                        ? 'bg-[#008953] text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Content Body */}
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}
