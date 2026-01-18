import { useState, useRef, useEffect } from "react";
import { Pipette, Copy, Image as ImageIcon, X } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import toast from "react-hot-toast";

export function ImageColorPicker() {
    const [image, setImage] = useState<string | null>(null);
    const [color, setColor] = useState<string | null>(null);
    const [rgb, setRgb] = useState<{ r: number; g: number; b: number } | null>(null);
    const [hsl, setHsl] = useState<{ h: number; s: number; l: number } | null>(null);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [showMagnifier, setShowMagnifier] = useState(false);

    // Magnifier state
    const [magnifierData, setMagnifierData] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initial load handling
    useEffect(() => {
        if (image && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = image;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                const maxDim = 1200;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = (height / width) * maxDim;
                        width = maxDim;
                    } else {
                        width = (width / height) * maxDim;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
            };
        }
    }, [image]);

    // Paste support
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        const blob = items[i].getAsFile();
                        if (blob) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                setImage(event.target?.result as string);
                                resetState();
                                toast.success("Image pasted from clipboard!");
                            };
                            reader.readAsDataURL(blob);
                        }
                    }
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    const resetState = () => {
        setColor(null);
        setRgb(null);
        setHsl(null);
        setPosition(null);
        setMagnifierData(null);
    }

    const handleAceternityUpload = (files: File[]) => {
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target?.result as string);
                resetState();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        setPosition({ x: Math.round(x), y: Math.round(y) });
        setShowMagnifier(true);

        // Magnifier Logic
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const zoomSize = 11; // 11x11 pixel grid
            const halfSize = Math.floor(zoomSize / 2);

            // Get pixel data around cursor
            // Safe bounds check handled by getImageData (returns transparent black for out of bounds)
            const imageData = ctx.getImageData(x - halfSize, y - halfSize, zoomSize, zoomSize);

            // Create a temporary canvas to scale this up
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = zoomSize;
            tempCanvas.height = zoomSize;
            const tempCtx = tempCanvas.getContext("2d");
            tempCtx?.putImageData(imageData, 0, 0);
            setMagnifierData(tempCanvas.toDataURL());
        }
    };

    const handleMouseLeave = () => {
        setShowMagnifier(false);
    };

    const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Get single pixel
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        // Convert to HEX
        const toHex = (n: number) => {
            const hex = n.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        const hexColor = "#" + toHex(r) + toHex(g) + toHex(b);

        // Convert to HSL
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: h = (bNorm - rNorm) / d + 2; break;
                case bNorm: h = (rNorm - gNorm) / d + 4; break;
            }
            h /= 6;
        }

        setColor(hexColor.toUpperCase());
        setRgb({ r, g, b });
        setHsl({ h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label}!`);
    };

    const reset = () => {
        setImage(null);
        resetState();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 w-full">
                    {/* Main Area: Upload / Canvas */}
                    <div className="lg:col-span-7 space-y-6 lg:order-1">
                        {!image ? (
                            <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white/[0.02] border-white/10 rounded-[2.5rem] flex items-center justify-center overflow-hidden">
                                <FileUpload
                                    onChange={handleAceternityUpload}
                                    accept={{
                                        "image/png": [".png"],
                                        "image/jpeg": [".jpg", ".jpeg"],
                                        "image/webp": [".webp"],
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 shadow-2xl group cursor-crosshair">
                                <canvas
                                    ref={canvasRef}
                                    onClick={pickColor}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    className="w-full h-auto block"
                                />

                                {/* Magnifier Lens */}
                                {showMagnifier && magnifierData && position && (
                                    <div
                                        className="absolute pointer-events-none z-50 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-black"
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            // Position logic: keep slightly offset from cursor to handle visibility
                                            // But for a true "lens" feel, usually it's centered or offset. 
                                            // Let's attach it to mouse via CSS if we had mouse event client coords here, 
                                            // but since 'position' is canvas-relative, we rely on canvas container being relative.
                                            // Re-calculating proper css 'top/left' based on the mouse event in 'handleMouseMove' would be better.
                                            // For now, let's just create a fixed "Loupe" in the corner of the image container to avoid chaotic movement.
                                            top: '20px',
                                            left: '20px',
                                        }}
                                    >
                                        <div className="relative w-full h-full">
                                            <img
                                                src={magnifierData}
                                                className="w-full h-full rendering-pixelated"
                                                style={{ imageRendering: 'pixelated' }}
                                            />
                                            {/* Crosshair */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-3 h-3 border-2 border-red-500/80 rounded-sm shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={reset}
                                        className="p-3 bg-black/60 backdrop-blur-md text-white rounded-xl hover:bg-red-500/80 transition-colors"
                                        title="Remove Image"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-xs font-mono text-white/70 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    {position ? `X: ${position.x} Y: ${position.y}` : "Hover to measure"}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Results */}
                    <div className="lg:col-span-4 space-y-6 lg:order-2">
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 border border-white/20 shadow-2xl relative overflow-hidden h-full min-h-[400px]">
                            <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12">
                                <Pipette size={140} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-6">
                                    Picked Color
                                </h3>

                                {color ? (
                                    <div className="space-y-8 flex-1">
                                        {/* Large Swatch */}
                                        <div
                                            className="w-full aspect-video rounded-3xl shadow-xl border border-white/20 relative group transition-transform hover:scale-[1.02] duration-500"
                                            style={{ backgroundColor: color }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-[2px] rounded-3xl transition-opacity">
                                                <span className="font-black text-2xl text-white drop-shadow-md tracking-widest uppercase">{color}</span>
                                            </div>
                                        </div>

                                        {/* Values */}
                                        <div className="space-y-4">
                                            <div
                                                onClick={() => copyToClipboard(color, "HEX")}
                                                className="group relative p-4 rounded-2xl bg-black/40 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer select-none active:scale-[0.98]"
                                            >
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 block group-hover:text-white/80 transition-colors">HEX</label>
                                                <div className="text-white font-mono text-xl font-bold uppercase">{color}</div>
                                                <div className="absolute top-4 right-4 text-white/20 group-hover:text-white transition-colors">
                                                    <Copy size={16} />
                                                </div>
                                            </div>

                                            {rgb && (
                                                <div
                                                    onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "RGB")}
                                                    className="group relative p-4 rounded-2xl bg-black/40 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer select-none active:scale-[0.98]"
                                                >
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 block group-hover:text-white/80 transition-colors">RGB</label>
                                                    <div className="text-white font-mono text-xl font-bold">rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
                                                    <div className="absolute top-4 right-4 text-white/20 group-hover:text-white transition-colors">
                                                        <Copy size={16} />
                                                    </div>
                                                </div>
                                            )}

                                            {hsl && (
                                                <div
                                                    onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "HSL")}
                                                    className="group relative p-4 rounded-2xl bg-black/40 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer select-none active:scale-[0.98]"
                                                >
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 block group-hover:text-white/80 transition-colors">HSL</label>
                                                    <div className="text-white font-mono text-xl font-bold">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
                                                    <div className="absolute top-4 right-4 text-white/20 group-hover:text-white transition-colors">
                                                        <Copy size={16} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/50">
                                            <ImageIcon size={32} />
                                        </div>
                                        <p className="text-white/60 text-sm font-bold uppercase tracking-widest max-w-[200px]">
                                            Click on the image to pick a color
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
