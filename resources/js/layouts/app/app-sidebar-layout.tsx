import React, { useState } from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <AppShell variant="sidebar">
            <AppSidebar
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />
            <AppContent variant="sidebar">
                <AppSidebarHeader
                    breadcrumbs={breadcrumbs}
                    onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
                />
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
            </AppContent>
        </AppShell>
    );
}
