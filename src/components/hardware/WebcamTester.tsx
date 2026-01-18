
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Webcam,
    VideoOff,

    Trash2,
    RefreshCcw,
    Grid,
    ShieldCheck,
    AlertCircle,
    Download,
    Camera
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type WebCamStats = {
    fps: number;
    width: number;
    height: number;
};

export function WebcamTester() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<"prompt" | "requesting" | "denied" | "granted">("prompt");
    const [stats, setStats] = useState<WebCamStats | null>(null);
    const [isMirrored, setIsMirrored] = useState(true);
    const [showGrid, setShowGrid] = useState(false);
    const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const fpsTimerRef = useRef<number>(0);
    const frameCountRef = useRef<number>(0);

    // Enumerate devices
    const getDevices = useCallback(async () => {
        try {
            const deviceInfos = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = deviceInfos.filter(d => d.kind === 'videoinput');
            setDevices(videoInputs);
            // Set default if not set
            if (!selectedDeviceId && videoInputs.length > 0) {
                setSelectedDeviceId(videoInputs[0].deviceId);
            }
        } catch (err) {
            console.error("Error enumerating devices:", err);
        }
    }, [selectedDeviceId]);

    useEffect(() => {
        getDevices();
        navigator.mediaDevices.addEventListener('devicechange', getDevices);
        return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    }, [getDevices]);

    // Re-fetch devices on permission grant to get labels
    useEffect(() => {
        if (permissionStatus === 'granted') {
            getDevices();
        }
    }, [permissionStatus, getDevices]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsActive(false);
        setPermissionStatus("prompt");
        setStats(null);
    }, [stream]);

    const startCamera = useCallback(async () => {
        setPermissionStatus("requesting");
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 60 }
                }
            });
            setStream(mediaStream);
            setPermissionStatus("granted");
            setIsActive(true);
        } catch (err) {
            console.error("Webcam access denied:", err);
            setPermissionStatus("denied");
        }
    }, [selectedDeviceId]);

    // Load Stream into Video Element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // FPS & Resolution Tracking
    useEffect(() => {
        if (!isActive) return;

        const updateStats = () => {
            if (videoRef.current) {
                const video = videoRef.current;

                // Track Frames for FPS
                frameCountRef.current++;
                const now = performance.now();
                if (now - fpsTimerRef.current >= 1000) {
                    setStats({
                        fps: frameCountRef.current,
                        width: video.videoWidth,
                        height: video.videoHeight
                    });
                    frameCountRef.current = 0;
                    fpsTimerRef.current = now;
                }
            }
            requestAnimationFrame(updateStats);
        };

        fpsTimerRef.current = performance.now();
        const handle = requestAnimationFrame(updateStats);
        return () => cancelAnimationFrame(handle);
    }, [isActive]);

    const takeSnapshot = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            if (isMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            ctx.drawImage(videoRef.current, 0, 0);
            setLastSnapshot(canvas.toDataURL("image/png"));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm flex items-center gap-3">
                        <Webcam className="text-blue-400" size={18} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Camera Source</span>
                            <div className="relative">
                                <Select
                                    value={selectedDeviceId}
                                    onValueChange={(value) => {
                                        setSelectedDeviceId(value);
                                        // If camera is active, restart it with new device
                                        if (isActive) {
                                            stopCamera();
                                            // Small timeout to allow state clear before restarting
                                            setTimeout(() => startCamera(), 100);
                                        }
                                    }}
                                    disabled={permissionStatus !== "granted" && devices.length === 0}
                                >
                                    <SelectTrigger className="w-full min-w-[200px] h-auto p-0 border-0 bg-transparent text-sm font-black text-white/60 focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Default Webcam" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                                        {devices.length === 0 ? (
                                            <SelectItem value="default" disabled className="text-white/40">Default Webcam</SelectItem>
                                        ) : (
                                            devices.map(device => (
                                                <SelectItem key={device.deviceId} value={device.deviceId} className="focus:bg-white/10 focus:text-white cursor-pointer font-bold">
                                                    {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsMirrored(!isMirrored)}
                        className={cn(
                            "rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest px-6 transition-all",
                            isMirrored ? "bg-blue-600/10 text-blue-400 border-blue-500/20" : "bg-black/40 text-white/30 hover:text-white/60"
                        )}
                    >
                        {isMirrored ? "Mirrored" : "Normal"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowGrid(!showGrid)}
                        className={cn(
                            "rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest px-6 transition-all",
                            showGrid ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-black/40 text-white/30 hover:text-white/60"
                        )}
                    >
                        <Grid size={14} className="mr-2" /> Grid
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 p-4 rounded-[3.5rem] bg-black/40 border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center min-h-[500px]">
                    <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600 via-transparent to-transparent group-hover:opacity-[0.1] transition-opacity duration-1000" />

                    <div className="w-full h-full relative z-10 flex flex-col items-center justify-center aspect-video rounded-[2.5rem] overflow-hidden bg-black/60 shadow-inner">
                        {permissionStatus === "granted" && (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={cn(
                                        "w-full h-full object-cover transition-transform duration-500",
                                        isMirrored && "scale-x-[-1]"
                                    )}
                                />
                                {showGrid && (
                                    <div className="absolute inset-0 pointer-events-none border border-white/10">
                                        <div className="absolute inset-x-0 top-1/3 h-px bg-white/20" />
                                        <div className="absolute inset-x-0 top-2/3 h-px bg-white/20" />
                                        <div className="absolute left-1/3 inset-y-0 w-px bg-white/20" />
                                        <div className="absolute left-2/3 inset-y-0 w-px bg-white/20" />
                                    </div>
                                )}
                            </div>
                        )}

                        {permissionStatus === "prompt" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center">
                                <div className="p-8 rounded-full bg-blue-600/10 border border-blue-500/20 animate-pulse">
                                    <Webcam size={48} className="text-blue-400" />
                                </div>
                                <Button
                                    onClick={startCamera}
                                    className="px-12 py-8 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20"
                                >
                                    Start Camera
                                </Button>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Hardware Permission Required</p>
                            </div>
                        )}

                        {permissionStatus === "requesting" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-center bg-black/40 backdrop-blur-sm z-50">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                                    <Webcam className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Awaiting Permission</h3>
                                    <p className="text-sm font-bold text-white/40">Please click "Allow" in your browser's prompt.</p>
                                </div>
                            </div>
                        )}

                        {permissionStatus === "denied" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-center bg-black/60 backdrop-blur-md z-50 p-12">
                                <div className="p-6 rounded-full bg-rose-500/10 border border-rose-500/20">
                                    <AlertCircle size={48} className="text-rose-500" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Camera Access Blocked</h3>
                                    <p className="text-sm font-bold text-white/40 max-w-sm mx-auto">
                                        Camera access is blocked. Please grant permission in your browser settings to use the camera.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                    <Button onClick={startCamera} className="flex-1 px-10 py-6 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 text-white">Try Again</Button>
                                    <Button onClick={() => window.location.reload()} variant="outline" className="flex-1 px-10 py-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-black uppercase tracking-widest text-white/60">Reload</Button>
                                </div>
                            </div>
                        )}

                        {isActive && (
                            <div className="absolute top-0 right-0 p-6 flex gap-4">
                                <Button
                                    onClick={takeSnapshot}
                                    className="p-4 rounded-2xl bg-white/10 hover:bg-white border border-white/10 text-white hover:text-black transition-all group shadow-xl"
                                >
                                    <Camera size={20} className="group-active:scale-95" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={stopCamera}
                                    className="p-4 rounded-2xl text-white/20 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                                >
                                    <VideoOff size={20} />
                                </Button>
                            </div>
                        )}
                    </div>

                    {isActive && (
                        <div className="w-full mt-4 flex items-center justify-between px-8 text-white/40 mb-2">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black tracking-widest uppercase mb-1">FPS Rate</span>
                                    <span className="text-xl font-black font-mono text-blue-400">{stats?.fps || "--"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black tracking-widest uppercase mb-1">Resolution</span>
                                    <span className="text-xl font-black font-mono text-blue-400">
                                        {stats ? `${stats.width}x${stats.height} ` : "Detecting..."}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 via-black/40 to-blue-900/20 border border-white/10 shadow-2xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <ShieldCheck size={20} className="text-blue-400" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Camera Tech</h3>
                        </div>

                        <div className="space-y-8 flex-1">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Stream Stats</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                        <span className="text-[9px] font-black text-white/30 uppercase">Aspect</span>
                                        <p className="text-lg font-black text-white/80">16:9</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                        <span className="text-[9px] font-black text-white/30 uppercase">Latency</span>
                                        <p className="text-lg font-black text-blue-400">Low</p>
                                    </div>
                                </div>
                            </div>

                            {lastSnapshot && (
                                <div className="pt-8 border-t border-white/5 space-y-4 animate-in zoom-in-95 duration-500">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Last Snapshot</span>
                                        <button onClick={() => setLastSnapshot(null)} className="text-rose-500 hover:text-rose-400 transition-colors">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 aspect-video flex items-center justify-center">
                                        <img src={lastSnapshot} alt="Snapshot" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a
                                                href={lastSnapshot}
                                                download="webcam-snapshot.png"
                                                className="p-4 rounded-full bg-blue-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Download size={24} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 pt-8 border-t border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Diagnostics</span>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-[11px] font-black text-white/40">Color Fidelity</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Stable</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-[11px] font-black text-white/40">Focus Mode</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Auto</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-white/20">
                            <div className="flex items-center gap-2">
                                <RefreshCcw size={14} className="animate-spin-slow" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Real-time Stream</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
