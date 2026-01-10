import { useState, useEffect, useRef } from "react";
import { Timer } from "lucide-react";

export function Stopwatch() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime((prev: number) => prev + 10);
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
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Timer className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white">Stopwatch</h3>
                </div>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="text-7xl font-mono font-bold tracking-tighter mb-10 text-blue-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.2)] select-none">
                    {formatStopwatch(time)}
                </div>

                <div className="flex flex-wrap justify-center gap-4 w-full max-w-md">
                    {/* Main Start/Pause/Resume Button */}
                    {!isRunning && time === 0 ? (
                        <button
                            onClick={() => setIsRunning(true)}
                            className="flex-1 min-w-[120px] px-8 py-4 rounded-2xl bg-blue-500 text-white font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer hover:scale-105 active:scale-95 transition-all text-center"
                        >
                            Start
                        </button>
                    ) : isRunning ? (
                        <button
                            onClick={() => setIsRunning(false)}
                            className="flex-1 min-w-[120px] px-8 py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-bold uppercase tracking-wider text-xs cursor-pointer hover:bg-white/20 active:scale-95 transition-all text-center"
                        >
                            Pause
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsRunning(true)}
                            className="flex-1 min-w-[120px] px-8 py-4 rounded-2xl bg-blue-500 text-white font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer hover:scale-105 active:scale-95 transition-all text-center"
                        >
                            Resume
                        </button>
                    )}

                    {/* Lap Button */}
                    <button
                        disabled={!isRunning}
                        onClick={() => setLaps([time, ...laps])}
                        className="flex-1 min-w-[120px] px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold uppercase tracking-wider text-xs cursor-pointer hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all text-center"
                    >
                        Lap
                    </button>

                    {/* Reset Button */}
                    <button
                        onClick={() => { setTime(0); setIsRunning(false); setLaps([]); }}
                        className="flex-1 min-w-[120px] px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase tracking-wider text-xs cursor-pointer hover:bg-red-500/20 active:scale-95 transition-all text-center"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="flex-grow max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {laps.map((l: number, i: number) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 text-sm group/lap">
                        <span className="text-white/40 font-mono font-bold text-xs">LAP {laps.length - i}</span>
                        <span className="font-mono font-bold text-white group-hover/lap:text-blue-400 transition-colors uppercase">{formatStopwatch(l)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
