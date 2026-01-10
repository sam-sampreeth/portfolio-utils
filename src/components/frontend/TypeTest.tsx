import { useState } from "react";
import { Type, RotateCcw } from "lucide-react";

export function TypeTest() {
    const [size, setSize] = useState(32);
    const fonts = ["Inter", "system-ui", "serif", "monospace", "Outfit"];
    const [font, setFont] = useState(fonts[0]);
    const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Type className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Typography Tester</h3>
                        <p className="text-sm text-white/50">Preview fonts and sizes</p>
                    </div>
                </div>
                <button
                    onClick={() => { setSize(32); setFont(fonts[0]); }}
                    className="p-3 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-colors"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Font Family</label>
                            <select
                                value={font}
                                onChange={e => setFont(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                {fonts.map(f => <option key={f} value={f} className="bg-neutral-900">{f}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Font Size ({size}px)</label>
                            <input type="range" min="12" max="120" value={size} onChange={e => setSize(parseInt(e.target.value))} className="w-full accent-primary" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-8 bg-black/40 border border-white/5 rounded-3xl min-h-[300px] text-white focus:outline-none focus:border-primary/30 transition-colors resize-none overflow-hidden"
                        style={{ fontSize: `${size}px`, fontFamily: font }}
                        placeholder="Type something here..."
                    />
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <span>Characters: {text.length}</span>
                        <span>Words: {text.trim().split(/\s+/).length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
