import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, ChevronRight, Clock, Monitor, PlayCircle, Settings } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Devices', href: '/devices' },
];

Index.layout = {
    breadcrumbs: breadcrumbs
};


export default function Index({ devices }: any) {
    return (
        <>
            <Head title="Connected Units" />

            <div className="flex flex-col gap-8 p-6 w-full">
                {/* Header Section */}
                <div className="flex items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-primary">
                            <Monitor className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Hardware</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Vmix Fleet</h1>
                        <p className="text-muted-foreground">Manage and monitor all connected production units.</p>
                    </div>
                    <Badge variant="outline" className="h-8 px-4 font-bold border-primary/20 text-primary bg-primary/5">
                        {devices.length} Total Units
                    </Badge>
                </div>

                {/* Grid Section */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {devices.length > 0 ? devices.map((device: any) => (
                        <Card key={device.id} className="overflow-hidden group hover:shadow-xl transition-all border-none ring-1 ring-border/50 hover:ring-primary/40 bg-card/50">
                            <div className={`h-1.5 w-full ${device.is_online ? 'bg-emerald-500' : 'bg-muted'}`} />
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 pt-6 px-6">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black tracking-tight uppercase">
                                        {device.display_name || device.machine_name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground font-bold">
                                        <Monitor className="h-3 w-3" />
                                        <span>ID: {device.machine_name}</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className={`h-3 w-3 rounded-full ${device.is_online ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]' : 'bg-slate-300'}`} />
                                    {device.is_online && (
                                        <div className="absolute inset-0 h-full w-full rounded-full bg-emerald-500 animate-ping opacity-40" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 pt-0">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40 bg-muted/5 -mx-6 px-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Connectivity</p>
                                            <p className={`text-sm font-bold ${device.is_online ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                                {device.is_online ? 'CONNECTED' : 'DISCONNECTED'}
                                            </p>
                                        </div>
                                        <div className="space-y-1 border-l border-border/40 pl-4">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Logs</p>
                                            <p className="text-sm font-bold flex items-center gap-1.5">
                                                <PlayCircle className="h-3.5 w-3.5 text-primary" />
                                                {device.logs_count || 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Last Activity</p>
                                            <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                                                <Clock className="h-3 w-3" />
                                                {device.last_seen_at ? new Date(device.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest border-primary/10 hover:border-primary/40 hover:bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm">
                                            <Link href={`/devices/${device.id}`}>
                                                Manage <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/10 text-muted-foreground/30 gap-6">
                            <Monitor className="h-20 w-20 opacity-10" />
                            <div className="text-center">
                                <p className="text-xl font-black uppercase tracking-widest">No Vmix Systems Detected</p>
                                <p className="text-sm font-medium mt-2">Waiting for first API handshake...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
