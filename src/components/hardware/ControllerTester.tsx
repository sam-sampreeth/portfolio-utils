import { useState, useEffect, useCallback, useRef } from "react";
import {
    Gamepad2,
    Zap,
    Info,
    Settings,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Layout = "xbox" | "ps";

interface GamepadState {
    id: string;
    buttons: { pressed: boolean; value: number }[];
    axes: number[];
}

const XBOX_LABELS = {
    0: "A", 1: "B", 2: "X", 3: "Y",
    4: "LB", 5: "RB", 6: "LT", 7: "RT",
    8: "Back", 9: "Start", 10: "L3", 11: "R3",
    12: "Up", 13: "Down", 14: "Left", 15: "Right",
    16: "Home"
};

const PS_LABELS = {
    0: "Cross", 1: "Circle", 2: "Square", 3: "Triangle",
    4: "L1", 5: "R1", 6: "L2", 7: "R2",
    8: "Create", 9: "Options", 10: "L3", 11: "R3",
    12: "Up", 13: "Down", 14: "Left", 15: "Right",
    16: "PS"
};

const CrossIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const CircleIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" strokeWidth="3.5">
        <circle cx="12" cy="12" r="8" />
    </svg>
);

const SquareIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="5" y="5" width="14" height="14" rx="1" />
    </svg>
);

const TriangleIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round">
        <path d="M12 5L19 18H5L12 5Z" />
    </svg>
);

