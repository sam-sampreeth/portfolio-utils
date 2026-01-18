import { useState } from "react";
import { Copy, RefreshCw, Hash, Fingerprint, Binary, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { v1 as uuidv1, v4 as uuidv4, v6 as uuidv6, v7 as uuidv7 } from "uuid";
import { nanoid } from "nanoid";
import CryptoJS from "crypto-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Generators() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Fingerprint className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Generators</h1>
                    <p className="text-white/40">Generate UUIDs, Hashes, NanoIDs, and Random Strings</p>
                </div>
            </div>

            <div className="p-1 rounded-3xl bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 border border-white/20 backdrop-blur-xl shadow-2xl">
                <Tabs defaultValue="uuid" className="w-full">
                    <TabsList className="w-full bg-transparent p-1 h-auto flex flex-wrap justify-start gap-1">
                        <TabTrigger value="uuid" icon={Fingerprint} label="UUID" />
                        <TabTrigger value="nanoid" icon={Binary} label="NanoID" />
                        <TabTrigger value="hash" icon={Hash} label="Hash" />
                        <TabTrigger value="password" icon={Lock} label="Password" />
                    </TabsList>

                    <div className="p-8">
                        <TabsContent value="uuid" className="mt-0 focus-visible:outline-none">
                            <UuidGenerator />
                        </TabsContent>
                        <TabsContent value="nanoid" className="mt-0 focus-visible:outline-none">
                            <NanoIdGenerator />
                        </TabsContent>
                        <TabsContent value="hash" className="mt-0 focus-visible:outline-none">
                            <HashGenerator />
                        </TabsContent>
                        <TabsContent value="password" className="mt-0 focus-visible:outline-none">
                            <PasswordGenerator />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}

function TabTrigger({ value, icon: Icon, label }: { value: string, icon: any, label: string }) {
    return (
        <TabsTrigger
            value={value}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-white/40 hover:text-white/60 transition-all"
        >
            <Icon size={16} />
            <span className="font-bold tracking-wide text-sm">{label}</span>
        </TabsTrigger>
    );
}

// --- Sub Components ---

function UuidGenerator() {
    const [version, setVersion] = useState("v4");
    const [result, setResult] = useState("");
    const [quantity, setQuantity] = useState(1);

    const generate = () => {
        let fn;
        switch (version) {
            case "v1": fn = () => uuidv1(); break;
            case "v4": fn = () => uuidv4(); break;
            case "v6": fn = () => uuidv6(); break;
            case "v7": fn = () => uuidv7(); break;
            default: fn = () => uuidv4();
        }

        const res = Array.from({ length: quantity }).map(() => fn()).join('\n');
        setResult(res);
        toast.success(`Generated ${quantity} UUID${quantity > 1 ? 's' : ''}`);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>UUID Version</Label>
                    <Select value={version} onValueChange={setVersion}>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                            <SelectItem value="v1">Version 1 (Timestamp)</SelectItem>
                            <SelectItem value="v4">Version 4 (Random)</SelectItem>
                            <SelectItem value="v6">Version 6 (Gregorian)</SelectItem>
                            <SelectItem value="v7">Version 7 (Unix ts)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Quantity: {quantity}</Label>
                    <div className="h-12 flex items-center px-4 bg-white/5 border border-white/10 rounded-xl">
                        <Slider
                            value={[quantity]}
                            onValueChange={([v]) => setQuantity(v)}
                            min={1}
                            max={50}
                            step={1}
                            className="cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={generate}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
                <RefreshCw size={20} />
                Generate UUIDs
            </button>

            {result && <ResultDisplay value={result} multiline={quantity > 1} />}
        </div>
    );
}

