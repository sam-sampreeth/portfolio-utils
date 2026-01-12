import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    RotateCcw,
    SkipForward,
    Settings2,
    Volume2,
    VolumeX,
    Brain,
    Coffee,
    Sunset,
    CheckCircle2,
    X
} from "lucide-react";
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

const SESSION_THEMES: Record<SessionType, {
    primary: string;
    secondary: string;
    accent: string;
    icon: any;
    label: string;
    gradient: string;
}> = {
    work: {
        primary: "text-rose-400",
        secondary: "bg-rose-500/10 border-rose-500/20",
        accent: "rose",
        icon: Brain,
        label: "Deep Focus",
        gradient: "from-rose-500/20 via-orange-500/10 to-transparent"
    },
    shortBreak: {
        primary: "text-emerald-400",
        secondary: "bg-emerald-500/10 border-emerald-500/20",
        accent: "emerald",
        icon: Coffee,
        label: "Short Refresh",
        gradient: "from-emerald-500/20 via-teal-500/10 to-transparent"
    },
    longBreak: {
        primary: "text-indigo-400",
        secondary: "bg-indigo-500/10 border-indigo-500/20",
        accent: "indigo",
        icon: Sunset,
        label: "Long Recharge",
        gradient: "from-indigo-500/20 via-purple-500/10 to-transparent"
    },
};

