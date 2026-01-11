import { useState, useMemo } from "react";
import {
    Calendar as CalendarIcon,
    Plus,
    Minus,
    ArrowRightLeft,
    CalendarRange,
    Clock,
    RotateCcw,
    Calculator,
    ArrowRight
} from "lucide-react";
import {
    add,
    sub,
    differenceInYears,
    differenceInMonths,
    differenceInDays,
    differenceInWeeks,
    differenceInHours,
    differenceInMinutes,
    format,
    isBefore,
    differenceInBusinessDays
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "arithmetic" | "difference";

export function DateCalculator() {
    const [mode, setMode] = useState<Mode>("arithmetic");
    const [startDate, setStartDate] = useState<Date>(new Date());

    // Arithmetic State
    const [operation, setOperation] = useState<"add" | "sub">("add");
    const [years, setYears] = useState(0);
    const [months, setMonths] = useState(0);
    const [weeks, setWeeks] = useState(0);
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);

    // Difference State
    const [endDate, setEndDate] = useState<Date>(add(new Date(), { days: 1 }));
    const [includeEndDate, setIncludeEndDate] = useState(false);

    // Calculations
    const arithmeticResult = useMemo(() => {
        const duration = {
            years, months, weeks, days, hours, minutes
        };
        return operation === "add" ? add(startDate, duration) : sub(startDate, duration);
    }, [startDate, operation, years, months, weeks, days, hours, minutes]);

    const differenceResult = useMemo(() => {
        let start = startDate;
        let end = endDate;
        if (isBefore(end, start)) [start, end] = [end, start];

        // If including end date, we conceptually add 1 day to the end for the duration calculation
        const effectiveEnd = includeEndDate ? add(end, { days: 1 }) : end;

        const totalDays = differenceInDays(effectiveEnd, start);
        const y = Math.floor(totalDays / 365);
        const m = Math.floor((totalDays % 365) / 30);
        const d = totalDays % 30;

        const totalWeeks = differenceInWeeks(effectiveEnd, start);
        const wDays = totalDays % 7;

        const businessDays = differenceInBusinessDays(effectiveEnd, start);

        return {
            years: differenceInYears(effectiveEnd, start),
            months: differenceInMonths(effectiveEnd, start),
            weeks: totalWeeks,
            remainingDays: wDays,
            days: totalDays,
            hours: differenceInHours(effectiveEnd, start),
            minutes: differenceInMinutes(effectiveEnd, start),
            businessDays,
            breakdown: `${y} years, ${m} months, ${d} days`
        };
    }, [startDate, endDate, includeEndDate]);

    const reset = () => {
        setStartDate(new Date());
        setEndDate(add(new Date(), { days: 1 }));
        setYears(0);
        setMonths(0);
        setWeeks(0);
        setDays(0);
        setHours(0);
        setMinutes(0);
        setOperation("add");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Mode Switch */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full md:w-fit">
                    <TabsList className="bg-black/40 border border-white/5 p-1 h-12 rounded-2xl shadow-inner w-full md:w-fit">
                        <TabsTrigger value="arithmetic" className="rounded-xl px-6 gap-2 font-bold data-[state=active]:bg-blue-600 transition-all flex-1 md:flex-none">
                            <Plus size={16} /> ADD / SUBTRACT
                        </TabsTrigger>
                        <TabsTrigger value="difference" className="rounded-xl px-6 gap-2 font-bold data-[state=active]:bg-blue-600 transition-all flex-1 md:flex-none">
                            <ArrowRightLeft size={16} /> DURATION
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button
                    variant="outline"
                    onClick={reset}
                    className="h-12 rounded-2xl border-white/10 bg-black/40 hover:bg-white/10 text-white font-bold gap-2 px-6"
                >
                    <RotateCcw size={16} /> RESET
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-11 gap-8">
                {/* Inputs Area */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 shadow-2xl space-y-8">
                        {/* Start Date Selection */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                                Start Date
                            </Label>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-14 rounded-2xl bg-black/40 border-white/10 text-white font-bold px-6 hover:bg-white/10 transition-all flex items-center justify-start gap-4 flex-1"
                                        >
                                            <CalendarIcon size={18} className="text-blue-400" />
                                            {format(startDate, "PPP")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10 rounded-2xl" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={(d) => d && setStartDate(d)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    variant="outline"
                                    onClick={() => setStartDate(new Date())}
                                    className="h-14 px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest transition-all"
                                >
                                    Today
                                </Button>
                            </div>
                        </div>

                        {mode === "arithmetic" ? (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* Operation Toggle */}
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                                        Operation
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setOperation("add")}
                                            className={cn(
                                                "h-14 rounded-2xl font-black gap-2 transition-all border-white/10",
                                                operation === "add" ? "bg-blue-600 text-white border-blue-500" : "bg-black/40 text-white/40 hover:bg-white/5"
                                            )}
                                        >
                                            <Plus size={18} /> ADD
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setOperation("sub")}
                                            className={cn(
                                                "h-14 rounded-2xl font-black gap-2 transition-all border-white/10",
                                                operation === "sub" ? "bg-blue-600 text-white border-blue-500" : "bg-black/40 text-white/40 hover:bg-white/5"
                                            )}
                                        >
                                            <Minus size={18} /> SUBTRACT
                                        </Button>
                                    </div>
                                </div>

                                {/* Intervals Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {[
                                        { label: "Years", value: years, setter: setYears },
                                        { label: "Months", value: months, setter: setMonths },
                                        { label: "Weeks", value: weeks, setter: setWeeks },
                                        { label: "Days", value: days, setter: setDays },
                                        { label: "Hours", value: hours, setter: setHours },
                                        { label: "Minutes", value: minutes, setter: setMinutes },
                                    ].map((item) => (
                                        <div key={item.label} className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">
                                                {item.label}
                                            </Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.value || ""}
                                                onChange={(e) => item.setter(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="h-14 rounded-2xl bg-black/40 border-white/10 text-white font-mono text-xl font-black focus-visible:ring-blue-500/50 text-center"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* End Date Selection */}
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                                        End Date
                                    </Label>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="h-14 rounded-2xl bg-black/40 border-white/10 text-white font-bold px-6 hover:bg-white/10 transition-all flex items-center justify-start gap-4 flex-1"
                                                >
                                                    <CalendarRange size={18} className="text-blue-400" />
                                                    {format(endDate, "PPP")}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10 rounded-2xl" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={(d) => d && setEndDate(d)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setEndDate(new Date())}
                                                className="h-14 px-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest transition-all"
                                            >
                                                Today
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIncludeEndDate(!includeEndDate)}
                                                className={cn(
                                                    "h-14 px-4 rounded-2xl border-white/10 font-bold uppercase text-[10px] tracking-widest transition-all",
                                                    includeEndDate ? "bg-blue-600 text-white border-blue-500" : "bg-white/5 text-white/40 hover:bg-white/10"
                                                )}
                                            >
                                                {includeEndDate ? "Including End Date" : "Excl. End Date"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-blue-300/60 text-xs font-bold leading-relaxed">
                                    <Clock size={14} className="inline mr-2 text-blue-400/50" />
                                    The calculation includes the difference in years, months, and days, as well as total broken down units like business days and weeks.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-800 border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 transform group-hover:rotate-0 transition-transform duration-700">
                            <Calculator size={140} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                                    Resulting Date
                                </h3>
                                <div className="space-y-1">
                                    <div className="text-4xl font-black text-white tracking-tighter">
                                        {format(mode === "arithmetic" ? arithmeticResult : endDate, "MMMM d")}
                                    </div>
                                    <div className="text-2xl font-black text-white/60 tracking-tight">
                                        {format(mode === "arithmetic" ? arithmeticResult : endDate, "yyyy")}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-blue-200/40 mt-2">
                                        {format(mode === "arithmetic" ? arithmeticResult : endDate, "EEEE")}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10 space-y-6">
                                {mode === "arithmetic" ? (
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                            Calculated Time
                                        </div>
                                        <div className="text-3xl font-mono font-black text-white tabular-nums">
                                            {format(arithmeticResult, "hh:mm a")}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">
                                                Duration Breakdown
                                            </div>
                                            <div className="text-xl font-bold text-white leading-snug">
                                                {differenceResult.breakdown}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Days</div>
                                                <div className="text-lg font-black text-white">{differenceResult.days}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Business Days</div>
                                                <div className="text-lg font-black text-white">{differenceResult.businessDays}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Weeks</div>
                                                <div className="text-lg font-black text-white">{differenceResult.weeks} w, {differenceResult.remainingDays} d</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Hours</div>
                                                <div className="text-lg font-black text-white">{differenceResult.hours.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                            Quick Summary
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-white/60">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                <ArrowRight size={14} />
                            </div>
                            <p className="leading-relaxed">
                                {mode === "arithmetic" ? (
                                    <>
                                        {operation === "add" ? "Adding" : "Subtracting"} {years}y {months}m {weeks}w {days}d to {format(startDate, "MMM d, yyyy")}.
                                    </>
                                ) : (
                                    <>
                                        Difference between {format(startDate, "MMM d")} and {format(endDate, "MMM d, yyyy")}.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
