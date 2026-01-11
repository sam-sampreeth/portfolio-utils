import { useState, useEffect, useMemo } from "react";
import { Globe, Plus, Trash2, Search, Clock, Calendar as CalendarIcon, RotateCcw, ChevronDown, Check } from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as ct from "countries-and-timezones";

interface TimezoneInfo {
    zone: string;
    city: string;
    continent: string;
    country?: string;
    abbreviation?: string;
}

// Generate all zones dynamically
const ALL_ZONES_LIST: TimezoneInfo[] = Intl.supportedValuesOf('timeZone').map(zone => {
    const parts = zone.split('/');
    let continent = parts[0];
    let city = parts[parts.length - 1].replace(/_/g, ' ');

    // Improve grouping for technical categories or top-level zones
    if (parts.length === 1) continent = "Global";
    if (continent === "Etc") continent = "Universal";

    // Try to get country info
    const zoneData = ct.getTimezone(zone);
    const countryData = zoneData?.countries?.[0] ? ct.getCountry(zoneData.countries[0]) : null;

    // Get abbreviation (IST, GMT, PST, etc.)
    let abbreviation = "";
    try {
        abbreviation = new Intl.DateTimeFormat('en-US', {
            timeZoneName: 'short',
            timeZone: zone
        }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || "";
    } catch (e) {
        // Fallback for technical zones
    }

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
    placeholder = "Select zone...",
    className,
    icon: Icon = Globe
}: {
    selectedZone?: string,
    onSelect: (zone: string) => void,
    placeholder?: string,
    className?: string,
    icon?: any
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

    const getUTCOffset = (zone: string) => {
        if (zone.startsWith('OFFSET:')) {
            const mins = parseInt(zone.split(':')[1]);
            const h = Math.floor(Math.abs(mins) / 60);
            const m = Math.abs(mins) % 60;
            return `UTC ${mins >= 0 ? '+' : '-'}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }
        try {
            return `UTC ${formatInTimeZone(new Date(), zone, "xxx")}`;
        } catch {
            return "UTC +00:00";
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-14 rounded-2xl bg-black/40 border-white/10 text-white font-bold px-6 hover:bg-white/10 transition-all flex items-center justify-between gap-3 min-w-[200px]",
                        className
                    )}
                >
                    <div className="flex items-center gap-3 truncate">
                        <Icon size={18} className="text-blue-400 shrink-0" />
                        <div className="flex flex-col items-start truncate leading-tight">
                            <span className="truncate">
                                {selectedZone ?
                                    (selectedZone.startsWith('OFFSET:') ?
                                        getUTCOffset(selectedZone) :
                                        selectedZone.split('/').pop()?.replace(/_/g, ' '))
                                    : placeholder}
                            </span>
                            {selectedZone && !selectedZone.startsWith('OFFSET:') && (
                                <span className="text-[9px] opacity-40 font-black tracking-widest uppercase">
                                    {getUTCOffset(selectedZone)}
                                </span>
                            )}
                        </div>
                    </div>
                    <ChevronDown size={16} className="opacity-40 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#0A0A0A] border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden" align="start">
                <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <Input
                            placeholder="Search city, offset, or country..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 pl-9 bg-black/40 border-white/10 text-sm rounded-xl focus-visible:ring-blue-500/50"
                            autoFocus
                        />
                    </div>
                </div>
                <ScrollArea className="h-[400px]">
                    <div className="p-2 space-y-4">
                        {activeContinents.map(continent => (
                            <div key={continent} className="space-y-1">
                                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/30 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md z-10">
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
                                                "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group",
                                                selectedZone === tz.zone ? "bg-blue-600 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{tz.city}</span>
                                                    {tz.abbreviation && !tz.zone.startsWith('OFFSET:') && (
                                                        <span className="text-[9px] font-black bg-white/5 px-1.5 py-0.5 rounded text-white/40 group-hover:bg-blue-500/20 group-hover:text-blue-400">
                                                            {tz.abbreviation}
                                                        </span>
                                                    )}
                                                </div>
                                                {!tz.zone.startsWith('OFFSET:') && (
                                                    <span className={cn("text-[10px] opacity-40 uppercase font-black tracking-widest", selectedZone === tz.zone ? "text-white/80" : "")}>
                                                        {getUTCOffset(tz.zone)}
                                                    </span>
                                                )}
                                            </div>
                                            {selectedZone === tz.zone && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {activeContinents.length === 0 && (
                            <div className="py-12 text-center text-xs text-white/20 font-bold uppercase tracking-widest">
                                No timezones found
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

// Utility to handle both IANA and OFFSET strings
const getTimeInZone = (date: Date, zone: string) => {
    if (zone.startsWith('OFFSET:')) {
        const offsetMins = parseInt(zone.split(':')[1]);
        // Get UTC time by subtracting local offset, then add target offset
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const target = new Date(utc + (offsetMins * 60000));
        return target;
    }
    // For IANA, use a dummy string conversion to get a relative date object
    // This is purely for consistent formatting usage
    const str = formatInTimeZone(date, zone, "yyyy-MM-dd HH:mm:ss");
    return new Date(str.replace(' ', 'T'));
};

const formatTimeInZone = (date: Date, zone: string, fmt: string) => {
    if (zone.startsWith('OFFSET:')) {
        return format(getTimeInZone(date, zone), fmt);
    }
    return formatInTimeZone(date, zone, fmt);
};

function DateTimePicker({ date, setDate, timeZone }: { date: Date, setDate: (d: Date) => void, timeZone: string }) {
    const [tempTime, setTempTime] = useState(formatTimeInZone(date, timeZone, "HH:mm"));

    useEffect(() => {
        setTempTime(formatTimeInZone(date, timeZone, "HH:mm"));
    }, [date, timeZone]);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempTime(e.target.value);
        const [hours, minutes] = e.target.value.split(":").map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
            if (timeZone.startsWith('OFFSET:')) {
                const offsetMins = parseInt(timeZone.split(':')[1]);
                const currentInZone = getTimeInZone(date, timeZone);
                currentInZone.setHours(hours);
                currentInZone.setMinutes(minutes);

                // Convert back from zone to real world UTC
                const utc = currentInZone.getTime() - (offsetMins * 60000);
                const realDate = new Date(utc);
                // Adjust for local system drift to keep the date object "real"
                setDate(new Date(realDate.getTime() - (new Date().getTimezoneOffset() * 60000)));
            } else {
                const dateStr = formatInTimeZone(date, timeZone, "yyyy-MM-dd");
                const newDate = toDate(`${dateStr}T${e.target.value}:00`, { timeZone });
                setDate(newDate);
            }
        }
    };

    const handleDateSelect = (d: Date | undefined) => {
        if (d) {
            if (timeZone.startsWith('OFFSET:')) {
                const currentInZone = getTimeInZone(date, timeZone);
                currentInZone.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                const offsetMins = parseInt(timeZone.split(':')[1]);
                const utc = currentInZone.getTime() - (offsetMins * 60000);
                const realDate = new Date(utc);
                setDate(new Date(realDate.getTime() - (new Date().getTimezoneOffset() * 60000)));
            } else {
                const timeStr = formatInTimeZone(date, timeZone, "HH:mm:ss");
                const dateStr = format(d, "yyyy-MM-dd");
                const newDate = toDate(`${dateStr}T${timeStr}`, { timeZone });
                setDate(newDate);
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "flex-1 justify-start text-left font-bold border-white/10 bg-black/40 hover:bg-white/10 text-white rounded-2xl h-14 px-6 transition-all",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-3 h-4 w-4 text-blue-400" />
                        {date ? formatTimeInZone(date, timeZone, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10 rounded-2xl shadow-2xl z-[100]" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="rounded-2xl shadow-2xl"
                    />
                </PopoverContent>
            </Popover>

            <div className="flex bg-black/40 border border-white/10 rounded-2xl h-14 p-1">
                <Input
                    type="time"
                    value={tempTime}
                    onChange={handleTimeChange}
                    className="border-none bg-transparent h-full px-4 text-white focus-visible:ring-0 text-lg font-mono w-40"
                />
            </div>

            <Button
                variant="outline"
                onClick={() => setDate(new Date())}
                className="h-14 w-14 rounded-2xl border-white/10 bg-black/40 hover:bg-white/10 hover:text-blue-400 transition-all p-0 flex items-center justify-center shrink-0"
                title="Reset to Now"
            >
                <RotateCcw size={20} />
            </Button>
        </div>
    );
}

export function TimezoneConverter() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isAutoSync, setIsAutoSync] = useState(true);
    const [baseZone, setBaseZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [selectedZones, setSelectedZones] = useState<string[]>(() => {
        const saved = localStorage.getItem("tz_selected_zones");
        return saved ? JSON.parse(saved) : ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];
    });

    // Update time every second if auto-sync is on
    useEffect(() => {
        if (!isAutoSync) return;
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [isAutoSync]);

    useEffect(() => {
        localStorage.setItem("tz_selected_zones", JSON.stringify(selectedZones));
    }, [selectedZones]);

    const getRelativeOffset = (targetZone: string) => {
        const now = new Date();
        const baseDate = getTimeInZone(now, baseZone);
        const targetDate = getTimeInZone(now, targetZone);

        const diffHours = (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
        const rounded = Math.round(diffHours * 2) / 2;
        return rounded > 0 ? `+${rounded}` : rounded.toString();
    };

    const addZone = (zone: string) => {
        if (!selectedZones.includes(zone)) {
            setSelectedZones([...selectedZones, zone]);
        }
    };

    const removeZone = (zone: string) => {
        setSelectedZones(selectedZones.filter(z => z !== zone));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Base Time Card */}
            <div className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 via-blue-900/10 to-transparent border border-blue-500/20 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Globe size={120} className="animate-spin-slow text-blue-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center flex-wrap gap-4">
                            <Tabs
                                value={isAutoSync ? "auto" : "manual"}
                                onValueChange={(v) => setIsAutoSync(v === "auto")}
                                className="w-fit"
                            >
                                <TabsList className="bg-black/40 border border-white/5 p-1 h-11 rounded-xl shadow-inner">
                                    <TabsTrigger value="auto" className="rounded-lg px-4 gap-2 font-bold data-[state=active]:bg-blue-600 transition-all">
                                        <Clock size={14} /> LIVE
                                    </TabsTrigger>
                                    <TabsTrigger value="manual" className="rounded-lg px-4 gap-2 font-bold data-[state=active]:bg-blue-600 transition-all">
                                        <CalendarIcon size={14} /> MANUAL
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <ZoneSelector
                                selectedZone={baseZone}
                                onSelect={setBaseZone}
                                className="h-11 rounded-xl shadow-sm"
                            />

                            {isAutoSync && (
                                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-emerald-400 uppercase animate-pulse decoration-emerald-500 underline underline-offset-4 decoration-2 px-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    SYNCED
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="text-7xl md:text-8xl font-black tracking-tighter text-white tabular-nums drop-shadow-2xl mb-1 py-1">
                                {formatTimeInZone(currentTime, baseZone, "hh:mm:ss a")}
                            </div>
                            <div className="flex items-center gap-3 text-white/40 font-bold uppercase tracking-widest text-xs">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 shadow-sm">
                                    <CalendarIcon size={12} className="text-blue-400" />
                                    {formatTimeInZone(currentTime, baseZone, "eee, MMM d, yyyy")}
                                </div>
                                <div className="font-mono text-blue-400/60 px-2.5 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20 uppercase">
                                    BASE: {baseZone}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 w-full max-w-md">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                                {isAutoSync ? "Current Time Control" : "Adjust Base Time"}
                            </Label>
                            {isAutoSync ? (
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white/40 text-sm font-medium flex items-center gap-3 shadow-inner">
                                    <Clock size={16} className="text-blue-500" />
                                    Syncing automatically with current time.
                                </div>
                            ) : (
                                <DateTimePicker date={currentTime} setDate={setCurrentTime} timeZone={baseZone} />
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                                Add Destination Zones
                            </Label>
                            <ZoneSelector
                                onSelect={addZone}
                                placeholder="Add result zone..."
                                icon={Plus}
                                className="w-full h-14"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Zones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                {selectedZones.map((zone) => {
                    const isOffset = zone.startsWith('OFFSET:');
                    let info, city;

                    if (isOffset) {
                        const mins = parseInt(zone.split(':')[1]);
                        const h = Math.floor(Math.abs(mins) / 60);
                        const m = Math.abs(mins) % 60;
                        city = `UTC ${mins >= 0 ? '+' : '-'}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                        info = { city, continent: 'Manual Offset', abbreviation: 'OFFSET' };
                    } else {
                        info = ALL_ZONES_LIST.find(t => t.zone === zone);
                        city = info?.city || zone.split('/').pop()?.replace(/_/g, ' ');
                    }

                    return (
                        <div
                            key={zone}
                            className="group relative p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all duration-500 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                                        {city}
                                    </h4>
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                        {isOffset ? 'Manual Offset' : `UTC ${formatInTimeZone(currentTime, zone, "xxx")}`}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-mono font-black text-white/90 tabular-nums">
                                        {formatTimeInZone(currentTime, zone, "hh:mm a")}
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-1">
                                        {info?.abbreviation && (
                                            <span className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest">
                                                {info.abbreviation}
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-white/40 border border-white/5">
                                            REL: {getRelativeOffset(zone)}H
                                        </span>
                                        <span className="text-[10px] font-bold text-blue-500/60 uppercase">
                                            {formatTimeInZone(currentTime, zone, "MMM d")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => removeZone(zone)}
                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white z-20 shadow-xl"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}

                {selectedZones.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
                            <Plus size={32} />
                        </div>
                        <p className="text-white/30 font-bold uppercase tracking-widest text-sm">Add zones to start comparing</p>
                    </div>
                )}
            </div>
        </div>
    );
}
