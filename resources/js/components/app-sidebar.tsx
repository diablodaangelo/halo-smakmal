import {
    AlertTriangle,
    BookOpen,
    Building2,
    CalendarCheck,
    ClipboardCheck,
    GitMerge,
    GraduationCap,
    LayoutGrid,
    ShieldAlert,
    Sun,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import type { NavItem, User } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth?.user;
    const role = user?.role;

    const logoHref =
        role === 'admin'
            ? '/admin/students'
            : role === 'guru_pembimbing'
            ? '/teacher/attendances'
            : dashboard();

    let navItems: NavItem[] = [];

    if (role === 'admin') {
        navItems = [
            {
                title: 'Kelola Siswa',
                href: '/admin/students',
                icon: Users,
            },
            {
                title: 'Kelola Guru',
                href: '/admin/teachers',
                icon: GraduationCap,
            },
            {
                title: 'Master DUDI',
                href: '/admin/companies',
                icon: Building2,
            },
        ];
    } else if (role === 'guru_pembimbing') {
        navItems = [
            {
                title: 'Presensi Siswa',
                href: '/teacher/attendances',
                icon: CalendarCheck,
            },
            {
                title: 'Review Jurnal',
                href: '/teacher/journals',
                icon: BookOpen,
            },
            {
                title: 'Review Salat',
                href: '/teacher/prayers',
                icon: Sun,
            },
        ];
    } else if (role === 'pembimbing_dudi') {
        navItems = [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Review Jurnal Siswa',
                href: '/dashboard',
                icon: ClipboardCheck,
            },
        ];
    } else if (role === 'siswa') {
        navItems = [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Riwayat Presensi',
                href: '/student/attendances',
                icon: CalendarCheck,
            },
            {
                title: 'Jurnal Harian PKL',
                href: '/student/journals',
                icon: BookOpen,
            },
            {
                title: 'Jadwal & Log Salat',
                href: '/student/prayers',
                icon: ClipboardCheck,
            },
        ];
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={logoHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

