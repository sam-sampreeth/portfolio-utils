
import { useState, useEffect } from "react";
import { ArrowLeftRight, Check, Copy, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export function CssUnitsConverter() {
    const [baseSize, setBaseSize] = useState<number>(16);
    const [px, setPx] = useState<string>("16");
    const [rem, setRem] = useState<string>("1");
    const [em, setEm] = useState<string>("1");
    const [percent, setPercent] = useState<string>("100");
    const [vw, setVw] = useState<string>("");

    // Viewport dimensions for VW/VH calculation (default to standard 1920x1080 if not specified, 
    // but in a real converter we usually just want the ratio or treat inputs as independent. 
    // For this simple converter, maybe we omit VW/VH or treat them as independent inputs if we had a viewport width input.
    // Let's stick to PX/REM/EM/% for the main synchronized group, and maybe a separate section for Viewport units if needed.
    // Actually, usually users want to convert PX to VW based on a design width.
    const [designWidth, setDesignWidth] = useState<number>(1920);

    const [lastEdited, setLastEdited] = useState<"px" | "rem" | "em" | "percent" | "vw">("px");

    const formatNumber = (num: number): string => {
        // Remove trailing zeros, max 4 decimals
        return Number(num.toFixed(4)).toString();
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label} value!`);
    };

    // Conversion logic
    useEffect(() => {
        const base = baseSize || 16;
        const width = designWidth || 1920;

        if (lastEdited === "px") {
            const val = parseFloat(px);
            if (!isNaN(val)) {
                setRem(formatNumber(val / base));
                setEm(formatNumber(val / base));
                setPercent(formatNumber((val / base) * 100));
                setVw(formatNumber((val / width) * 100));
            } else {
                setRem(""); setEm(""); setPercent(""); setVw("");
            }
        } else if (lastEdited === "rem") {
            const val = parseFloat(rem);
            if (!isNaN(val)) {
                setPx(formatNumber(val * base));
                setEm(formatNumber(val));
                setPercent(formatNumber(val * 100));
                setVw(formatNumber((val * base / width) * 100));
            } else {
                setPx(""); setEm(""); setPercent(""); setVw("");
            }
        } else if (lastEdited === "em") {
            const val = parseFloat(em);
            if (!isNaN(val)) {
                setPx(formatNumber(val * base));
                setRem(formatNumber(val));
                setPercent(formatNumber(val * 100));
                setVw(formatNumber((val * base / width) * 100));
            } else {
                setPx(""); setRem(""); setPercent(""); setVw("");
            }
        } else if (lastEdited === "percent") {
            const val = parseFloat(percent);
            if (!isNaN(val)) {
                setPx(formatNumber(val / 100 * base));
                setRem(formatNumber(val / 100));
                setEm(formatNumber(val / 100));
                setVw(formatNumber((val / 100 * base / width) * 100));
            } else {
                setPx(""); setRem(""); setEm(""); setVw("");
            }
        } else if (lastEdited === "vw") {
            const val = parseFloat(vw);
            if (!isNaN(val)) {
                const pxVal = (val / 100) * width;
                setPx(formatNumber(pxVal));
                setRem(formatNumber(pxVal / base));
                setEm(formatNumber(pxVal / base));
                setPercent(formatNumber((pxVal / base) * 100));
            } else {
                setPx(""); setRem(""); setEm(""); setPercent("");
            }
        }
    }, [px, rem, em, percent, vw, baseSize, designWidth, lastEdited]);

    const InputGroup = ({ label, value, onChange, unit, onCopy }: {
        label: string,
        value: string,
        onChange: (val: string) => void,
        unit: string,
        onCopy: () => void
    }) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/60">{label}</label>
            <div className="relative group">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-12 bg-black/40 border border-white/20 rounded-xl px-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono placeholder-white/20"
                    placeholder="0"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-white/40 text-xs font-bold pointer-events-none">{unit}</span>
                    {value && (
                        <button
                            onClick={onCopy}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Copy size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-8">
                {/* Configuration Panel (Sidebar) */}
                <div className="lg:col-span-4 space-y-6 lg:order-2">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 border border-white/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 transform group-hover:rotate-0 transition-transform duration-700">
                            <RefreshCw size={140} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">
                                    Configuration
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Base Size (PX)</label>
                                        <input
                                            type="number"
                                            value={baseSize}
                                            onChange={(e) => setBaseSize(parseFloat(e.target.value) || 16)}
                                            className="w-full h-12 bg-black/40 border border-white/20 rounded-2xl px-4 text-white font-black text-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-center placeholder-white/20"
                                            placeholder="16"
                                        />
                                        <p className="text-[10px] text-white/60 font-bold leading-tight">
                                            Normally 16px. Used to calculate REM/EM values.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Design Width (PX)</label>
                                        <input
                                            type="number"
                                            value={designWidth}
                                            onChange={(e) => setDesignWidth(parseFloat(e.target.value) || 1920)}
                                            className="w-full h-12 bg-black/40 border border-white/20 rounded-2xl px-4 text-white font-black text-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-center placeholder-white/20"
                                            placeholder="1920"
                                        />
                                        <p className="text-[10px] text-white/60 font-bold leading-tight">
                                            Used to calculate Viewport Width (VW).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10">
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">
                                    Quick Reference
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-white/80 font-bold">16px</span>
                                        <span className="font-mono font-black text-white">1rem</span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-white/80 font-bold">24px</span>
                                        <span className="font-mono font-black text-white">1.5rem</span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-white/80 font-bold">32px</span>
                                        <span className="font-mono font-black text-white">2rem</span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-white/80 font-bold">8px</span>
                                        <span className="font-mono font-black text-white">0.5rem</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Inputs Area */}
                <div className="lg:col-span-7 space-y-8 lg:order-1">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <ArrowLeftRight className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Converter</h2>
                                <p className="text-white/40 text-sm font-medium">Type in any field to convert</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <InputGroup
                                label="Pixels"
                                value={px}
                                onChange={(val) => { setPx(val); setLastEdited("px"); }}
                                unit="px"
                                onCopy={() => handleCopy(px + "px", "Pixels")}
                            />
                            <InputGroup
                                label="REM"
                                value={rem}
                                onChange={(val) => { setRem(val); setLastEdited("rem"); }}
                                unit="rem"
                                onCopy={() => handleCopy(rem + "rem", "REM")}
                            />
                            <InputGroup
                                label="EM"
                                value={em}
                                onChange={(val) => { setEm(val); setLastEdited("em"); }}
                                unit="em"
                                onCopy={() => handleCopy(em + "em", "EM")}
                            />
                            <InputGroup
                                label="Percentage"
                                value={percent}
                                onChange={(val) => { setPercent(val); setLastEdited("percent"); }}
                                unit="%"
                                onCopy={() => handleCopy(percent + "%", "Percentage")}
                            />
                            <InputGroup
                                label="Viewport Width"
                                value={vw}
                                onChange={(val) => { setVw(val); setLastEdited("vw"); }}
                                unit="vw"
                                onCopy={() => handleCopy(vw + "vw", "Viewport Width")}
                            />
                        </div>

                        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-blue-300/60 text-xs font-bold leading-relaxed flex items-start gap-3">
                            <Check size={16} className="shrink-0 mt-0.5" />
                            <p>Values are calculated in real-time. Copy buttons appear when a value is present. Viewport width calculations depend on the Design Width setting.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
