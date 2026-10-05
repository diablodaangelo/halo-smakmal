import { Link } from '@inertiajs/react';
import { Lock, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const tabItems = [
    {
        title: 'Profil & Foto',
        href: edit(),
        icon: User,
    },
    {
        title: 'Keamanan / Password',
        href: editSecurity(),
        icon: Lock,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Pengaturan Akun
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    Kelola foto profil, nama panggilan interaktif, dan kata sandi akun Anda.
                </p>

                {/* Horizontal Navigation Tabs (No nested sidebar) */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                    {tabItems.map((item, index) => {
                        const active = isCurrentOrParentUrl(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={`${toUrl(item.href)}-${index}`}
                                href={item.href}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition shadow-2xs',
                                    active
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800 dark:hover:bg-neutral-800'
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
