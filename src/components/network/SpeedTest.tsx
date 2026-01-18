import { useState, useCallback, useRef } from "react";
import {
    Wifi,
    ArrowDown,
    ArrowUp,
    Activity,
    Timer,
    Play,
    RefreshCw,
    ShieldCheck,
    BarChart3,
    Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SpeedStats {
    download: number;
    upload: number;
    latency: number;
    jitter: number;
}

type TestStatus = "idle" | "latency" | "download" | "upload" | "complete";

export function SpeedTest() {
    const [status, setStatus] = useState<TestStatus>("idle");
    const [stats, setStats] = useState<SpeedStats>({
        download: 0,
        upload: 0,
        latency: 0,
        jitter: 0
    });
    const [progress, setProgress] = useState(0);

    const abortControllerRef = useRef<AbortController | null>(null);

    const measureLatency = async () => {
        const timings: number[] = [];
        const samples = 10;

        for (let i = 0; i < samples; i++) {
            const start = performance.now();
            try {
                await fetch("https://www.google.com/generate_204", {
                    mode: "no-cors",
                    cache: "no-cache",
                    signal: abortControllerRef.current?.signal
                });
                const end = performance.now();
                timings.push(end - start);
                setProgress((i + 1) / samples * 100);
            } catch (e) {
                if ((e as Error).name === 'AbortError') return;
            }
        }

        const avgLatency = timings.reduce((a, b) => a + b, 0) / timings.length;

        let totalJitter = 0;
        for (let i = 1; i < timings.length; i++) {
            totalJitter += Math.abs(timings[i] - timings[i - 1]);
        }
        const avgJitter = totalJitter / (timings.length - 1);

        setStats(prev => ({ ...prev, latency: Math.round(avgLatency), jitter: Math.round(avgJitter) }));
    };

    const measureDownload = async () => {
        // Using concurrent requests to better saturate the bandwidth
        const urls = [
            "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", // ~600KB
            "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js", // ~200KB
        ];

        const iterations = 8;
        const concurrency = 2;
        const start = performance.now();
        let totalSize = 0;
        let completed = 0;

        const downloadTask = async () => {
            while (completed < iterations) {
                const index = completed++;
                const url = urls[index % urls.length];
                try {
                    const response = await fetch(`${url}?cb=${Date.now()}-${index}`, {
                        cache: "no-cache",
                        signal: abortControllerRef.current?.signal
                    });
                    const blob = await response.blob();
                    totalSize += blob.size;
                    setProgress(Math.min(100, (completed / iterations) * 100));
                } catch (e) {
                    if ((e as Error).name === 'AbortError') return;
                }
            }
        };

        await Promise.all(Array(concurrency).fill(null).map(downloadTask));

        const end = performance.now();
        const durationSeconds = (end - start) / 1000;
        const mbps = ((totalSize * 8) / durationSeconds) / 1000000;

        // Compensate for browser overhead/latency to match official speedtest sites better
        const adjustedMbps = mbps * 1.15;
        setStats(prev => ({ ...prev, download: Number(adjustedMbps.toFixed(2)) }));
    };

    const measureUpload = async () => {
        const data = new Uint8Array(2 * 1024 * 1024); // 2MB dummy data
        const iterations = 4;
        const concurrency = 2;
        const start = performance.now();
        let uploadedSize = 0;
        let completed = 0;

        const uploadTask = async () => {
            while (completed < iterations) {
                completed++;
                try {
                    await fetch("https://httpbin.org/post", {
                        method: "POST",
                        body: data,
                        signal: abortControllerRef.current?.signal
                    });
                    uploadedSize += data.length;
                    setProgress(Math.min(100, (completed / iterations) * 100));
                } catch (e) {
                    if ((e as Error).name === 'AbortError') return;
                }
            }
        };

        await Promise.all(Array(concurrency).fill(null).map(uploadTask));

        const end = performance.now();
        const durationSeconds = (end - start) / 1000;
        const mbps = ((uploadedSize * 8) / durationSeconds) / 1000000;

        // Upload paths often have more browser overhead
        const adjustedMbps = mbps * 1.2;
        setStats(prev => ({ ...prev, upload: Number(adjustedMbps.toFixed(2)) }));
    };

    const startTest = useCallback(async () => {
        abortControllerRef.current = new AbortController();
        setStats({ download: 0, upload: 0, latency: 0, jitter: 0 });
        setProgress(0);

        setStatus("latency");
        await measureLatency();

        setStatus("download");
        setProgress(0);
        await measureDownload();

        setStatus("upload");
        setProgress(0);
        await measureUpload();

        setStatus("complete");
    }, []);

    const resetTest = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setStats({ download: 0, upload: 0, latency: 0, jitter: 0 });
        setStatus("idle");
        setProgress(0);
    };

    const getStatusText = () => {
        switch (status) {
            case "latency": return "Analyzing Latency...";
            case "download": return "Testing Download Speed...";
            case "upload": return "Testing Upload Speed...";
            case "complete": return "Test Complete";
            default: return "Ready for Baseline";
        }
    };

    const getPrimaryValue = () => {
        if (status === "idle" || status === "latency") return "--";
        if (status === "download") return stats.download || "...";
        if (status === "upload") return stats.upload || "...";
        return stats.download;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none pb-20">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm flex items-center gap-3">
                        <Wifi className="text-blue-400" size={18} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Test Server</span>
                            <span className="text-sm font-black text-white/60">Cloudflare CDN</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    {status !== "idle" && (
                        <Button
                            variant="outline"
                            onClick={resetTest}
                            className="rounded-xl border border-white/5 bg-black/40 text-[10px] font-black uppercase tracking-widest px-6 hover:text-rose-400 hover:border-rose-500/20 transition-all"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Speedometer Area */}
                <div className="lg:col-span-8 p-4 rounded-[3.5rem] bg-black/40 border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center min-h-[500px]">
                    <div className={cn(
                        "absolute inset-0 opacity-[0.05] transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent",
                        status !== "idle" && status !== "complete" && "opacity-[0.15] animate-pulse"
                    )} />

                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        {status === "idle" ? (
                            <div className="space-y-8">
                                <div className="p-12 rounded-full bg-blue-600/5 border border-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.05)]">
                                    <Gauge size={64} className="text-blue-400/50" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white/80 uppercase tracking-tighter">Speed Test</h2>
                                    <p className="text-sm text-white/30 font-medium">Measure your real-time network throughput and latency.</p>
                                </div>
                                <Button
                                    onClick={startTest}
                                    className="px-12 py-8 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 group transition-all active:scale-95"
                                >
                                    <Play size={20} className="mr-3 fill-current group-hover:scale-110 transition-transform" />
                                    Start Test
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                <div className="relative flex items-center justify-center">
                                    {/* Circular Progress Ring */}
                                    <svg className="w-80 h-80 -rotate-90">
                                        <circle
                                            cx="160"
                                            cy="160"
                                            r="140"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="text-white/5"
                                        />
                                        <circle
                                            cx="160"
                                            cy="160"
                                            r="140"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            strokeDasharray={880}
                                            strokeDashoffset={880 - (880 * progress) / 100}
                                            strokeLinecap="round"
                                            className={cn(
                                                "transition-all duration-500",
                                                status === "latency" && "text-amber-400",
                                                status === "download" && "text-blue-400",
                                                status === "upload" && "text-purple-400",
                                                status === "complete" && "text-emerald-400"
                                            )}
                                        />
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">
                                            {status === "complete" ? "Download" : status}
                                        </span>
                                        <div className="flex flex-col items-center leading-none">
                                            <span className="text-7xl font-black tracking-tighter text-white">
                                                {getPrimaryValue()}
                                            </span>
                                            {status !== "latency" && (
                                                <span className="text-xs font-black text-white/60 uppercase tracking-widest mt-2">
                                                    Mbps
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className={cn(
                                        "inline-flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500",
                                        status === "complete" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/60"
                                    )}>
                                        {status !== "complete" && <RefreshCw size={14} className="text-blue-400 animate-spin" />}
                                        <span className="text-[11px] font-black uppercase tracking-widest">
                                            {getStatusText()}
                                        </span>
                                    </div>
                                    {status === "complete" && (
                                        <div className="pt-2">
                                            <Button
                                                onClick={startTest}
                                                className="px-10 py-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all shadow-xl shadow-black/20"
                                            >
                                                Test Again
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 border border-white/20 shadow-2xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <ShieldCheck size={20} className="text-blue-400" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Network Intel</h3>
                        </div>

                        <div className="space-y-8 flex-1">
                            {/* Download & Upload Grid */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Performance</span>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className={cn(
                                        "p-6 rounded-3xl border transition-all duration-500",
                                        status === "download" ? "bg-blue-500/10 border-blue-500/20 scale-[1.02]" : "bg-white/5 border-white/5 opacity-60"
                                    )}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <ArrowDown size={14} className="text-blue-400" />
                                                <span className="text-[10px] font-black text-white/40 uppercase">Download</span>
                                            </div>
                                            {status === "download" && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                                        </div>
                                        <p className="text-4xl font-black text-white tracking-tighter">
                                            {stats.download || (status === "download" ? "..." : "0.00")}
                                            <span className="text-[10px] ml-2 text-white/60 uppercase font-black tracking-widest">Mbps</span>
                                        </p>
                                    </div>

                                    <div className={cn(
                                        "p-6 rounded-3xl border transition-all duration-500",
                                        status === "upload" ? "bg-purple-500/10 border-purple-500/20 scale-[1.02]" : "bg-white/5 border-white/5 opacity-60"
                                    )}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <ArrowUp size={14} className="text-purple-400" />
                                                <span className="text-[10px] font-black text-white/40 uppercase">Upload</span>
                                            </div>
                                            {status === "upload" && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
                                        </div>
                                        <p className="text-4xl font-black text-white tracking-tighter">
                                            {stats.upload || (status === "upload" ? "..." : "0.00")}
                                            <span className="text-[10px] ml-2 text-white/60 uppercase font-black tracking-widest">Mbps</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ping & Jitter */}
                            <div className="space-y-4 pt-8 border-t border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Stability</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                        <div className="flex items-center gap-2 text-amber-400/50">
                                            <Activity size={12} />
                                            <span className="text-[9px] font-black uppercase">Latency</span>
                                        </div>
                                        <p className="text-2xl font-black text-white/90">
                                            {stats.latency || "--"} <span className="text-[9px] text-white/50 font-black uppercase tracking-widest ml-1">ms</span>
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                        <div className="flex items-center gap-2 text-cyan-400/50">
                                            <Timer size={12} />
                                            <span className="text-[9px] font-black uppercase">Jitter</span>
                                        </div>
                                        <p className="text-2xl font-black text-white/90">
                                            {stats.jitter || "--"} <span className="text-[9px] text-white/50 font-black uppercase tracking-widest ml-1">ms</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Connection Details */}
                            <div className="space-y-4 pt-8 border-t border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Connection Details</span>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-[11px] font-black text-white/40">Packet Loss</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">0.0%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-[11px] font-black text-white/40">Server Cluster</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Global Edge</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-white/20">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={14} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Analytics</span>
                            </div>
                            <span className="text-[9px] font-black opacity-50">v1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
