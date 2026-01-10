import { useState, useEffect, useRef } from "react";
import { Timer as TimerIcon, Play, Pause, RotateCcw } from "lucide-react";

const PRESETS = [
    { label: "Ramen", Icon: "🍜", seconds: 240 },
    { label: "Focus", Icon: "🧠", seconds: 600 },
    { label: "Deep Work", Icon: "💻", seconds: 1800 },
];

export function Timers() {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning, timeLeft]);

    const startTimer = (secs: number) => {
        setTimeLeft(secs);
        setIsRunning(true);
    };

    const formatLeft = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 h-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <TimerIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Quick Timers</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
                {PRESETS.map((p) => (
                    <button
                        key={p.label}
                        onClick={() => startTimer(p.seconds)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{p.Icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.label}</span>
                    </button>
                ))}
            </div>

            <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-5xl font-mono font-bold mb-4 text-white">
                    {formatLeft(timeLeft)}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white"
                    >
                        {isRunning ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
                    </button>
                    <button
                        onClick={() => { setTimeLeft(0); setIsRunning(false); }}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
