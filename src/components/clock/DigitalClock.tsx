import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock as ClockIcon, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const TIMEZONE_GROUPS = [
    // ... (rest of the file is large, I'll be careful with the replacement)
    {
        label: "India",
        items: [
            { name: "India Standard Time (IST) (UTC+5:30)", zone: "Asia/Kolkata" },
        ]
    },
    {
        label: "North America",
        items: [
            { name: "Eastern Time (EST) (UTC-5:00)", zone: "America/New_York" },
            { name: "Central Time (CST) (UTC-6:00)", zone: "America/Chicago" },
            { name: "Mountain Time (MST) (UTC-7:00)", zone: "America/Denver" },
            { name: "Pacific Time (PST) (UTC-8:00)", zone: "America/Los_Angeles" },
            { name: "Alaska Time (AKST) (UTC-9:00)", zone: "America/Anchorage" },
            { name: "Hawaii Time (HST) (UTC-10:00)", zone: "Pacific/Honolulu" },
        ]
    },
    {
        label: "Europe & Africa",
        items: [
            { name: "Greenwich Mean Time (GMT) (UTC+0:00)", zone: "UTC" },
            { name: "London (BST/GMT) (UTC+0:00)", zone: "Europe/London" },
            { name: "Central European Time (CET) (UTC+1:00)", zone: "Europe/Paris" },
            { name: "Eastern European Time (EET) (UTC+2:00)", zone: "Europe/Athens" },
            { name: "Western European Time (WEST) (UTC+1:00)", zone: "Europe/Lisbon" },
            { name: "Central Africa Time (CAT) (UTC+2:00)", zone: "Africa/Maputo" },
            { name: "East Africa Time (EAT) (UTC+3:00)", zone: "Africa/Nairobi" },
        ]
    },
    {
        label: "Asia",
        items: [
            { name: "Moscow Time (MSK) (UTC+3:00)", zone: "Europe/Moscow" },
            { name: "China Standard Time (CST) (UTC+8:00)", zone: "Asia/Shanghai" },
            { name: "Singapore Time (SGT) (UTC+8:00)", zone: "Asia/Singapore" },
            { name: "Japan Standard Time (JST) (UTC+9:00)", zone: "Asia/Tokyo" },
            { name: "Korea Standard Time (KST) (UTC+9:00)", zone: "Asia/Seoul" },
            { name: "Indonesia Central Time (WITA) (UTC+8:00)", zone: "Asia/Makassar" },
        ]
    },
    {
        label: "Australia & Pacific",
        items: [
            { name: "Australian Western (AWST) (UTC+8:00)", zone: "Australia/Perth" },
            { name: "Australian Central (ACST) (UTC+9:30)", zone: "Australia/Adelaide" },
            { name: "Australian Eastern (AEST) (UTC+10:00)", zone: "Australia/Sydney" },
            { name: "New Zealand Standard (NZST) (UTC+12:00)", zone: "Pacific/Auckland" },
            { name: "Fiji Time (FJT) (UTC+12:00)", zone: "Pacific/Fiji" },
        ]
    },
    {
        label: "South America",
        items: [
            { name: "Argentina Time (ART) (UTC-3:00)", zone: "America/Argentina/Buenos_Aires" },
            { name: "Bolivia Time (BOT) (UTC-4:00)", zone: "America/La_Paz" },
            { name: "Brasilia Time (BRT) (UTC-3:00)", zone: "America/Sao_Paulo" },
            { name: "Chile Standard Time (CLT) (UTC-4:00)", zone: "America/Santiago" },
        ]
    }
];

const ALL_TIMEZONES = TIMEZONE_GROUPS.flatMap(g => g.items);

