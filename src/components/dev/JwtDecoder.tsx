import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export function JwtDecoder() {
    const [token, setToken] = useState("");
    const [decoded, setDecoded] = useState<{ header: any, payload: any } | null>(null);

    const decodeJwt = () => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) throw new Error("Invalid JWT");
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            setDecoded({ header, payload });
            toast.success("JWT Decoded");
        } catch (e) {
            toast.error("Invalid JWT Token");
            setDecoded(null);
        }
    };

    return (
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold">JWT Decoder</h3>
            </div>

            <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your JWT here..."
                className="w-full min-h-[80px] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary mb-4 text-white"
            />
            <button
                onClick={decodeJwt}
                className="w-full py-3 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/20 font-bold hover:bg-orange-500 hover:text-white transition-all mb-6"
            >
                Decode Token
            </button>

            {decoded && (
                <div className="space-y-4">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Header</div>
                        <pre className="p-3 bg-black/40 rounded-lg text-[10px] text-pink-400 font-mono overflow-auto border border-white/5 max-h-[100px]">
                            {JSON.stringify(decoded.header, null, 2)}
                        </pre>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Payload</div>
                        <pre className="p-3 bg-black/40 rounded-lg text-[10px] text-blue-400 font-mono overflow-auto border border-white/5 max-h-[150px]">
                            {JSON.stringify(decoded.payload, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
