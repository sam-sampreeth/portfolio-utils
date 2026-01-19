import { useState, useEffect, useCallback } from "react";
import {
    Keyboard,
    Monitor,
    RotateCcw,
    Zap,
    Info,
    CheckCircle2,
    Command,
    CircleDot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OS = "windows" | "mac";

interface KeyInfo {
    code: string;
    label?: string;
    macLabel?: string;
    altLabel?: string;
    width?: number;
    height?: number;
}

// Full ISO/ANSI hybrid layout data
const KEYBOARD_LAYOUT: KeyInfo[][] = [
    // Row 0
    [
        { code: "Escape", label: "Esc" },
        { code: "Spacer", width: 0.75 },
        { code: "F1", label: "F1" },
        { code: "F2", label: "F2" },
        { code: "F3", label: "F3" },
        { code: "F4", label: "F4" },
        { code: "Spacer", width: 0.5 },
        { code: "F5", label: "F5" },
        { code: "F6", label: "F6" },
        { code: "F7", label: "F7" },
        { code: "F8", label: "F8" },
        { code: "Spacer", width: 0.5 },
        { code: "F9", label: "F9" },
        { code: "F10", label: "F10" },
        { code: "F11", label: "F11" },
        { code: "F12", label: "F12" },
        { code: "Spacer", width: 0.25 },
        { code: "PrintScreen", label: "PrtSc" },
        { code: "ScrollLock", label: "Scroll" },
        { code: "Pause", label: "Pause" },
    ],
    // Row 1
    [
        { code: "Backquote", label: "~ `", altLabel: "± §" },
        { code: "Digit1", label: "1 !" },
        { code: "Digit2", label: "2 @" },
        { code: "Digit3", label: "3 #" },
        { code: "Digit4", label: "4 $" },
        { code: "Digit5", label: "5 %" },
        { code: "Digit6", label: "6 ^" },
        { code: "Digit7", label: "7 &" },
        { code: "Digit8", label: "8 *" },
        { code: "Digit9", label: "9 (" },
        { code: "Digit0", label: "0 )" },
        { code: "Minus", label: "- _" },
        { code: "Equal", label: "= +" },
        { code: "Backspace", label: "Backspace", width: 2 },
        { code: "Spacer", width: 0.25 },
        { code: "Insert", label: "Ins" },
        { code: "Home", label: "Home" },
        { code: "PageUp", label: "PgUp" },
    ],
    // Row 2
    [
        { code: "Tab", label: "Tab", width: 1.5 },
        { code: "KeyQ", label: "Q" },
        { code: "KeyW", label: "W" },
        { code: "KeyE", label: "E" },
        { code: "KeyR", label: "R" },
        { code: "KeyT", label: "T" },
        { code: "KeyY", label: "Y" },
        { code: "KeyU", label: "U" },
        { code: "KeyI", label: "I" },
        { code: "KeyO", label: "O" },
        { code: "KeyP", label: "P" },
        { code: "BracketLeft", label: "[ {" },
        { code: "BracketRight", label: "] }" },
        { code: "Backslash", label: "\\ |", width: 1.5 },
        { code: "Spacer", width: 0.25 },
        { code: "Delete", label: "Del" },
        { code: "End", label: "End" },
        { code: "PageDown", label: "PgDn" },
    ],
    // Row 3
    [
        { code: "CapsLock", label: "Caps", width: 1.75 },
        { code: "KeyA", label: "A" },
        { code: "KeyS", label: "S" },
        { code: "KeyD", label: "D" },
        { code: "KeyF", label: "F" },
        { code: "KeyG", label: "G" },
        { code: "KeyH", label: "H" },
        { code: "KeyJ", label: "J" },
        { code: "KeyK", label: "K" },
        { code: "KeyL", label: "L" },
        { code: "Semicolon", label: "; :" },
        { code: "Quote", label: "' \"" },
        { code: "Enter", label: "Enter", width: 2.25 },
    ],
    // Row 4
    [
        { code: "ShiftLeft", label: "Shift", width: 2.25 },
        { code: "KeyZ", label: "Z" },
        { code: "KeyX", label: "X" },
        { code: "KeyC", label: "C" },
        { code: "KeyV", label: "V" },
        { code: "KeyB", label: "B" },
        { code: "KeyN", label: "N" },
        { code: "KeyM", label: "M" },
        { code: "Comma", label: ", <" },
        { code: "Period", label: ". >" },
        { code: "Slash", label: "/ ?" },
        { code: "ShiftRight", label: "Shift", width: 2.75 },
        { code: "Spacer", width: 1.43 }, // Adjusted to align ArrowUp with ArrowDown (accounting for gap)
        { code: "ArrowUp", label: "↑" },
    ],
    // Row 5
    [
        { code: "ControlLeft", label: "Ctrl", macLabel: "Control", width: 1.25 },
        { code: "MetaLeft", label: "Win", macLabel: "Command", width: 1.25 },
        { code: "AltLeft", label: "Alt", macLabel: "Option", width: 1.25 },
        { code: "Space", label: "Space", width: 6.25 },
        { code: "AltRight", label: "Alt", macLabel: "Option", width: 1.25 },
        { code: "MetaRight", label: "Win", macLabel: "Command", width: 1.25 },
        { code: "ContextMenu", label: "Menu", macLabel: "Control", width: 1.25 },
        { code: "ControlRight", label: "Ctrl", macLabel: "Control", width: 1.25 },
        { code: "Spacer", width: 0.25 },
        { code: "ArrowLeft", label: "←" },
        { code: "ArrowDown", label: "↓" },
        { code: "ArrowRight", label: "→" },
    ]
];

const NUMPAD_LAYOUT: KeyInfo[][] = [
    [
        { code: "NumLock", label: "Num" },
        { code: "NumpadDivide", label: "/" },
        { code: "NumpadMultiply", label: "*" },
        { code: "NumpadSubtract", label: "-" },
    ],
    [
        { code: "Numpad7", label: "7" },
        { code: "Numpad8", label: "8" },
        { code: "Numpad9", label: "9" },
        { code: "NumpadAdd", label: "+", height: 2 },
    ],
    [
        { code: "Numpad4", label: "4" },
        { code: "Numpad5", label: "5" },
        { code: "Numpad6", label: "6" },
    ],
    [
        { code: "Numpad1", label: "1" },
        { code: "Numpad2", label: "2" },
        { code: "Numpad3", label: "3" },
        { code: "NumpadEnter", label: "Ent", height: 2 },
    ],
    [
        { code: "Numpad0", label: "0", width: 2 },
        { code: "NumpadDecimal", label: "." },
    ]
];

export function KeyboardTester() {
    const [os, setOs] = useState<OS>("windows");
    const [history, setHistory] = useState<Record<string, boolean>>({});
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
    const [lastKey, setLastKey] = useState<{ code: string, key: string } | null>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Prevent default browser behavior for some keys (F-keys, Backspace, etc.)
        if (e.code.startsWith("F") || e.code === "Backspace" || e.code === "Tab" || e.code === "AltLeft" || e.code === "AltRight" || e.metaKey || e.code === "PageUp" || e.code === "PageDown" || e.code === "Enter" || e.code === "NumpadEnter") {
            e.preventDefault();
        }

        setLastKey({ code: e.code, key: e.key });
        setHistory(prev => ({ ...prev, [e.code]: true }));
        setActiveKeys(prev => {
            const next = new Set(prev);
            next.add(e.code);
            return next;
        });
    }, []);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        // Also register history on key up to catch keys intercepted by OS (like PrtSc)
        setHistory(prev => ({ ...prev, [e.code]: true }));
        // Optional: Update last key on up if it wasn't caught on down
        setLastKey(prev => prev?.code === e.code ? prev : { code: e.code, key: e.key });

        setActiveKeys(prev => {
            const next = new Set(prev);
            next.delete(e.code);
            return next;
        });
    }, []);

    useEffect(() => {
        const handleBlur = () => {
            setActiveKeys(new Set());
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
        };
    }, [handleKeyDown, handleKeyUp]);

    const resetTests = () => {
        setHistory({});
        setActiveKeys(new Set());
        setLastKey(null);
    };

    const ghostingCount = activeKeys.size;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Tabs value={os} onValueChange={(v) => setOs(v as OS)} className="w-fit">
                        <TabsList className="bg-black/40 border border-white/5 p-1 h-12 rounded-2xl shadow-inner">
                            <TabsTrigger value="windows" className="rounded-xl px-6 gap-2 font-bold data-[state=active]:bg-blue-600 transition-all">
                                <Monitor size={16} /> WINDOWS
                            </TabsTrigger>
                            <TabsTrigger value="mac" className="rounded-xl px-6 gap-2 font-bold data-[state=active]:bg-blue-600 transition-all">
                                <Command size={16} /> MAC
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Ghosting Test</span>
                            <span className={cn(
                                "text-sm font-black transition-colors",
                                ghostingCount > 2 ? "text-blue-400" : "text-white/60"
                            )}>
                                {ghostingCount} Keys Active
                            </span>
                        </div>
                        <Zap size={18} className={cn(
                            "transition-all duration-300",
                            ghostingCount > 0 ? "text-blue-400 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-white/10"
                        )} />
                    </div>

                    <Button
                        variant="outline"
                        onClick={resetTests}
                        className="h-12 rounded-2xl border-white/10 bg-black/40 hover:bg-white/10 text-white font-bold gap-2 px-6"
                    >
                        <RotateCcw size={16} /> RESET TEST
                    </Button>
                </div>
            </div>

            {/* Main Keyboard Visual Area */}
            <div className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <Keyboard size={300} />
                </div>

                <div className="relative z-10 flex gap-8 overflow-x-auto pb-4 custom-scrollbar">
                    {/* Main Section */}
                    <div className="space-y-2">
                        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1.5 min-w-max">
                                {row.map((key, keyIndex) => {
                                    if (key.code === "Spacer") {
                                        return <div key={`spacer-${keyIndex}`} style={{ width: `${(key.width || 1) * 50}px` }} />;
                                    }

                                    const isPressed = activeKeys.has(key.code);
                                    const isTested = history[key.code];
                                    const label = os === "mac" && key.macLabel ? key.macLabel : key.label;

                                    return (
                                        <div
                                            key={key.code}
                                            style={{ width: `${(key.width || 1) * 53}px` }}
                                            className={cn(
                                                "h-[53px] rounded-lg border flex items-center justify-center transition-all duration-100 relative group",
                                                isPressed
                                                    ? "bg-blue-600 border-blue-400 text-white scale-95 shadow-[0_0_20px_rgba(37,99,235,0.6)] z-20"
                                                    : isTested
                                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[inset_0_0_10px_rgba(37,99,235,0.1)]"
                                                        : "bg-black/40 border-white/5 text-white/30 hover:bg-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <span className={cn(
                                                "font-black tracking-tight",
                                                label && label.length > 2 ? "text-[8px] uppercase" : "text-xs"
                                            )}>
                                                {label}
                                            </span>
                                            {isTested && !isPressed && (
                                                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Numpad Section */}
                    <div className="grid grid-cols-4 gap-1.5 mt-[61px] min-w-max">
                        {NUMPAD_LAYOUT.flat().map((key) => {
                            const isPressed = activeKeys.has(key.code);
                            const isTested = history[key.code];

                            return (
                                <div
                                    key={key.code}
                                    style={{
                                        gridColumn: key.width ? `span ${key.width}` : undefined,
                                        gridRow: key.height ? `span ${key.height}` : undefined,
                                        width: key.width ? `${key.width * 53 + (key.width - 1) * 6}px` : "53px",
                                        height: key.height ? `${key.height * 53 + (key.height - 1) * 6}px` : "53px",
                                    }}
                                    className={cn(
                                        "rounded-lg border flex items-center justify-center transition-all duration-100 relative group",
                                        isPressed
                                            ? "bg-blue-600 border-blue-400 text-white scale-95 shadow-[0_0_20px_rgba(37,99,235,0.6)] z-20"
                                            : isTested
                                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[inset_0_0_10px_rgba(37,99,235,0.1)]"
                                                : "bg-black/40 border-white/5 text-white/30 hover:bg-white/5 hover:border-white/10"
                                    )}
                                >
                                    <span className="font-black text-xs">
                                        {key.label}
                                    </span>
                                    {isTested && !isPressed && (
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Stats & Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                            Last Input
                        </div>
                        <CircleDot size={14} className="text-blue-500/50" />
                    </div>
                    {lastKey ? (
                        <div className="space-y-1">
                            <div className="text-2xl font-black text-white">{lastKey.key === " " ? "Space" : lastKey.key}</div>
                            <div className="text-[10px] font-mono text-white/30 uppercase tracking-tighter">Code: {lastKey.code}</div>
                        </div>
                    ) : (
                        <div className="text-sm font-bold text-white/20 italic">No input detected...</div>
                    )}
                </div>

                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                            Testing Coverage
                        </div>
                        <CheckCircle2 size={14} className="text-blue-500/50" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-black text-white">{Object.keys(history).length}</div>
                            <div className="text-[10px] font-black text-white/20 pb-1">KEYS TESTED</div>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${Math.min(100, (Object.keys(history).length / 88) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                        <Info size={14} /> Tester Tips
                    </div>
                    <ul className="text-[11px] font-bold text-blue-300/40 space-y-2 leading-relaxed">
                        <li>• Use ghosting test to check rollover limits.</li>
                        <li>• Function keys (F1-F12) are fully captured.</li>
                        <li>• Browser-specific shortcuts are inhibited.</li>
                        <li>• Switch layout to see Cmd/Opt vs Win/Alt.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
