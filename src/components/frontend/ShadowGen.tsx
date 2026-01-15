import { useState } from "react";
import { Box, Copy, Plus, Trash2, Layers, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

type ShadowLayer = {
    id: string;
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
    opacity: number;
    inset: boolean;
};

const PRESETS = [
    {
        name: "Soft",
        layers: [
            { id: "1", x: 0, y: 4, blur: 6, spread: -1, color: "#3b82f6", opacity: 0.15, inset: false },
            { id: "2", x: 0, y: 2, blur: 4, spread: -1, color: "#3b82f6", opacity: 0.1, inset: false }
        ]
    },
    {
        name: "Crisp",
        layers: [
            { id: "1", x: 0, y: 0, blur: 0, spread: 1, color: "#8b5cf6", opacity: 0.2, inset: false },
            { id: "2", x: 0, y: 1, blur: 2, spread: 0, color: "#8b5cf6", opacity: 0.3, inset: false }
        ]
    },
    {
        name: "Neon",
        layers: [
            { id: "1", x: 0, y: 0, blur: 10, spread: 2, color: "#06b6d4", opacity: 0.4, inset: false },
            { id: "2", x: 0, y: 0, blur: 20, spread: 5, color: "#3b82f6", opacity: 0.3, inset: false }
        ]
    },
    {
        name: "Material",
        layers: [
            { id: "1", x: 0, y: 3, blur: 6, spread: 0, color: "#6366f1", opacity: 0.2, inset: false },
            { id: "2", x: 0, y: 3, blur: 6, spread: 0, color: "#6366f1", opacity: 0.3, inset: false }
        ]
    }
];

export function ShadowGen() {
    const [layers, setLayers] = useState<ShadowLayer[]>([
        { id: "1", x: 0, y: 10, blur: 20, spread: 0, color: "#3b82f6", opacity: 0.2, inset: false }
    ]);
    const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const generateCSS = () => {
        return layers.map(l =>
            `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`
        ).join(", ");
    };

    const css = `box-shadow: ${generateCSS()};`; // Fixed for full declaration

    const addLayer = () => {
        setLayers([...layers, {
            id: Math.random().toString(36).substr(2, 9),
            x: 0,
            y: 4,
            blur: 10,
            spread: 0,
            color: "#000000",
            opacity: 0.1,
            inset: false
        }]);
    };

    const removeLayer = (id: string) => {
        if (layers.length > 1) {
            setLayers(layers.filter(l => l.id !== id));
        } else {
            toast.error("Keep at least one layer");
        }
    };

    const updateLayer = (id: string, updates: Partial<ShadowLayer>) => {
        setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Box size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Shadow Generator</h2>
                    <p className="text-white/50 font-medium">Design Complex, Layered Shadows</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Preview */}
                <div className="lg:col-span-7 space-y-6">
                    <div className={`w-full aspect-square lg:aspect-video rounded-[2.5rem] shadow-2xl relative flex items-center justify-center overflow-hidden transition-colors duration-500 ${previewTheme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-[#e5e7eb]'}`}>
                        {/* Grid and Dots pattern for depth */}
                        <div className={`absolute inset-0 [background-size:20px_20px] transition-all duration-500 ${previewTheme === 'dark' ? 'bg-[radial-gradient(#ffffff08_1px,transparent_1px)]' : 'bg-[radial-gradient(#00000008_1px,transparent_1px)]'}`} />

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setPreviewTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                            className={`absolute top-6 right-6 p-3 rounded-xl border transition-all duration-300 ${previewTheme === 'dark'
                                ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                                : 'bg-white/60 border-black/5 text-black/60 hover:text-black hover:bg-white'
                                }`}
                            title="Toggle Preview Theme"
                        >
                            {previewTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div
                            className={`w-40 h-40 lg:w-64 lg:h-64 rounded-3xl transition-all duration-300 border ${previewTheme === 'dark'
                                ? 'bg-[#1a1a1a] border-white/5'
                                : 'bg-white border-black/5'
                                }`}
                            style={{ boxShadow: generateCSS() }}
                        />
                    </div>

                    {/* CSS Output */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
                        <div className="relative flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                            <code className="flex-1 font-mono text-xs sm:text-sm text-blue-300 truncate pr-4">
                                {css}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(css);
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

                {/* Controls */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Presets */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Presets</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {PRESETS.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => setLayers(preset.layers.map((l, i) => ({ ...l, id: Date.now().toString() + i })))}
                                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400 hover:text-blue-300 transition-all whitespace-nowrap"
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Layers Control */}
                    <div className="p-6 rounded-[2rem] bg-black/40 border border-white/10 space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <Layers size={14} /> Layers
                            </label>
                            <button
                                onClick={addLayer}
                                className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-colors"
                            >
                                <Plus size={12} /> Add Layer
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {layers.map((layer, index) => (
                                <div key={layer.id} className="p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all space-y-4 group">
                                    <div className="flex items-center justify-between text-xs font-medium text-white/50">
                                        <span>Layer {index + 1}</span>
                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={layer.inset}
                                                    onChange={(e) => updateLayer(layer.id, { inset: e.target.checked })}
                                                    className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                                                />
                                                Inset
                                            </label>
                                            {layers.length > 1 && (
                                                <button onClick={() => removeLayer(layer.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sliders Grid */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-white/30">
                                                <span>X Offset</span>
                                                <span className="text-white/60">{layer.x}px</span>
                                            </div>
                                            <input
                                                type="range" min="-50" max="50" value={layer.x}
                                                onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) })}
                                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-white/30">
                                                <span>Y Offset</span>
                                                <span className="text-white/60">{layer.y}px</span>
                                            </div>
                                            <input
                                                type="range" min="-50" max="50" value={layer.y}
                                                onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) })}
                                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-white/30">
                                                <span>Blur</span>
                                                <span className="text-white/60">{layer.blur}px</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100" value={layer.blur}
                                                onChange={(e) => updateLayer(layer.id, { blur: Number(e.target.value) })}
                                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-white/30">
                                                <span>Spread</span>
                                                <span className="text-white/60">{layer.spread}px</span>
                                            </div>
                                            <input
                                                type="range" min="-50" max="50" value={layer.spread}
                                                onChange={(e) => updateLayer(layer.id, { spread: Number(e.target.value) })}
                                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Color & Opacity */}
                                    <div className="pt-2 border-t border-white/5 grid grid-cols-[auto_1fr] gap-4 items-center">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-sm shrink-0">
                                            <input
                                                type="color"
                                                value={layer.color}
                                                onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                                                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-white/30">
                                                <span>Opacity</span>
                                                <span className="text-white/60">{Math.round(layer.opacity * 100)}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="1" step="0.01" value={layer.opacity}
                                                onChange={(e) => updateLayer(layer.id, { opacity: Number(e.target.value) })}
                                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
