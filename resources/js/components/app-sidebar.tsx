import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Notebook, Globe, Barcode, AlignLeft, ArrowRightLeft, UserCheck, HandCoins } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
      {
    title: "Master Data",
    icon: Folder,
    href: "#",
    children: [
      { title: "Users", href: "/users", icon: Users },
      { title: "Roles", href: "/roles", icon: Notebook },
      { title: "Categories", href: "/categories", icon: AlignLeft },
      { title: "Products", href: "/products", icon: Barcode },
      { title: "Customers", href: "/customers", icon: UserCheck },
        ],
    },   
    {
        title: 'Transactions',
        href: '/transactions',
        icon: ArrowRightLeft,
    },
    {
        title: 'Invoices',
        href: '/invoices',
        icon: HandCoins,
    },
];


const footerNavItems: NavItem[] = [
    {
        title: 'Proxima Suite',
        href: 'https://proximasuite.com',
        icon: Globe,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="hide-on-print">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
