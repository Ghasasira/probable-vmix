import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps, BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
    ...props
}: AppLayoutProps) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}
