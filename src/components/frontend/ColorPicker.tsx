import { useState, useEffect } from "react";
import { Palette, Copy, Hash } from "lucide-react";
import toast from "react-hot-toast";

// --- Color Conversion Helpers ---

function hexToRgb(hex: string) {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return {
            r: (c >> 16) & 255,
            g: (c >> 8) & 255,
            b: c & 255
        }
    }
    return null;
}

function rgbToHex(r: number, g: number, b: number) {
    const toHex = (n: number) => {
        const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function rgbToCmyk(r: number, g: number, b: number) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));

    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);

    if (isNaN(c)) c = 0;
    if (isNaN(m)) m = 0;
    if (isNaN(y)) y = 0;
    if (isNaN(k)) k = 1;

    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}


export function ColorPicker() {
    // Master state: HEX is the source of truth for simplicity in this implementation
    const [hex, setHex] = useState("#3b82f6");

    // Derived states for display
    const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
    const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
    const [cmyk, setCmyk] = useState({ c: 76, m: 47, y: 0, k: 4 });

    // Update all derived states when HEX changes (and is valid)
    useEffect(() => {
        const rgbVal = hexToRgb(hex);
        if (rgbVal) {
            setRgb(rgbVal);
            setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
            setCmyk(rgbToCmyk(rgbVal.r, rgbVal.g, rgbVal.b));
        }
    }, [hex]);

    const handleHexChange = (val: string) => {
        if (val.startsWith("#")) {
            setHex(val);
        } else {
            setHex("#" + val);
        }
    };

    const handleRgbChange = (key: 'r' | 'g' | 'b', val: string) => {
        const num = parseInt(val) || 0;
        const newRgb = { ...rgb, [key]: num };
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label}!`);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-8">
                {/* Sidebar: Configuration & Input */}
                <div className="lg:col-span-4 space-y-6 lg:order-1">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-800 border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 transform group-hover:rotate-0 transition-transform duration-700">
                            <Palette size={140} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-4">
                                    Input Color
                                </h3>
                                <div className="space-y-6">
                                    {/* HEX Input */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60">HEX Code</label>
                                        <div className="relative">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                            <input
                                                type="text"
                                                value={hex.replace("#", "")}
                                                onChange={(e) => handleHexChange(e.target.value)}
                                                className="w-full h-12 bg-black/20 border border-white/20 rounded-2xl pl-10 pr-4 text-white font-black text-lg focus:outline-none focus:ring-1 focus:ring-white/50 uppercase placeholder-white/20"
                                                maxLength={6}
                                            />
                                        </div>
                                    </div>

                                    {/* Picker */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Color Picker</label>
                                        <div className="flex gap-4 items-center p-2 bg-black/20 border border-white/20 rounded-2xl">
                                            <input
                                                type="color"
                                                value={hex}
                                                onChange={(e) => setHex(e.target.value)}
                                                className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0 overflow-hidden shrink-0"
                                            />
                                            <span className="text-white/60 text-xs font-bold">Click circle to pick</span>
                                        </div>
                                    </div>

                                    {/* RGB Inputs */}
                                    <div className="space-y-2 pt-4 border-t border-white/10">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60">RGB Values</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['r', 'g', 'b'].map((k) => (
                                                <div key={k} className="relative">
                                                    <label className="absolute top-1 left-2 text-[8px] font-bold text-white/40 uppercase">{k}</label>
                                                    <input
                                                        type="number"
                                                        value={rgb[k as keyof typeof rgb]}
                                                        onChange={(e) => handleRgbChange(k as any, e.target.value)}
                                                        className="w-full h-10 bg-black/20 border border-white/20 rounded-xl px-2 pt-3 text-white font-bold text-sm focus:outline-none focus:ring-1 focus:ring-white/50 text-center"
                                                        min={0} max={255}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Area: Preview & Conversion */}
                <div className="lg:col-span-7 space-y-8 lg:order-2">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 shadow-2xl space-y-8">

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <Palette className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Format Converter</h2>
                                <p className="text-white/40 text-sm font-medium">Instantly convert between color formats</p>
                            </div>
                        </div>

                        {/* Large Preview */}
                        <div
                            className="w-full h-32 rounded-3xl border border-white/10 shadow-inner relative group transition-all duration-500"
                            style={{ backgroundColor: hex }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px] rounded-3xl">
                                <span className="text-white font-black text-xl drop-shadow-lg uppercase tracking-widest">{hex}</span>
                            </div>
                        </div>

                        {/* Conversions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* HEX */}
                            <div className="group relative p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1 block">HEX</label>
                                <div className="text-white font-mono text-xl font-bold uppercase">{hex}</div>
                                <button onClick={() => copyToClipboard(hex, "HEX")} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
                                    <Copy size={16} />
                                </button>
                            </div>

                            {/* RGB */}
                            <div className="group relative p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1 block">RGB</label>
                                <div className="text-white font-mono text-xl font-bold">rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
                                <button onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "RGB")} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
                                    <Copy size={16} />
                                </button>
                            </div>

                            {/* HSL */}
                            <div className="group relative p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1 block">HSL</label>
                                <div className="text-white font-mono text-xl font-bold">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
                                <button onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "HSL")} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
                                    <Copy size={16} />
                                </button>
                            </div>

                            {/* CMYK */}
                            <div className="group relative p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1 block">CMYK</label>
                                <div className="text-white font-mono text-xl font-bold">cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%)</div>
                                <button onClick={() => copyToClipboard(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, "CMYK")} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>

                        {/* CSS Copier */}
                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/30 transition-all mt-4 relative group cursor-pointer" onClick={() => copyToClipboard(`color: ${hex};`, "CSS")}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Hash size={16} />
                                </div>
                                <div className="font-mono text-sm text-blue-100">
                                    color: <span className="font-bold text-white">{hex}</span>;
                                </div>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to Copy
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
