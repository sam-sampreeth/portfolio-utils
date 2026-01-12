import { useState, useEffect, useRef, useCallback } from "react";
import {
    Mic,
    MicOff,
    Activity,
    Ear,
    Circle,
    Square,
    Play,
    ShieldCheck,
    AlertCircle,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type MeterState = {
    peak: number;
    rms: number;
    clipped: boolean;
};

export function MicTester() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<"prompt" | "requesting" | "denied" | "granted">("prompt");
    const [meter, setMeter] = useState<MeterState>({ peak: 0, rms: 0, clipped: false });
    const [noiseFloor, setNoiseFloor] = useState<number>(-100);
    const [visualMode, setVisualMode] = useState<"spectral" | "sculpture">("spectral");

    // Playback & Monitoring State
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [monitorVolume, setMonitorVolume] = useState(0.5);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const monitorGainRef = useRef<GainNode | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const animationRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const recordingTimerRef = useRef<any>(null);

    const stopMic = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        setIsActive(false);
        setPermissionStatus("prompt");
        setIsMonitoring(false);
        setIsRecording(false);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }, [stream]);

    const startMic = useCallback(async () => {
        setPermissionStatus("requesting");
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(mediaStream);
            setPermissionStatus("granted");

            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ latencyHint: "interactive" });
            audioCtxRef.current = ctx;

            const source = ctx.createMediaStreamSource(mediaStream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.8;

            const monitorGain = ctx.createGain();
            monitorGain.gain.value = isMonitoring ? monitorVolume : 0;

            source.connect(analyser);
            analyser.connect(monitorGain);
            monitorGain.connect(ctx.destination);

            analyserRef.current = analyser;
            monitorGainRef.current = monitorGain;
            setIsActive(true);
        } catch (err: any) {
            console.error("Microphone access denied:", err);
            setPermissionStatus("denied");
        }
    }, [isMonitoring, monitorVolume]);

    // Live Monitoring Toggle
    useEffect(() => {
        if (monitorGainRef.current && audioCtxRef.current) {
            monitorGainRef.current.gain.setTargetAtTime(
                isMonitoring ? monitorVolume : 0,
                audioCtxRef.current.currentTime,
                0.01
            );
        }
    }, [isMonitoring, monitorVolume]);

    // Recording Logic
    const startRecording = () => {
        if (!stream) return;
        setRecordedUrl(null);
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: "audio/ogg; codecs=opus" });
            setRecordedUrl(URL.createObjectURL(blob));
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingTime(0);
        recordingTimerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        }
    };

    // Audio Processing & Metering
    useEffect(() => {
        if (!isActive || !analyserRef.current) return;

        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const timeDomainArray = new Uint8Array(analyser.fftSize);

        const processAudio = () => {
            animationRef.current = requestAnimationFrame(processAudio);
            analyser.getByteFrequencyData(dataArray);
            analyser.getByteTimeDomainData(timeDomainArray);

            let sumSq = 0;
            let peakAmt = 0;
            for (let i = 0; i < timeDomainArray.length; i++) {
                const val = (timeDomainArray[i] - 128) / 128;
                sumSq += val * val;
                if (Math.abs(val) > peakAmt) peakAmt = Math.abs(val);
            }
            const rms = Math.sqrt(sumSq / timeDomainArray.length);

            setMeter({
                peak: peakAmt,
                rms: rms,
                clipped: peakAmt > 0.95
            });

            if (rms > 0) {
                const db = 20 * Math.log10(rms);
                setNoiseFloor(prev => Math.min(prev, db));
            }

            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d")!;
                const width = canvas.width;
                const height = canvas.height;
                ctx.clearRect(0, 0, width, height);

                if (visualMode === "spectral") {
                    const barWidth = (width / bufferLength) * 2.5;
                    let x = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        const barHeight = (dataArray[i] / 255) * height;
                        ctx.fillStyle = `rgb(59, 130, 246, ${dataArray[i] / 255})`;
                        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                        x += barWidth + 1;
                    }
                } else {
                    ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "rgb(168, 85, 247)";
                    const sliceWidth = width / timeDomainArray.length;
                    let x = 0;
                    for (let i = 0; i < timeDomainArray.length; i++) {
                        const v = timeDomainArray[i] / 128.0;
                        const y = (v * height) / 2;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                        x += sliceWidth;
                    }
                    ctx.lineTo(width, height / 2);
                    ctx.stroke();
                }
            }
        };

        processAudio();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isActive, visualMode]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm flex items-center gap-3">
                        <Mic className="text-blue-400" size={18} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Capture Engine</span>
                            <span className="text-sm font-black text-white/60">Voice Studio 1.0</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 gap-2">
                        <button
                            onClick={() => setVisualMode("spectral")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest",
                                visualMode === "spectral" ? "bg-blue-600 text-white shadow-lg" : "text-white/20 hover:text-white/40"
                            )}
                        >
                            Spectral
                        </button>
                        <button
                            onClick={() => setVisualMode("sculpture")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest",
                                visualMode === "sculpture" ? "bg-purple-600 text-white shadow-lg" : "text-white/20 hover:text-white/40"
                            )}
                        >
                            Sculpture
                        </button>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                        {visualMode === "spectral" ? "Analyzing Frequency Layers" : "Modeling Waveform Geometry"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 p-12 py-16 rounded-[3.5rem] bg-black/40 border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center min-h-[600px]">
                    <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent group-hover:opacity-[0.1] transition-opacity duration-1000" />

                    <div className="w-full h-full relative z-10 flex flex-col items-center justify-center">
                        {permissionStatus === "granted" && (
                            <canvas ref={canvasRef} width={800} height={400} className="w-full h-full max-h-[400px] opacity-80" />
                        )}

                        {permissionStatus === "prompt" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center">
                                <div className="p-8 rounded-full bg-blue-600/10 border border-blue-500/20 animate-pulse">
                                    <Mic size={48} className="text-blue-400" />
                                </div>
                                <Button
                                    onClick={startMic}
                                    className="px-12 py-8 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20"
                                >
                                    Initialize Mic
                                </Button>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Hardware Permission Required</p>
                            </div>
                        )}

                        {permissionStatus === "requesting" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-center bg-black/40 backdrop-blur-sm z-50">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                                    <Mic className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Awaiting Permission</h3>
                                    <p className="text-sm font-bold text-white/40">Please click "Allow" in your browser's prompt.</p>
                                </div>
                                {/* Simple UI Art for Permission Prompt */}
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xl max-w-sm">
                                    <div className="flex items-center gap-3 mb-4 px-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                                        <div className="flex-1 h-2 bg-white/5 rounded-full" />
                                    </div>
                                    <div className="bg-zinc-800 p-4 rounded-xl border border-white/5 flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500">
                                                <Mic size={16} className="text-white" />
                                            </div>
                                            <div className="text-left text-[10px] font-black text-white/80">
                                                Allow Mic Access?
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="px-3 py-1 rounded-md bg-white/5 text-[8px] font-black text-white/40">Block</div>
                                            <div className="px-3 py-1 rounded-md bg-blue-600 text-[8px] font-black text-white shadow-lg animate-bounce">Allow</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {permissionStatus === "denied" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-center bg-black/60 backdrop-blur-md z-50 p-12">
                                <div className="p-6 rounded-full bg-rose-500/10 border border-rose-500/20">
                                    <AlertCircle size={48} className="text-rose-500" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Access Restricted</h3>
                                    <p className="text-sm font-bold text-white/40 max-w-sm mx-auto">
                                        Your browser has blocked microphone access. To proceed, you must manually grant permission.
                                    </p>
                                </div>
                                <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6 w-full max-w-md">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black">1</div>
                                        <p className="text-[11px] font-bold text-white/60">Click the <span className="text-blue-400">Lock</span> or <span className="text-blue-400">Settings</span> icon in your address bar.</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black">2</div>
                                        <p className="text-[11px] font-bold text-white/60">Toggle the <span className="text-emerald-400">Microphone</span> switch to <span className="text-emerald-400">On</span>.</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black">3</div>
                                        <p className="text-[11px] font-bold text-white/60">Refresh the page to apply changes.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                    <Button
                                        onClick={startMic}
                                        className="flex-1 px-10 py-6 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 text-white"
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        onClick={() => window.location.reload()}
                                        variant="outline"
                                        className="flex-1 px-10 py-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-black uppercase tracking-widest text-white/60"
                                    >
                                        Reload Page
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isActive && (
                            <>
                                <div className="absolute top-0 right-0 p-4 flex gap-4">
                                    <Button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={cn(
                                            "flex items-center gap-3 px-6 py-4 rounded-xl transition-all font-black uppercase tracking-widest",
                                            isRecording ? "bg-rose-600 text-white animate-pulse" : "bg-white/5 text-white/40 hover:bg-rose-600/20 hover:text-rose-400"
                                        )}
                                    >
                                        {isRecording ? <Square size={16} fill="currentColor" /> : <Circle size={16} fill="currentColor" />}
                                        {isRecording ? `Stopping in... ${30 - recordingTime}s` : "Record Snippet"}
                                    </Button>
                                    <Button variant="ghost" onClick={stopMic} className="text-white/20 hover:text-rose-400 hover:bg-rose-400/10">
                                        <MicOff size={20} />
                                    </Button>
                                </div>
                                {isRecording && (
                                    <div className="absolute bottom-40 px-6 py-2 rounded-full bg-rose-600 text-[10px] font-black text-white uppercase tracking-widest animate-bounce">
                                        Recording Live Output
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="w-full absolute bottom-0 inset-x-0 p-12 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-end gap-12">
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                                    <div className="flex items-center gap-2"><Activity size={12} /> Peak Level</div>
                                    <span className={cn("font-mono font-black", meter.clipped ? "text-rose-500 animate-pulse" : "text-blue-400")}>
                                        {meter.clipped ? "CLIPPING" : `${Math.round(meter.peak * 100)}%`}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                                    <div className={cn("h-full transition-all duration-75", meter.clipped ? "bg-rose-500" : "bg-blue-500")} style={{ width: `${Math.min(meter.peak * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div className="w-32 space-y-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">RMS Avg</div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-150" style={{ width: `${Math.min(meter.rms * 300, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-800 to-black border border-white/10 shadow-2xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <ShieldCheck size={20} className="text-emerald-400" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Room Intel</h3>
                        </div>
                        <div className="space-y-8 flex-1">
                            {/* Live Monitoring Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Live Monitoring</span>
                                    <button
                                        onClick={() => setIsMonitoring(!isMonitoring)}
                                        className={cn(
                                            "p-2 rounded-xl border transition-all",
                                            isMonitoring ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/5 text-white/20"
                                        )}
                                    >
                                        <Ear size={18} />
                                    </button>
                                </div>
                                {isMonitoring && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                                            <span>Gain Control</span>
                                            <span>{Math.round(monitorVolume * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={monitorVolume}
                                            onChange={(e) => setMonitorVolume(parseFloat(e.target.value))}
                                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-8 border-t border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Noise Floor</span>
                                <div className="flex items-end gap-2">
                                    <span className={cn("text-4xl font-black font-mono", noiseFloor < -60 ? "text-emerald-400" : noiseFloor < -40 ? "text-yellow-400" : "text-rose-400")}>
                                        {noiseFloor > -100 ? Math.round(noiseFloor) : "---"}
                                    </span>
                                    <span className="text-xs font-bold text-white/20 mb-2">dBFS</span>
                                </div>
                            </div>

                            {/* Audio Replay Card */}
                            {recordedUrl && (
                                <div className="pt-8 border-t border-white/5 space-y-4 animate-in zoom-in-95 duration-500">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Instant Replay</span>
                                    <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 cursor-pointer hover:bg-blue-500 transition-colors" onClick={() => {
                                                const audio = new Audio(recordedUrl);
                                                audio.play();
                                            }}>
                                                <Play size={16} fill="currentColor" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter">Captured Audio</span>
                                                <span className="text-[9px] font-bold text-blue-400">Ready for Review</span>
                                            </div>
                                        </div>
                                        <a href={recordedUrl} download="mic-test.ogg" className="text-[9px] font-black text-white/30 uppercase hover:text-white transition-colors">Save</a>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 pt-8 border-t border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Pro Diagnostics</span>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-[11px] font-black text-white/40">Hardware Gain</span>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", meter.clipped ? "text-rose-400" : "text-emerald-400")}>{meter.clipped ? "High" : "Optimal"}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-[11px] font-black text-white/40">Environment</span>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest text-blue-400")}>Stable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-white/20">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Loopback Active</span>
                            </div>
                            <Settings size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
