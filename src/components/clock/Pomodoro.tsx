import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Settings2, Volume2, VolumeX, X, Maximize2, Minimize2, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

type SessionType = "work" | "shortBreak" | "longBreak";

interface PomodoroSettings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    soundEnabled: boolean;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
};

export function Pomodoro() {
    const [settings, setSettings] = useState<PomodoroSettings>(() => {
        const saved = localStorage.getItem("pomodoro-settings");
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });

    const [sessionType, setSessionType] = useState<SessionType>("work");
    const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [totalFocusTime, setTotalFocusTime] = useState(() => {
        const saved = localStorage.getItem("pomodoro-total-focus");
        return saved ? parseInt(saved) : 0;
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        localStorage.setItem("pomodoro-settings", JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem("pomodoro-total-focus", totalFocusTime.toString());
    }, [totalFocusTime]);

    const getDuration = useCallback((type: SessionType) => {
        switch (type) {
            case "work": return settings.workDuration * 60;
            case "shortBreak": return settings.shortBreakDuration * 60;
            case "longBreak": return settings.longBreakDuration * 60;
        }
    }, [settings]);

    const playChime = useCallback(() => {
        if (!settings.soundEnabled) return;
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            if (ctx?.state === 'suspended') ctx.resume();

            if (ctx) {
                // Ethereal chord for glassmorphism vibe
                const notes = sessionType === 'work' ? [261.63, 329.63, 392.00, 523.25] : [392.00, 329.63, 261.63];
                const now = ctx.currentTime;
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.05, now + 0.1 + (i * 0.1)); // Quieter, softer
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + (i * 0.1));
                    osc.stop(now + 3.1);
                });
            }
        } catch (e) {
            console.error(e);
        }
    }, [settings.soundEnabled, sessionType]);

    const handleComplete = useCallback(() => {
        playChime();
        setIsRunning(false);
        if (sessionType === "work") {
            const newCompleted = completedSessions + 1;
            setCompletedSessions(newCompleted);
            setTotalFocusTime(prev => prev + settings.workDuration);
            const isLongBreak = newCompleted % settings.sessionsBeforeLongBreak === 0;
            const nextType = isLongBreak ? "longBreak" : "shortBreak";
            setSessionType(nextType);
            setTimeLeft(getDuration(nextType));
            if (settings.autoStartBreaks) setIsRunning(true);
        } else {
            setSessionType("work");
            setTimeLeft(getDuration("work"));
            if (settings.autoStartWork) setIsRunning(true);
        }
    }, [sessionType, completedSessions, settings, getDuration, playChime]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0 && isRunning) {
            handleComplete();
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning, timeLeft, handleComplete]);

    const toggleTimer = () => {
        if (!audioContextRef.current && settings.soundEnabled) {
            try { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) { }
        }
        setIsRunning(!isRunning);
    };

    const resetSession = () => {
        setIsRunning(false);
        setTimeLeft(getDuration(sessionType));
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const formatHours = (m: number) => {
        const hrs = Math.floor(m / 60);
        const mins = m % 60;
        return hrs > 0 ? `${hrs}H ${mins}M` : `${mins}M`;
    };





    return (
        <motion.div
            layout
            ref={containerRef}
            className={cn(
                "relative flex flex-col overflow-hidden transition-all duration-700 font-sans",
                isMaximized ? "fixed inset-0 z-50 h-screen w-screen rounded-none" : "h-full rounded-[2rem]",
                "bg-[#09090b] text-white"
            )}
        >
            {/* Ambient Background Gradient Blobs */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        filter: ["hue-rotate(0deg)", "hue-rotate(30deg)", "hue-rotate(0deg)"]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-blue-600/20 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -90, 0],
                        filter: ["hue-rotate(0deg)", "hue-rotate(-30deg)", "hue-rotate(0deg)"]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -left-[20%] w-[80%] h-[80%] rounded-full bg-sky-600/20 blur-[120px]"
                />
            </div>

            {/* Glass Overlay/Container */}
            <div className="absolute inset-0 z-0 backdrop-blur-[100px] bg-black/10" />

            {/* Content z-index wrapper */}
            <div className="relative z-10 flex flex-col h-full">

                {/* Header */}
                <div className="flex items-center justify-between p-8 z-20 relative">
                    <div className="flex items-center gap-6">
                        <span className="text-xl font-bold tracking-wider text-white/80 uppercase hidden md:inline-block">
                            Utils / Pomodoro
                        </span>

                        {/* Session Toggles - Innovative Glass Chips */}
                        <div className="flex items-center p-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                            {(['work', 'shortBreak', 'longBreak'] as SessionType[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setSessionType(t);
                                        setTimeLeft(getDuration(t));
                                        setIsRunning(false);
                                    }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500",
                                        sessionType === t
                                            ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105"
                                            : "text-white/40 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {t === 'work' ? 'Pomodoro' : t === 'shortBreak' ? 'Short' : 'Long'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={toggleFullscreen} className="p-3 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all hidden md:flex"><Expand size={20} /></button>
                        <button onClick={toggleMaximize} className="p-3 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all">
                            {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <div className="w-px h-6 bg-white/10 mx-2" />
                        <button onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))} className={cn("p-3 rounded-xl hover:bg-white/10 transition-all", settings.soundEnabled ? "text-white" : "text-white/30")}>
                            {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                        <button onClick={() => setShowSettings(!showSettings)} className={cn("p-3 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all", showSettings && "bg-white/10 text-white")}>
                            {showSettings ? <X size={20} /> : <Settings2 size={20} />}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                        {!showSettings ? (
                            <motion.div
                                key="timer"
                                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center justify-center w-full"
                            >
                                {/* THE TIMER TEXT - BOLD & TALL */}
                                <div className="relative group cursor-pointer select-none" onClick={toggleTimer}>
                                    <motion.h1
                                        key={timeLeft}
                                        className={cn(
                                            "font-bold leading-none text-white text-center tabular-nums tracking-tighter drop-shadow-2xl transition-all duration-300",
                                            isMaximized ? "text-[min(25vw,30vh)]" : "text-[8rem] sm:text-[10rem] md:text-[12rem] lg:text-[14rem]"
                                        )}
                                        initial={{ y: 20 }}
                                        animate={{ y: 0 }}
                                    >
                                        {formatTime(timeLeft)}
                                    </motion.h1>

                                    <motion.p
                                        className="text-center font-bold text-2xl md:text-4xl text-white/30 tracking-[0.2em] uppercase mt-[-10px] md:mt-[-20px]"
                                        animate={{ opacity: isRunning ? [0.3, 0.6, 0.3] : 0.3 }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        {isRunning ? "Running" : "Paused"}
                                    </motion.p>
                                </div>

                                {/* Minimal Controls */}
                                <div className={cn("flex items-center gap-12", isMaximized ? "mt-8" : "mt-12 md:mt-16")}>
                                    <button onClick={resetSession} className="group p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all active:scale-90">
                                        <RotateCcw size={24} className="text-white/40 group-hover:text-white transition-colors" />
                                    </button>

                                    <button
                                        onClick={toggleTimer}
                                        className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                    >
                                        {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                    </button>

                                    <button onClick={handleComplete} className="group p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all active:scale-90">
                                        <SkipForward size={24} className="text-white/40 group-hover:text-white transition-colors" />
                                    </button>
                                </div>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                                transition={{ duration: 0.4 }}
                                className="w-full max-w-lg bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                            >
                                <h2 className="text-3xl font-bold tracking-wide text-white mb-8">Configurations</h2>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Durations (Minutes)</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { label: 'Work', key: 'workDuration', max: 60, min: 1 },
                                                { label: 'Short', key: 'shortBreakDuration', max: 30, min: 1 },
                                                { label: 'Long', key: 'longBreakDuration', max: 60, min: 5 }
                                            ].map(({ label, key, max, min }) => (
                                                <div key={key} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                                    <span className="block text-xs uppercase text-white/40 font-bold tracking-wider mb-2">{label}</span>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-2xl font-bold text-white">{settings[key as keyof PomodoroSettings]}</span>
                                                    </div>
                                                    <input
                                                        type="range" min={min} max={max}
                                                        value={settings[key as keyof PomodoroSettings] as number}
                                                        onChange={(e) => setSettings(s => ({ ...s, [key]: parseInt(e.target.value) }))}
                                                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Behavior</label>
                                        <div className="flex flex-col gap-2">
                                            {[
                                                { label: 'Auto-start Breaks', key: 'autoStartBreaks' },
                                                { label: 'Auto-start Work', key: 'autoStartWork' }
                                            ].map(({ label, key }) => (
                                                <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <span className="text-sm font-medium text-white/80">{label}</span>
                                                    <button
                                                        onClick={() => setSettings(s => ({ ...s, [key]: !s[key as keyof PomodoroSettings] }))}
                                                        className={cn("w-12 h-6 rounded-full transition-colors relative", settings[key as keyof PomodoroSettings] ? "bg-white" : "bg-white/10")}
                                                    >
                                                        <motion.div
                                                            animate={{ x: settings[key as keyof PomodoroSettings] ? 24 : 0 }}
                                                            className={cn("absolute top-1 left-1 w-4 h-4 rounded-full shadow-sm", settings[key as keyof PomodoroSettings] ? "bg-black" : "bg-white")}
                                                        />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="w-full mt-8 py-4 bg-white text-black font-bold text-xl rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Save Changes
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Stats - Minimal */}
                {!showSettings && (
                    <div className="p-6 flex items-center justify-center gap-12 pb-12">
                        <div className="text-center group">
                            <h4 className="text-4xl font-bold text-white group-hover:text-blue-400 transition-colors">{completedSessions}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Sessions</span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center group">
                            <h4 className="text-4xl font-bold text-white group-hover:text-sky-400 transition-colors">{formatHours(totalFocusTime)}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Total Focus</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
