import { useState, useEffect, useCallback, useRef } from "react";
import {
    ArrowLeft,
    ArrowRight,
    X,
    Monitor,
    ShieldAlert,
    CheckCircle2,
    Keyboard,
    MousePointer2,
    Scan
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const COLORS = [
    { name: "Pure White", hex: "#ffffff", text: "text-black/40" },
    { name: "Void Black", hex: "#000000", text: "text-white/20" },
    { name: "Spectral Red", hex: "#ff0000", text: "text-white/40" },
    { name: "Spectral Green", hex: "#00ff00", text: "text-black/40" },
    { name: "Spectral Blue", hex: "#0000ff", text: "text-white/40" },
    { name: "Neon Cyan", hex: "#00ffff", text: "text-black/40" },
    { name: "Neon Magenta", hex: "#ff00ff", text: "text-black/40" },
    { name: "Neon Yellow", hex: "#ffff00", text: "text-black/40" },
];

export function DeadPixelTester() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [showHud, setShowHud] = useState(true);
    const hudTimerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleNext = useCallback(() => {
        setCurrentColorIndex((prev) => (prev + 1) % COLORS.length);
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentColorIndex((prev) => (prev - 1 + COLORS.length) % COLORS.length);
    }, []);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Auto-hide HUD logic
    const resetHudTimer = useCallback(() => {
        setShowHud(true);
        if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
        hudTimerRef.current = setTimeout(() => {
            if (isFullscreen) setShowHud(false);
        }, 3000);
    }, [isFullscreen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isFullscreen) return;

            switch (e.key) {
                case "ArrowRight":
                case " ":
                    handleNext();
                    resetHudTimer();
                    break;
                case "ArrowLeft":
                    handlePrev();
                    resetHudTimer();
                    break;
                case "Escape":
                    setIsFullscreen(false);
                    break;
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
        };
    }, [isFullscreen, handleNext, handlePrev, resetHudTimer]);

    const currentColor = COLORS[currentColorIndex];

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full transition-all duration-700 select-none",
                isFullscreen ? "h-screen bg-black" : "min-h-[600px] space-y-8 animate-in fade-in slide-in-from-bottom-4"
            )}
            onMouseMove={resetHudTimer}
        >
            {/* Fullscreen Diagnostic View */}
            {
                isFullscreen ? (
                    <div
                        className={cn("absolute inset-0 flex items-center justify-center transition-colors duration-500")}
                        style={{ backgroundColor: currentColor.hex }}
                    >
                        {/* Minimalist HUD */}
                        < div className={cn(
                            "fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-black/80 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-[2rem] transition-all duration-500 z-50",
                            showHud ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                        )}>
                            <button onClick={handlePrev} className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
                                <ArrowLeft size={24} />
                            </button>

                            <div className="flex flex-col items-center min-w-[120px]">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Chromatic Channel</span>
                                <span className="text-sm font-black text-white">{currentColor.name}</span>
                            </div>

                            <button onClick={handleNext} className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
                                <ArrowRight size={24} />
                            </button>

                            <div className="h-8 w-px bg-white/10 mx-2" />

                            <button onClick={toggleFullscreen} className="p-3 rounded-full hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Hint Overlay */}
                        <div className={cn(
                            "absolute top-12 left-1/2 -translate-x-1/2 text-center transition-opacity duration-500",
                            showHud ? "opacity-100" : "opacity-0",
                            currentColor.text
                        )}>
                            <p className="text-[9px] font-black uppercase tracking-[0.4em]">Scan every pixel meticulously</p>
                        </div>
                    </div >
                ) : (
                    /* Landing UI */
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm flex items-center gap-3">
                                    <Monitor className="text-blue-400" size={18} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Display Engine</span>
                                        <span className="text-sm font-black text-white/60">Display Diagnostics</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 p-12 rounded-[3.5rem] bg-black/40 border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center min-h-[500px]">
                                <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent group-hover:opacity-[0.1] transition-opacity duration-1000" />

                                <div className="relative z-10 flex flex-col items-center text-center max-w-md gap-8">
                                    <div className="p-8 rounded-full bg-blue-500/10 border border-blue-500/20">
                                        <Scan size={48} className="text-blue-400" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Enter Diagnostic</h2>
                                        <p className="text-white/40 text-sm leading-relaxed">
                                            The diagnostic will open in full-screen mode to allow edge-to-edge panel inspection.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={toggleFullscreen}
                                        className="px-12 py-8 rounded-[2.5rem] bg-blue-600 hover:bg-blue-500 text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 transform hover:scale-105 transition-all"
                                    >
                                        Start Full Screen Scan
                                    </Button>

                                    <div className="flex items-center gap-6 pt-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase">
                                            <Keyboard size={14} /> Arrow Keys
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase">
                                            <MousePointer2 size={14} /> Click
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 border border-white/10 shadow-2xl h-full flex flex-col">
                                    <div className="flex items-center gap-3 mb-8">
                                        <ShieldAlert size={20} className="text-blue-400" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Diagnostic Intel</h3>
                                    </div>

                                    <div className="space-y-8 flex-1">
                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Test Patterns</span>
                                            <div className="grid grid-cols-4 gap-2">
                                                {COLORS.map((c, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => !isFullscreen && setCurrentColorIndex(i)}
                                                        className={cn(
                                                            "aspect-square rounded-xl border transition-all",
                                                            currentColorIndex === i ? "border-white scale-110 z-10" : "border-white/10 opacity-60 hover:opacity-100"
                                                        )}
                                                        style={{ backgroundColor: c.hex }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-8 border-t border-white/5 leading-relaxed">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 p-1 rounded-full bg-emerald-500/20">
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Pixel Verification</span>
                                                    <p className="text-[11px] font-medium text-white/30">Look for contrasting dots against each solid color channel.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-white/20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Ready for Scan</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    );
}
