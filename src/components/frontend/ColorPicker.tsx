import { useState } from "react";
import { Palette, Copy } from "lucide-react";
import toast from "react-hot-toast";

export function ColorPicker() {
    const [color, setColor] = useState("#3b82f6");

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Palette className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Color Picker</h3>
                    <p className="text-sm text-white/50">Pick and convert colors</p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div
                    className="w-full h-40 rounded-3xl shadow-2xl border border-white/10"
                    style={{ backgroundColor: color }}
                />

                <div className="flex items-center gap-6 p-6 rounded-2xl bg-black/40 border border-white/5">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-16 h-16 rounded-xl bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                    />
                    <div className="flex-grow relative">
                        <input
                            readOnly
                            value={color.toUpperCase()}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 font-mono text-lg text-white"
                        />
                        <button
                            onClick={() => { navigator.clipboard.writeText(color); toast.success("Copied!"); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 hover:bg-white/10 rounded-xl text-white/50 transition-colors"
                        >
                            <Copy size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
