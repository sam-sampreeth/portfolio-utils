import { useState } from "react";
import { Box, Copy } from "lucide-react";
import toast from "react-hot-toast";

export function ShadowGen() {
    const [blur, setBlur] = useState(20);
    const [opacity, setOpacity] = useState(0.2);
    const [spread, setSpread] = useState(0);

    const shadow = `0 10px ${blur}px ${spread}px rgba(59, 130, 246, ${opacity})`;

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <Box className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Shadow Generator</h3>
                    <p className="text-sm text-white/50">Visualize and copy box shadows</p>
                </div>
            </div>

            <div className="flex flex-col gap-10">
                <div className="flex items-center justify-center py-12 px-6 rounded-3xl bg-black/20 border border-white/5">
                    <div
                        className="w-40 h-40 bg-primary/20 rounded-3xl border border-primary/40 transition-all duration-300"
                        style={{ boxShadow: shadow }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6 p-6 rounded-2xl bg-black/40 border border-white/5">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Blur</label>
                                <span className="text-xs text-primary font-mono">{blur}px</span>
                            </div>
                            <input type="range" min="0" max="100" value={blur} onChange={e => setBlur(parseInt(e.target.value))} className="w-full accent-primary" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Spread</label>
                                <span className="text-xs text-primary font-mono">{spread}px</span>
                            </div>
                            <input type="range" min="-20" max="50" value={spread} onChange={e => setSpread(parseInt(e.target.value))} className="w-full accent-primary" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Opacity</label>
                                <span className="text-xs text-primary font-mono">{opacity}</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="w-full accent-primary" />
                        </div>
                    </div>

                    <div className="flex flex-col justify-center gap-4">
                        <div className="relative group">
                            <pre className="p-6 bg-black/60 border border-white/10 rounded-2xl text-xs text-orange-400 font-mono overflow-x-auto leading-relaxed">
                                box-shadow: {shadow};
                            </pre>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`box-shadow: ${shadow};`);
                                    toast.success("Shadow Copied!");
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