export function Pomodoro() {
    // --- State ---
    const [settings, setSettings] = useState<PomodoroSettings>(() => {
        const saved = localStorage.getItem("pomodoro-settings");
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const [sessionType, setSessionType] = useState<SessionType>("work");
    const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [totalFocusTime, setTotalFocusTime] = useState(() => {
        const saved = localStorage.getItem("pomodoro-total-focus");
        return saved ? parseInt(saved) : 0;
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // --- Effects ---
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

    // --- Sound Engine ---
    const playChime = useCallback(() => {
        if (!settings.soundEnabled) return;

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            // Play a gentle major chord
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            const now = ctx.currentTime;

            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1 - (i * 0.02), now + 0.05 + (i * 0.05));
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + (i * 0.05));
                osc.stop(now + 1.6);
            });
        } catch (e) {
            console.error("Audio play failed", e);
        }
    }, [settings.soundEnabled]);

    // --- Timer Logic ---
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
            timerRef.current = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            handleComplete();
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning, timeLeft, handleComplete]);

    // --- Actions ---
    const toggleTimer = () => {
        // Initialize audio on first user interaction
        if (!audioContextRef.current && settings.soundEnabled) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) { }
        }
        setIsRunning(!isRunning);
    };

    const resetSession = () => {
        setIsRunning(false);
        setTimeLeft(getDuration(sessionType));
    };

    const skipSession = () => {
        handleComplete();
    };

    const switchType = (type: SessionType) => {
        setIsRunning(false);
        setSessionType(type);
        setTimeLeft(getDuration(type));
    };

    // --- Render Helpers ---
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const formatHours = (m: number) => {
        const hrs = Math.floor(m / 60);
        const mins = m % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    const theme = SESSION_THEMES[sessionType];
    const progress = 1 - (timeLeft / getDuration(sessionType));
    const circumference = 2 * Math.PI * 120; // r=120

    return (
        <div className="relative h-full overflow-hidden rounded-3xl bg-neutral-950/50 border border-white/10 shadow-2xl backdrop-blur-xl group">
            {/* Ambient Background */}
            <motion.div
                className={cn("absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br opacity-20 blur-[100px] transition-colors duration-1000 pointer-events-none", theme.gradient)}
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10 flex flex-col h-full p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className={cn("p-2.5 rounded-xl transition-colors duration-500", theme.secondary)}>
                            <theme.icon className={cn("w-5 h-5 transition-colors duration-500", theme.primary)} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white tracking-tight">Pomodoro</h2>
                            <p className={cn("text-xs font-medium transition-colors duration-500", theme.primary)}>{theme.label}</p>
                        </div>
                    </motion.div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                            className="p-2.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                            <Settings2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                    <AnimatePresence mode="wait">
                        {!showSettings ? (
                            <motion.div
                                key="timer"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center"
                            >
                                {/* Progress Circle */}
                                <div className="relative mb-10 group cursor-pointer" onClick={toggleTimer}>
                                    {/* Glow Ring */}
                                    <div className={cn("absolute inset-0 rounded-full blur-2xl opacity-20 transition-colors duration-500", theme.primary.replace("text-", "bg-"))} />

                                    <svg className="w-72 h-72 transform -rotate-90 drop-shadow-2xl" viewBox="0 0 256 256">
                                        <circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                                        <motion.circle
                                            cx="128" cy="128" r="120"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            className={cn("transition-colors duration-500", theme.primary)}
                                            strokeDasharray={circumference}
                                            initial={{ strokeDashoffset: circumference }}
                                            animate={{ strokeDashoffset: circumference * (1 - progress) }}
                                            transition={{ duration: 1, ease: "linear" }}
                                        />
                                    </svg>

                                    {/* Timer Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.div
                                            key={timeLeft}
                                            className={cn("text-7xl font-mono font-bold tracking-tighter tabular-nums transition-colors duration-500 text-white drop-shadow-lg")}
                                        >
                                            {formatTime(timeLeft)}
                                        </motion.div>
                                        <div className="flex gap-2 mt-4">
                                            {/* Indicators for sessions before long break */}
                                            {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => {
                                                const isActive = i === (completedSessions % settings.sessionsBeforeLongBreak);
                                                const isPast = i < (completedSessions % settings.sessionsBeforeLongBreak);
                                                return (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "w-2 h-2 rounded-full transition-all duration-500",
                                                            isActive ? `w-6 ${theme.primary.replace("text-", "bg-")}` :
                                                                isPast ? "bg-white/30" : "bg-white/10"
                                                        )}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-6">
                                    <button onClick={resetSession} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-105 active:scale-95">
                                        <RotateCcw size={24} />
                                    </button>
                                    <button
                                        onClick={toggleTimer}
                                        className={cn(
                                            "p-6 rounded-full text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center",
                                            isRunning ? "bg-white/10 border border-white/20" : `bg-gradient-to-br ${theme.gradient.split(' ')[0].replace('/20', '')} to-neutral-800 border border-white/10`
                                        )}
                                    >
                                        {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                    </button>
                                    <button onClick={skipSession} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-105 active:scale-95">
                                        <SkipForward size={24} fill="currentColor" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-sm"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Timer Settings</h3>
                                    <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["work", "shortBreak", "longBreak"] as SessionType[]).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => switchType(type)}
                                                className={cn(
                                                    "py-2 px-2 rounded-xl text-xs font-bold transition-all border",
                                                    sessionType === type
                                                        ? `${SESSION_THEMES[type].secondary} ${SESSION_THEMES[type].primary} border-current`
                                                        : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"
                                                )}
                                            >
                                                {SESSION_THEMES[type].label.split(" ")[0]}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                        <label className="block">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-white/70">Focus Duration</span>
                                                <span className="font-mono text-white">{settings.workDuration}m</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="60"
                                                value={settings.workDuration}
                                                onChange={(e) => setSettings(s => ({ ...s, workDuration: parseInt(e.target.value) }))}
                                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500"
                                            />
                                        </label>
                                        <label className="block">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-white/70">Short Break</span>
                                                <span className="font-mono text-white">{settings.shortBreakDuration}m</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="30"
                                                value={settings.shortBreakDuration}
                                                onChange={(e) => setSettings(s => ({ ...s, shortBreakDuration: parseInt(e.target.value) }))}
                                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                                            />
                                        </label>
                                        <label className="block">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-white/70">Long Break</span>
                                                <span className="font-mono text-white">{settings.longBreakDuration}m</span>
                                            </div>
                                            <input
                                                type="range" min="5" max="60"
                                                value={settings.longBreakDuration}
                                                onChange={(e) => setSettings(s => ({ ...s, longBreakDuration: parseInt(e.target.value) }))}
                                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                                            />
                                        </label>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/80">Auto-start Breaks</span>
                                            <button
                                                onClick={() => setSettings(s => ({ ...s, autoStartBreaks: !s.autoStartBreaks }))}
                                                className={cn("w-12 h-6 rounded-full transition-colors relative", settings.autoStartBreaks ? "bg-blue-500" : "bg-white/10")}
                                            >
                                                <motion.div
                                                    className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                                    animate={{ x: settings.autoStartBreaks ? 24 : 0 }}
                                                />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/80">Auto-start Focus</span>
                                            <button
                                                onClick={() => setSettings(s => ({ ...s, autoStartWork: !s.autoStartWork }))}
                                                className={cn("w-12 h-6 rounded-full transition-colors relative", settings.autoStartWork ? "bg-blue-500" : "bg-white/10")}
                                            >
                                                <motion.div
                                                    className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                                    animate={{ x: settings.autoStartWork ? 24 : 0 }}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setCompletedSessions(0);
                                            setTotalFocusTime(0);
                                            setSessionType("work");
                                            setTimeLeft(settings.workDuration * 60);
                                            localStorage.removeItem("pomodoro-total-focus");
                                        }}
                                        className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                                    >
                                        Reset All Statistics
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Stats - Only show when timer is visible */}
                {!showSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group-hover:bg-white/[0.07] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div className="text-xs text-white/50 uppercase tracking-wider font-bold">Sessions</div>
                            </div>
                            <span className="text-xl font-bold text-white">{completedSessions}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group-hover:bg-white/[0.07] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <Brain size={18} />
                                </div>
                                <div className="text-xs text-white/50 uppercase tracking-wider font-bold">Focus Time</div>
                            </div>
                            <span className="text-xl font-bold text-white">{formatHours(totalFocusTime)}</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
