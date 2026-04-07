import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    ClipboardList,
    Clock,
    Monitor,
    PlayCircle
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => (
    <Card className="relative overflow-hidden group transition-all hover:shadow-md border-b-2 border-b-transparent hover:border-b-primary/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="text-muted-foreground transition-transform group-hover:scale-110 duration-300">{icon}</div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            {description && <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 mt-1">{description}</p>}
        </CardContent>
    </Card>
);

export default function Dashboard({ stats, chart_data, recent_logs, devices }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
                    <p className="text-muted-foreground">Monitor your Vmix units and playback logs in real-time.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Devices"
                        value={stats.total_devices}
                        icon={<Monitor className="h-5 w-5" />}
                    />
                    <StatCard
                        title="Online Now"
                        value={stats.online_devices}
                        icon={<Activity className="h-5 w-5 text-emerald-500" />}
                        description="Active in last 10m"
                    />
                    <StatCard
                        title="Logs Today"
                        value={stats.logs_today}
                        icon={<PlayCircle className="h-5 w-5 text-blue-500" />}
                    />
                    <StatCard
                        title="Top Input"
                        value={stats.top_input || 'N/A'}
                        icon={<Clock className="h-5 w-5 text-amber-500" />}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
                    {/* Activity Chart */}
                    <Card className="lg:col-span-8 overflow-hidden flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>24 Hour Activity</CardTitle>
                            <Badge variant="outline" className="font-normal border-primary/20 text-primary">Real-time Feed</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[300px] flex flex-col justify-center">
                            {chart_data && chart_data.length > 0 && chart_data.some((d: any) => d.count > 0) ? (
                                <div className="h-[280px] flex items-end gap-3 px-2 pb-8">
                                    {chart_data.map((item: any, i: number) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                            <div
                                                className="w-full bg-primary/10 hover:bg-primary/40 transition-all duration-300 rounded-t-sm cursor-help sm:min-w-[8px]"
                                                style={{ height: `${Math.max(4, (item.count / (Math.max(...chart_data.map((d: any) => d.count)) || 1)) * 100)}%` }}
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all shadow-xl z-50 border whitespace-nowrap">
                                                    {item.count} logs
                                                </div>
                                            </div>
                                            <span className="text-[9px] text-muted-foreground font-medium rotate-45 origin-left truncate w-6 mt-2">
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground/40 py-12 gap-3 transition-colors hover:bg-muted/20">
                                    <Activity className="h-12 w-12 opacity-20" />
                                    <p className="text-sm font-medium">No activity data available for the last 24h</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Devices Sidebar */}
                    <Card className="lg:col-span-4 flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-lg">Active Units</CardTitle>
                            <Link href="/devices">
                                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs hover:bg-primary/5">
                                    View All <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto max-h-[400px] scrollbar-hide">
                            <div className="space-y-4">
                                {devices && devices.length > 0 ? devices.slice(0, 6).map((device: any) => (
                                    <div key={device.id} className="flex items-center gap-4 group transition-all p-2 rounded-lg hover:bg-muted/30">
                                        <div className="relative flex-shrink-0">
                                            <div className={`h-2.5 w-2.5 rounded-full ${device.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            {device.is_online && (
                                                <div className="absolute inset-0 h-full w-full rounded-full bg-emerald-500 animate-ping opacity-30" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                                {device.display_name || device.machine_name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground truncate font-medium">
                                                {device.last_input_name || 'Idle'}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 text-[10px] font-mono font-bold text-muted-foreground/60 tabular-nums">
                                            {device.last_seen_at ? new Date(device.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/40 gap-3">
                                        <Monitor className="h-10 w-10 opacity-10" />
                                        <p className="text-xs font-medium uppercase tracking-widest">No devices connected</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Logs Table */}
                <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/20 py-4 px-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <PlayCircle className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Global Playback Feed</CardTitle>
                        </div>
                        <Link href="/logs">
                            <Button variant="outline" size="sm" className="h-9 px-4 font-semibold hover:border-primary/40 transition-colors">Detailed History</Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black bg-muted/5 border-b">
                                    <tr>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">Unit</th>
                                        <th className="px-6 py-4">Input Name</th>
                                        <th className="px-6 py-4 text-right">Duration</th>
                                        <th className="px-6 py-4 text-center">Class</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {recent_logs && recent_logs.length > 0 ? recent_logs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-[10px] text-muted-foreground/70 font-semibold italic">
                                                {new Date(log.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                                            </td>
                                            <td className="px-6 py-4 font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                                                {log.device.display_name || log.device.machine_name}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-foreground/80">{log.input_name}</td>
                                            <td className="px-6 py-4 text-right tabular-nums font-mono text-xs text-muted-foreground">
                                                {log.duration_formatted}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="outline" className="font-mono text-[9px] font-bold uppercase py-0 px-2 rounded bg-muted/30">
                                                    {log.input_type || 'Unknown'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground/30">
                                                <div className="flex flex-col items-center gap-4">
                                                    <ClipboardList className="h-16 w-16 opacity-10" />
                                                    <p className="text-sm font-medium tracking-wide">No playback records found for today</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
