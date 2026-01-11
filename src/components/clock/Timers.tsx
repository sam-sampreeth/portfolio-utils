import { useState, useEffect, useRef } from "react";
import { Timer as TimerIcon, Play, Pause, RotateCcw, Plus, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";

interface Preset {
    label: string;
    Icon: string;
    seconds: number;
}

const DEFAULT_PRESETS: Preset[] = [
    { label: "Ramen", Icon: "🍜", seconds: 240 },
    { label: "Focus", Icon: "🧠", seconds: 600 },
    { label: "Deep Work", Icon: "💻", seconds: 1800 },
];

function ScrollPicker({ max, value, onChange, label }: { max: number, value: number, onChange: (v: number) => void, label: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemHeight = 40;
    const items = Array.from({ length: max + 1 }, (_, i) => i);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = value * itemHeight;
        }
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const index = Math.round(e.currentTarget.scrollTop / itemHeight);
        if (index !== value && index >= 0 && index <= max) {
            onChange(index);
        }
    };

    return (
        <div className="flex flex-col items-center flex-1 min-w-[60px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">{label}</span>
            <div className="relative h-[120px] w-full overflow-hidden">
                {/* Overlay masks for gradient effect */}
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

                {/* Center Highlight */}
                <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 border-y border-white/10 bg-white/5 z-0" />

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth relative z-10"
                    style={{ scrollbarWidth: 'none' }}
                >
                    <div className="py-10"> {/* Padding to allow first and last items to center */}
                        {items.map((i) => (
                            <div
                                key={i}
                                className={`h-10 flex items-center justify-center snap-center text-xl font-mono transition-colors duration-200 ${value === i ? "text-blue-400 font-bold scale-110" : "text-white/20"
                                    }`}
                            >
                                {i.toString().padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Timers() {
    const [presets, setPresets] = useState<Preset[]>(() => {
        const saved = localStorage.getItem("timer_presets");
        return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
    });
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [overdueTime, setOverdueTime] = useState(0);
    const [isOverdue, setIsOverdue] = useState(false);

    // Custom Picker State
    const [selHours, setSelHours] = useState(0);
    const [selMinutes, setSelMinutes] = useState(0);
    const [selSeconds, setSelSeconds] = useState(0);
    const [customLabel, setCustomLabel] = useState("");
    const [customIcon, setCustomIcon] = useState("⏱️");

    const EMOJI_OPTIONS = ["⏱️", "🎯", "🍎", "☕", "🎮", "📚", "🏃", "🧘", "🍳", "🧹"];

    const timerRef = useRef<any>(null);
    const overdueRef = useRef<any>(null);

    const playTing = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio error:", e);
        }
    };

    const startOverdueCounter = () => {
        setIsOverdue(true);
        setOverdueTime(0);

        overdueRef.current = setInterval(() => {
            setOverdueTime(prev => prev + 1);
        }, 1000);

        const stopOverdue = () => {
            if (overdueRef.current) {
                clearInterval(overdueRef.current);
                overdueRef.current = null;
            }
            window.removeEventListener('focus', stopOverdue);
        };

        window.addEventListener('focus', stopOverdue);
    };

    const onTimerEnd = () => {
        playTing();
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b'],
            zIndex: 1000
        });

        const originalTitle = document.title;
        document.title = "🔔 Time's Up!";

        let timeoutId: any;
        const restoreTitle = () => {
            document.title = originalTitle;
            window.removeEventListener('focus', restoreTitle);
            clearTimeout(timeoutId);
        };

        window.addEventListener('focus', restoreTitle);
        timeoutId = setTimeout(restoreTitle, 5000);

        // Start overdue tracking if tab isn't active
        if (document.hidden) {
            startOverdueCounter();
        }
    };

    useEffect(() => {
        localStorage.setItem("timer_presets", JSON.stringify(presets));
    }, [presets]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            onTimerEnd();
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning, timeLeft]);

    const startTimer = (secs: number) => {
        setTimeLeft(secs);
        setIsRunning(true);
        setIsOverdue(false);
        setOverdueTime(0);
        if (overdueRef.current) clearInterval(overdueRef.current);
    };

    const getTotalSeconds = () => (selHours * 3600) + (selMinutes * 60) + selSeconds;

    const addCustomPreset = () => {
        const totalSecs = getTotalSeconds();
        if (totalSecs > 0) {
            const newPreset: Preset = {
                label: customLabel.trim() || "Custom",
                Icon: customIcon,
                seconds: totalSecs
            };
            setPresets([...presets, newPreset]);
            setCustomLabel("");
        }
    };

    const startCustom = () => {
        const totalSecs = getTotalSeconds();
        if (totalSecs > 0) {
            startTimer(totalSecs);
        }
    };

    const removePreset = (index: number) => {
        setPresets(presets.filter((_, i) => i !== index));
    };

    const formatTime = (s: number) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;

        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <TimerIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg">Countdown Timer</h3>
                </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {presets.map((p, idx) => (
                    <div key={`${p.label}-${idx}`} className="group relative">
                        <button
                            onClick={() => startTimer(p.seconds)}
                            className="w-full h-full flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-center"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{p.Icon}</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{p.label}</span>
                                <span className="text-sm font-mono font-bold text-white/80">{formatTime(p.seconds)}</span>
                            </div>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); removePreset(idx); }}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 hover:text-white z-10"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Scrollable Custom Timer Picker */}
            <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex flex-col lg:flex-row items-end gap-6">
                    <div className="flex-1 w-full lg:w-auto flex justify-center gap-4 bg-black/40 rounded-2xl p-4 border border-white/5">
                        <ScrollPicker label="Hours" max={23} value={selHours} onChange={setSelHours} />
                        <div className="pt-8 text-white/20 font-bold">:</div>
                        <ScrollPicker label="Mins" max={59} value={selMinutes} onChange={setSelMinutes} />
                        <div className="pt-8 text-white/20 font-bold">:</div>
                        <ScrollPicker label="Secs" max={59} value={selSeconds} onChange={setSelSeconds} />
                    </div>

                    <div className="flex flex-col gap-4 w-full lg:w-48">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Preset Details</p>
                                <input
                                    type="text"
                                    placeholder="Preset Name..."
                                    value={customLabel}
                                    onChange={(e) => setCustomLabel(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
                                {EMOJI_OPTIONS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => setCustomIcon(emoji)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${customIcon === emoji
                                                ? "bg-blue-500/20 border border-blue-500/50 scale-110"
                                                : "bg-white/5 border border-transparent hover:bg-white/10"
                                            }`}
                                    >
                                        <span className="text-base">{emoji}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={startCustom}
                                className="flex-1 h-12 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2 group font-bold text-sm"
                                title="Start Custom Timer"
                            >
                                <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                                Start
                            </button>
                            <button
                                onClick={addCustomPreset}
                                className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center group"
                                title="Save as Preset"
                            >
                                <Plus size={22} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Timer Display */}
            <div className={`relative flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-500 ${isRunning ? 'bg-blue-500/10 border-blue-500/30 shadow-2xl shadow-blue-500/5' : 'bg-black/40 border-white/5'}`}>
                {/* Overdue Counter */}
                {(isOverdue && overdueTime > 0) && (
                    <div className="absolute top-4 right-6 text-xs font-mono font-bold text-white/30 flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        +{formatTime(overdueTime)} overdue
                    </div>
                )}

                <div className={`text-6xl font-mono font-bold mb-6 tracking-tighter ${isRunning ? 'text-blue-400' : 'text-white/90'}`}>
                    {formatTime(timeLeft)}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${isRunning
                            ? 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600'
                            : 'bg-blue-500 text-white shadow-blue-500/20 hover:bg-blue-600'
                            }`}
                    >
                        {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="translate-x-0.5" />}
                    </button>
                    <button
                        onClick={() => { setTimeLeft(0); setIsRunning(false); }}
                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
