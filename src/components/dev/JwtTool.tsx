import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Check, AlertCircle, Key, FileJson, ShieldCheck, Copy, Clock, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

import * as CryptoJS from 'crypto-js';

// If Tabs components don't exist in local UI folder, I'll use Radix primitives directly or simple state.
// Since I used Tabs in Generators.tsx, they should exist or I can check.
// Checking Generators.tsx showed use of Radix Tabs directly.

import * as TabsPrimitive from "@radix-ui/react-tabs";

export function JwtTool() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">JWT Tool</h1>
                    <p className="text-white/40">Sign, decode, and verify JSON Web Tokens</p>
                </div>
            </div>

            <TabsPrimitive.Root defaultValue="decode" className="space-y-6">
                <TabsPrimitive.List className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-white/5 w-fit">
                    <TabTrigger value="decode">Decode</TabTrigger>
                    <TabTrigger value="encode">Encode</TabTrigger>
                </TabsPrimitive.List>

                <TabsPrimitive.Content value="decode">
                    <Decoder />
                </TabsPrimitive.Content>

                <TabsPrimitive.Content value="encode">
                    <Encoder />
                </TabsPrimitive.Content>
            </TabsPrimitive.Root>
        </div>
    );
}

function TabTrigger({ value, children }: { value: string, children: React.ReactNode }) {
    return (
        <TabsPrimitive.Trigger
            value={value}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white/50 transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:text-white/80"
        >
            {children}
        </TabsPrimitive.Trigger>
    );
}

// --- Decoder Component (Refactored from previous JwtDecoder) ---
function Decoder() {
    const [token, setToken] = useState("");
    const [header, setHeader] = useState<any>(null);
    const [payload, setPayload] = useState<any>(null);
    const [signature, setSignature] = useState("");
    const [isValid, setIsValid] = useState(true);
    const [error, setError] = useState("");
    const [isExpired, setIsExpired] = useState(false);
    const [expDate, setExpDate] = useState<Date | null>(null);

    useEffect(() => {
        if (!token.trim()) {
            setHeader(null);
            setPayload(null);
            setSignature("");
            setIsValid(true);
            setError("");
            setIsExpired(false);
            setExpDate(null);
            return;
        }

        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error("Invalid JWT structure");
            }

            try {
                const h = JSON.parse(atob(parts[0]));
                setHeader(h);
            } catch (e) {
                throw new Error("Invalid Header encoding");
            }

            const p = jwtDecode<any>(token);
            setPayload(p);
            setSignature(parts[2]);

            if (p.exp) {
                const exp = new Date(p.exp * 1000);
                setExpDate(exp);
                setIsExpired(exp < new Date());
            } else {
                setExpDate(null);
                setIsExpired(false);
            }

            setIsValid(true);
            setError("");
        } catch (err: any) {
            setIsValid(false);
            setError(err.message || "Invalid JWT Token");
            const parts = token.split('.');
            if (parts[0]) try { setHeader(JSON.parse(atob(parts[0]))) } catch { }
            if (parts[1]) try { setPayload(JSON.parse(atob(parts[1]))) } catch { }
        }
    }, [token]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white/80 flex items-center gap-2">
                        Encoded Token
                        {!isValid && <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded flex items-center gap-1"><AlertCircle size={12} /> {error}</span>}
                        {isValid && token && <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded flex items-center gap-1"><Check size={12} /> Valid Structure</span>}
                    </h2>
                </div>
                <textarea
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste encoded JWT..."
                    className={`w-full h-[600px] bg-slate-950/50 border rounded-2xl p-6 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 resize-none transition-all ${isValid ? 'border-blue-500/20 focus:ring-blue-500/50' : 'border-red-500/20 focus:ring-red-500/50'}`}
                    spellCheck={false}
                />
            </div>

            <div className="space-y-6">
                {isValid && expDate && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${isExpired ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                        {isExpired ? <AlertTriangle size={20} /> : <Clock size={20} />}
                        <div className="flex-1">
                            <p className="font-bold text-sm tracking-wide uppercase opacity-80">{isExpired ? 'Token Expired' : 'Token Active'}</p>
                            <p className="text-xs opacity-60 font-mono mt-0.5">Expires: {format(expDate, "PPpp")}</p>
                        </div>
                    </div>
                )}
                <Section title="Header" icon={<FileJson size={14} />} content={header} isJson />
                <Section title="Payload" icon={<FileJson size={14} />} content={payload} isJson />
                <Section title="Signature" icon={<ShieldCheck size={14} />} content={signature} isJson={false} className="text-blue-300 break-all" />
            </div>
        </div>
    );
}