export function ControllerTester() {
    const [layout, setLayout] = useState<Layout>("ps"); // Temporarily forced for review
    const [gamepad, setGamepad] = useState<GamepadState | null>(null);
    const [isVibrating, setIsVibrating] = useState(false);
    const rafRef = useRef<number>(0);

    const updateGamepad = useCallback((_time?: number) => {
        const gamepads = navigator.getGamepads();
        const activeGamepad = gamepads[0];

        if (activeGamepad) {
            setGamepad({
                id: activeGamepad.id,
                buttons: activeGamepad.buttons.map(b => ({ pressed: b.pressed, value: b.value })),
                axes: [...activeGamepad.axes]
            });
        } else {
            setGamepad(null);
        }

        rafRef.current = requestAnimationFrame((t) => updateGamepad(t));
    }, []);

    useEffect(() => {
        rafRef.current = requestAnimationFrame((t) => updateGamepad(t));
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [updateGamepad]);

    /* Temporarily disabled auto-detection for review
    useEffect(() => {
        if (!gamepad?.id) return;
        const lowerId = gamepad.id.toLowerCase();
        if (lowerId.includes("xbox") || lowerId.includes("x-input") || lowerId.includes("microsoft") || lowerId.includes("xinput")) {
            setLayout("xbox");
        } else if (lowerId.includes("sony") || lowerId.includes("playstation") || lowerId.includes("dualshock") || lowerId.includes("dualsense") || lowerId.includes("ps5") || lowerId.includes("ps4") || lowerId.includes("wireless controller")) {
            setLayout("ps");
        }
    }, [gamepad?.id]);
    */

    const detectedBrand = (() => {
        if (!gamepad?.id) return null;
        const lowerId = gamepad.id.toLowerCase();
        if (lowerId.includes("xbox") || lowerId.includes("x-input") || lowerId.includes("microsoft") || lowerId.includes("xinput")) return "xbox";
        if (lowerId.includes("sony") || lowerId.includes("playstation") || lowerId.includes("dualshock") || lowerId.includes("dualsense") || lowerId.includes("ps5") || lowerId.includes("ps4") || lowerId.includes("wireless controller")) return "ps";
        return null;
    })();

    const isBrandMismatch = false; // Temporarily forced false for review

    const testRumble = async () => {
        if (isBrandMismatch) return;
        const gamepads = navigator.getGamepads();
        const activeGamepad = gamepads[0];
        if (activeGamepad?.vibrationActuator) {
            setIsVibrating(true);
            try {
                await activeGamepad.vibrationActuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 500,
                    weakMagnitude: 1.0,
                    strongMagnitude: 1.0,
                });
            } catch (e) {
                console.warn("Vibration not supported", e);
            }
            setTimeout(() => setIsVibrating(false), 500);
        }
    };

    const getLabels = () => layout === "xbox" ? XBOX_LABELS : PS_LABELS;

    const AnalogStick = ({ x, y, label, pressed }: { x: number; y: number; label: string; pressed: boolean }) => {
        const dx = isBrandMismatch ? 0 : x;
        const dy = isBrandMismatch ? 0 : y;
        const dPressed = isBrandMismatch ? false : pressed;

        return (
            <div className="flex flex-col items-center gap-2">
                <div className={cn(
                    "w-24 h-24 rounded-full border-2 bg-black/40 relative flex items-center justify-center transition-colors duration-100",
                    dPressed ? "border-blue-500 bg-blue-500/10" : "border-white/5"
                )}>
                    <div className="absolute inset-4 rounded-full border border-white/5 border-dashed pointer-events-none" />
                    <div
                        className={cn(
                            "w-10 h-10 rounded-full border-2 shadow-2xl transition-all duration-75 flex items-center justify-center",
                            dPressed ? "bg-blue-600 border-blue-400 scale-90" : "bg-white/10 border-white/20"
                        )}
                        style={{
                            transform: `translate(${dx * 30}px, ${dy * 30}px)`
                        }}
                    >
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                    </div>
                    <div className="absolute -bottom-6 flex gap-3 opacity-40">
                        <span className="text-[10px] font-mono">X: {dx.toFixed(2)}</span>
                        <span className="text-[10px] font-mono">Y: {dy.toFixed(2)}</span>
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-4">{label}</span>
            </div>
        );
    };

    const Trigger = ({ value, label }: { value: number; label: string }) => {
        const dValue = isBrandMismatch ? 0 : value;
        return (
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-24 bg-black/40 rounded-lg border border-white/5 relative overflow-hidden">
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-75"
                        style={{ height: `${dValue * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-black mix-blend-difference">{(dValue * 100).toFixed(0)}%</span>
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
            </div>
        );
    };

    const ButtonNode = ({ index, className }: { index: number; className?: string }) => {
        const btn = isBrandMismatch ? null : gamepad?.buttons[index];
        const labels = getLabels();
        const label = labels[index as keyof typeof labels];

        const isPSAction = layout === "ps" && index <= 3;

        const getPSIcon = () => {
            if (index === 0) return <CrossIcon className={btn?.pressed ? "text-blue-400" : "text-blue-400/50"} />;
            if (index === 1) return <CircleIcon className={btn?.pressed ? "text-red-400" : "text-red-400/50"} />;
            if (index === 2) return <SquareIcon className={btn?.pressed ? "text-pink-400" : "text-pink-400/50"} />;
            if (index === 3) return <TriangleIcon className={btn?.pressed ? "text-emerald-400" : "text-emerald-400/50"} />;
            return label;
        };

        return (
            <div className={cn(
                "rounded-lg border flex items-center justify-center transition-all duration-75 text-[10px] font-black uppercase tracking-tighter",
                btn?.pressed
                    ? "bg-blue-600 border-blue-400 text-white scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] z-20"
                    : "bg-white/5 border-white/10 text-white/20",
                isPSAction && !btn?.pressed && "bg-black/20 border-white/5",
                className
            )}>
                {isPSAction ? getPSIcon() : label}
            </div>
        );
    };

    if (!gamepad) {
        return (
            <div className="h-[600px] rounded-[3.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-8 animate-in fade-in duration-1000">
                <div className="relative">
                    <div className="absolute -inset-8 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                    <Gamepad2 size={80} className="text-white/10 relative" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-white">No Controller Detected</h2>
                    <p className="text-white/40 text-sm max-w-xs">Press any button on your controller to wake it up and begin testing.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">USB Connectivity</div>
                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">Bluetooth Support</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm flex items-center gap-3">
                        <Activity className="text-blue-400" size={18} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Active Device</span>
                            <span className="text-sm font-black text-white/60 truncate max-w-[200px]">{gamepad.id}</span>
                        </div>
                    </div>

                    <Tabs value={layout} onValueChange={(v) => setLayout(v as Layout)} className="bg-black/40 p-1 rounded-xl border border-white/5">
                        <TabsList className="bg-transparent border-none gap-1">
                            <TabsTrigger
                                value="xbox"
                                className={cn(
                                    "rounded-lg px-4 transition-all duration-300",
                                    "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                                    detectedBrand && detectedBrand !== "xbox" && "opacity-20 grayscale hover:opacity-100 hover:grayscale-0"
                                )}
                            >
                                Xbox {detectedBrand === "xbox" && <span className="ml-2 size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                            </TabsTrigger>
                            <TabsTrigger
                                value="ps"
                                className={cn(
                                    "rounded-lg px-4 transition-all duration-300",
                                    "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                                    detectedBrand && detectedBrand !== "ps" && "opacity-20 grayscale hover:opacity-100 hover:grayscale-0"
                                )}
                            >
                                PlayStation {detectedBrand === "ps" && <span className="ml-2 size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm flex items-center gap-3">
                        <Settings className="text-white/20" size={18} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/10">Mode</span>
                            <span className="text-sm font-black text-white/20 uppercase">{layout} Standard</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto">
                {/* Visual Controller Box */}
                <div className="lg:col-span-8 p-4 py-12 rounded-[3.5rem] bg-black/40 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group flex flex-col items-center justify-center min-h-[700px]">
                    {/* Dynamic Background Glow */}
                    <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none" />

                    {/* Hardware Mismatch Warning */}
                    {isBrandMismatch && (
                        <div className="absolute inset-[-100px] z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="relative mb-4">
                                <div className="absolute -inset-4 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                                <Settings size={48} className="text-orange-400 animate-spin-slow" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Hardware Mismatch</h3>
                            <p className="text-white/40 text-xs mt-1 text-center max-w-[200px]">
                                This UI is locked because you've connected a <span className="text-white font-bold">{detectedBrand?.toUpperCase()}</span> controller.
                                Switch to the <span className="text-blue-400 font-bold">{detectedBrand?.toUpperCase()}</span> tab to test.
                            </p>
                            <Button
                                onClick={() => setLayout(detectedBrand as Layout)}
                                className="mt-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 text-xs font-black uppercase tracking-widest"
                            >
                                Switch to {detectedBrand?.toUpperCase()}
                            </Button>
                        </div>
                    )}

                    {/* Accurate Layout Grid with High-Fidelity SVG Silhouette */}
                    <div className="w-full max-w-4xl aspect-[1.6/1] relative scale-[1.05]">
                        {/* High-Fidelity Controller SVG Silhouette */}
                        <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)] -z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Controller Body Shell */}
                            <path
                                d="M224.2 72.5C268.4 64.2 334.8 60 400 60C465.2 60 531.6 64.2 575.8 72.5C635.4 83.7 671.3 112.5 692.4 154.6C712.1 193.8 732.5 292.5 735.8 344.2C738.2 381.5 728.4 412.4 702.5 432.6C676.6 452.8 638.6 458.5 592.4 442.6C546.2 426.7 516.4 394.2 492.4 362.5C478.4 344.2 462.4 332.5 400 332.5C337.6 332.5 321.6 344.2 307.6 362.5C283.6 394.2 253.8 426.7 207.6 442.6C161.4 458.5 123.4 452.8 97.5 432.6C71.6 412.4 61.8 381.5 64.2 344.2C67.5 292.5 87.9 193.8 107.6 154.6C128.7 112.5 164.6 83.7 224.2 72.5Z"
                                className="fill-white/[0.04] stroke-white/20"
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                            {/* Inner Depth Shadows */}
                            <path
                                d="M220 85C260 75 340 70 400 70C460 70 540 75 580 85C620 95 640 105 660 125"
                                className="stroke-white/5"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                            {/* Grip Contours */}
                            <path
                                d="M120 220C130 280 145 340 160 380"
                                className="stroke-white/[0.03]"
                                strokeWidth="20"
                                strokeLinecap="round"
                            />
                            <path
                                d="M680 220C670 280 655 340 640 380"
                                className="stroke-white/[0.03]"
                                strokeWidth="20"
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Side Mounted Triggers (Beside Bumpers) */}
                        <div className="absolute left-[5%] top-[2%] flex flex-col items-center gap-1 scale-90 z-20">
                            <Trigger value={gamepad.buttons[6]?.value || 0} label={layout === "xbox" ? "LT" : "L2"} />
                        </div>
                        <div className="absolute right-[5%] top-[2%] flex flex-col items-center gap-1 scale-90 z-20">
                            <Trigger value={gamepad.buttons[7]?.value || 0} label={layout === "xbox" ? "RT" : "R2"} />
                        </div>

                        {/* Layout Containers */}
                        <div className="absolute inset-0">
                            {/* Top Shoulder Area (Bumpers) */}
                            <div className="absolute left-[20%] right-[20%] top-[2%] flex justify-between z-20">
                                <ButtonNode index={4} className="w-24 h-10 rounded-t-2xl rounded-b-sm border-white/20 shadow-xl" />
                                <ButtonNode index={5} className="w-24 h-10 rounded-t-2xl rounded-b-sm border-white/20 shadow-xl" />
                            </div>

                            {/* Main Face Area */}
                            <div className="absolute inset-0 pt-20">
                                {/* Xbox Layout */}
                                {layout === "xbox" && (
                                    <>
                                        {/* Left Side */}
                                        <div className="absolute left-[22%] top-[22%]">
                                            <AnalogStick x={gamepad.axes[0]} y={gamepad.axes[1]} label="Left Stick" pressed={gamepad.buttons[10]?.pressed} />
                                        </div>
                                        <div className="absolute left-[30%] bottom-[34%]">
                                            <div className="grid grid-cols-3 gap-1 size-24 items-center justify-center scale-90">
                                                <div /> <ButtonNode index={12} className="w-9 h-9 border-white/20" /> <div />
                                                <ButtonNode index={14} className="w-9 h-9 border-white/20" /> <div className="w-9 h-9 rounded-lg opacity-20 flex items-center justify-center" /> <ButtonNode index={15} className="w-9 h-9 border-white/20" />
                                                <div /> <ButtonNode index={13} className="w-9 h-9 border-white/20" /> <div />
                                            </div>
                                        </div>

                                        {/* Right Side */}
                                        <div className="absolute right-[22%] top-[22%]">
                                            <div className="grid grid-cols-3 gap-1.5 size-28 items-center justify-center scale-95">
                                                <div /> <ButtonNode index={3} className="w-11 h-11 font-black text-sm border-white/20 shadow-lg rounded-full" /> <div />
                                                <ButtonNode index={2} className="w-11 h-11 font-black text-sm border-white/20 shadow-lg rounded-full" /> <div className="w-11 h-11" /> <ButtonNode index={1} className="w-11 h-11 font-black text-sm border-white/20 shadow-lg rounded-full" />
                                                <div /> <ButtonNode index={0} className="w-11 h-11 font-black text-sm border-white/20 shadow-lg rounded-full" /> <div />
                                            </div>
                                        </div>
                                        <div className="absolute right-[30%] bottom-[31%]">
                                            <AnalogStick x={gamepad.axes[2]} y={gamepad.axes[3]} label="Right Stick" pressed={gamepad.buttons[11]?.pressed} />
                                        </div>
                                    </>
                                )}

                                {/* PlayStation Layout */}
                                {layout === "ps" && (
                                    <>
                                        {/* Left Side (D-Pad) */}
                                        <div className="absolute left-[22%] top-[18%]">
                                            <div className="grid grid-cols-3 gap-1 size-28 items-center justify-center scale-95">
                                                <div /> <ButtonNode index={12} className="w-10 h-10 border-white/20" /> <div />
                                                <ButtonNode index={14} className="w-10 h-10 border-white/20" /> <div className="w-10 h-10" /> <ButtonNode index={15} className="w-10 h-10 border-white/20" />
                                                <div /> <ButtonNode index={13} className="w-10 h-10 border-white/20" /> <div />
                                            </div>
                                        </div>

                                        {/* Right Side (Shapes) */}
                                        <div className="absolute right-[22%] top-[18%]">
                                            <div className="grid grid-cols-3 gap-1.5 size-28 items-center justify-center scale-95">
                                                <div /> <ButtonNode index={3} className="w-11 h-11 font-black text-sm border-white/20 shadow-lg rounded-full" /> <div />
                                                <ButtonNode index={2} className="w-11 h-11 font-black text-sm border-white/20 shadow-lg rounded-full" /> <div className="w-11 h-11" /> <ButtonNode index={1} className="w-11 h-11 font-black text-sm border-white/20 shadow-lg rounded-full" />
                                                <div /> <ButtonNode index={0} className="w-11 h-11 font-black text-sm border-white/20 shadow-lg rounded-full" /> <div />
                                            </div>
                                        </div>

                                        {/* Bottom Center (Dual Sticks) */}
                                        <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 flex gap-56 scale-95">
                                            <AnalogStick x={gamepad.axes[0]} y={gamepad.axes[1]} label="Left Stick" pressed={gamepad.buttons[10]?.pressed} />
                                            <AnalogStick x={gamepad.axes[2]} y={gamepad.axes[3]} label="Right Stick" pressed={gamepad.buttons[11]?.pressed} />
                                        </div>
                                    </>
                                )}

                                {/* Center Operations Area */}
                                <div className="absolute left-1/2 top-[22%] -translate-x-1/2 flex flex-col items-center gap-6 z-30">
                                    <div className="flex gap-10">
                                        <ButtonNode index={8} className="w-16 h-5 border-white/20 rounded-full opacity-60" />
                                        <ButtonNode index={9} className="w-16 h-5 border-white/20 rounded-full opacity-60" />
                                    </div>

                                    {/* Vibration Guide Button */}
                                    <div className="relative group/vibrate">
                                        <div className={cn(
                                            "absolute -inset-4 rounded-full blur-2xl transition-opacity duration-500",
                                            isVibrating ? "bg-white/40 opacity-100" : "bg-white/5 opacity-0 group-hover/vibrate:opacity-20"
                                        )} />
                                        <Button
                                            onClick={testRumble}
                                            disabled={isVibrating || isBrandMismatch}
                                            className={cn(
                                                "w-20 h-20 rounded-full border-[6px] flex flex-col items-center justify-center gap-1 transition-all duration-300 relative z-10",
                                                isBrandMismatch ? "opacity-20 grayscale cursor-not-allowed" : "bg-gradient-to-b from-white/20 to-white/5 border-white/40 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-white/60 hover:scale-105 active:scale-95",
                                                isVibrating ? "animate-shake bg-white/20 border-white" : ""
                                            )}
                                        >
                                            <Zap size={24} className={cn("transition-transform duration-500", isVibrating ? "text-white animate-pulse" : "text-white/20")} />
                                            <span className="text-[7px] font-black uppercase tracking-tighter opacity-10">VIB</span>
                                        </Button>
                                    </div>

                                    {/* Touchpad / Logo Area */}
                                    <div className="w-32 h-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center -mt-2">
                                        <div className="size-5 rounded-full bg-white/[0.02] border border-white/5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brand Meta */}
                    <div className="absolute bottom-12 flex flex-col items-center gap-1.5 opacity-40">
                        <Activity size={18} className="text-blue-400" />
                        <span className="text-[10px] font-black tracking-[0.5em] uppercase italic text-white/60">Hardware Interaction Unit</span>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="lg:col-span-4 h-full">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-800 border border-white/10 shadow-2xl relative overflow-hidden group h-full text-white">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transform group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                            <Gamepad2 size={120} />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-8">
                                <Activity size={16} className="text-blue-200" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Live Feed</h3>
                            </div>

                            <div className="flex-1 min-h-0 space-y-4">
                                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Latency</span>
                                        <span className="text-xs font-mono font-bold text-white">~4ms</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-1/4 h-full bg-emerald-400" />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Stick Drift</span>
                                        <span className="text-xs font-mono font-bold text-white">LOW</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className={cn("flex-1 h-1 rounded-full", i < 5 ? "bg-emerald-400" : "bg-white/10")} />)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <Info size={14} /> Hardware Tips
                                    </div>
                                    <ul className="text-[10px] font-bold text-blue-100/40 space-y-2 leading-relaxed">
                                        <li>• Test buttons for "ghost" presses.</li>
                                        <li>• Check analog stick circularity.</li>
                                        <li>• Verify trigger pressure sensitivity.</li>
                                        <li>• Some browsers require a re-plug if the rumble fails.</li>
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
