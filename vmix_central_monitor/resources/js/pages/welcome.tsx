import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Shield, Monitor, PlayCircle, ClipboardList, ArrowRight } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10 transition-colors duration-500 overflow-x-hidden">
            <Head title="Vmix Central Monitor - Hill-Com" />

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full" />
                {/* Subtle Grid overlay effect (using CSS) */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 dark:bg-[radial-gradient(#ffffff11_1px,transparent_1px)]" />
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all duration-300">
                <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-4 group">
                        <img src="/Hill-Com.png" alt="Hill-Com Logo" className="h-12 w-auto brightness-110 group-hover:scale-105 transition-transform duration-300 drop-shadow-sm" />
                        <div className="hidden sm:flex flex-col leading-none">
                            <span className="text-sm font-black tracking-tighter uppercase text-foreground/90">Vmix Central</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hill-Com Monitoring</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 sm:gap-6">
                        {auth.user ? (
                            <Button asChild variant="default" size="sm" className="h-9 px-5 shadow-lg shadow-primary/10">
                                <Link href={dashboard()}>Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        ) : (
                            <>
                                <Link href={login()} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-2">Log in</Link>
                                {canRegister && (
                                    <Button asChild size="sm" variant="outline" className="h-9 font-bold border-primary/20 hover:bg-primary/5">
                                        <Link href={register()}>Register</Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="relative isolate pt-14 pb-12 sm:pb-32 min-h-[calc(100vh-64px)] flex items-center">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-2xl text-center lg:text-left space-y-8">
                            <div>
                                <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 mb-6 ring-1 ring-primary/20 animate-in fade-in slide-in-from-bottom-3 duration-1000">
                                    <Activity className="mr-2 h-3.5 w-3.5 animate-pulse" /> vMix Transmission Ready
                                </div>
                                <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl leading-[1.05] animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
                                    Monitor your <span className="text-primary italic">broadcast</span> fleet with precision.
                                </h1>
                            </div>

                            <p className="mt-6 text-lg leading-8 text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-200 text-balance">
                                Real-time telemetry, automated logging, and comprehensive device health tracking. Built for professional broadcasters by Hill-Com.
                            </p>

                            <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                                {auth.user ? (
                                    <Button asChild size="lg" className="h-12 px-8 font-black uppercase tracking-widest rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-xl shadow-primary/20">
                                        <Link href={dashboard()}>Launch Command Center</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild size="lg" className="h-12 px-8 font-black uppercase tracking-widest rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-xl shadow-primary/20">
                                            <Link href={login()}>Get Started</Link>
                                        </Button>
                                        <Link href="https://hillcom.ug" target="_blank" className="text-sm font-black uppercase tracking-widest leading-6 text-foreground/70 hover:text-foreground transition-all flex items-center gap-2 group">
                                            Contact Sales <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Interactive Card/Graphic Section */}
                        <div className="relative group animate-in fade-in zoom-in-95 duration-1000 delay-500">
                            <Card className="border-primary/10 overflow-hidden shadow-2xl bg-card/40 backdrop-blur-xl group-hover:border-primary/30 transition-all duration-500 rounded-2xl relative ring-1 ring-white/5 shadow-primary/20">
                                <CardContent className="p-0">
                                    <div className="bg-muted/30 p-4 border-b flex items-center gap-2 justify-between">
                                        <div className="flex gap-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground tabular-nums">Connected Unit #051 - LIVE</span>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Active Transmission</span>
                                            <div className="h-12 w-full bg-primary/5 rounded flex items-center px-4 border border-primary/10">
                                                <PlayCircle className="h-5 w-5 text-primary mr-3" />
                                                <span className="text-sm font-black tabular-nums">01:24:12 : Main Input Source</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-muted/20 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors">
                                                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Status</p>
                                                <p className="text-sm font-black text-emerald-500">OPTIMAL</p>
                                            </div>
                                            <div className="p-4 bg-muted/20 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors">
                                                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Latency</p>
                                                <p className="text-sm font-black">42ms</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Decorative shadow layer */}
                            <div className="absolute inset-x-0 bottom-0 -z-10 bg-primary/20 blur-[100px] h-32 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Feature Cards Section */}
                    <div className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-700">
                        <FeatureItem
                            icon={<Monitor className="h-7 w-7" />}
                            title="Fleet Management"
                            description="Monitor and control all your vMix hardware instances from a single glass-panel interface."
                        />
                        <FeatureItem
                            icon={<ClipboardList className="h-7 w-7 text-primary" />}
                            title="Automated Logging"
                            description="Historical playback logs are captured automatically with millisecond precision for every production event."
                        />
                        <FeatureItem
                            icon={<Shield className="h-7 w-7" />}
                            title="Enterprise Ready"
                            description="Secure access, detailed audit trails, and multi-user permissions tailored for mission-critical media workflows."
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-16 border-t mt-20 relative overflow-hidden bg-muted/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col gap-3 text-center sm:text-left">
                        <img src="/Hill-Com.png" alt="Hill-Com Logo" className="h-20 w-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 italic font-mono">Precision Broadcasting Architecture</p>
                        <p className="text-xs font-black uppercase tracking-tighter text-muted-foreground/40 mt-2">© 2026 Hill-Com Ltd. Kampala, Uganda.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                        <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors">Dashboard</Link>
                        <Link href="/login" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors">Unit Auth</Link>
                        <Link href="https://hillcom.ug" target="_blank" className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity font-bold">Official Site</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="bg-card/30 border-primary/5 hover:border-primary/20 hover:bg-card/50 transition-all duration-500 group hover:translate-y-[-8px] shadow-sm relative overflow-hidden">
            <CardContent className="p-10 space-y-6">
                <div className="p-3.5 bg-muted/50 rounded-2xl w-fit group-hover:scale-110 group-hover:bg-primary group-hover:!text-primary-foreground transition-all duration-500 shadow-sm border border-border/20">
                    {icon}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter leading-none">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-semibold transition-colors group-hover:text-foreground/80">{description}</p>
            </CardContent>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
        </Card>
    );
}