function NanoIdGenerator() {
    const [length, setLength] = useState(21);
    const [alphabet, setAlphabet] = useState("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
    const [result, setResult] = useState("");

    const generate = () => {
        // Custom alphabet nanoid requires importing 'customAlphabet'
        // For simplicity with standard nanoid import, we can stick to standard or dynamic import if needed.
        // But 'nanoid' package exports 'customAlphabet'. Let's assume standard for now or fix import if needed.
        // Actually best way:
        try {
            // Basic implementation for custom alphabet without complex imports if standard fails
            // The 'nanoid' export is usually standard. 
            // Let's use a simple custom generator if needed or just standard if default alphabet.

            if (alphabet === "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" || !alphabet) {
                setResult(nanoid(length));
            } else {
                let res = "";
                for (let i = 0; i < length; i++) {
                    res += alphabet[Math.floor(Math.random() * alphabet.length)];
                }
                setResult(res);
            }
            toast.success("NanoID Generated");
        } catch (e) {
            console.error(e);
            toast.error("Generation failed");
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Length: {length}</Label>
                    <div className="h-12 flex items-center px-4 bg-white/5 border border-white/10 rounded-xl">
                        <Slider
                            value={[length]}
                            onValueChange={([v]) => setLength(v)}
                            min={2}
                            max={64}
                            step={1}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Custom Alphabet</Label>
                    <Input
                        value={alphabet}
                        onChange={(e) => setAlphabet(e.target.value)}
                        className="h-12 bg-white/5 border-white/10 font-mono"
                    />
                </div>
            </div>

            <button
                onClick={generate}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
                <RefreshCw size={20} />
                Generate NanoID
            </button>

            {result && <ResultDisplay value={result} />}
        </div>
    );
}

function HashGenerator() {
    const [input, setInput] = useState("");

    // Auto-calculate on input change
    const md5 = input ? CryptoJS.MD5(input).toString() : "";
    const sha1 = input ? CryptoJS.SHA1(input).toString() : "";
    const sha256 = input ? CryptoJS.SHA256(input).toString() : "";
    const sha512 = input ? CryptoJS.SHA512(input).toString() : "";

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Label>Input Text to Hash</Label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    placeholder="Type something..."
                />
            </div>

            <div className="grid gap-4">
                <HashResult label="MD5" value={md5} />
                <HashResult label="SHA-1" value={sha1} />
                <HashResult label="SHA-256" value={sha256} />
                <HashResult label="SHA-512" value={sha512} />
            </div>
        </div>
    );
}

function HashResult({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-2">
            <Label className="text-xs text-white/50 uppercase tracking-wider">{label}</Label>
            <ResultDisplay value={value} />
        </div>
    );
}

function PasswordGenerator() {
    const [length, setLength] = useState(16);
    const [useUpper, setUseUpper] = useState(true);
    const [useLower, setUseLower] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
    const [result, setResult] = useState("");

    const generate = () => {
        let charset = "";
        if (useUpper) charset += "ABCDEFGHJKLMNPQRSTUVWXYZ"; // No I, O
        if (useLower) charset += "abcdefghijkmnopqrstuvwxyz"; // No l
        if (useNumbers) charset += "23456789"; // No 1, 0
        if (useSymbols) charset += "!@#$%^&*";

        // Add back ambiguous if not excluded
        if (!excludeAmbiguous) {
            if (useUpper) charset += "IO";
            if (useLower) charset += "l";
            if (useNumbers) charset += "10";
        }

        if (!charset) {
            // Fallback if strict settings remove everything (e.g. only numbers but all excluded?) 
            // Logic above prevents empty if upper/lower picked.
            // But if user deselects everything...
            if (!useUpper && !useLower && !useNumbers && !useSymbols) {
                toast.error("Please select at least one character type");
                return;
            }
        }

        let res = "";
        for (let i = 0; i < length; i++) {
            res += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setResult(res);
        toast.success("Password Generated");
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <Label>Length: {length}</Label>
                <div className="h-12 flex items-center px-4 bg-white/5 border border-white/10 rounded-xl">
                    <Slider
                        value={[length]}
                        onValueChange={([v]) => setLength(v)}
                        min={8}
                        max={64}
                        step={1}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                    <Label>Uppercase (A-Z)</Label>
                    <Switch checked={useUpper} onCheckedChange={setUseUpper} />
                </div>
                <div className="flex items-center justify-between">
                    <Label>Lowercase (a-z)</Label>
                    <Switch checked={useLower} onCheckedChange={setUseLower} />
                </div>
                <div className="flex items-center justify-between">
                    <Label>Numbers (0-9)</Label>
                    <Switch checked={useNumbers} onCheckedChange={setUseNumbers} />
                </div>
                <div className="flex items-center justify-between">
                    <Label>Symbols (!@#...)</Label>
                    <Switch checked={useSymbols} onCheckedChange={setUseSymbols} />
                </div>
                <div className="flex items-center justify-between col-span-2 pt-2 border-t border-white/10">
                    <div className="space-y-0.5">
                        <Label>Exclude Ambiguous</Label>
                        <p className="text-[10px] text-white/40">Avoid chars like I, l, 1, O, 0</p>
                    </div>
                    <Switch checked={excludeAmbiguous} onCheckedChange={setExcludeAmbiguous} />
                </div>
            </div>

            <button
                onClick={generate}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
                <RefreshCw size={20} />
                Generate Password
            </button>

            {result && <ResultDisplay value={result} />}
        </div>
    );
}

function ResultDisplay({ value, multiline = false }: { value: string, multiline?: boolean }) {
    const copy = () => {
        navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
            {multiline ? (
                <textarea
                    readOnly
                    value={value}
                    className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none break-all"
                />
            ) : (
                <div
                    className="w-full min-h-12 bg-black/30 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm break-all text-white/90 flex items-center pr-12"
                >
                    {value}
                </div>
            )}

            <button
                onClick={copy}
                className="absolute right-2 top-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70"
            >
                <Copy size={16} />
            </button>
        </div>
    );
}

export default Generators;
