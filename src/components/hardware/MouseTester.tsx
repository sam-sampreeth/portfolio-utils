import { useState, useEffect, useCallback, useRef } from "react";
import {
    MousePointer2,
    RotateCcw,
    Zap,
    Info,
    CheckCircle2,
    Mouse,
    Crosshair,
    History as HistoryIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MouseState {
    left: boolean;
    right: boolean;
    middle: boolean;
    back: boolean;
    forward: boolean;
    scrollDelta: number;
    x: number;
    y: number;
    doubleClick: boolean;
}

interface ClickEvent {
    id: number;
    button: string;
    timestamp: number;
}

export function MouseTester() {
    const [mouseState, setMouseState] = useState<MouseState>({
        left: false,
        right: false,
        middle: false,
        back: false,
        forward: false,
        scrollDelta: 0,
        x: 0,
        y: 0,
        doubleClick: false
    });
    const [clickHistory, setClickHistory] = useState<ClickEvent[]>([]);
    const [scrollCount, setScrollCount] = useState(0);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
        // Prevent default browser behavior for all buttons in the test area
        // Especially buttons 3 (Back) and 4 (Forward)
        if (e.button === 3 || e.button === 4) {
            e.preventDefault();
        }

        const buttonMap: Record<number, keyof MouseState> = {
            0: "left",
            1: "middle",
            2: "right",
            3: "back",
            4: "forward"
        };
        const buttonKey = buttonMap[e.button];
        if (buttonKey) {
            setMouseState(prev => ({ ...prev, [buttonKey]: true }));
            setClickHistory(prev => [
                { id: Date.now() + Math.random(), button: buttonKey.toUpperCase(), timestamp: Date.now() },
                ...prev.slice(0, 9)
            ]);
        }
    }, []);

    const handleMouseUp = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (e.button === 3 || e.button === 4) {
            e.preventDefault();
        }

        const buttonMap: Record<number, keyof MouseState> = {
            0: "left",
            1: "middle",
            2: "right",
            3: "back",
            4: "forward"
        };
        const buttonKey = buttonMap[e.button];
        if (buttonKey) {
            setMouseState(prev => ({ ...prev, [buttonKey]: false }));
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
        setMouseState(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    }, []);

    useEffect(() => {
        const preventBack = (e: MouseEvent) => {
            if (e.button === 3 || e.button === 4) {
                e.preventDefault();
            }
        };

        window.addEventListener("mousedown", preventBack);
        window.addEventListener("mouseup", preventBack);

        return () => {
            window.removeEventListener("mousedown", preventBack);
            window.removeEventListener("mouseup", preventBack);
        };
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        setMouseState(prev => ({ ...prev, scrollDelta: e.deltaY }));
        setScrollCount(prev => prev + 1);

        const direction = e.deltaY < 0 ? "SCROLL UP" : "SCROLL DOWN";
        setClickHistory(prev => [
            { id: Date.now() + Math.random(), button: direction, timestamp: Date.now() },
            ...prev.slice(0, 9)
        ]);

        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
            setMouseState(prev => ({ ...prev, scrollDelta: 0 }));
        }, 300); // Increased timeout for better visibility
    }, []);

    const handleDoubleClick = useCallback(() => {
        setMouseState(prev => ({ ...prev, doubleClick: true }));
        setTimeout(() => setMouseState(prev => ({ ...prev, doubleClick: false })), 200);
    }, []);

    const testAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = testAreaRef.current;
        if (!element) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            handleWheel(e);
        };

        element.addEventListener("wheel", onWheel, { passive: false });
        return () => element.removeEventListener("wheel", onWheel);
    }, [handleWheel]);

    const resetTests = () => {
        setClickHistory([]);
        setScrollCount(0);
        setMouseState({
            left: false, right: false, middle: false, back: false, forward: false,
            scrollDelta: 0, x: 0, y: 0, doubleClick: false
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Scroll Activity</span>
                            <span className="text-sm font-black text-white/60">{scrollCount} Units</span>
                        </div>
                        <RotateCcw size={18} className={cn(
                            "transition-all duration-300",
                            mouseState.scrollDelta !== 0 ? "text-blue-400 animate-spin-slow" : "text-white/10"
                        )} />
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Dbl Click</span>
                            <span className={cn(
                                "text-sm font-black transition-colors",
                                mouseState.doubleClick ? "text-blue-400" : "text-white/60"
                            )}>
                                {mouseState.doubleClick ? "DETECTED" : "Waiting..."}
                            </span>
                        </div>
                        <Zap size={18} className={cn(
                            "transition-all",
                            mouseState.doubleClick ? "text-blue-400 scale-125" : "text-white/10"
                        )} />
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={resetTests}
                    className="h-12 rounded-2xl border-white/10 bg-black/40 hover:bg-white/10 text-white font-bold gap-2 px-6"
                >
                    <RotateCcw size={16} /> RESET STATS
                </Button>
            </div>

            {/* Main Interactive Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
                {/* Visual Mouse Center */}
                <div
                    ref={testAreaRef}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onDoubleClick={handleDoubleClick}
                    onContextMenu={(e) => e.preventDefault()}
                    className="lg:col-span-8 h-full p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden group"
                >
                    <div className="absolute top-6 left-8 flex flex-col gap-1 select-none pointer-events-none z-20">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Test Zone</span>
                        </div>
                        <span className="text-xs font-bold text-white/40">Perform clicks, scrolls & movements here</span>
                    </div>

                    <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent group-hover:opacity-[0.05] transition-opacity duration-1000" />

                    <div className="relative w-64 h-[400px] bg-black/40 rounded-[6rem] border-8 border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center pt-1 overflow-hidden shrink-0">
                        {/* Top Buttons Row */}
                        <div className="w-full flex h-48 border-b-4 border-white/5">
                            <div className={cn(
                                "flex-1 transition-all duration-75 flex items-center justify-center font-black text-xs tracking-widest border-r-2 border-white/5",
                                mouseState.left ? "bg-blue-600 text-white shadow-inner" : "text-white/10"
                            )}>
                                LEFT
                            </div>
                            <div className="w-16 flex flex-col items-center justify-center gap-4 bg-white/[0.02]">
                                <div className={cn(
                                    "w-5 h-14 rounded-full border-2 transition-all duration-75 flex flex-col items-center justify-center p-1 relative",
                                    mouseState.middle ? "bg-blue-500 border-blue-400" : "border-white/10"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 text-[10px] transition-all duration-200",
                                        mouseState.scrollDelta < 0 ? "text-blue-400 opacity-100 -translate-y-1 scale-125" : "text-white/5 opacity-0"
                                    )}>↑</div>

                                    <div className={cn(
                                        "w-full h-5 rounded-full bg-white/20 transition-all duration-200 shadow-lg",
                                        mouseState.scrollDelta < 0 && "-translate-y-2 bg-blue-300 shadow-blue-500/50",
                                        mouseState.scrollDelta > 0 && "translate-y-2 bg-blue-300 shadow-blue-500/50"
                                    )} />

                                    <div className={cn(
                                        "absolute bottom-1 text-[10px] transition-all duration-200",
                                        mouseState.scrollDelta > 0 ? "text-blue-400 opacity-100 translate-y-1 scale-125" : "text-white/5 opacity-0"
                                    )}>↓</div>
                                </div>
                                <span className={cn("text-[8px] font-black tracking-widest", mouseState.middle ? "text-blue-400" : "text-white/10")}>MID</span>
                            </div>
                            <div className={cn(
                                "flex-1 transition-all duration-75 flex items-center justify-center font-black text-xs tracking-widest border-l-2 border-white/5",
                                mouseState.right ? "bg-blue-600 text-white shadow-inner" : "text-white/10"
                            )}>
                                RIGHT
                            </div>
                        </div>

                        {/* Side Buttons Area */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 flex flex-col gap-2">
                            <div className={cn(
                                "h-14 w-full rounded-r-lg border-y border-r border-white/10 transition-all",
                                mouseState.forward ? "bg-blue-600 border-blue-400 w-6" : "bg-white/5"
                            )} />
                            <div className={cn(
                                "h-14 w-full rounded-r-lg border-y border-r border-white/10 transition-all",
                                mouseState.back ? "bg-blue-600 border-blue-400 w-6" : "bg-white/5"
                            )} />
                        </div>

                        {/* Laser / Sensor Visual */}
                        <div className="mt-20 w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        </div>

                        {/* Bottom Label */}
                        <div className="mt-auto pb-8 flex flex-col items-center gap-1 opacity-20">
                            <MousePointer2 size={16} />
                            <span className="text-[10px] font-black tracking-[0.3em]">PRECISION</span>
                        </div>
                    </div>

                    {/* Coordinates Overlay */}
                    <div className="absolute bottom-8 left-12 flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md flex flex-col">
                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Global X</span>
                            <span className="text-sm font-mono font-black text-white">{mouseState.x}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md flex flex-col">
                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Global Y</span>
                            <span className="text-sm font-mono font-black text-white">{mouseState.y}</span>
                        </div>
                    </div>
                </div>

                {/* Info & Logs Panel */}
                <div className="lg:col-span-4 h-[500px]">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 border border-white/10 shadow-2xl relative overflow-hidden group h-full">
                        <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 transform group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                            <Crosshair size={140} />
                        </div>

                        <div className="relative z-10 flex flex-col h-full overflow-hidden">
                            <div className="flex items-center gap-2 mb-8 shrink-0">
                                <HistoryIcon size={16} className="text-blue-400/50" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Event Log</h3>
                            </div>

                            <div className="flex-1 min-h-0 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                                {clickHistory.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4 mt-20">
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white flex items-center justify-center">
                                            <Mouse size={20} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Click to start logging</p>
                                    </div>
                                ) : (
                                    clickHistory.map(click => (
                                        <div key={click.id} className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                                            <span className="text-xs font-black text-white">{click.button} CLICK</span>
                                            <span className="text-[9px] font-mono text-white/40">{new Date(click.timestamp).toLocaleTimeString()}</span>
                                            <CheckCircle2 size={12} className="text-emerald-400" />
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <Info size={14} /> Tester Tips
                                    </div>
                                    <ul className="text-[10px] font-bold text-blue-100/40 space-y-2 leading-relaxed">
                                        <li>• Right-click is intercepted for testing.</li>
                                        <li>• Test side buttons (Forward/Back).</li>
                                        <li>• Click the scroll wheel (Middle Click).</li>
                                        <li>• Check for clean, no-bounce clicks.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
