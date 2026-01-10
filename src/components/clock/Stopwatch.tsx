import { useState, useEffect, useRef } from "react";
import { Timer as RaceIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stopwatch() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime((prev) => prev + 10);
            }, 10);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning]);

    const formatStopwatch = (t: number) => {
        const mins = Math.floor(t / 60000);
        const secs = Math.floor((t % 60000) / 1000);
        const ms = Math.floor((t % 1000) / 10);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <RaceIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold">Stopwatch</h3>
                </div>
                <button
                    onClick={() => { setTime(0); setIsRunning(false); setLaps([]); }}
                    className="text-xs text-muted-foreground hover:text-white transition-colors"
                >
                    Reset
                </button>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="text-6xl font-mono font-bold tracking-tight mb-8 text-white">
                    {formatStopwatch(time)}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={cn(
                            "px-8 py-3 rounded-full font-bold transition-all shadow-lg",
                            isRunning ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-primary text-white shadow-primary/20"
                        )}
                    >
                        {isRunning ? "Stop" : "Start"}
                    </button>
                    <button
                        disabled={!isRunning}
                        onClick={() => setLaps([time, ...laps])}
                        className="px-8 py-3 rounded-full bg-white/10 text-white font-bold border border-white/10 disabled:opacity-50"
                    >
                        Lap
                    </button>
                </div>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {laps.map((l, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                        <span className="text-muted-foreground font-mono">Lap {laps.length - i}</span>
                        <span className="font-mono font-bold text-white/80">{formatStopwatch(l)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
