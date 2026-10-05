import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarCheck,
    ClipboardCheck,
    GitMerge,
    GraduationCap,
    LayoutGrid,
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
import { dashboard } from '@/routes';
import type { NavItem, User } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth?.user;
    const role = user?.role;

    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (role === 'admin') {
        navItems.push(
            {
                title: 'Data DUDI / Kantor',
                href: '/admin/companies',
                icon: Building2,
            },
            {
                title: 'Kelola Pengguna',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Plotting Penempatan',
                href: '/admin/plotting',
                icon: GitMerge,
            }
        );
    } else if (role === 'guru_pembimbing') {
        navItems.push(
            {
                title: 'Monitoring Siswa',
                href: '/dashboard',
                icon: GraduationCap,
            },
            {
                title: 'Rekap Presensi & Jurnal',
                href: '/dashboard',
                icon: ClipboardCheck,
            }
        );
    } else if (role === 'pembimbing_dudi') {
        navItems.push(
            {
                title: 'Review Jurnal Siswa',
                href: '/dashboard',
                icon: ClipboardCheck,
            }
        );
    } else if (role === 'siswa') {
        navItems.push(
            {
                title: 'Presensi PKL',
                href: '/dashboard',
                icon: CalendarCheck,
            },
            {
                title: 'Jurnal & Salat',
                href: '/dashboard',
                icon: ClipboardCheck,
            }
        );
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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

