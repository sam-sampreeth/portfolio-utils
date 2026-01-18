import { useState } from "react";
import { Blend as Wand2, Copy, Plus, Trash2, Shuffle } from "lucide-react";
import toast from "react-hot-toast";

type GradientType = "linear" | "radial";
type ColorStop = { id: string; color: string; position: number };

const POPULAR_GRADIENTS = [
    { name: "Hyper", stops: [{ color: "#ec4899", position: 0 }, { color: "#8b5cf6", position: 100 }], type: "linear", angle: 135 },
    { name: "Oceanic", stops: [{ color: "#06b6d4", position: 0 }, { color: "#3b82f6", position: 100 }], type: "linear", angle: 135 },
    { name: "Sunset", stops: [{ color: "#f97316", position: 0 }, { color: "#ec4899", position: 100 }], type: "linear", angle: 45 },
    { name: "Mint", stops: [{ color: "#34d399", position: 0 }, { color: "#3b82f6", position: 100 }], type: "linear", angle: 135 },
    { name: "Black & Blue", stops: [{ color: "#000000", position: 0 }, { color: "#2563eb", position: 100 }], type: "linear", angle: 135 },
    { name: "Midnight", stops: [{ color: "#1e1b4b", position: 0 }, { color: "#4f46e5", position: 100 }], type: "linear", angle: 180 },
    { name: "Aurora", stops: [{ color: "#00c6ff", position: 0 }, { color: "#0072ff", position: 100 }], type: "linear", angle: 90 },
    { name: "Fire", stops: [{ color: "#f12711", position: 0 }, { color: "#f5af19", position: 100 }], type: "linear", angle: 90 },
];

export function GradientGen() {
    const [type, setType] = useState<GradientType>("linear");
    const [angle, setAngle] = useState(135);
    const [stops, setStops] = useState<ColorStop[]>([
        { id: "1", color: "#3b82f6", position: 0 },
        { id: "2", color: "#8b5cf6", position: 100 },
    ]);

    const generateCSS = (gType: GradientType, gAngle: number, gStops: { color: string; position: number }[]) => {
        const stopsStr = gStops
            .sort((a, b) => a.position - b.position)
            .map((s) => `${s.color} ${s.position}%`)
            .join(", ");

        if (gType === "linear") {
            return `linear-gradient(${gAngle}deg, ${stopsStr})`;
        } else {
            return `radial-gradient(circle, ${stopsStr})`;
        }
    };

    const css = generateCSS(type, angle, stops);

    const addStop = () => {
        const newStop: ColorStop = {
            id: Math.random().toString(36).substr(2, 9),
            color: "#ffffff",
            position: 50,
        };
        setStops([...stops, newStop]);
    };

    const removeStop = (id: string) => {
        if (stops.length <= 2) {
            toast.error("Minimum 2 colors required");
            return;
        }
        setStops(stops.filter((s) => s.id !== id));
    };

    const updateStop = (id: string, updates: Partial<ColorStop>) => {
        setStops(stops.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    };

    const randomize = () => {
        const randomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        setAngle(Math.floor(Math.random() * 360));
        setStops(stops.map(s => ({ ...s, color: randomColor() })));
        toast.success("Randomized!");
    };

    const loadPreset = (preset: typeof POPULAR_GRADIENTS[0]) => {
        setType(preset.type as GradientType);
        setAngle(preset.angle);
        setStops(preset.stops.map((s, i) => ({ ...s, id: i.toString() })));
        toast.success(`Loaded ${preset.name}`);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <Wand2 size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Gradient Generator</h2>
                    <p className="text-white/50 font-medium">Design & Export CSS Gradients</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Preview Area */}
                <div className="w-full lg:col-span-7 space-y-6">
                    <div
                        className="w-full aspect-square lg:aspect-video rounded-[2.5rem] bg-black/40 shadow-2xl relative overflow-hidden group transition-all"
                        style={{ background: css }}
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 pointer-events-none" />
                    </div>

                    {/* CSS Output */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
                        <div className="relative flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                            <code className="flex-1 font-mono text-sm text-blue-300 truncate pr-4">
                                background: {css};
                            </code>
                            <div className="flex gap-2">
                                <button
                                    onClick={randomize}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                                    title="Randomize Colors"
                                >
                                    <Shuffle size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`background: ${css};`);
                                        toast.success("CSS Copied!");
                                    }}
                                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors font-medium flex items-center gap-2"
                                >
                                    <Copy size={16} />
                                    <span className="hidden sm:inline">Copy</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Sidebar */}
                <div className="w-full lg:col-span-5 space-y-8">
                    {/* Main Controls */}
                    <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 border border-white/20 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Type</label>
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                    {(["linear", "radial"] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${type === t ? "bg-blue-500/20 text-blue-400 shadow-sm border border-blue-500/20" : "text-white/30 hover:text-white/60"
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {type === "linear" && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Angle ({angle}°)</label>
                                    <div className="flex items-center h-[42px] px-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            value={angle}
                                            onChange={(e) => setAngle(Number(e.target.value))}
                                            className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Color Stops */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Color Stops</label>
                                <button
                                    onClick={addStop}
                                    className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-colors"
                                >
                                    <Plus size={12} /> Add Color
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {stops.map((stop) => (
                                    <div key={stop.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group border border-white/5 hover:border-white/20 transition-colors">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border border-white/10 shrink-0">
                                            <input
                                                type="color"
                                                value={stop.color}
                                                onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                                                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between text-xs text-white/70 font-medium">
                                                <span>{stop.color.toUpperCase()}</span>
                                                <span>{stop.position}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={stop.position}
                                                onChange={(e) => updateStop(stop.id, { position: Number(e.target.value) })}
                                                className="w-full accent-blue-400 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                        {stops.length > 2 && (
                                            <button
                                                onClick={() => removeStop(stop.id)}
                                                className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Popular Gradients */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60 px-1">Popular Presets</label>
                        <div className="grid grid-cols-4 gap-3">
                            {POPULAR_GRADIENTS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => loadPreset(preset)}
                                    className="group space-y-2 text-left"
                                >
                                    <div
                                        className="w-full aspect-square rounded-2xl shadow-lg ring-1 ring-white/10 group-hover:scale-95 transition-transform"
                                        style={{
                                            background: generateCSS(preset.type as GradientType, preset.angle, preset.stops)
                                        }}
                                    />
                                    <p className="text-[10px] font-medium text-center text-white/60 group-hover:text-white transition-colors truncate">
                                        {preset.name}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