export function DigitalClock() {
    const [time, setTime] = useState(new Date());
    const [offset, setOffset] = useState(0);
    const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "error">("syncing");
    const [selectedZone, setSelectedZone] = useState(ALL_TIMEZONES[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const syncTime = async () => {
        setSyncStatus("syncing");
        try {
            const start = Date.now();
            const res = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC");
            if (!res.ok) throw new Error("API response error");
            const data = await res.json();
            const end = Date.now();

            const apiTimeMs = new Date(data.datetime).getTime();
            const latency = (end - start) / 2;
            const correctedApiTime = apiTimeMs + latency;

            setOffset(correctedApiTime - end);
            setSyncStatus("synced");
        } catch (error) {
            console.error("Time sync failed:", error);
            setSyncStatus("error");
        }
    };

    useEffect(() => {
        syncTime();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date(Date.now() + offset));
        }, 1000);
        return () => clearInterval(timer);
    }, [offset]);

    const formatTime = (date: Date, zone: string) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: zone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }).format(date);
    };

    const formatDate = (date: Date, zone: string) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: zone,
            dateStyle: "full",
        }).format(date);
    };

    const formatOffset = (ms: number) => {
        if (Math.abs(ms) < 100) return "In sync with system";
        const seconds = (ms / 1000).toFixed(1);
        const isAhead = ms > 0;
        return `Your system is ${Math.abs(Number(seconds))}s ${isAhead ? "behind" : "ahead"}`;
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "p-8 relative overflow-hidden transition-all duration-500",
                isFullscreen
                    ? "fixed inset-0 z-9999 bg-black flex flex-col items-center justify-center p-20"
                    : "rounded-3xl bg-white/[0.02] border border-white/10 h-full"
            )}
        >
            <div className={cn(
                "flex items-center justify-between mb-8 transition-all duration-500",
                isFullscreen ? "w-full max-w-5xl" : "w-full"
            )}>
                <motion.div layout className="flex items-center gap-3">
                    {!isFullscreen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400"
                        >
                            <ClockIcon className="w-5 h-5" />
                        </motion.div>
                    )}
                    <motion.div layout>
                        <div className="flex items-center gap-2">
                            {!isFullscreen && <h3 className="font-bold">Digital Clock</h3>}
                            {!isFullscreen && (
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                        syncStatus === "synced" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            syncStatus === "syncing" ? "bg-white/5 text-white/40 animate-pulse" :
                                                "bg-red-500/10 text-red-400 border border-red-500/20"
                                    )}>
                                        {syncStatus === "synced" ? "Accurate" : syncStatus === "syncing" ? "Syncing" : "System Time"}
                                    </div>
                                    <button
                                        onClick={() => syncTime()}
                                        disabled={syncStatus === "syncing"}
                                        className={cn(
                                            "p-1.5 rounded-md hover:bg-white/10 text-white/20 hover:text-white transition-all text-xs cursor-pointer",
                                            syncStatus === "syncing" && "animate-spin cursor-not-allowed"
                                        )}
                                        title="Re-sync with network"
                                    >
                                        <RefreshCw size={12} />
                                    </button>
                                    {syncStatus === "synced" && (
                                        <span className="text-[12px] text-white/30 font-medium whitespace-nowrap">
                                            {formatOffset(offset)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <motion.p
                            layout
                            className={cn(
                                "text-muted-foreground transition-all duration-500",
                                isFullscreen ? "text-2xl md:text-3xl font-medium text-white/60 mt-1" : "text-xs"
                            )}
                        >
                            {selectedZone.name}
                        </motion.p>
                    </motion.div>
                </motion.div>

                {!isFullscreen ? (
                    <div className="flex items-center gap-2">
                        <Select
                            value={selectedZone.zone}
                            onValueChange={(value) => setSelectedZone(ALL_TIMEZONES.find(z => z.zone === value) || ALL_TIMEZONES[0])}
                        >
                            <SelectTrigger className="w-[280px] bg-white/5 border-white/10 text-xs text-white">
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="bg-neutral-900 border-white/10 text-white max-h-[400px]">
                                {TIMEZONE_GROUPS.map((group) => (
                                    <SelectGroup key={group.label}>
                                        <SelectLabel className="text-white/40 text-[10px] uppercase tracking-wider">{group.label}</SelectLabel>
                                        {group.items.map((z) => (
                                            <SelectItem
                                                key={z.zone}
                                                value={z.zone}
                                                className="text-xs hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer"
                                            >
                                                {z.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all ml-1 shadow-lg"
                            title="Enter Fullscreen"
                        >
                            <Maximize2 size={18} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={toggleFullscreen}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all shadow-2xl"
                        title="Exit Fullscreen"
                    >
                        <Minimize2 size={24} />
                    </button>
                )}
            </div>

            <motion.div
                layout
                className={cn(
                    "flex flex-col items-center justify-center transition-all duration-700 ease-in-out",
                    isFullscreen ? "flex-1 py-0 w-full" : "py-10"
                )}
            >
                <motion.div
                    layout
                    key={selectedZone.zone + time.getSeconds()}
                    initial={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                        "font-mono font-bold tracking-tighter text-blue-400 drop-shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center justify-center gap-4",
                        isFullscreen ? "text-[15vw] leading-[0.8]" : "text-6xl md:text-7xl"
                    )}
                >
                    <span className="tabular-nums">
                        {formatTime(time, selectedZone.zone).split(' ')[0]}
                    </span>
                    <span className={cn(
                        "opacity-50 font-sans tracking-normal",
                        isFullscreen ? "text-[6vw] md:text-[8vw] md:-mt-4" : "text-2xl md:text-3xl"
                    )}>
                        {formatTime(time, selectedZone.zone).split(' ')[1]}
                    </span>
                </motion.div>

                <motion.div
                    layout
                    className={cn(
                        "text-muted-foreground font-medium transition-all duration-700 ease-in-out",
                        isFullscreen ? "text-4xl md:text-5xl mt-20 text-white/30 tracking-widest uppercase" : "mt-4"
                    )}
                >
                    {formatDate(time, selectedZone.zone)}
                </motion.div>
            </motion.div>
        </div>
    );
}
