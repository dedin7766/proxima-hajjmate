import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { useEffect, type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    useEffect(() => {
        // Load Midtrans Snap.js script
        const script = document.createElement('script');
        script.src = `https://app.sandbox.midtrans.com/snap/snap.js`; // Use sandbox for development
        // For production, use: script.src = `https://app.midtrans.com/snap/snap.js`;
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY); // Or directly use your client key
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Clean up the script when the component unmounts
            document.body.removeChild(script);
        };
    }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}