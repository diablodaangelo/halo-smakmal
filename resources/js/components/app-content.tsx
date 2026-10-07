import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'main'> & {
    variant?: AppVariant;
};

export function AppContent({ variant = 'sidebar', children, className, ...props }: Props) {
    if (variant === 'sidebar') {
        return (
            <div className={cn('min-h-screen pl-64 w-full flex flex-col bg-[#f8fafc]', className)} {...props}>
                {children}
            </div>
        );
    }

    return (
        <main
            className={cn('mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl', className)}
            {...props}
        >
            {children}
        </main>
    );
}