// --- Encoder Component (New) ---
function Encoder() {
    const [headerText, setHeaderText] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
    const [payloadText, setPayloadText] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
    const [secret, setSecret] = useState("secret");
    const [encodedToken, setEncodedToken] = useState("");
    const [jsonError, setJsonError] = useState("");

    // Base64URL encode function (no padding, url safe)
    const base64UrlEncode = (str: string) => {
        const wordArray = CryptoJS.enc.Utf8.parse(str);
        const base64 = CryptoJS.enc.Base64.stringify(wordArray);
        return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    };

    const signatureBase64UrlEncode = (wordArray: any) => {
        const base64 = CryptoJS.enc.Base64.stringify(wordArray);
        return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    };

    useEffect(() => {
        try {
            // Validate JSON
            JSON.parse(headerText);
            JSON.parse(payloadText);
            setJsonError("");

            const encodedHeader = base64UrlEncode(headerText);
            const encodedPayload = base64UrlEncode(payloadText);

            const signatureInput = `${encodedHeader}.${encodedPayload}`;
            const signature = CryptoJS.HmacSHA256(signatureInput, secret);
            const encodedSignature = signatureBase64UrlEncode(signature);

            setEncodedToken(`${encodedHeader}.${encodedPayload}.${encodedSignature}`);
        } catch (e) {
            setJsonError("Invalid JSON in Header or Payload");
            setEncodedToken("");
        }
    }, [headerText, payloadText, secret]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                {/* Header Input */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <FileJson size={14} /> Header
                    </h3>
                    <textarea
                        value={headerText}
                        onChange={e => setHeaderText(e.target.value)}
                        className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-blue-300 resize-none"
                    />
                </div>

                {/* Payload Input */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <FileJson size={14} /> Payload
                    </h3>
                    <textarea
                        value={payloadText}
                        onChange={e => setPayloadText(e.target.value)}
                        className="w-full h-48 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-purple-300 resize-none"
                    />
                </div>

                {/* Secret Input */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Key size={14} /> Verify Signature
                    </h3>
                    <input
                        type="text"
                        value={secret}
                        onChange={e => setSecret(e.target.value)}
                        placeholder="your-256-bit-secret"
                        className="w-full bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 font-mono text-sm text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white/80 flex items-center gap-2">
                        Generated Token
                        {jsonError && <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded flex items-center gap-1"><AlertCircle size={12} /> {jsonError}</span>}
                    </h2>
                    <button
                        onClick={() => {
                            if (encodedToken) {
                                navigator.clipboard.writeText(encodedToken);
                                toast.success("Copied Token");
                            }
                        }}
                        disabled={!encodedToken}
                        className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-30"
                    >
                        <Copy size={12} /> Copy
                    </button>
                </div>
                <textarea
                    readOnly
                    value={encodedToken}
                    className="w-full h-[500px] bg-slate-950/50 border border-white/10 rounded-2xl p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none break-all text-white/80"
                />
            </div>
        </div>
    );
}

// --- Shared Helper Components ---

function Section({ title, icon, content, isJson, className = "" }: { title: string, icon: any, content: any, isJson?: boolean, className?: string }) {
    const copy = () => {
        const text = isJson ? JSON.stringify(content, null, 2) : content;
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${title}`);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    {icon} {title}
                </h3>
                <button
                    onClick={copy}
                    disabled={!content}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    title="Copy"
                >
                    <Copy size={14} />
                </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 bg-[#0d1117] min-h-[100px] relative group">
                {content ? (
                    isJson ? (
                        <JsonViewer data={content} />
                    ) : (
                        <div className={`p-4 font-mono text-xs leading-relaxed ${className}`}>
                            {content}
                        </div>
                    )
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 italic text-xs">
                        {title} empty
                    </div>
                )}
            </div>
        </div>
    );
}

function JsonViewer({ data }: { data: any }) {
    const html = syntaxHighlight(data);
    return (
        <pre
            className="p-4 font-mono text-xs leading-relaxed overflow-auto max-h-[300px] custom-scrollbar text-white/80"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function syntaxHighlight(json: any) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    if (!json) return "";

    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match: string) {
        let cls = 'text-orange-300';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'text-blue-400';
            } else {
                cls = 'text-green-400';
            }
        } else if (/true|false/.test(match)) {
            cls = 'text-purple-400';
        } else if (/null/.test(match)) {
            cls = 'text-gray-500';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
