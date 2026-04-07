import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Activity, ArrowLeft, ChevronLeft, ChevronRight, Clock, Edit3, Monitor, PlayCircle, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Devices', href: '/devices' },
    { title: 'System Detail', href: '#' },
];

export default function Show({ device, logs, stats }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const { data, setData, put, processing, reset } = useForm({
        display_name: device.display_name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/devices/${device.id}`, {
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`System: ${device.machine_name}`} />

            <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl shadow-sm ${device.is_online ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20' : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'}`}>
                            <Monitor className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            {isEditing ? (
                                <form onSubmit={submit} className="flex items-center gap-2">
                                    <Input
                                        value={data.display_name}
                                        onChange={e => setData('display_name', e.target.value)}
                                        className="h-10 text-xl font-bold bg-background max-w-[300px]"
                                        autoFocus
                                    />
                                    <Button size="icon" variant="default" disabled={processing} type="submit" className="h-10 w-10 shadow-sm"><Save className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="outline" onClick={() => { setIsEditing(false); reset(); }} className="h-10 w-10"><X className="h-4 w-4" /></Button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black tracking-tight uppercase">
                                        {device.display_name || device.machine_name}
                                    </h1>
                                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8 hover:bg-primary/5 hover:text-primary transition-colors">
                                        <Edit3 className="h-4 w-4 opacity-40 hover:opacity-100" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <span className="bg-muted px-2 py-0.5 rounded font-mono text-[10px]">ID: {device.machine_name}</span>
                                <span className="flex items-center gap-1.5">
                                    <div className={`h-1.5 w-1.5 rounded-full ${device.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    {device.is_online ? 'Device Online' : 'Device Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <Link href="/devices">
                            <Button variant="outline" size="sm" className="h-10 px-4 font-bold uppercase text-[10px] tracking-widest gap-2">
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Fleet
                            </Button>
                         </Link>
                         <Badge className={`h-10 px-6 font-black uppercase tracking-[0.1em] text-xs ${device.is_online ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600' : 'bg-slate-400'}`}>
                             {device.is_online ? 'LIVE FEED ACTIVE' : 'NO SIGNAL'}
                         </Badge>
                    </div>
                </div>

                {/* Stats cards Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader className="pb-2 px-6 pt-6">
                            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Total Transmissions</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-4xl font-black tracking-tighter flex items-center gap-3">
                                <PlayCircle className="h-8 w-8 text-primary/40" />
                                {stats.total_logs}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader className="pb-2 px-6 pt-6">
                            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Unique Source Inputs</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-4xl font-black tracking-tighter flex items-center gap-3 text-foreground/80">
                                <Activity className="h-8 w-8 text-emerald-500/30" />
                                {stats.unique_inputs}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader className="pb-2 px-6 pt-6">
                            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Last System Handshake</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-3xl font-mono font-black tracking-tighter flex items-center gap-3 text-amber-500/80">
                                <Clock className="h-8 w-8 text-amber-500/20" />
                                {device.last_seen_at ? new Date(device.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'NEVER'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Local History Table */}
                <Card className="overflow-hidden border-none shadow-md ring-1 ring-border">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 py-5 px-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-3">
                             <div className="p-2 bg-primary/10 rounded-lg">
                                <ClipboardList className="h-5 w-5 text-primary" />
                             </div>
                             System Transmission History
                        </CardTitle>
                        <Badge variant="outline" className="font-mono text-[9px] font-bold py-1 px-3 bg-background">
                            Latest events
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black bg-muted/5 border-b">
                                    <tr>
                                        <th className="px-6 py-4">Exact Time</th>
                                        <th className="px-6 py-4">Input & Index</th>
                                        <th className="px-6 py-4 text-right">Duration</th>
                                        <th className="px-6 py-4 text-center">Class</th>
                                        <th className="px-6 py-4 text-center">Source</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {logs.data.length > 0 ? logs.data.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-[10px] text-muted-foreground font-bold">
                                                {new Date(log.played_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-foreground uppercase tracking-tight text-xs">{log.input_name}</span>
                                                    <span className="text-[9px] text-muted-foreground font-mono font-bold"># {log.input_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums font-mono text-xs text-muted-foreground font-black">
                                                {log.duration_formatted}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="secondary" className="font-mono text-[9px] font-black uppercase py-0.5 px-2 rounded-sm text-primary/80">
                                                    {log.input_type || 'Unknown'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                 <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{log.source || 'TCP'}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground/30">
                                                <div className="flex flex-col items-center gap-4">
                                                    <Monitor className="h-16 w-16 opacity-5" />
                                                    <p className="text-sm font-medium tracking-wide uppercase">No activity logs recorded for this unit</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                         {/* Mini Pagination */}
                         {logs.last_page > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Page {logs.current_page} of {logs.last_page}</p>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="sm" className="h-8 px-3 font-bold text-[10px] uppercase" disabled={!logs.prev_page_url} onClick={() => logs.prev_page_url && router.get(logs.prev_page_url)}>
                                         <ChevronLeft className="h-3 w-3 mr-1" /> Previous
                                     </Button>
                                     <Button variant="outline" size="sm" className="h-8 px-3 font-bold text-[10px] uppercase" disabled={!logs.next_page_url} onClick={() => logs.next_page_url && router.get(logs.next_page_url)}>
                                         Next <ChevronRight className="h-3 w-3 ml-1" />
                                     </Button>
                                </div>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
