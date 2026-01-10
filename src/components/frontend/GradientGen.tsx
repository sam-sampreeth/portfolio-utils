import { useState } from "react";
import { Wand2, Copy } from "lucide-react";
import toast from "react-hot-toast";

export function GradientGen() {
    const [c1, setC1] = useState("#3b82f6");
    const [c2, setC2] = useState("#8b5cf6");
    const [dir, setDir] = useState("to right");

    const css = `linear-gradient(${dir}, ${c1}, ${c2})`;

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Wand2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Gradient Generator</h3>
                    <p className="text-sm text-white/50">Create beautiful CSS gradients</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div
                    className="w-full aspect-square lg:aspect-auto h-full min-h-[300px] rounded-3xl border border-white/10 shadow-2xl"
                    style={{ background: css }}
                />

                <div className="flex flex-col justify-center space-y-6">
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Color 1</label>
                                <input type="color" value={c1} onChange={e => setC1(e.target.value)} className="w-full h-12 bg-transparent cursor-pointer" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Color 2</label>
                                <input type="color" value={c2} onChange={e => setC2(e.target.value)} className="w-full h-12 bg-transparent cursor-pointer" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Direction</label>
                            <select
                                value={dir}
                                onChange={e => setDir(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="to right" className="bg-neutral-900">To Right</option>
                                <option value="to bottom" className="bg-neutral-900">To Bottom</option>
                                <option value="to bottom right" className="bg-neutral-900">Diagonal</option>
                                <option value="to top" className="bg-neutral-900">To Top</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative group">
                        <pre className="p-6 bg-black/60 border border-white/10 rounded-2xl text-xs text-purple-400 font-mono overflow-x-auto leading-relaxed">
                            background: {css};
                        </pre>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`background: ${css};`);
                                toast.success("CSS Copied!");
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
