import { useState, useEffect, useRef, useCallback } from "react";
import {
    Volume2,
    VolumeX,
    Zap,
    Waves,
    Info,
    Play,
    Headphones,
    Speaker as SpeakerIcon,
    Move
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SoundMode = "oscillator" | "studio";
type Channel = "left" | "right" | "both";
type DeviceType = "headphones" | "speaker";

interface AcousticSample {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    type: "noise" | "buffer";
}

const SAMPLES: AcousticSample[] = [
    { id: "white-noise", name: "White Noise", description: "Full spectrum for driver burn-in.", icon: <Waves size={16} />, color: "text-blue-400", type: "noise" },
    { id: "pink-noise", name: "Pink Noise", description: "Balanced energy across octaves.", icon: <Waves size={16} />, color: "text-rose-400", type: "noise" },
    { id: "spatial-rain", name: "Spatial Rain", description: "Synthesized atmospheric high-freq.", icon: <Waves size={16} />, color: "text-cyan-400", type: "buffer" },
    { id: "deep-pulse", name: "Deep Pulse", description: "Rhythmic sub-bass check.", icon: <Zap size={16} />, color: "text-purple-400", type: "buffer" }
];

export function SpeakerTester() {
    const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mode, setMode] = useState<SoundMode>("oscillator");
    const [device, setDevice] = useState<DeviceType>("headphones");
    const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
    const [frequency, setFrequency] = useState(440);
    const [panning, setPanning] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [channel, setChannel] = useState<Channel>("both");

    const oscRef = useRef<OscillatorNode | null>(null);
    const noiseRef = useRef<ScriptProcessorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const pannerRef = useRef<StereoPannerNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const filterRef = useRef<BiquadFilterNode | null>(null);
    const compressorRef = useRef<DynamicsCompressorNode | null>(null);
    const animationRef = useRef<number>();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initialize Audio Context
    const initAudio = useCallback(() => {
        if (!audioCtx) {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ latencyHint: "interactive" });
            setAudioCtx(ctx);
            return ctx;
        }
        return audioCtx;
    }, [audioCtx]);

    const stopAudio = useCallback(() => {
        if (oscRef.current) {
            oscRef.current.stop();
            oscRef.current.disconnect();
            oscRef.current = null;
        }
        if (noiseRef.current) {
            noiseRef.current.disconnect();
            noiseRef.current = null;
        }
        if (filterRef.current) {
            filterRef.current.disconnect();
            filterRef.current = null;
        }
        if (compressorRef.current) {
            compressorRef.current.disconnect();
            compressorRef.current = null;
        }
        setIsPlaying(false);
        setActiveSampleId(null);
    }, []);

    const setupBaseChain = useCallback((ctx: AudioContext) => {
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();
        const analyser = ctx.createAnalyser();
        const filter = ctx.createBiquadFilter();
        const compressor = ctx.createDynamicsCompressor();

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        const targetPan = channel === "left" ? -1 : channel === "right" ? 1 : panning;
        panner.pan.setValueAtTime(targetPan, ctx.currentTime);

        // Device-specific DSP optimization
        if (device === "headphones") {
            filter.type = "highpass";
            filter.frequency.setValueAtTime(80, ctx.currentTime);
            compressor.threshold.setValueAtTime(-24, ctx.currentTime);
            compressor.ratio.setValueAtTime(4, ctx.currentTime);
        } else {
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(16000, ctx.currentTime);
            compressor.threshold.setValueAtTime(-20, ctx.currentTime);
            compressor.ratio.setValueAtTime(6, ctx.currentTime);
        }

        analyser.connect(filter);
        filter.connect(panner);
        panner.connect(compressor);
        compressor.connect(gain);
        gain.connect(ctx.destination);

        gainRef.current = gain;
        pannerRef.current = panner;
        analyserRef.current = analyser;
        filterRef.current = filter;
        compressorRef.current = compressor;

        return { gain, panner, analyser, filter, compressor };
    }, [volume, channel, panning, device]);

    const startOscillator = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();
        stopAudio();

        const { analyser } = setupBaseChain(ctx);
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        osc.connect(analyser);
        osc.start();
        oscRef.current = osc;
        setIsPlaying(true);
        setMode("oscillator");
    }, [initAudio, stopAudio, setupBaseChain, frequency]);

    const playSample = useCallback((sampleId: string) => {
        const ctx = initAudio();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();
        stopAudio();

        const { analyser } = setupBaseChain(ctx);
        const sample = SAMPLES.find(s => s.id === sampleId);
        if (!sample) return;

        if (sample.type === "noise") {
            const bufferSize = 4096;
            const noise = ctx.createScriptProcessor(bufferSize, 1, 1);
            noise.onaudioprocess = (e: AudioProcessingEvent) => {
                const output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    if (sampleId === "white-noise") {
                        output[i] = Math.random() * 2 - 1;
                    } else {
                        // Pinkish Noise approximation
                        output[i] = (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;
                    }
                }
            };
            noise.connect(analyser);
            noiseRef.current = noise;
        } else if (sample.type === "buffer") {
            const osc = ctx.createOscillator();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();

            if (sampleId === "spatial-rain") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(8000 + Math.random() * 2000, ctx.currentTime);
                lfo.frequency.setValueAtTime(10, ctx.currentTime);
                lfoGain.gain.setValueAtTime(2000, ctx.currentTime);
            } else {
                osc.type = "square";
                osc.frequency.setValueAtTime(40, ctx.currentTime);
                lfo.frequency.setValueAtTime(2, ctx.currentTime);
                lfoGain.gain.setValueAtTime(10, ctx.currentTime);
            }

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            osc.connect(analyser);
            lfo.start();
            osc.start();
            oscRef.current = osc;
        }

        setIsPlaying(true);
        setMode("studio");
        setActiveSampleId(sampleId);
    }, [initAudio, stopAudio, setupBaseChain]);

    // Handle Waveform Visualization
    useEffect(() => {
        if (!isPlaying || !analyserRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const analyser = analyserRef.current;
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const maxRadius = Math.min(centerX, centerY) * 0.8;

            for (let i = 0; i < 5; i++) {
                const ringRadius = (maxRadius / 5) * (i + 1);
                const magnitude = dataArray[i * 10] / 255;

                ctx.beginPath();
                ctx.arc(centerX, centerY, ringRadius + (magnitude * 20), 0, Math.PI * 2);
                ctx.strokeStyle = device === "headphones" ? `rgba(59, 130, 246, ${0.1 + (magnitude * 0.4)})` : `rgba(16, 185, 129, ${0.1 + (magnitude * 0.4)})`;
                ctx.lineWidth = 2 + (magnitude * 10);
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = mode === "oscillator" ? "rgb(59, 130, 246)" : "rgb(168, 85, 247)";

            const sliceWidth = (canvas.width * 0.6) / bufferLength;
            let x = centerX - (canvas.width * 0.3);

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * 150;
                const y = centerY - barHeight / 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.stroke();
        };

        draw();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, device, mode]);

    // Update real-time parameters
    useEffect(() => {
        if (oscRef.current && audioCtx && mode === "oscillator") {
            oscRef.current.frequency.setTargetAtTime(frequency, audioCtx.currentTime, 0.05);
        }
    }, [frequency, audioCtx, mode]);

    useEffect(() => {
        if (gainRef.current && audioCtx) {
            gainRef.current.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.05);
        }
    }, [volume, audioCtx]);

    useEffect(() => {
        if (pannerRef.current && audioCtx) {
            const targetPan = channel === "left" ? -1 : channel === "right" ? 1 : panning;
            pannerRef.current.pan.setTargetAtTime(targetPan, audioCtx.currentTime, 0.1);
        }
    }, [panning, channel, audioCtx]);

    useEffect(() => {
        if (isPlaying && audioCtx) {
            const currentMode = mode;
            const currentSampleId = activeSampleId;
            stopAudio();
            setTimeout(() => {
                if (currentMode === "oscillator") startOscillator();
                else if (currentMode === "studio" && currentSampleId) playSample(currentSampleId);
            }, 50);
        }
    }, [device]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 gap-1">
                        <button
                            onClick={() => setDevice("headphones")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest",
                                device === "headphones" ? "bg-blue-600 text-white shadow-lg" : "text-white/20 hover:text-white/40"
                            )}
                        >
                            <Headphones size={14} /> Headphones
                        </button>
                        <button
                            onClick={() => setDevice("speaker")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest",
                                device === "speaker" ? "bg-emerald-600 text-white shadow-lg" : "text-white/20 hover:text-white/40"
                            )}
                        >
                            <SpeakerIcon size={14} /> Speaker
                        </button>
                    </div>

                    <Tabs value={mode} onValueChange={(v: any) => { stopAudio(); setMode(v); }} className="bg-black/40 p-1 rounded-xl border border-white/5">
                        <TabsList className="bg-transparent border-none h-auto">
                            <TabsTrigger value="oscillator" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-[10px] uppercase font-black px-4 py-2">Oscillator</TabsTrigger>
                            <TabsTrigger value="studio" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-[10px] uppercase font-black px-4 py-2">Studio</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex gap-4">
                    <Button variant="ghost" onClick={stopAudio} className="text-white/20 hover:text-white hover:bg-white/5">
                        <VolumeX size={18} />
                    </Button>
                    <div className="flex items-center gap-3 px-6 py-2 rounded-2xl bg-white/5 border border-white/5">
                        <Volume2 size={16} className="text-white/40" />
                        <input
                            type="range"
                            value={volume * 100}
                            onChange={(e) => setVolume(Number(e.target.value) / 100)}
                            max={100} step={1}
                            className="w-32 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 p-12 py-16 rounded-[3.5rem] bg-black/40 border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col items-center justify-between min-h-[600px]">
                    <div className={cn(
                        "absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] transition-colors duration-1000",
                        device === "headphones" ? "from-blue-500 via-transparent to-transparent" : "from-emerald-500 via-transparent to-transparent"
                    )} />

                    <div className="w-full relative flex-1 flex items-center justify-center">
                        <canvas ref={canvasRef} width={800} height={400} className="w-full h-full relative z-10" />
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <Button
                                    onClick={startOscillator}
                                    className="w-24 h-24 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 border border-white/10 transition-all font-black"
                                >
                                    <Play fill="white" size={32} />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 z-20">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                                <div className="flex items-center gap-2"><Zap size={14} /> Frequency</div>
                                <span className="font-mono text-blue-400">{frequency}Hz</span>
                            </div>
                            <input
                                type="range"
                                value={frequency}
                                onChange={(e) => setFrequency(Number(e.target.value))}
                                max={20000} min={20} step={1}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                                <div className="flex items-center gap-2"><Move size={14} /> {device === "headphones" ? "Stereo Balance" : "Room Panning"}</div>
                                <span className="font-mono text-emerald-400">
                                    {panning === 0 ? "CENTER" : panning < 0 ? `${Math.abs(Math.round(panning * 100))}% L` : `${Math.round(panning * 100)}% R`}
                                </span>
                            </div>
                            <input
                                type="range"
                                value={panning * 100}
                                onChange={(e) => setPanning(Number(e.target.value) / 100)}
                                max={100} min={-100} step={1}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 h-full flex flex-col gap-6">
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 shadow-2xl flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-8">
                            <Waves size={16} className="text-white/40" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Acoustic Studio</h3>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                            {SAMPLES.map((sample) => (
                                <button
                                    key={sample.id}
                                    onClick={() => playSample(sample.id)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border transition-all text-left group/btn relative overflow-hidden",
                                        activeSampleId === sample.id
                                            ? "bg-white/10 border-white/20"
                                            : "bg-white/5 border-white/5 hover:bg-white/[0.08]"
                                    )}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={cn("p-2.5 rounded-xl bg-black/40", sample.color)}>
                                            {sample.icon}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black uppercase tracking-tight text-white/80">{sample.name}</div>
                                            <div className="text-[9px] font-bold text-white/30 leading-tight mt-1">{sample.description}</div>
                                        </div>
                                    </div>
                                    {activeSampleId === sample.id && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="flex gap-1 items-end h-3">
                                                <div className="w-0.5 bg-blue-400 animate-bounce duration-300" />
                                                <div className="w-0.5 bg-blue-400 animate-bounce duration-500" />
                                                <div className="w-0.5 bg-blue-400 animate-bounce duration-400" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20">
                                <Info size={12} /> Optimization Mode
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <p className="text-[10px] font-bold text-white/40 leading-relaxed italic">
                                    {device === "headphones"
                                        ? "Currently optimizing for Binaural Isolation and Driver Symmetry. High-freq clarity is prioritized."
                                        : "Currently optimizing for Soundstage Depth and Phase Linearity. Sub-bass and room-filling textures are prioritized."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
