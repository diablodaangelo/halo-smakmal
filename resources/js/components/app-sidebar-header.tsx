import { Menu } from 'lucide-react';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    onToggleMobileSidebar,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    onToggleMobileSidebar?: () => void;
}) {
    return (
        <header className="lg:hidden flex h-14 shrink-0 items-center justify-between px-4 sm:px-6 bg-transparent">
            <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer shrink-0"
                aria-label="Buka menu navigasi"
            >
                <Menu className="size-5" />
            </button>
        </header>
    );
}
