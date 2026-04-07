import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ClipboardList, Filter, LayoutGrid, Monitor, RotateCcw, Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Log Viewer', href: '/logs' },
];


Index.layout = {
    breadcrumbs: breadcrumbs
};

export default function Index({ logs, filters, devices, types }: any) {
    const { data, setData, reset } = useForm({
        device_id: filters.device_id || '',
        input_name: filters.input_name || '',
        input_type: filters.input_type || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const applyFilters = () => {
        router.get('/logs', { ...data }, { preserveState: true });
    };

    const clearFilters = () => {
        reset();
        router.get('/logs');
    };

    return (
        <>
            <Head title="Log Viewer" />

            <div className="flex flex-col gap-8 p-6 w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-primary">
                            <ClipboardList className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Archive</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Comprehensive Logs</h1>
                        <p className="text-muted-foreground">Historical records of all playback events across all units.</p>
                    </div>
                </div>

                {/* Filter Section */}
                <Card className="bg-muted/10 border-dashed shadow-sm">
                    <CardHeader className="pb-4 pt-4 px-6 border-b bg-muted/5">
                        <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight">
                            <Filter className="h-4 w-4 text-primary" /> Active Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12 items-end">
                            <div className="lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Source Device</label>
                                <Select value={data.device_id} onValueChange={v => setData('device_id', v)}>
                                    <SelectTrigger className="bg-background border-muted-foreground/20">
                                        <SelectValue placeholder="All Devices" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">All Devices</SelectItem>
                                        {devices.map((d: any) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                                {d.display_name || d.machine_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Input Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        className="bg-background pl-9 border-muted-foreground/20"
                                        placeholder="e.g. Main Camera"
                                        value={data.input_name}
                                        onChange={e => setData('input_name', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Input Type</label>
                                <Select value={data.input_type} onValueChange={v => setData('input_type', v)}>
                                    <SelectTrigger className="bg-background border-muted-foreground/20">
                                        <SelectValue placeholder="Any Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">Any Type</SelectItem>
                                        {types.map((t: string) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Time range</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        className="bg-background border-muted-foreground/20 text-xs"
                                        value={data.date_from}
                                        onChange={e => setData('date_from', e.target.value)}
                                    />
                                    <Input
                                        type="date"
                                        className="bg-background border-muted-foreground/20 text-xs"
                                        value={data.date_to}
                                        onChange={e => setData('date_to', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-1 flex gap-2">
                                <Button onClick={applyFilters} className="flex-1 font-bold shadow-sm">
                                    Go
                                </Button>
                                <Button onClick={clearFilters} variant="outline" size="icon" className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Log Table */}
                <Card className="overflow-hidden border-none shadow-md ring-1 ring-border">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 py-5 px-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5 text-primary" /> Data Grid
                        </CardTitle>
                        <Badge variant="secondary" className="font-mono text-[10px] py-1 px-3">
                            {logs.total} Total Records
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black bg-muted/5 border-b">
                                    <tr>
                                        <th className="px-6 py-4">Played At</th>
                                        <th className="px-6 py-4 text-center">Snapshot</th>
                                        <th className="px-6 py-4">Machine</th>
                                        <th className="px-6 py-4">Input & ID</th>
                                        <th className="px-6 py-4 text-right">Duration</th>
                                        <th className="px-6 py-4 text-center">Type</th>
                                        <th className="px-6 py-4 text-center">Protocol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {logs.data.length > 0 ? logs.data.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-[10px] text-muted-foreground/70 font-semibold">
                                                {new Date(log.played_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'medium' })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {log.screenshot_url ? (
                                                    <a href={log.screenshot_url} target="_blank" rel="noreferrer" className="inline-block relative group/img">
                                                        <img 
                                                            src={log.screenshot_url} 
                                                            alt="Input" 
                                                            className="h-8 w-12 object-cover rounded shadow-sm border border-border group-hover/img:scale-150 transition-transform origin-center z-10" 
                                                        />
                                                    </a>
                                                ) : (
                                                    <div className="h-8 w-12 bg-muted/30 rounded border border-dashed flex items-center justify-center">
                                                        <Monitor className="h-3 w-3 text-muted-foreground/20" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Monitor className="h-3.5 w-3.5 text-muted-foreground/50" />
                                                    <span className="font-bold text-foreground/90 uppercase tracking-tight text-xs">
                                                        {log.device.display_name || log.device.machine_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-black text-foreground">{log.input_name}</span>
                                                    <span className="text-[9px] text-muted-foreground font-mono font-bold uppercase">Index: #{log.input_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums font-mono text-xs text-muted-foreground font-bold">
                                                {log.duration_formatted}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="outline" className="font-mono text-[9px] font-black uppercase py-0.5 px-2 rounded-sm bg-muted/40 border-primary/10 text-foreground/70">
                                                    {log.input_type || 'Unknown'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="secondary" className="font-mono text-[9px] font-black uppercase py-0.5 px-2 rounded-sm text-primary/80">
                                                    {log.source || 'TCP'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-24 text-center text-muted-foreground/30">
                                                <div className="flex flex-col items-center gap-4">
                                                    <ClipboardList className="h-20 w-20 opacity-5" />
                                                    <p className="text-sm font-medium tracking-widest uppercase">No matching logs found</p>
                                                    <Button variant="outline" size="sm" onClick={clearFilters}>Reset All Filters</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 border-t bg-muted/5 gap-4">
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-tight">
                                Showing <span className="text-foreground">{logs.from}</span> to <span className="text-foreground">{logs.to}</span> of {logs.total}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest"
                                    disabled={!logs.prev_page_url}
                                    onClick={() => logs.prev_page_url && router.get(logs.prev_page_url, {}, { preserveState: true })}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>

                                <div className="hidden lg:flex items-center gap-1">
                                    {logs.links.slice(1, -1).map((link: any, i: number) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'ghost'}
                                            size="sm"
                                            className={`h-9 w-9 p-0 font-bold ${link.active ? 'shadow-md' : 'text-muted-foreground'}`}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            disabled={!link.url}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest"
                                    disabled={!logs.next_page_url}
                                    onClick={() => logs.next_page_url && router.get(logs.next_page_url, {}, { preserveState: true })}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
