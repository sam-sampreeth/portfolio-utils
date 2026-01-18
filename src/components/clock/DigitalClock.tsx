import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock3 as ClockIcon, RefreshCw, Maximize2, Minimize2, Search, Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import * as ct from "countries-and-timezones";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface TimezoneInfo {
    zone: string;
    city: string;
    continent: string;
    country?: string;
    abbreviation?: string;
}

// Generate all zones dynamically (Copied from TimezoneConverter for consistency)
const ALL_ZONES_LIST: TimezoneInfo[] = Intl.supportedValuesOf('timeZone').map(zone => {
    const parts = zone.split('/');
    let continent = parts[0];
    let city = parts[parts.length - 1].replace(/_/g, ' ');

    if (parts.length === 1) continent = "Global";
    if (continent === "Etc") continent = "Universal";

    const zoneData = ct.getTimezone(zone);
    const countryData = zoneData?.countries?.[0] ? ct.getCountry(zoneData.countries[0]) : null;

    let abbreviation = "";
    try {
        abbreviation = new Intl.DateTimeFormat('en-US', {
            timeZoneName: 'short',
            timeZone: zone
        }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || "";
    } catch (e) { }

    return {
        zone,
        city,
        continent,
        country: countryData?.name,
        abbreviation
    };
});

const GROUPED_ZONES = ALL_ZONES_LIST.reduce((acc, tz) => {
    if (!acc[tz.continent]) acc[tz.continent] = [];
    acc[tz.continent].push(tz);
    return acc;
}, {} as Record<string, TimezoneInfo[]>);

function ZoneSelector({
    selectedZone,
    onSelect,
    className,
}: {
    selectedZone: string,
    onSelect: (zone: string) => void,
    className?: string,
}) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    const filteredGroups = useMemo(() => {
        if (!search) return GROUPED_ZONES;

        const filtered: Record<string, TimezoneInfo[]> = {};
        const searchLower = search.toLowerCase();
        ALL_ZONES_LIST.forEach(tz => {
            if (
                tz.city.toLowerCase().includes(searchLower) ||
                tz.zone.toLowerCase().includes(searchLower) ||
                tz.continent.toLowerCase().includes(searchLower) ||
                (tz.country && tz.country.toLowerCase().includes(searchLower)) ||
                (tz.abbreviation && tz.abbreviation.toLowerCase().includes(searchLower))
            ) {
                if (!filtered[tz.continent]) filtered[tz.continent] = [];
                filtered[tz.continent].push(tz);
            }
        });
        return filtered;
    }, [search]);

    const activeContinents = useMemo(() => {
        const sorted = Object.keys(filteredGroups).sort();
        const priority = ["Global", "Universal"];
        const others = sorted.filter(c => !priority.includes(c));
        const existingPriority = priority.filter(c => sorted.includes(c));
        return [...existingPriority, ...others];
    }, [filteredGroups]);

    // Find current zone info for display
    const currentInfo = ALL_ZONES_LIST.find(z => z.zone === selectedZone) || { city: selectedZone, zone: selectedZone };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-10 rounded-xl bg-white/5 border-white/10 text-white text-xs hover:bg-white/10 transition-all flex items-center justify-between gap-3 min-w-[280px]",
                        className
                    )}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Globe size={14} className="text-blue-400 shrink-0" />
                        <span className="truncate">
                            {currentInfo.city}
                        </span>
                    </div>
                    <ChevronDown size={14} className="opacity-40 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-[#0A0A0A] border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden" align="start">
                <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <Input
                            placeholder="Search city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 pl-9 bg-black/40 border-white/10 text-xs rounded-lg focus-visible:ring-blue-500/50"
                            autoFocus
                        />
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="p-2 space-y-4">
                        {activeContinents.map(continent => (
                            <div key={continent} className="space-y-1">
                                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/30 sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-md z-10">
                                    {continent}
                                </div>
                                <div className="grid gap-0.5">
                                    {filteredGroups[continent].map(tz => (
                                        <button
                                            key={tz.zone}
                                            onClick={() => {
                                                onSelect(tz.zone);
                                                setOpen(false);
                                                setSearch("");
                                            }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group",
                                                selectedZone === tz.zone ? "bg-blue-600 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{tz.city}</span>
                                                    {tz.abbreviation && (
                                                        <span className="text-[9px] font-black bg-white/5 px-1.5 py-0.5 rounded text-white/40 group-hover:bg-blue-500/20 group-hover:text-blue-400">
                                                            {tz.abbreviation}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedZone === tz.zone && <Check size={12} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

export function DigitalClock() {
    const [time, setTime] = useState(new Date());
    const [offset, setOffset] = useState(0);
    const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "error">("syncing");
    // Default to local timezone instead of first item in list
    const [selectedZone, setSelectedZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get display name for current selection
    const currentZoneInfo = ALL_ZONES_LIST.find(z => z.zone === selectedZone) || { zone: selectedZone, city: selectedZone, name: selectedZone };
    // Helper accessors for compatibility with existing render code
    const displayZoneName = currentZoneInfo.zone;
    const displayCityName = (currentZoneInfo as any).city || displayZoneName;


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
                    ? "fixed inset-0 z-[9999] bg-gradient-to-br from-blue-900/40 via-black to-blue-900/40 flex flex-col items-center justify-center p-20"
                    : "rounded-3xl bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 border border-white/10 h-full shadow-2xl"
            )}
        >
            {/* Ambient Background Effects */}
            <>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen"
                />
            </>

            <div className={cn(
                "flex items-center justify-between mb-8 transition-all duration-500 relative z-10",
                isFullscreen ? "w-full max-w-5xl" : "w-full"
            )}>
                <motion.div layout className="flex items-center gap-3">
                    {!isFullscreen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
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
                            {displayCityName}
                        </motion.p>
                    </motion.div>
                </motion.div>

                {!isFullscreen ? (
                    <div className="flex items-center gap-2">
                        <ZoneSelector
                            selectedZone={selectedZone}
                            onSelect={setSelectedZone}
                            className="w-[280px]"
                        />

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
                    "flex flex-col items-center justify-center transition-all duration-700 ease-in-out relative z-10",
                    isFullscreen ? "flex-1 py-0 w-full" : "py-10"
                )}
            >
                <motion.div
                    layout
                    key={selectedZone + time.getSeconds()}
                    initial={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                        "font-mono font-bold tracking-tighter drop-shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center justify-center gap-4 bg-gradient-to-b from-blue-300 to-blue-600 bg-clip-text text-transparent",
                        isFullscreen ? "text-[15vw] leading-[0.8]" : "text-6xl md:text-8xl"
                    )}
                >
                    <span className="tabular-nums">
                        {formatTime(time, selectedZone).split(' ')[0]}
                    </span>
                    <span className={cn(
                        "opacity-50 font-sans tracking-normal text-blue-400",
                        isFullscreen ? "text-[6vw] md:text-[8vw] md:-mt-4" : "text-2xl md:text-4xl"
                    )}>
                        {formatTime(time, selectedZone).split(' ')[1]}
                    </span>
                </motion.div>

                <motion.div
                    layout
                    className={cn(
                        "text-muted-foreground font-medium transition-all duration-700 ease-in-out",
                        isFullscreen ? "text-4xl md:text-5xl mt-20 text-white/30 tracking-widest uppercase" : "mt-4"
                    )}
                >
                    {formatDate(time, selectedZone)}
                </motion.div>

            </motion.div>
        </div>
    );
}
